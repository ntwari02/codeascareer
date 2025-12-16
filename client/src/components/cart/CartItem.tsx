import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
  Trash2,
  Heart,
  Plus,
  Minus,
  AlertCircle,
  Truck,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { CartItem, ProductVariant } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface CartItemComponentProps {
  item: CartItem;
  validation?: {
    isValid: boolean;
    warnings: string[];
    priceChanged?: boolean;
    stockChanged?: boolean;
    unavailable?: boolean;
  };
  isSelected?: boolean;
  onSelect?: (itemId: string, selected: boolean) => void;
  onSaveForLater?: (itemId: string) => void;
}

export function CartItemComponent({ item, validation, isSelected = false, onSelect }: CartItemComponentProps) {
  const { currency } = useTheme();
  const { updateQuantity, removeItem, addToCart, savedForLater } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist, items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});
  const quantityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const quantityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseDownTimeRef = useRef<number | null>(null);
  const isRapidChangingRef = useRef(false);

  const product = item.product;
  const variant = item.variant;
  const imageUrl = product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  const price = variant?.price || product?.price || 0;
  const comparePrice = product?.compare_at_price;
  const sku = variant?.sku || product?.sku || 'N/A';
  const stock = variant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const isInWishlistItem = product ? isInWishlist(product.id) : false;
  const wishlistItem = product ? wishlistItems.find(w => w.product_id === product.id) : null;
  const isSavedForLater = savedForLater.some(saved => saved.id === item.id);

  // Load available variants when editing
  useEffect(() => {
    if (isEditingVariant && product?.id) {
      loadVariants();
    }
  }, [isEditingVariant, product?.id]);

  const loadVariants = async () => {
    if (!product?.id) return;
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);
    
    if (data) {
      setAvailableVariants(data as ProductVariant[]);
      // Initialize selected options from current variant
      if (variant?.options) {
        setSelectedVariantOptions(variant.options);
      }
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantityInput('1');
      return;
    }
    if (newQuantity > stock) {
      setQuantityInput(stock.toString());
      alert(`Only ${stock} items available in stock`);
      return;
    }
    setQuantityInput(newQuantity.toString());
    await updateQuantity(item.id, newQuantity);
  };

  const handleQuantityInputChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantityInput(value);
    } else if (value === '') {
      setQuantityInput('');
    }
  };

  const handleQuantityInputBlur = () => {
    const numValue = parseInt(quantityInput);
    if (isNaN(numValue) || numValue < 1) {
      setQuantityInput(item.quantity.toString());
      setIsEditingQuantity(false);
    } else {
      handleQuantityChange(numValue);
      setIsEditingQuantity(false);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantityInputBlur();
    } else if (e.key === 'Escape') {
      setQuantityInput(item.quantity.toString());
      setIsEditingQuantity(false);
    }
  };

  // Hold to rapid change quantity
  const startRapidChange = (direction: 'increase' | 'decrease') => {
    const change = direction === 'increase' ? 1 : -1;
    mouseDownTimeRef.current = Date.now();
    isRapidChangingRef.current = false;
    
    // Only start rapid change after delay, not immediately
    quantityTimeoutRef.current = setTimeout(() => {
      isRapidChangingRef.current = true;
      quantityIntervalRef.current = setInterval(() => {
        // Use current item quantity from state
        const currentQty = parseInt(quantityInput) || item.quantity;
        handleQuantityChange(currentQty + change);
      }, 100);
    }, 500);
  };

  const stopRapidChange = () => {
    if (quantityIntervalRef.current) {
      clearInterval(quantityIntervalRef.current);
      quantityIntervalRef.current = null;
    }
    if (quantityTimeoutRef.current) {
      clearTimeout(quantityTimeoutRef.current);
      quantityTimeoutRef.current = null;
    }
    mouseDownTimeRef.current = null;
    isRapidChangingRef.current = false;
  };

  useEffect(() => {
    return () => {
      stopRapidChange();
    };
  }, []);

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeItem(item.id);
    setIsRemoving(false);
  };

  const handleRemoveClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmRemove = async () => {
    setShowDeleteConfirm(false);
    await handleRemove();
  };

  const handleMoveToWishlist = async () => {
    if (!product) return;
    
    try {
      // Toggle wishlist: if already in wishlist, remove it; otherwise add it
      if (isInWishlistItem && wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      } else {
        if (user) {
          await addToWishlist(user.id, product);
        } else {
          await addToWishlist(null, product);
        }
      }
      // Don't remove from cart - item stays in cart
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  const handleSaveForLater = async () => {
    if (!product) return;
    
    try {
      const { useCartStore } = await import('../../stores/cartStore');
      const cartStore = useCartStore.getState();
      
      // Toggle save for later: if already saved, remove it; otherwise add it
      if (isSavedForLater) {
        // Remove from saved for later
        const updatedSaved = cartStore.savedForLater.filter(saved => saved.id !== item.id);
        useCartStore.setState({ savedForLater: updatedSaved });
        
        // Update localStorage for guest users
        if (item.user_id?.startsWith('guest-')) {
          localStorage.setItem('saved_for_later', JSON.stringify(updatedSaved));
        }
      } else {
        // Add to saved for later (but keep in cart)
        const updatedSaved = [...cartStore.savedForLater, item];
        useCartStore.setState({ savedForLater: updatedSaved });
        
        // Update localStorage for guest users
        if (item.user_id?.startsWith('guest-')) {
          localStorage.setItem('saved_for_later', JSON.stringify(updatedSaved));
        }
      }
      // Item stays in cart as requested
    } catch (error) {
      console.error('Failed to toggle save for later:', error);
      alert('Failed to update save for later. Please try again.');
    }
  };

  const handleVariantChange = async (newVariant: ProductVariant) => {
    if (!product) return;
    
    // Remove old item and add new one with different variant
    await removeItem(item.id);
    await addToCart(user?.id || null, product, newVariant, item.quantity);
    setIsEditingVariant(false);
  };

  const getVariantOptions = () => {
    if (!availableVariants.length) return {};
    
    const options: Record<string, string[]> = {};
    availableVariants.forEach(v => {
      Object.entries(v.options || {}).forEach(([key, value]) => {
        if (!options[key]) options[key] = [];
        if (!options[key].includes(value)) {
          options[key].push(value);
        }
      });
    });
    return options;
  };

  const getMatchingVariant = () => {
    if (!availableVariants.length) return null;
    
    return availableVariants.find(v => {
      return Object.entries(selectedVariantOptions).every(([key, value]) => 
        v.options?.[key] === value
      );
    });
  };

  const variantOptions = variant?.options ? Object.entries(variant.options).map(([key, value]) => 
    `${key}: ${value}`
  ).join(', ') : '';

  const getStockWarning = () => {
    if (stock === 0) return { message: 'Out of stock – remove or replace', severity: 'error' };
    if (stock < 5) return { message: `Only ${stock} left`, severity: 'warning' };
    if (stock < 10) return { message: 'Low stock – almost sold out', severity: 'info' };
    return null;
  };

  const stockWarning = getStockWarning();

  return (
    <div className={`relative bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-2xl border-2 ${
      validation && !validation.isValid 
        ? 'border-red-300 dark:border-red-700' 
        : 'border-gray-200/60 dark:border-gray-700/60'
    } p-3 sm:p-5 lg:p-6 transition-all duration-300 ${isRemoving ? 'opacity-50 animate-fade-out' : ''} ${isSelected ? 'ring-2 sm:ring-4 ring-orange-500/50 shadow-2xl scale-[1.01] sm:scale-[1.02]' : 'shadow-lg hover:shadow-2xl hover:scale-[1.01]'} backdrop-blur-sm overflow-hidden group`}>
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/20 to-transparent dark:from-orange-900/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-5">
        {/* Selection Checkbox - Enhanced */}
        {onSelect && (
          <div className="flex-shrink-0 pt-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(item.id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 text-orange-600 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-orange-500 checked:to-red-500 checked:border-orange-500"
              />
            </div>
          </div>
        )}

        {/* Product Image with Hover Zoom - Premium */}
        <div className="flex-shrink-0 group/image">
          <Link to={`/products/${product?.id}`} className="block">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-lg group-hover/image:shadow-xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-10" />
              <img
                src={imageUrl}
                alt={product?.title || 'Product'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-125"
              />
              <div className="absolute inset-0 border-2 border-white/20 rounded-2xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>
        </div>

        {/* Product Details - Enhanced */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/products/${product?.id}`}
                className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-2 block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-400 dark:hover:to-red-400 transition-all duration-300 flex items-start gap-2 group/title"
              >
                <span className="flex-1">{product?.title || 'Product'}</span>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover/title:opacity-100 transition-all duration-300 text-orange-600 dark:text-orange-400 transform group-hover/title:translate-x-1 flex-shrink-0 mt-0.5" />
              </Link>
              
              {/* Variant Options - Editable */}
              {isEditingVariant ? (
                <div className="mb-3 space-y-2">
                  {Object.entries(getVariantOptions()).map(([optionKey, values]) => (
                    <div key={optionKey}>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block capitalize">
                        {optionKey}:
                      </label>
                      <select
                        value={selectedVariantOptions[optionKey] || ''}
                        onChange={(e) => setSelectedVariantOptions({ ...selectedVariantOptions, [optionKey]: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="">Select {optionKey}</option>
                        {values.map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const matchingVariant = getMatchingVariant();
                        if (matchingVariant) {
                          handleVariantChange(matchingVariant);
                        }
                      }}
                      disabled={!getMatchingVariant()}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingVariant(false);
                        setSelectedVariantOptions(variant?.options || {});
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  {variantOptions && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {variantOptions}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingVariant(true);
                        }}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                        title="Edit variant"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SKU */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                SKU: {sku}
              </p>

              {/* Price - Unit and Total */}
              <div className="mb-2 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Unit: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(price, currency)}</span>
                  </span>
                  {comparePrice && comparePrice > price && (
                    <>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-through">
                        {formatCurrency(comparePrice, currency)}
                      </span>
                      <span className="text-[10px] sm:text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 sm:px-2 py-0.5 rounded">
                        {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                    Total: {formatCurrency(price * item.quantity, currency)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    ({item.quantity} × {formatCurrency(price, currency)})
                  </span>
                </div>
              </div>

              {/* Stock Status with Enhanced Warnings */}
              {stockWarning && (
                <div className={`mb-2 p-2 rounded-lg ${
                  stockWarning.severity === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : stockWarning.severity === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  <div className={`flex items-center gap-2 text-sm ${
                    stockWarning.severity === 'error'
                      ? 'text-red-800 dark:text-red-200'
                      : stockWarning.severity === 'warning'
                      ? 'text-orange-800 dark:text-orange-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{stockWarning.message}</span>
                  </div>
                </div>
              )}

              {!stockWarning && stock > 0 && (
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    In Stock
                  </span>
                </div>
              )}

              {/* Delivery Estimate - Enhanced */}
              <div className="flex items-center gap-2 text-xs mb-2">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Truck className="w-3 h-3" />
                  <span className="font-medium">Est. delivery:</span>
                  <span>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="text-gray-500 dark:text-gray-400">3-5 business days</span>
              </div>

              {/* Validation Warnings */}
              {validation && validation.warnings.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  {validation.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div 
              className="flex flex-col items-end gap-2"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Quantity Selector */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startRapidChange('decrease');
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    const wasQuickClick = mouseDownTimeRef.current && (Date.now() - mouseDownTimeRef.current < 300);
                    stopRapidChange();
                    // If it was a quick click and not rapid changing, handle as single click
                    if (wasQuickClick && !isRapidChangingRef.current) {
                      handleQuantityChange(item.quantity - 1);
                    }
                  }}
                  onMouseLeave={stopRapidChange}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                {isEditingQuantity ? (
                  <input
                    type="text"
                    value={quantityInput}
                    onChange={(e) => handleQuantityInputChange(e.target.value)}
                    onBlur={handleQuantityInputBlur}
                    onKeyDown={handleQuantityKeyDown}
                    className="w-16 text-center font-medium text-gray-900 dark:text-white border border-orange-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingQuantity(true);
                    }}
                    className="w-16 text-center font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 text-sm transition-colors"
                    title="Click to edit quantity"
                  >
                    {item.quantity}
                  </button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startRapidChange('increase');
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    const wasQuickClick = mouseDownTimeRef.current && (Date.now() - mouseDownTimeRef.current < 300);
                    stopRapidChange();
                    // If it was a quick click and not rapid changing, handle as single click
                    if (wasQuickClick && !isRapidChangingRef.current) {
                      handleQuantityChange(item.quantity + 1);
                    }
                  }}
                  onMouseLeave={stopRapidChange}
                  disabled={item.quantity >= stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div 
                className="flex items-center gap-1"
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Save for Later - Always visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isSavedForLater ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveForLater();
                  }}
                  title={isSavedForLater ? "Remove from saved for later" : "Save for later"}
                >
                  <Clock className={`w-4 h-4 ${
                    isSavedForLater 
                      ? 'text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </Button>
                
                {/* Move to Wishlist - Always visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isInWishlistItem ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMoveToWishlist();
                  }}
                  title={isInWishlistItem ? "Remove from wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${
                    isInWishlistItem 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </Button>
                
                {/* Remove from Cart - Always visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveClick();
                  }}
                  disabled={isRemoving}
                  title="Remove from Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Subtotal */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subtotal: <span className="font-bold">{formatCurrency(price * item.quantity, currency)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Item from Cart"
        message={`Are you sure you want to remove "${product?.title || 'this item'}" from your cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
