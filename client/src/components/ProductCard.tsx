import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, MapPin, Truck, Star } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product & { images?: { url: string; is_primary?: boolean; position?: number }[] };
  onViewProduct?: (product: Product) => void;
}

export function ProductCard({ product, onViewProduct }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { currency } = useTheme();
  const navigate = useNavigate();

  // Get primary image, or first image, or placeholder
  const getPrimaryImage = () => {
    if (!product.images || product.images.length === 0) {
      return 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
    }
    
    // Find primary image
    const primaryImage = product.images.find(img => (img as any).is_primary);
    if (primaryImage) return primaryImage.url;
    
    // Sort by position and get first
    const sortedImages = [...product.images].sort((a, b) => (a.position || 0) - (b.position || 0));
    return sortedImages[0]?.url || product.images[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  };

  const imageUrl = getPrimaryImage();
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
  };

  const symbol = currencySymbols[currency] || '$';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(user?.id || null, product);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      const item = useWishlistStore.getState().items.find(i => i.product_id === product.id);
      if (item) await removeFromWishlist(item.id);
    } else {
      await addToWishlist(user?.id || null, product);
    }
  };

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleKeyNavigate = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewProduct();
    }
  };

  return (
    <div
      className="group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleViewProduct}
      onKeyDown={handleKeyNavigate}
    >
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-dark hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-dark-primary">
          <img
            src={imageError ? 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg' : imageUrl}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-scaleIn">
              -{discount}%
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 bg-white dark:bg-dark-secondary p-2 rounded-full shadow-md transition-transform hover:scale-110 active:scale-90"
          >
            <Heart
              className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
            />
          </button>

          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-600 to-orange-800 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {product.is_shippable ? (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <Truck className="h-3 w-3" />
                Shippable
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                <MapPin className="h-3 w-3" />
                Pickup Only
              </span>
            )}
            {product.stock_quantity <= product.low_stock_threshold && (
              <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                Low Stock
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
            {product.title}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(1,258)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {symbol}{product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {symbol}{product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
            className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
}
