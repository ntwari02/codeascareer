import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Star, Truck, MapPin } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { ProductGallery } from './ProductGallery';
import { Button } from './ui/button';
import type { Product, ProductVariant } from '../types';

interface ProductDetailModalProps {
  product: Product & { images?: { url: string; is_primary?: boolean; position?: number; alt_text?: string }[] };
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { currency } = useTheme();

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
  };

  const symbol = currencySymbols[currency] || '$';
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  // Get available colors and sizes from variants
  const availableColors = React.useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const colors = new Set(variants.map(v => v.color).filter(Boolean));
    return Array.from(colors);
  }, [variants]);

  const availableSizes = React.useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const sizes = new Set(variants.map(v => v.size).filter(Boolean));
    return Array.from(sizes);
  }, [variants]);

  useEffect(() => {
    // Load variants if needed
    // For now, we'll use empty array
    setVariants([]);
  }, [product.id]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAddToCart = async () => {
    await addToCart(user?.id || null, product);
    // You can add a toast notification here
  };

  const handleToggleWishlist = async () => {
    if (isInWishlist(product.id)) {
      const item = useWishlistStore.getState().items.find(i => i.product_id === product.id);
      if (item) await removeFromWishlist(item.id);
    } else {
      await addToWishlist(user?.id || null, product);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock_quantity || 99)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const images = product.images || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        style={{ 
          zIndex: 9998,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      {/* Modal Content */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            zIndex: 10000
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left Column - Product Images */}
            <div>
              <ProductGallery 
                images={images}
                productTitle={product.title}
                className="sticky top-4"
              />
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Brand/Category */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                REAGLEX TECH
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {product.title}
              </h1>

              {/* Tagline/Description Preview */}
              <p className="text-gray-600 dark:text-gray-400">
                {product.description?.substring(0, 100)}...
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  (1,258 reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {symbol}{product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    {symbol}{product.compare_at_price.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Color Options */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color: {selectedColor || 'Select Color'}
                  </label>
                  <div className="flex gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color
                            ? 'border-gray-900 dark:border-white ring-2 ring-offset-2'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Options */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Size</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && val <= (product.stock_quantity || 99)) {
                        setQuantity(val);
                      }
                    }}
                    className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max={product.stock_quantity || 99}
                  />
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.stock_quantity || 0} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 text-lg font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  className="px-4"
                >
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
                  />
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {product.is_shippable ? (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Pickup only - Available at store location</span>
                  </>
                )}
              </div>

              {/* Product Information Tabs */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'description'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'specifications'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Reviews (1,258)
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === 'description' && (
                    <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {product.description || 'No description available.'}
                    </div>
                  )}
                  {activeTab === 'specifications' && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">SKU:</span>
                          <span>{product.sku || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Weight:</span>
                          <span>{product.weight || 'N/A'} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Stock:</span>
                          <span>{product.stock_quantity || 0} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span className={`capitalize ${product.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                            {product.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'reviews' && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <p>Reviews feature coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

