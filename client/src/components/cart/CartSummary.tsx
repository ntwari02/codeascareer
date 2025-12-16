import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { 
  ShoppingCart, 
  CreditCard,
  Truck,
  Tag,
  AlertCircle,
  CheckCircle2,
  Shield,
  Lock,
  RefreshCw,
  Gift,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface CartSummaryProps {
  onCheckout: () => void;
  isMobile?: boolean;
}

export function CartSummary({ onCheckout, isMobile = false }: CartSummaryProps) {
  const { currency } = useTheme();
  const { user } = useAuthStore();
  const { 
    items, 
    getSubtotal, 
    getSelectedSubtotal,
    getSelectedTotal,
    selectedSellers,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showAutoApply, setShowAutoApply] = useState(false);
  const [showCouponSection, setShowCouponSection] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrustBadges, setShowTrustBadges] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express' | 'overnight'>('standard');

  const subtotal = selectedSellers.size > 0 ? getSelectedSubtotal() : getSubtotal();
  const discount = appliedCoupon?.discount || 0;
  
  // Shipping costs based on selected option
  const shippingCosts = {
    standard: selectedSellers.size > 0 ? selectedSellers.size * 5 : Math.ceil(items.length / 3) * 5,
    express: selectedSellers.size > 0 ? selectedSellers.size * 15 : Math.ceil(items.length / 3) * 15,
    overnight: selectedSellers.size > 0 ? selectedSellers.size * 25 : Math.ceil(items.length / 3) * 25,
  };
  const estimatedShipping = shippingCosts[selectedShipping];
  
  const estimatedTax = (subtotal - discount) * 0.1;
  const serviceFee = subtotal * 0.02; // 2% service fee
  const total = selectedSellers.size > 0 
    ? getSelectedTotal() 
    : (subtotal - discount + estimatedShipping + estimatedTax + serviceFee);
  
  // Free shipping threshold
  const freeShippingThreshold = 50;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const selectedCount = selectedSellers.size > 0 
    ? items.filter(item => item.product?.seller_id && selectedSellers.has(item.product.seller_id)).length
    : items.length;

  const canCheckout = selectedCount > 0 && total > 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      await applyCoupon(couponCode, subtotal);
      setCouponCode('');
    } catch (error: any) {
      setCouponError(error.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleAutoApplyBestCoupon = async () => {
    // In a real app, this would check all available coupons and apply the best one
    setShowAutoApply(true);
    // Mock: Try common coupon codes
    const commonCodes = ['WELCOME10', 'SAVE20', 'FLASH50'];
    for (const code of commonCodes) {
      try {
        await applyCoupon(code, subtotal);
        setShowAutoApply(false);
        return;
      } catch (e) {
        continue;
      }
    }
    setShowAutoApply(false);
    setCouponError('No applicable coupons found');
  };

  return (
    <div className={`relative ${
      isMobile ? 'p-0' : 'p-0'
    }`}>
      <div className={`relative bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-xl sm:rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/60 shadow-2xl backdrop-blur-sm overflow-hidden ${
        isMobile ? 'p-2.5 sm:p-3' : 'p-4 sm:p-6'
      }`}>
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100/30 to-transparent dark:from-orange-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/30 to-transparent dark:from-blue-900/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-200/50 dark:border-gray-700/50">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl shadow-lg">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Order Summary
            </h2>
          </div>

        {/* Compact Coupon Section */}
        <div className="mb-3">
          {appliedCoupon ? (
            <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  {appliedCoupon.code} - {formatCurrency(appliedCoupon.discount, currency)} off
                </span>
              </div>
              <button
                onClick={() => removeCoupon()}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                title="Remove coupon"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCouponSection(!showCouponSection)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Have a coupon code?</span>
              </div>
              {showCouponSection ? (
                <ChevronUp className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}
          
          {showCouponSection && !appliedCoupon && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="text-xs px-3"
                >
                  {isApplyingCoupon ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-red-600 dark:text-red-400">{couponError}</p>
              )}
              <button
                onClick={handleAutoApplyBestCoupon}
                className="w-full text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center justify-center gap-1 py-1"
                disabled={showAutoApply}
              >
                {showAutoApply ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Auto-apply best coupon
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Compact Summary */}
        <div className="space-y-2 mb-4">
          {/* Summary Row - Collapsible */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Discount</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                -{formatCurrency(discount, currency)}
              </span>
            </div>
          )}

          {/* Collapsible Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1"
          >
            <span>View details</span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {showDetails && (
            <div className="space-y-1.5 pl-2 border-l-2 border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
              </div>
              
              {/* Shipping - Collapsible */}
              {!isMobile ? (
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShippingOptions(!showShippingOptions);
                    }}
                    className="w-full flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {estimatedShipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">FREE</span>
                        ) : (
                          formatCurrency(estimatedShipping, currency)
                        )}
                      </span>
                    </div>
                    {showShippingOptions ? (
                      <ChevronUp className="w-3 h-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  {showShippingOptions && (
                    <div className="ml-4 mt-1 space-y-1.5">
                      {(['standard', 'express', 'overnight'] as const).map((option) => (
                        <label key={option} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shipping"
                              value={option}
                              checked={selectedShipping === option}
                              onChange={(e) => setSelectedShipping(e.target.value as typeof option)}
                              className="w-3 h-3"
                            />
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatCurrency(shippingCosts[option], currency)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {estimatedShipping === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                    ) : (
                      formatCurrency(estimatedShipping, currency)
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(serviceFee, currency)}</span>
              </div>

              {/* Tax - Collapsible */}
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTaxDetails(!showTaxDetails);
                  }}
                  className="w-full flex items-center justify-between py-1"
                >
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(estimatedTax, currency)}
                    </span>
                    {showTaxDetails ? (
                      <ChevronUp className="w-3 h-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </button>
                {showTaxDetails && (
                  <div className="ml-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tax calculated at 10% of subtotal after discounts.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white text-base">Total</span>
              <span className="font-bold text-gray-900 dark:text-white text-xl">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Free Shipping Banner */}
        {subtotal >= freeShippingThreshold ? (
          <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-green-800 dark:text-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold">🎉 FREE shipping unlocked!</span>
            </div>
          </div>
        ) : !isMobile && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-blue-700 dark:text-blue-300">
                Add {formatCurrency(amountToFreeShipping, currency)} for free shipping
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progressToFreeShipping)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <div className="mb-3 space-y-2">
          <Button
            onClick={onCheckout}
            disabled={!canCheckout}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 text-sm shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout</span>
              <span className="text-lg">→</span>
            </div>
          </Button>
          
          {/* Express Checkout - Collapsible */}
          {!isMobile && (
            <button
              onClick={() => setShowTrustBadges(!showTrustBadges)}
              className="w-full text-xs text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1"
            >
              or checkout with {showTrustBadges ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />}
            </button>
          )}
          {!isMobile && showTrustBadges && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border hover:border-orange-500 text-xs py-2"
                disabled
              >
                <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center font-bold">P</div>
                <span>PayPal</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border hover:border-orange-500 text-xs py-2"
                disabled
              >
                <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center font-bold">A</div>
                <span>Apple Pay</span>
              </Button>
            </div>
          )}
        </div>

        {/* Guest Checkout Option */}
        {!user && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:underline">
              Sign in
            </Link>
            {' or '}
            <span className="text-gray-600 dark:text-gray-400">checkout as guest</span>
          </p>
        )}

        {/* Compact Trust Badges - Collapsible */}
        {!isMobile && (
          <div className="mb-3">
            <button
              onClick={() => setShowTrustBadges(!showTrustBadges)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1"
            >
              <Shield className="w-3 h-3" />
              <span>Security & Trust</span>
              {showTrustBadges ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showTrustBadges && (
              <div className="mt-2 space-y-2 p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>SSL</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>Protected</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <RefreshCw className="w-3 h-3" />
                    <span>7-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Gift className="w-3 h-3" />
                    <span>Escrow</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Over 3000 buyers purchased today
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selected Sellers Info */}
        {selectedSellers.size > 0 && selectedSellers.size < items.filter(i => i.product?.seller_id).length && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                You're checking out {selectedSellers.size} of {new Set(items.map(i => i.product?.seller_id).filter(Boolean)).size} sellers
              </span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

