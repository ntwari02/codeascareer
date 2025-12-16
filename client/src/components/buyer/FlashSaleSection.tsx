import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import type { Product } from '../../types';

interface FlashSaleSectionProps {
  products: Product[];
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

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

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3); // Desktop: 3 items
      } else {
        setItemsPerView(4); // Large desktop: 4 items
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = products.slice(0, 8);
  const maxIndex = Math.max(0, flashSaleProducts.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-lg sm:text-xl shadow-lg whitespace-nowrap">
              🔥 Flash Sale
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Ends in:</span>
              <div className="flex gap-1 sm:gap-2">
                <div className="bg-white dark:bg-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base text-red-600 dark:text-red-400 shadow-md">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">:</span>
                <div className="bg-white dark:bg-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base text-red-600 dark:text-red-400 shadow-md">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">:</span>
                <div className="bg-white dark:bg-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base text-red-600 dark:text-red-400 shadow-md">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/deals"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold text-sm sm:text-base whitespace-nowrap"
          >
            See All <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-4 sm:gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {flashSaleProducts.map((product) => {
                const discount = Math.floor(Math.random() * 30) + 20; // 20-50%
                const sold = Math.floor(Math.random() * 40) + 30; // 30-70%
                const remaining = 100 - sold;
                const itemWidth = 100 / itemsPerView;
                return (
                  <div key={product.id} className="relative flex-shrink-0" style={{ width: `calc(${itemWidth}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}>
                    <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                          -{discount}%
                        </div>
                        <button 
                          onClick={(e) => handleAddToCart(product, e)}
                          className="absolute bottom-2 right-2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full shadow-lg transition-colors"
                          title="Add to cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                            {product.title}
                          </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                            ${(product.price * 1.5).toFixed(2)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-red-500 h-full transition-all duration-500"
                              style={{ width: `${sold}%` }}
                            />
                          </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {sold}% sold • {remaining}% left
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
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

