import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  CreditCard,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { SellerGroup } from '../../stores/cartStore';
import { formatCurrency } from '../../lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerGroups: SellerGroup[];
}

interface Address {
  id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

type PaymentMethod = 'stripe' | 'flutterwave' | null;
type ShippingMethod = 'standard' | 'express' | 'international';

export function CheckoutModal({ isOpen, onClose, sellerGroups }: CheckoutModalProps) {
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const {
    selectedSellers,
    getSelectedTotal,
  } = useCartStore();

  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'processing'>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [shippingMethods, setShippingMethods] = useState<Record<string, ShippingMethod>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const selectedGroups = sellerGroups.filter(g => selectedSellers.has(g.sellerId));

  useEffect(() => {
    if (isOpen && user?.id) {
      loadAddresses();
    }
  }, [isOpen, user]);

  const loadAddresses = async () => {
    // In a real app, fetch from addresses table
    // For now, use mock data or localStorage
    const savedAddresses = localStorage.getItem(`addresses_${user?.id}`);
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      const defaultAddr = parsed.find((a: Address) => a.is_default) || parsed[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    }
  };

  const handleSaveAddress = () => {
    const addressToSave = { ...newAddress, id: `addr-${Date.now()}` };
    const updated = [...addresses, addressToSave];
    setAddresses(updated);
    setSelectedAddress(addressToSave);
    setShowNewAddress(false);
    if (user?.id) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
    setNewAddress({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
    });
  };

  const handleContinue = () => {
    // Flowchart: Proceed to Checkout → Update Cart Summary
    if (step === 'address') {
      if (!selectedAddress) {
        setError('Please select or add a shipping address');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      // Flowchart: Select Payment Method
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      // Flowchart: Place Order
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    // Flowchart: Place Order → Generate Sub-Orders Per Seller
    if (!user?.id || !selectedAddress) return;

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      // Flowchart: Generate Sub-Orders Per Seller
      // Create orders for each seller (one order per seller group)
      const orders = [];

      for (const group of selectedGroups) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
        
        // Calculate totals
        const discount = group.appliedCoupon?.discount || 0;
        const subtotalAfterDiscount = Math.max(0, group.subtotal - discount);
        const tax = subtotalAfterDiscount * 0.1;
        const shippingCost = shippingMethods[group.sellerId] === 'express' ? 15 : 
                           shippingMethods[group.sellerId] === 'international' ? 25 : 5;
        const total = subtotalAfterDiscount + tax + shippingCost;

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            buyer_id: user.id,
            seller_id: group.sellerId,
            status: 'pending',
            subtotal: group.subtotal,
            shipping_cost: shippingCost,
            tax: tax,
            discount: discount,
            total: total,
            shipping_method: shippingMethods[group.sellerId] || 'standard',
            shipping_address: {
              full_name: selectedAddress.full_name,
              phone: selectedAddress.phone,
              address_line1: selectedAddress.address_line1,
              address_line2: selectedAddress.address_line2,
              city: selectedAddress.city,
              state: selectedAddress.state,
              postal_code: selectedAddress.postal_code,
              country: selectedAddress.country,
            },
            payment_method: paymentMethod,
            payment_status: 'pending',
            notes: notes[group.sellerId] || '',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        for (const item of group.items) {
          const price = item.variant?.price || item.product?.price || 0;
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: price,
            total: price * item.quantity,
          });
        }

        // Create escrow transaction
        await supabase.from('escrow_transactions').insert({
          order_id: order.id,
          amount: total,
          status: 'held',
        });

        // Remove items from cart
        for (const item of group.items) {
          await useCartStore.getState().removeItem(item.id);
        }

        orders.push(order);
      }

      // Show success and close
      setTimeout(() => {
        onClose();
        window.location.href = '/orders'; // Navigate to orders page
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing your order...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we create your orders and initialize escrow payments.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Checkout</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {['address', 'payment', 'review'].map((s, idx) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === s ? 'bg-primary text-white' :
                ['address', 'payment', 'review'].indexOf(step) > idx ? 'bg-green-500 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {['address', 'payment', 'review'].indexOf(step) > idx ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              <div className={`ml-2 text-sm font-medium ${
                step === s ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {s === 'address' ? 'Address' : s === 'payment' ? 'Payment' : 'Review'}
              </div>
              {idx < 2 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        {step === 'address' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h3>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      selectedAddress?.id === addr.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <div className="font-medium">{addr.full_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{addr.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address */}
            {!showNewAddress ? (
              <Button
                variant="outline"
                onClick={() => setShowNewAddress(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            ) : (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAddress.full_name}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={newAddress.address_line2}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress} className="flex-1">
                    Save Address
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAddress(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h3>

            <div className="space-y-2">
              <label
                className={`block p-4 border rounded-lg cursor-pointer ${
                  paymentMethod === 'stripe'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                  className="mr-3"
                />
                <span className="font-medium">Stripe</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pay securely with credit/debit card via Stripe
                </p>
              </label>

              <label
                className={`block p-4 border rounded-lg cursor-pointer ${
                  paymentMethod === 'flutterwave'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="flutterwave"
                  checked={paymentMethod === 'flutterwave'}
                  onChange={() => setPaymentMethod('flutterwave')}
                  className="mr-3"
                />
                <span className="font-medium">Flutterwave</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pay with mobile money, bank transfer, or card via Flutterwave
                </p>
              </label>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg mb-4">Review Your Order</h3>

            {/* Selected Address */}
            {selectedAddress && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Shipping Address</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAddress.full_name}<br />
                  {selectedAddress.address_line1}<br />
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}<br />
                  {selectedAddress.country}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="font-medium mb-2">Payment Method</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {paymentMethod}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {selectedGroups.map((group) => (
                <div key={group.sellerId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="font-medium mb-3">{group.seller?.full_name || 'Seller'}</div>
                  
                  {/* Shipping Method */}
                  <div className="mb-3">
                    <label className="text-sm font-medium mb-2 block">Shipping Method</label>
                    <select
                      value={shippingMethods[group.sellerId] || 'standard'}
                      onChange={(e) => setShippingMethods({ ...shippingMethods, [group.sellerId]: e.target.value as ShippingMethod })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      <option value="standard">Standard ($5) - 3-5 days</option>
                      <option value="express">Express ($15) - 1-2 days</option>
                      <option value="international">International ($25) - 7-14 days</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="text-sm font-medium mb-2 block">Notes for Seller (Optional)</label>
                    <textarea
                      value={notes[group.sellerId] || ''}
                      onChange={(e) => setNotes({ ...notes, [group.sellerId]: e.target.value })}
                      placeholder="e.g., Please pack fragile items properly"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      rows={2}
                    />
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product?.title} × {item.quantity}</span>
                        <span>{formatCurrency((item.variant?.price || item.product?.price || 0) * item.quantity, currency)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(group.total, currency)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between text-xl font-bold">
                <span>Grand Total</span>
                <span>{formatCurrency(getSelectedTotal(), currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button variant="outline" onClick={step === 'address' ? onClose : () => setStep(step === 'payment' ? 'address' : 'payment')}>
            {step === 'address' ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={handleContinue} disabled={isProcessing}>
            {step === 'review' ? 'Place Order' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

