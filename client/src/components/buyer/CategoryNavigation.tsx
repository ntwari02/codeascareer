import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Flame,
  Sparkles,
  Tag,
  TrendingUp,
  X,
  Filter,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  badge?: 'hot' | 'new' | 'trending' | 'sale';
  priority?: number;
  subcategories?: Category[];
  brands?: string[];
  budgetRanges?: { label: string; min: number; max: number }[];
  promoBanner?: {
    image: string;
    title: string;
    link: string;
    discount?: number;
  };
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Categories',
    slug: 'all',
    icon: '🏠',
    priority: 0,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    badge: 'hot',
    priority: 1,
    brands: ['Apple', 'Samsung', 'Sony', 'LG', 'Xiaomi', 'Huawei'],
    budgetRanges: [
      { label: 'Under $50', min: 0, max: 50 },
      { label: '$50 - $200', min: 50, max: 200 },
      { label: '$200 - $500', min: 200, max: 500 },
      { label: 'Over $500', min: 500, max: 10000 },
    ],
    promoBanner: {
      image: 'https://images.pexels.com/photos/3394655/pexels-photo-3394655.jpeg',
      title: 'Flash Sale: Up to 50% OFF',
      link: '/products?category=electronics&sale=true',
      discount: 50,
    },
    subcategories: [
      { id: 'phones', name: 'Smartphones', slug: 'phones', icon: '📱' },
      { id: 'laptops', name: 'Laptops', slug: 'laptops', icon: '💻' },
      { id: 'tablets', name: 'Tablets', slug: 'tablets', icon: '📱' },
      { id: 'audio', name: 'Audio Devices', slug: 'audio', icon: '🎧' },
      { id: 'cameras', name: 'Cameras', slug: 'cameras', icon: '📷' },
      { id: 'gaming', name: 'Gaming', slug: 'gaming', icon: '🎮' },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: '👕',
    badge: 'trending',
    priority: 2,
    brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Puma'],
    budgetRanges: [
      { label: 'Under $30', min: 0, max: 30 },
      { label: '$30 - $100', min: 30, max: 100 },
      { label: '$100 - $300', min: 100, max: 300 },
      { label: 'Over $300', min: 300, max: 10000 },
    ],
    promoBanner: {
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
      title: 'New Season Collection',
      link: '/products?category=fashion&new=true',
    },
    subcategories: [
      { id: 'men', name: "Men's Fashion", slug: 'men-fashion', icon: '👔' },
      { id: 'women', name: "Women's Fashion", slug: 'women-fashion', icon: '👗' },
      { id: 'shoes', name: 'Shoes', slug: 'shoes', icon: '👠' },
      { id: 'accessories', name: 'Accessories', slug: 'accessories', icon: '👜' },
      { id: 'watches', name: 'Watches', slug: 'watches', icon: '⌚' },
      { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', icon: '💍' },
    ],
  },
  {
    id: 'groceries',
    name: 'Groceries',
    slug: 'groceries',
    icon: '🛒',
    badge: 'sale',
    priority: 3,
    brands: ['Organic Valley', 'Fresh Market', 'Local Farm', 'Premium Brands'],
    budgetRanges: [
      { label: 'Under $20', min: 0, max: 20 },
      { label: '$20 - $50', min: 20, max: 50 },
      { label: 'Over $50', min: 50, max: 1000 },
    ],
    subcategories: [
      { id: 'fresh', name: 'Fresh Produce', slug: 'fresh-produce', icon: '🥬' },
      { id: 'beverages', name: 'Beverages', slug: 'beverages', icon: '🥤' },
      { id: 'snacks', name: 'Snacks', slug: 'snacks', icon: '🍪' },
      { id: 'dairy', name: 'Dairy Products', slug: 'dairy', icon: '🥛' },
    ],
  },
  {
    id: 'baby',
    name: 'Baby Products',
    slug: 'baby',
    icon: '👶',
    badge: 'new',
    priority: 4,
    brands: ['Pampers', 'Fisher-Price', 'Gerber', 'Huggies'],
    budgetRanges: [
      { label: 'Under $25', min: 0, max: 25 },
      { label: '$25 - $75', min: 25, max: 75 },
      { label: 'Over $75', min: 75, max: 1000 },
    ],
    subcategories: [
      { id: 'toys', name: 'Toys', slug: 'baby-toys', icon: '🧸' },
      { id: 'clothing', name: 'Baby Clothing', slug: 'baby-clothing', icon: '👕' },
      { id: 'care', name: 'Baby Care', slug: 'baby-care', icon: '🧴' },
      { id: 'feeding', name: 'Feeding', slug: 'baby-feeding', icon: '🍼' },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    icon: '🚗',
    priority: 5,
    brands: ['Bosch', '3M', 'Mobil', 'Castrol'],
    budgetRanges: [
      { label: 'Under $50', min: 0, max: 50 },
      { label: '$50 - $200', min: 50, max: 200 },
      { label: 'Over $200', min: 200, max: 5000 },
    ],
    subcategories: [
      { id: 'parts', name: 'Car Parts', slug: 'car-parts', icon: '🔧' },
      { id: 'accessories', name: 'Accessories', slug: 'auto-accessories', icon: '🎵' },
      { id: 'tools', name: 'Tools', slug: 'auto-tools', icon: '🔨' },
      { id: 'tires', name: 'Tires', slug: 'tires', icon: '⭕' },
    ],
  },
  {
    id: 'appliances',
    name: 'Home Appliances',
    slug: 'appliances',
    icon: '🔌',
    badge: 'hot',
    priority: 6,
    brands: ['Samsung', 'LG', 'Whirlpool', 'Bosch'],
    budgetRanges: [
      { label: 'Under $100', min: 0, max: 100 },
      { label: '$100 - $500', min: 100, max: 500 },
      { label: 'Over $500', min: 500, max: 10000 },
    ],
    subcategories: [
      { id: 'kitchen', name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: '🍳' },
      { id: 'cleaning', name: 'Cleaning', slug: 'cleaning-appliances', icon: '🧹' },
      { id: 'cooling', name: 'Cooling & Heating', slug: 'cooling-heating', icon: '❄️' },
      { id: 'laundry', name: 'Laundry', slug: 'laundry', icon: '👔' },
    ],
  },
];

const BadgeIcon = ({ badge }: { badge?: string }) => {
  switch (badge) {
    case 'hot':
      return <Flame className="h-3 w-3" />;
    case 'new':
      return <Sparkles className="h-3 w-3" />;
    case 'trending':
      return <TrendingUp className="h-3 w-3" />;
    case 'sale':
      return <Tag className="h-3 w-3" />;
    default:
      return null;
  }
};

const BadgeLabel = ({ badge }: { badge?: string }) => {
  switch (badge) {
    case 'hot':
      return '🔥 Hot';
    case 'new':
      return '✨ New';
    case 'trending':
      return '⚡ Trending';
    case 'sale':
      return '💥 Sale';
    default:
      return null;
  }
};

export function CategoryNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get active filter from URL
  const activeFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';
  }, [location.search]);

  // Get active subcategory from URL
  const activeSubcategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('subcategory') || null;
  }, [location.search]);

  // Handle filter change
  const handleFilterChange = (categorySlug: string) => {
    const params = new URLSearchParams(location.search);
    
    if (categorySlug === 'all') {
      params.delete('category');
      params.delete('subcategory');
    } else {
      params.set('category', categorySlug);
      params.delete('subcategory'); // Reset subcategory when changing main category
    }
    
    // Preserve other query params
    const newSearch = params.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    
    // Scroll to top on filter change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle subcategory filter
  const handleSubcategoryChange = (subcategorySlug: string, categorySlug: string) => {
    const params = new URLSearchParams(location.search);
    params.set('category', categorySlug);
    params.set('subcategory', subcategorySlug);
    
    const newSearch = params.toString();
    navigate(`${location.pathname}?${newSearch}`, { replace: true });
    setMobileFiltersOpen(false);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    navigate(location.pathname, { replace: true });
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get active category
  const activeCategory = useMemo(() => {
    return CATEGORIES.find(c => c.slug === activeFilter);
  }, [activeFilter]);

  // Scroll to active filter on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-category="${activeFilter}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeFilter]);

  return (
    <>
      <section className="bg-white/95 dark:bg-dark-secondary/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-[73px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Filter Indicator */}
          {activeFilter !== 'all' && (
            <div className="py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600 dark:text-gray-400">Active Filter:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {CATEGORIES.find(c => c.slug === activeFilter)?.name}
                </span>
                {activeSubcategory && activeCategory?.subcategories && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {activeCategory.subcategories.find(s => s.slug === activeSubcategory)?.name}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Desktop: Horizontal Filter Bar */}
          <div className="hidden lg:flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => {
              const isActive = activeFilter === category.slug;
              return (
                <button
                  key={category.id}
                  data-category={category.slug}
                  onClick={() => handleFilterChange(category.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  {category.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                      category.badge === 'hot' ? 'bg-red-500 text-white' :
                      category.badge === 'new' ? 'bg-blue-500 text-white' :
                      category.badge === 'trending' ? 'bg-orange-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      <BadgeIcon badge={category.badge} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile: Filter Button + Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 py-3">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeFilter !== 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilter !== 'all' && (
                  <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {CATEGORIES.find(c => c.slug === activeFilter)?.name}
                  </span>
                )}
              </button>

              {/* Horizontal Scrollable Categories */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-2 pb-1"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {CATEGORIES.map((category) => {
                  const isActive = activeFilter === category.slug;
                  return (
                    <button
                      key={category.id}
                      data-category={category.slug}
                      onClick={() => handleFilterChange(category.slug)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-base">{category.icon}</span>
                      <span>{category.name}</span>
                      {category.badge && isActive && (
                        <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                          category.badge === 'hot' ? 'bg-red-500 text-white' :
                          category.badge === 'new' ? 'bg-blue-500 text-white' :
                          category.badge === 'trending' ? 'bg-orange-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          <BadgeIcon badge={category.badge} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-dark-card z-50 shadow-2xl transform transition-transform overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h2>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Close filters"
                      >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Clear Filters */}
                    {activeFilter !== 'all' && (
                      <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Main Categories */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                        Categories
                      </h3>
                      <div className="space-y-2">
                        {CATEGORIES.map((category) => {
                          const isActive = activeFilter === category.slug;
                          return (
                            <div key={category.id}>
                              <button
                                onClick={() => {
                                  handleFilterChange(category.slug);
                                  if (!category.subcategories || category.subcategories.length === 0) {
                                    setMobileFiltersOpen(false);
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{category.icon}</span>
                                  <span className="font-semibold">{category.name}</span>
                                  {category.badge && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      category.badge === 'hot' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      category.badge === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                      category.badge === 'trending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      <BadgeLabel badge={category.badge} />
                                    </span>
                                  )}
                                </div>
                                {category.subcategories && category.subcategories.length > 0 && (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </button>
                              
                              {/* Subcategories */}
                              {isActive && category.subcategories && category.subcategories.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1">
                                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Subcategories
                                  </div>
                                  {category.subcategories.map((sub) => {
                                    const isSubActive = activeSubcategory === sub.slug;
                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={() => handleSubcategoryChange(sub.slug, category.slug)}
                                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                                          isSubActive
                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                      >
                                        <span className="text-lg">{sub.icon}</span>
                                        <span>{sub.name}</span>
                                        {isSubActive && (
                                          <CheckCircle className="ml-auto h-4 w-4 text-orange-600" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
