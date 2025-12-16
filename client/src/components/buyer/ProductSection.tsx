import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingCart, Heart, TrendingUp } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import type { Product } from '../../types';

interface ProductSectionProps {
  title: string;
  products: Product[];
  icon?: typeof TrendingUp;
  link?: string;
  badge?: string;
  showQuickView?: boolean;
}

export function ProductSection({ title, products, icon: Icon, link, badge, showQuickView = true }: ProductSectionProps) {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, isInWishlist } = useWishlistStore();

  if (products.length === 0) return null;

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(user?.id || null, product, undefined, 1);
      // You can add a toast notification here if you have a toast system
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToWishlist(user?.id || null, product);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-dark-primary">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {badge && (
              <span className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800">
                {badge}
              </span>
            )}
          </div>
          {link && (
            <Link
              to={link}
              className="text-sm sm:text-base text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold transition-colors whitespace-nowrap"
            >
              View All →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const rating = 4 + Math.random();
            const reviewCount = Math.floor(Math.random() * 1000) + 100;
            const isVerified = Math.random() > 0.5;

            return (
              <div
                key={product.id}
                className="group bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleAddToWishlist(product, e)}
                      className={`p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors ${
                        isInWishlist(product.id) ? 'bg-red-50 dark:bg-red-900/30' : ''
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
                    </button>
                    {showQuickView && (
                      <Link
                        to={`/products/${product.id}`}
                        className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                        title="Quick view"
                      >
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-2 right-2 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add to cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>

                <Link to={`/products/${product.id}`} className="block">
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {isVerified && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-xs sm:text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {product.title}
                    </h3>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      Seller: {product.seller_id?.slice(0, 8)}...
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

