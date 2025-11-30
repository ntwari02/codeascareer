import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Shield, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { supabase } from '../lib/supabase';

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getSubtotal, getTotal, appliedCoupon, clearCart } = useCartStore();

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', cost: 0 },
    { id: 'express', name: 'Express Shipping', time: '2-3 business days', cost: 15 },
    { id: 'overnight', name: 'Overnight Shipping', time: '1 business day', cost: 30 },
  ];

  const hasShippableItems = items.some(item => item.product?.is_shippable);
  const hasPickupItems = items.some(item => !item.product?.is_shippable);

  const shippingCost = hasShippableItems
    ? shippingOptions.find(opt => opt.id === shippingMethod)?.cost || 0
    : 0;

  const subtotal = getSubtotal();
  const discount = appliedCoupon?.discount || 0;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + tax + shippingCost;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const groupedBySeller: Record<string, typeof items> = {};
      items.forEach(item => {
        const sellerId = item.product?.seller_id;
        if (sellerId) {
          if (!groupedBySeller[sellerId]) {
            groupedBySeller[sellerId] = [];
          }
          groupedBySeller[sellerId].push(item);
        }
      });

      for (const [sellerId, sellerItems] of Object.entries(groupedBySeller)) {
        const orderSubtotal = sellerItems.reduce((sum, item) => {
          const price = item.variant?.price || item.product?.price || 0;
          return sum + (price * item.quantity);
        }, 0);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            buyer_id: user.id,
            seller_id: sellerId,
            status: 'pending',
            subtotal: orderSubtotal,
            shipping_cost: shippingCost,
            tax: tax,
            discount: discount,
            total: orderSubtotal + shippingCost + tax - discount,
            coupon_id: appliedCoupon ? undefined : null,
            shipping_method: hasShippableItems ? shippingMethod : null,
            shipping_address: shippingInfo,
            payment_method: paymentMethod,
            payment_status: 'completed',
            is_shippable: sellerItems.some(item => item.product?.is_shippable),
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = sellerItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.variant?.price || item.product?.price || 0,
          total: (item.variant?.price || item.product?.price || 0) * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        await supabase.from('escrow_transactions').insert({
          order_id: order.id,
          amount: order.total,
          status: 'held',
        });

        for (const item of sellerItems) {
          const currentStock = item.variant?.stock_quantity || item.product?.stock_quantity || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          if (item.variant_id) {
            await supabase
              .from('product_variants')
              .update({ stock_quantity: newStock })
              .eq('id', item.variant_id);
          } else {
            await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id);
          }
        }

        await supabase.from('notifications').insert({
          user_id: sellerId,
          type: 'new_order',
          title: 'New Order Received',
          message: `You have received a new order #${orderNumber}`,
          link: `/seller/orders/${order.id}`,
        });
      }

      await clearCart(user.id);

      navigate(`/order-confirmation/${orderNumber}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 'shipping' || step === 'payment' || step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {step !== 'shipping' ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 font-semibold">Shipping</span>
          </div>

          <div className="w-24 h-0.5 bg-gray-300 mx-4" />

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 'payment' || step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {step === 'review' ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <span className="ml-2 font-semibold">Payment</span>
          </div>

          <div className="w-24 h-0.5 bg-gray-300 mx-4" />

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
            <span className="ml-2 font-semibold">Review</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Shipping Information</h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {hasShippableItems && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Method</label>
                      <div className="space-y-3">
                        {shippingOptions.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                              shippingMethod === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={shippingMethod === option.id}
                                onChange={(e) => setShippingMethod(e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">{option.name}</p>
                                <p className="text-sm text-gray-600">{option.time}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {option.cost === 0 ? 'FREE' : `$${option.cost.toFixed(2)}`}
                            </p>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasPickupItems && (
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">Pickup Items</p>
                        <p className="text-sm text-blue-700">
                          Some items in your cart require pickup. The seller will contact you to arrange a meeting.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Method</h2>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="font-semibold">Credit / Debit Card</span>
                    </label>

                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Bank Transfer</span>
                    </label>

                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'mobile' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-semibold">Mobile Money</span>
                    </label>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 mb-1">Secure Escrow Payment</p>
                      <p className="text-sm text-green-700">
                        Your payment will be held securely in escrow and only released to the seller after you confirm delivery.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Review Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'review' && (
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Review Your Order</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingInfo.fullName}</p>
                      <p className="text-gray-600">{shippingInfo.address}</p>
                      <p className="text-gray-600">
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                      </p>
                      <p className="text-gray-600">{shippingInfo.country}</p>
                      <p className="text-gray-600 mt-2">{shippingInfo.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product?.title}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">
                            ${((item.variant?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('payment')}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}

                {hasShippableItems && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-dark pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
