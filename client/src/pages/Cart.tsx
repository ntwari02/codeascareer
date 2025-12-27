import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore, type SellerGroup } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { CheckoutModal } from '../components/cart/CheckoutModal';
import { 
  ShoppingCart, 
  Trash2, 
  Heart, 
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  Sparkles,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  X,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { CartItemComponent } from '../components/cart/CartItem';
import { SellerGroupComponent } from '../components/cart/SellerGroup';
import { CartSummary } from '../components/cart/CartSummary';
import { formatCurrency } from '../lib/utils';

export function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const {
    items,
    savedForLater,
    selectedItems,
    selectedSellers,
    loading,
    validating,
    appliedCoupon,
    sellerCoupons,
    fetchCart,
    getSellerGroups,
    selectSeller,
    selectAllSellers,
    deselectAllSellers,
    selectItem,
    selectAllItems,
    deselectAllItems,
    removeSelectedItems,
    moveSelectedToWishlist,
    saveForLater,
    moveToCart,
    applyCoupon,
    removeCoupon,
    getSelectedSubtotal,
    getSelectedTotal,
  } = useCartStore();
  
  const { addToWishlist } = useWishlistStore();
  
  const [sellerGroups, setSellerGroups] = useState<SellerGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [cartValidations, setCartValidations] = useState<any[]>([]);

  // Load cart on mount
  useEffect(() => {
    if (user?.id) {
      fetchCart(user.id);
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          useCartStore.setState({ items: parsed });
        } catch (e) {
          console.error('Failed to load guest cart', e);
        }
      }
    }
  }, [user, fetchCart]);

  // Load seller groups whenever items change
  useEffect(() => {
    const loadGroups = async () => {
      if (items.length === 0) {
        setSellerGroups([]);
        return;
      }
      
      setLoadingGroups(true);
      try {
        const groups = await getSellerGroups();
        setSellerGroups(groups);
      } catch (error) {
        console.error('Error loading seller groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [items, getSellerGroups]);

  // Auto-select all sellers by default
  useEffect(() => {
    if (sellerGroups.length > 0 && selectedSellers.size === 0) {
      selectAllSellers();
    }
  }, [sellerGroups, selectedSellers, selectAllSellers]);

  // Calculate totals
  const selectedGroups = useMemo(() => {
    return sellerGroups.filter(g => selectedSellers.has(g.sellerId));
  }, [sellerGroups, selectedSellers]);

  const grandTotal = useMemo(() => {
    return selectedGroups.reduce((total, group) => {
      const discount = group.appliedCoupon?.discount || 0;
      const subtotalAfterDiscount = Math.max(0, group.subtotal - discount);
      const tax = subtotalAfterDiscount * 0.1;
      const shippingCost = group.shippingCost || 5;
      return total + subtotalAfterDiscount + tax + shippingCost;
    }, 0);
  }, [selectedGroups]);

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const subtotal = getSelectedSubtotal();
      await applyCoupon(couponCode.trim(), subtotal);
      setCouponCode('');
      setCouponError('');
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (selectedGroups.length === 0) {
      return;
    }
    setShowCheckout(true);
  };

  if (loading || loadingGroups) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your cart...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/products">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding items to your cart to see them here
            </p>
            <Link to="/products">
              <Button className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Left Column (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedItems.size === items.length) {
                        deselectAllItems();
                      } else {
                        selectAllItems();
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {selectedItems.size === items.length ? (
                      <CheckSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                    Select All ({selectedItems.size}/{items.length})
                  </button>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await removeSelectedItems();
                      }}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await moveSelectedToWishlist();
                      }}
                      className="gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Move to Wishlist
                    </Button>
                  </div>
                )}
              </div>

              {/* Seller Groups */}
              {sellerGroups.map((group) => (
                <div
                  key={group.sellerId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Seller Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSellers.has(group.sellerId)}
                          onChange={(e) => selectSeller(group.sellerId, e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {group.seller?.full_name || group.seller?.name || 'Seller'}
                          </h3>
                          {group.warnings.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs text-yellow-600">
                                {group.warnings[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(group.subtotal, currency)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items in this seller group */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.items.map((item) => (
                      <CartItemComponent key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Seller Group Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(group.subtotal, currency)}
                      </span>
                    </div>
                    {group.appliedCoupon && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Discount ({group.appliedCoupon.code}):
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          -{formatCurrency(group.appliedCoupon.discount, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(group.shippingCost, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(group.tax, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        {formatCurrency(group.total, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Saved for Later */}
              {savedForLater.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Saved for Later ({savedForLater.length})
                  </h2>
                  <div className="space-y-3">
                    {savedForLater.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <img
                          src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                          alt={item.product?.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.product?.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency((item.variant?.price || item.product?.price || 0) * item.quantity, currency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await moveToCart(item.id);
                            }}
                            className="gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Move to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const userId = item.user_id && !item.user_id.startsWith('guest-') ? item.user_id : null;
                              if (item.product) {
                                await addToWishlist(userId, item.product);
                                await useCartStore.getState().saveForLater(item.id);
                              }
                            }}
                            className="gap-2"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await useCartStore.getState().removeItem(item.id);
                            }}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Summary - Right Column (1/3 width on large screens) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      {applyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {couponError}
                    </p>
                  )}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {appliedCoupon.code} applied
                      </span>
                      <button
                        onClick={() => removeCoupon()}
                        className="text-green-700 dark:text-green-300 hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary Details */}
                <CartSummary onCheckout={handleCheckout} />

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={selectedGroups.length === 0 || validating}
                  className="w-full mt-6 gap-2"
                  size="lg"
                >
                  {validating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                {/* Security Badge */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Secure checkout with escrow protection
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        sellerGroups={selectedGroups}
      />
    </div>
  );
}

