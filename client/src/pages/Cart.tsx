import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export function Cart() {
  const { user } = useAuthStore();
  const { items, loading, fetchCart, updateQuantity, removeItem, applyCoupon, removeCoupon, appliedCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    }
  }, [user]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError('');

    try {
      await applyCoupon(couponCode, getSubtotal());
      setCouponCode('');
    } catch (error: any) {
      setCouponError(error.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started!</p>
          <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const total = getTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden">
              {items.map((item) => {
                const product = item.product;
                const variant = item.variant;
                const price = variant?.price || product?.price || 0;
                const itemTotal = price * item.quantity;
                const imageUrl = product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';

                return (
                  <div key={item.id} className="flex gap-4 p-6 border-b border-gray-200 last:border-0">
                    <Link to={`/product/${product?.id}`} className="flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={product?.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={`/product/${product?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition">
                        {product?.title}
                      </Link>
                      {variant && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Variant: {variant.name}</p>
                      )}
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">${price.toFixed(2)}</p>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-secondary text-gray-900 dark:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-secondary text-gray-900 dark:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>Coupon ({appliedCoupon.code})</span>
                      <button
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-semibold">-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-dark pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!appliedCoupon && (
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a coupon code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:bg-gray-300"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                </form>
              )}

              <Link
                to="/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block w-full text-center text-blue-600 py-3 rounded-lg font-semibold hover:text-blue-700 transition"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Secure Payment</p>
                    <p className="text-xs text-blue-700">
                      Your payment is protected by escrow until delivery is confirmed
                    </p>
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
