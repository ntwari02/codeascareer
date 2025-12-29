import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
  CreditCard,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Shield,
  Lock,
  FileText,
  Download,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  Globe,
  Truck,
  Clock,
  Info,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const {
    selectedSellers,
    getSelectedTotal,
    applyCoupon,
    removeCoupon,
    sellerCoupons,
    appliedCoupon,
  } = useCartStore();

  const [step, setStep] = useState<'auth' | 'address' | 'payment' | 'review' | 'processing' | 'confirmation'>('auth');
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
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);
  const [showDeleteAddressConfirm, setShowDeleteAddressConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Use selectedGroups if available, otherwise use all sellerGroups
  const selectedGroups = useMemo(() => {
    const filtered = sellerGroups.filter(g => selectedSellers.has(g.sellerId));
    // If no sellers are selected, use all groups (fallback)
    return filtered.length > 0 ? filtered : sellerGroups;
  }, [sellerGroups, selectedSellers]);
  
  // Calculate grand total using useMemo to prevent recalculation issues
  const grandTotal = useMemo(() => {
    // Use sellerGroups directly if selectedGroups is empty (fallback)
    const groupsToCalculate = selectedGroups.length > 0 ? selectedGroups : sellerGroups;
    
    if (groupsToCalculate.length === 0 || !groupsToCalculate[0]?.subtotal) {
      return 0;
    }
    
    return groupsToCalculate.reduce((total, group) => {
      // Ensure we have valid group data
      if (!group || !group.sellerId) return total;
      
      const discount = group.appliedCoupon?.discount || 0;
      const subtotal = group.subtotal || 0;
      const subtotalAfterDiscount = Math.max(0, subtotal - discount);
      const tax = subtotalAfterDiscount * 0.1; // 10% tax
      const shippingCost = shippingMethods[group.sellerId] === 'express' ? 15 :
                          shippingMethods[group.sellerId] === 'international' ? 25 : 5;
      const groupTotal = subtotalAfterDiscount + tax + shippingCost;
      return total + groupTotal;
    }, 0);
  }, [selectedGroups, sellerGroups, shippingMethods]);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadAddresses();
    }
    // Reset error and step when modal opens
    if (isOpen) {
      setError('');
      // Check if user is logged in, if not start with auth step
      if (!user) {
        setStep('auth');
      } else {
        setStep('address');
      }
      // Initialize shipping methods with default 'standard' for all groups if not already set
      if (sellerGroups.length > 0) {
        const currentMethods = { ...shippingMethods };
        let needsUpdate = false;
        sellerGroups.forEach(group => {
          if (!currentMethods[group.sellerId]) {
            currentMethods[group.sellerId] = 'standard';
            needsUpdate = true;
          }
        });
        if (needsUpdate) {
          setShippingMethods(currentMethods);
        }
      }
    }
  }, [isOpen, user]);

  // Clear error when step changes
  useEffect(() => {
    setError('');
  }, [step]);

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
    // Validate required fields
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.country) {
      setError('Please fill in all required fields (including State/Province)');
      return;
    }

    const addressToSave = { ...newAddress, id: `addr-${Date.now()}` };
    const updated = [...addresses, addressToSave];
    setAddresses(updated);
    setSelectedAddress(addressToSave);
    setShowNewAddress(false);
    setEditingAddress(null);
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
    setError('');
  };

  const handleEditAddress = (address: Address) => {
    console.log('Editing address:', address);
    setEditingAddress(address);
    setNewAddress({ ...address });
    setShowNewAddress(true);
    setError('');
    // Scroll to the form
    setTimeout(() => {
      const formElement = document.querySelector('[data-address-form]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteAddressConfirm(true);
  };

  const confirmDeleteAddress = () => {
    if (!addressToDelete) return;
    
    const updated = addresses.filter(a => a.id !== addressToDelete);
    setAddresses(updated);
    if (selectedAddress?.id === addressToDelete) {
      setSelectedAddress(updated[0] || null);
    }
    if (user?.id) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
    setError('');
    setAddressToDelete(null);
    console.log('Address deleted successfully');
  };

  const handleUpdateAddress = () => {
    if (!editingAddress?.id) return;
    
    // Validate required fields
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.country) {
      setError('Please fill in all required fields (including State/Province)');
      return;
    }
    
    const updated = addresses.map(a => 
      a.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } : a
    );
    setAddresses(updated);
    setSelectedAddress({ ...newAddress, id: editingAddress.id });
    setEditingAddress(null);
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
    setError('');
  };

  const handleContinue = () => {
    // Clear any previous errors when proceeding
    setError('');
    setCouponError('');
    
    if (step === 'auth') {
      // If user chooses to continue as guest or after login, proceed to address
      setStep('address');
    } else if (step === 'address') {
      if (!selectedAddress) {
        setError('Please select or add a shipping address');
        return;
      }
      // Validate address fields - state is required by backend
      if (!selectedAddress.full_name || !selectedAddress.phone || !selectedAddress.address_line1 || !selectedAddress.city || !selectedAddress.state || !selectedAddress.country) {
        setError('Please complete all required address fields (including State/Province)');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      if (!acceptedTerms) {
        setError('Please accept the Terms & Conditions and Refund Policy to continue');
        return;
      }
      if (selectedGroups.length === 0) {
        setError('No items selected for checkout. Please add items to your cart.');
        return;
      }
      // Call handlePlaceOrder - it's async so we don't need to await it here
      // Errors will be caught in handlePlaceOrder's try-catch
      handlePlaceOrder();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const subtotal = selectedGroups.reduce((sum, g) => sum + g.subtotal, 0);
      await applyCoupon(couponCode.trim(), subtotal);
      setCouponCode('');
      setCouponError('');
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Flowchart: Place Order → Generate Sub-Orders Per Seller
    // Support both logged-in users and guest checkout
    console.log('handlePlaceOrder called', { 
      selectedAddress: !!selectedAddress, 
      selectedGroupsCount: selectedGroups.length,
      acceptedTerms 
    });
    
    if (!selectedAddress) {
      console.error('No selected address');
      setError('Please select a shipping address');
      return;
    }

    // Validate that state is provided (required by backend)
    if (!selectedAddress.state || selectedAddress.state.trim() === '') {
      console.error('State is missing');
      setError('State/Province is required. Please add it to your shipping address.');
      setStep('address');
      return;
    }

    // Validate that we have items to order
    if (selectedGroups.length === 0) {
      setError('No items selected for checkout. Please add items to your cart.');
      return;
    }

    // Validate that each group has items
    const hasEmptyGroups = selectedGroups.some(group => !group.items || group.items.length === 0);
    if (hasEmptyGroups) {
      setError('Some seller groups have no items. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      const API_BASE = 'http://localhost:5000/api';
      const token = localStorage.getItem('auth_token');

      // Validate seller groups before sending
      if (selectedGroups.length === 0) {
        throw new Error('No items selected for checkout');
      }

      // Prepare seller groups for API
      const sellerGroupsForAPI = selectedGroups
        .filter(group => group.items && group.items.length > 0) // Filter out empty groups
        .map(group => ({
          sellerId: group.sellerId,
          items: group.items
            .filter(item => item.product_id && item.quantity > 0) // Filter out invalid items
            .map(item => ({
              product_id: item.product_id,
              variant_id: item.variant_id || undefined,
              quantity: item.quantity,
            })),
          subtotal: group.subtotal || 0,
          discount: group.appliedCoupon?.discount || 0,
        }))
        .filter(group => group.items.length > 0); // Final filter for groups with valid items

      if (sellerGroupsForAPI.length === 0) {
        throw new Error('No valid items found in your cart. Please add items and try again.');
      }

      console.log('Placing order with seller groups:', sellerGroupsForAPI);

      // Create orders via API
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          sellerGroups: sellerGroupsForAPI,
          shippingAddress: {
            full_name: selectedAddress.full_name,
            phone: selectedAddress.phone,
            address_line1: selectedAddress.address_line1,
            address_line2: selectedAddress.address_line2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state && selectedAddress.state.trim() !== '' ? selectedAddress.state : 'N/A',
            postal_code: selectedAddress.postal_code || '',
            country: selectedAddress.country,
          },
          paymentMethod: paymentMethod,
          shippingMethods: shippingMethods,
          notes: notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();

      // Store order information
      if (data.orders && data.orders.length > 0) {
        setOrderNumber(data.orders[0].order_number || data.orders[0].orderNumber);
        // Calculate estimated delivery (3-5 days for standard, 1-2 for express)
        const maxShippingDays = Math.max(...selectedGroups.map(g => {
          const method = shippingMethods[g.sellerId] || 'standard';
          return method === 'express' ? 2 : method === 'international' ? 14 : 5;
        }));
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + maxShippingDays);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }));
      }

      // Remove items from cart
      for (const group of selectedGroups) {
        for (const item of group.items) {
          await useCartStore.getState().removeItem(item.id);
        }
      }

      // Move to confirmation step
      setStep('confirmation');
      
      // Auto-navigate to orders page after 3 seconds
      setTimeout(() => {
        onClose();
        navigate('/orders', { replace: true });
      }, 3000);
      
      // Auto-navigate to orders page after 2 seconds
      setTimeout(() => {
        onClose();
        navigate('/orders', { replace: true });
      }, 2000);

    } catch (err: any) {
      console.error('Order placement error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
      setStep('review');
      
      // Provide retry option for network errors
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError(`${err.message}. Please check your connection and try again.`);
      }
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
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 border rounded-lg ${
                      selectedAddress?.id === addr.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-200 dark:ring-orange-800'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <label className="flex items-start gap-3 flex-1 cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.id === addr.id}
                          onChange={() => setSelectedAddress(addr)}
                          className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}</p>
                            <p>{addr.city}, {addr.state || 'N/A'} {addr.postal_code}</p>
                            <p>{addr.country}</p>
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {addr.phone}
                            </p>
                            {!addr.state && (
                              <p className="text-red-600 dark:text-red-400 text-xs font-medium mt-1">
                                ⚠️ State/Province is missing - Please edit to add it
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditAddress(addr);
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          title="Edit address"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAddress(addr.id!);
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State/Province *"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="set-default"
                    checked={newAddress.is_default || false}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="set-default" className="text-sm text-gray-700 dark:text-gray-300">
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={editingAddress ? handleUpdateAddress : handleSaveAddress} 
                    className="flex-1 gap-2"
                    disabled={!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.country}
                  >
                    <Check className="h-4 w-4" />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewAddress(false);
                      setEditingAddress(null);
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
                      setError('');
                    }}
                  >
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
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                  required
                />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span>I agree to the </span>
                  <Link to="/terms" className="text-orange-600 dark:text-orange-400 hover:underline font-medium" target="_blank">
                    Terms & Conditions
                  </Link>
                  <span> and </span>
                  <Link to="/returns" className="text-orange-600 dark:text-orange-400 hover:underline font-medium" target="_blank">
                    Refund Policy
                  </Link>
                </div>
              </label>
            </div>

            {/* Security & Trust Elements */}
            <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Lock className="h-4 w-4 text-green-600" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Escrow Protected</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="text-center py-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order Placed Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {orderNumber && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {orderNumber}
                </div>
                {estimatedDelivery && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Estimated Delivery: {estimatedDelivery}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You will receive an email confirmation shortly. Redirecting to orders page...
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    onClose();
                    navigate('/orders', { replace: true });
                  }}
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Go to Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate('/');
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {step !== 'confirmation' && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button variant="outline" onClick={step === 'address' ? onClose : () => setStep(step === 'payment' ? 'address' : 'payment')}>
              {step === 'address' ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={isProcessing || (step === 'review' && (!acceptedTerms || selectedGroups.length === 0))}
              className="gap-2 min-w-[140px]"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : step === 'review' ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Place Order
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Delete Address Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAddressConfirm}
        onClose={() => {
          setShowDeleteAddressConfirm(false);
          setAddressToDelete(null);
        }}
        onConfirm={confirmDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Dialog>
  );
}

