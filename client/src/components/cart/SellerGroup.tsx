import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { CartItemComponent } from './CartItem';
import {
  Store,
  Star,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Truck,
  Tag,
  X,
} from 'lucide-react';
import type { SellerGroup } from '../../stores/cartStore';
import { formatCurrency } from '../../lib/utils';

interface SellerGroupComponentProps {
  group: SellerGroup;
  onItemSelect?: (itemId: string, selected: boolean) => void;
  selectedItems?: Set<string>;
  onSaveForLater?: (itemId: string) => void;
}

export function SellerGroupComponent({ group, onItemSelect, selectedItems, onSaveForLater }: SellerGroupComponentProps) {
  const { currency } = useTheme();
  const { 
    selectedSellers, 
    selectSeller, 
    removeItemsBySeller,
    applyCoupon,
    removeCoupon 
  } = useCartStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isSelected = selectedSellers.has(group.sellerId);
  const sellerName = group.seller?.full_name || group.seller?.email || 'Unknown Seller';
  const sellerRating = 4.5; // Mock rating - should be fetched from reviews

  const handleToggleSelect = () => {
    selectSeller(group.sellerId, !isSelected);
  };

  const handleRemoveAll = async () => {
    if (confirm(`Remove all items from ${sellerName}?`)) {
      await removeItemsBySeller(group.sellerId);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      await applyCoupon(couponCode, group.subtotal, group.sellerId);
      setCouponCode('');
      setShowCouponInput(false);
    } catch (error: any) {
      setCouponError(error.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon(group.sellerId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Seller Header */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
        !group.isAvailable ? 'bg-red-50 dark:bg-red-900/20' : ''
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Checkbox for selection */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggleSelect}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />

            {/* Seller Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {sellerName}
                </h3>
                {group.seller?.role === 'seller' && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    Verified Seller
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{sellerRating}</span>
                <span className="text-gray-400">(128 reviews)</span>
              </div>

              {/* Warnings */}
              {group.warnings.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    {group.warnings.map((warning, idx) => (
                      <div key={idx}>{warning}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {!group.isAvailable && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>This seller is currently unavailable</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleRemoveAll}
              title="Remove all items from this seller"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Seller Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              Subtotal: {formatCurrency(group.subtotal, currency)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {group.appliedCoupon ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 text-xs">
                  Coupon: {group.appliedCoupon.code} (-{formatCurrency(group.appliedCoupon.discount, currency)})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveCoupon}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCouponInput(!showCouponInput)}
              >
                <Tag className="w-3 h-3 mr-1" />
                Apply Coupon
              </Button>
            )}
          </div>
        </div>

        {/* Coupon Input */}
        {showCouponInput && !group.appliedCoupon && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button
              size="sm"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
            >
              Apply
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowCouponInput(false);
                setCouponCode('');
                setCouponError('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {couponError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {couponError}
          </div>
        )}
      </div>

      {/* Cart Items */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {group.items.map((item) => (
            <CartItemComponent 
              key={item.id} 
              item={item}
              isSelected={selectedItems?.has(item.id) || false}
              onSelect={onItemSelect}
              onSaveForLater={onSaveForLater}
            />
          ))}

          {/* Shipping Options */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4" />
                <span>Shipping:</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`shipping-${group.sellerId}`}
                    value="standard"
                    defaultChecked
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Standard ($5) - 3-5 days</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`shipping-${group.sellerId}`}
                    value="express"
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Express ($15) - 1-2 days</span>
                </label>
              </div>
            </div>
          </div>

          {/* Seller Total */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Seller Total:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(group.total, currency)}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Includes shipping ({formatCurrency(group.shippingCost, currency)}) and tax ({formatCurrency(group.tax, currency)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

