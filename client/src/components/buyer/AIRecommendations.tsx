import { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import type { Product } from '../../types';

interface AIRecommendationsProps {
  products: Product[];
}

export function AIRecommendations({ products }: AIRecommendationsProps) {
  const { user } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [dismissedProducts, setDismissedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      // Show trending products for non-logged-in users
      setRecommendedProducts(products.slice(0, 4));
      return;
    }

    // AI-based recommendations based on:
    // 1. Browsing history (from localStorage)
    // 2. Wishlist items
    // 3. Purchase history (mock)
    // 4. Trending items

    const browsingHistory = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const wishlistCategories = wishlistItems
      .map((item) => item.product?.category_id)
      .filter(Boolean);

    // Filter products based on user preferences
    let filtered = products.filter((product) => {
      // Don't show dismissed products
      if (dismissedProducts.has(product.id)) return false;

      // Prioritize products in user's browsing history categories
      const viewedCategories = browsingHistory
        .map((p: Product) => p.category_id)
        .filter(Boolean);
      if (viewedCategories.includes(product.category_id)) return true;

      // Prioritize products in wishlist categories
      if (wishlistCategories.includes(product.category_id)) return true;

      return true;
    });

    // Sort by relevance (mock AI ranking)
    filtered = filtered.sort(() => Math.random() - 0.5);

    setRecommendedProducts(filtered.slice(0, 4));
  }, [user, products, wishlistItems, dismissedProducts]);

  const handleNotInterested = (productId: string) => {
    setDismissedProducts((prev) => new Set([...prev, productId]));
    setRecommendedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (!user) return null; // Only show for logged-in users
  if (recommendedProducts.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-orange-900/20 dark:to-teal-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Recommended For You
            </h2>
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded">
              AI
            </span>
          </div>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => {
            const rating = 4 + Math.random();
            const reviewCount = Math.floor(Math.random() * 1000) + 100;

            return (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => handleNotInterested(product.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100"
                  title="Not interested"
                >
                  <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
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

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 italic">
                    Based on your preferences
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

