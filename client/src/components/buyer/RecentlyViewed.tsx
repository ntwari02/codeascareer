import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Product } from '../../types';

export function RecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  useEffect(() => {
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed) {
      try {
        const products = JSON.parse(viewed);
        setRecentlyViewed(products.slice(0, 8));
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
      }
    }
  }, []);

  if (recentlyViewed.length === 0) return null;

  const maxIndex = Math.max(0, recentlyViewed.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-16 bg-white dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h2>
          </div>
          <Link
            to="/recently-viewed"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
          >
            View All <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="min-w-[calc(25%-18px)] group bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
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
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

