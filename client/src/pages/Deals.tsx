import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  Flame,
  Zap,
  Package,
  Tag,
  Ticket,
  Globe,
  DollarSign,
  TrendingUp,
  Filter,
  Grid3x3,
  List,
  Clock,
  ShoppingCart,
  Heart,
  Eye,
  Star,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useTheme } from '../contexts/ThemeContext';

// Local product shape for deals page (mock data only)
interface DealProduct {
  id: string;
  title: string;
  price: number;
  images: { url: string }[];
  category: string;
  brand: string;
  rating: number;
  reviews_count: number;
  description?: string;
}

interface Deal {
  id: string;
  product: DealProduct;
  discount: number;
  originalPrice: number;
  dealPrice: number;
  category: 'flash' | 'mega' | 'bulk' | 'clearance' | 'coupon' | 'regional' | 'under10' | 'trending';
  type: 'time-based' | 'quantity-based' | 'coupon' | 'exclusive';
  endsAt?: string;
  stockLeft?: number;
  totalStock?: number;
  couponCode?: string;
  minQuantity?: number;
  region?: string;
  exclusiveTo?: 'new' | 'logged-in' | 'app';
  rating: number;
  reviewCount: number;
}

// Mock deals data
const mockDeals: Deal[] = [
  {
    id: '1',
    product: {
      id: '1',
      title: 'Wireless Bluetooth Headphones',
      price: 79.99,
      images: [{ url: 'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg' }],
      category: 'Electronics',
      brand: 'TechSound',
      rating: 4.5,
      reviews_count: 234,
    },
    discount: 40,
    originalPrice: 129.99,
    dealPrice: 79.99,
    category: 'flash',
    type: 'time-based',
    endsAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    stockLeft: 15,
    totalStock: 100,
    rating: 4.5,
    reviewCount: 234,
  },
  {
    id: '2',
    product: {
      id: '2',
      title: 'Smart Watch Pro Series',
      price: 199.99,
      images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg' }],
      category: 'Electronics',
      brand: 'TechWear',
      rating: 4.8,
      reviews_count: 567,
    },
    discount: 35,
    originalPrice: 299.99,
    dealPrice: 199.99,
    category: 'mega',
    type: 'time-based',
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    stockLeft: 8,
    totalStock: 50,
    rating: 4.8,
    reviewCount: 567,
  },
  {
    id: '3',
    product: {
      id: '3',
      title: 'Premium Cotton T-Shirt Pack (5 Pack)',
      price: 29.99,
      images: [{ url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg' }],
      category: 'Fashion',
      brand: 'StyleCo',
      rating: 4.3,
      reviews_count: 189,
    },
    discount: 50,
    originalPrice: 59.99,
    dealPrice: 29.99,
    category: 'bulk',
    type: 'quantity-based',
    minQuantity: 5,
    rating: 4.3,
    reviewCount: 189,
  },
  {
    id: '4',
    product: {
      id: '4',
      title: 'Last Season Designer Jeans',
      price: 24.99,
      images: [{ url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg' }],
      category: 'Fashion',
      brand: 'DenimCo',
      rating: 4.0,
      reviews_count: 92,
    },
    discount: 60,
    originalPrice: 64.99,
    dealPrice: 24.99,
    category: 'clearance',
    type: 'time-based',
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    stockLeft: 3,
    totalStock: 20,
    rating: 4.0,
    reviewCount: 92,
  },
  {
    id: '5',
    product: {
      id: '5',
      title: 'Gaming Mouse RGB',
      price: 19.99,
      images: [{ url: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg' }],
      category: 'Electronics',
      brand: 'GameTech',
      rating: 4.6,
      reviews_count: 312,
    },
    discount: 25,
    originalPrice: 26.99,
    dealPrice: 19.99,
    category: 'coupon',
    type: 'coupon',
    couponCode: 'GAME25',
    rating: 4.6,
    reviewCount: 312,
  },
  {
    id: '6',
    product: {
      id: '6',
      title: 'Rwanda Special: Coffee Beans 1kg',
      price: 12.99,
      images: [{ url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg' }],
      category: 'Food & Beverages',
      brand: 'RwandaCoffee',
      rating: 4.9,
      reviews_count: 445,
    },
    discount: 30,
    originalPrice: 18.99,
    dealPrice: 12.99,
    category: 'regional',
    type: 'exclusive',
    region: 'Rwanda',
    exclusiveTo: 'logged-in',
    rating: 4.9,
    reviewCount: 445,
  },
  {
    id: '7',
    product: {
      id: '7',
      title: 'Phone Case with Stand',
      price: 7.99,
      images: [{ url: 'https://images.pexels.com/photos/163117/phone-mobile-phone-smartphone-cell-163117.jpeg' }],
      category: 'Accessories',
      brand: 'ProtectPro',
      rating: 4.4,
      reviews_count: 678,
    },
    discount: 20,
    originalPrice: 9.99,
    dealPrice: 7.99,
    category: 'under10',
    type: 'time-based',
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    stockLeft: 45,
    totalStock: 200,
    rating: 4.4,
    reviewCount: 678,
  },
  {
    id: '8',
    product: {
      id: '8',
      title: 'Fitness Tracker Band',
      price: 34.99,
      images: [{ url: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg' }],
      category: 'Electronics',
      brand: 'FitLife',
      rating: 4.7,
      reviews_count: 523,
    },
    discount: 42,
    originalPrice: 59.99,
    dealPrice: 34.99,
    category: 'trending',
    type: 'time-based',
    endsAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    stockLeft: 22,
    totalStock: 150,
    rating: 4.7,
    reviewCount: 523,
  },
  // Add more deals...
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `deal-${i + 9}`,
    product: {
      id: `product-${i + 9}`,
      title: `Deal Product ${i + 9}`,
      price: Math.random() * 100 + 10,
      images: [{ url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg' }],
      category: ['Electronics', 'Fashion', 'Home', 'Sports'][i % 4],
      brand: `Brand ${i + 9}`,
      rating: 4 + Math.random(),
      reviews_count: Math.floor(Math.random() * 500),
    },
    discount: Math.floor(Math.random() * 50) + 20,
    originalPrice: Math.random() * 200 + 50,
    dealPrice: Math.random() * 100 + 10,
    category: ['flash', 'mega', 'bulk', 'clearance', 'coupon', 'regional', 'under10', 'trending'][i % 8] as Deal['category'],
    type: ['time-based', 'quantity-based', 'coupon', 'exclusive'][i % 4] as Deal['type'],
    endsAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    stockLeft: Math.floor(Math.random() * 50) + 1,
    totalStock: Math.floor(Math.random() * 200) + 50,
    rating: 4 + Math.random(),
    reviewCount: Math.floor(Math.random() * 500),
  })),
];

const dealCategories = [
  { id: 'all', label: 'All Deals', icon: Sparkles },
  { id: 'flash', label: 'Flash Sales', icon: Flame },
  { id: 'mega', label: 'Mega Deals', icon: Zap },
  { id: 'bulk', label: 'Bulk/Wholesale', icon: Package },
  { id: 'clearance', label: 'Clearance', icon: Tag },
  { id: 'coupon', label: 'Coupon Deals', icon: Ticket },
  { id: 'regional', label: 'Regional', icon: Globe },
  { id: 'under10', label: 'Under $10', icon: DollarSign },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'discount', label: 'Highest Discount %' },
  { value: 'stock', label: 'Limited Stock' },
  { value: 'ending', label: 'Ending Soon' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Deals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currency } = useTheme();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist: checkInWishlist } = useWishlistStore();

  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'relevance'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewDeal, setQuickViewDeal] = useState<Deal | null>(null);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = [...mockDeals];

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(deal => deal.category === activeCategory);
    }

    // Additional filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(deal =>
        selectedCategories.includes(deal.product.category)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(deal =>
        selectedBrands.includes(deal.product.brand || '')
      );
    }

    filtered = filtered.filter(deal => {
      const price = deal.dealPrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (minRating > 0) {
      filtered = filtered.filter(deal => deal.rating >= minRating);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.dealPrice - b.dealPrice;
        case 'price-high':
          return b.dealPrice - a.dealPrice;
        case 'discount':
          return b.discount - a.discount;
        case 'stock':
          return (a.stockLeft || Infinity) - (b.stockLeft || Infinity);
        case 'ending':
          if (!a.endsAt || !b.endsAt) return 0;
          return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeCategory, sortBy, selectedCategories, selectedBrands, priceRange, minRating]);

  // Pagination
  const paginatedDeals = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAndSortedDeals.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDeals, page]);

  const totalPages = Math.ceil(filteredAndSortedDeals.length / itemsPerPage);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    setSearchParams(params);
  }, [activeCategory, sortBy, setSearchParams]);

  const formatCurrency = (amount: number, currencyOverride?: string) => {
    const currentCurrency = currencyOverride || currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency,
    }).format(amount);
  };

  const formatTimeRemaining = (endsAt: string) => {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStockPercentage = (stockLeft?: number, totalStock?: number) => {
    if (!stockLeft || !totalStock) return 0;
    return (stockLeft / totalStock) * 100;
  };

  const handleAddToCart = async (deal: Deal) => {
    try {
      await addToCart(user?.id || null, deal.product as any, undefined, 1);
      // Toast notification is handled by cartStore
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const toastStore = useToastStore.getState();
      toastStore.showToast('Failed to add item to cart. Please try again.', 'error');
    }
  };

  const handleBuyNow = async (deal: Deal) => {
    try {
      await addToCart(user?.id || null, deal.product as any, undefined, 1);
      // Toast notification is handled by cartStore
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const toastStore = useToastStore.getState();
      toastStore.showToast('Failed to add item to cart. Please try again.', 'error');
    }
  };

  const handleQuickView = (deal: Deal) => {
    setQuickViewDeal(deal);
    setShowQuickView(true);
  };

  const handleToggleWishlist = async (deal: Deal) => {
    try {
      const isWishlisted = checkInWishlist(deal.product.id);
      
      if (isWishlisted) {
        // Find the wishlist item and remove it
        const wishlistItem = wishlistItems.find(item => item.product_id === deal.product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          // Toast notification is handled by wishlistStore
        }
      } else {
        // Add to wishlist
          await addToWishlist(user?.id || null, deal.product as any);
        // Toast notification is handled by wishlistStore
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      const toastStore = useToastStore.getState();
      toastStore.showToast('Failed to update wishlist. Please try again.', 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return checkInWishlist(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AnnouncementBar />
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              🔥 REAGLEX Deals
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl mb-1 sm:mb-2">
              Limited Time Offers & Flash Sales
            </p>
            <p className="text-sm sm:text-base text-orange-100">
              Save up to 70% on thousands of products
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-8">
          {/* Category Tabs */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-3 sm:py-4 scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
            {dealCategories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all'
                ? mockDeals.length
                : mockDeals.filter(d => d.category === category.id).length;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-colors text-xs sm:text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium hidden xs:inline">{category.label}</span>
                  <span className="font-medium xs:hidden">{category.label.split(' ')[0]}</span>
                  <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & View Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 sm:pb-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">Filters</span>
                <span className="font-medium sm:hidden">Filter</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 dark:text-white text-sm sm:text-base"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {filteredAndSortedDeals.length} deals found
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="sm:hidden text-xs text-gray-600 dark:text-gray-400">
                {filteredAndSortedDeals.length} deals
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8 flex-1">
        <div className="flex gap-4 lg:gap-8">
          {/* Filters Sidebar - Mobile Modal */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                
                {/* Filters Sidebar */}
                <motion.aside
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed lg:relative left-0 top-0 h-full lg:h-auto w-80 sm:w-96 lg:w-64 z-50 lg:z-auto bg-white dark:bg-gray-800 lg:rounded-lg border-r lg:border border-gray-200 dark:border-gray-700 lg:shadow-none shadow-xl overflow-y-auto"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close filters"
                      >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Category</h4>
                    <div className="space-y-2">
                      {['Electronics', 'Fashion', 'Home', 'Sports', 'Food & Beverages'].map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, cat]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat));
                              }
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Min"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Minimum Rating</h4>
                    <div className="flex items-center gap-2">
                      {[4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            minRating >= rating
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {rating}+ ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedBrands([]);
                        setPriceRange([0, 1000]);
                        setMinRating(0);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Recommended Deals Section */}
            {activeCategory === 'all' && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  🔥 Recommended for You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {mockDeals.slice(0, 4).map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      viewMode={viewMode}
                      formatCurrency={formatCurrency}
                      formatTimeRemaining={formatTimeRemaining}
                      getStockPercentage={getStockPercentage}
                      handleAddToCart={handleAddToCart}
                      handleBuyNow={handleBuyNow}
                      handleQuickView={handleQuickView}
                      isInWishlist={isInWishlist}
                      onToggleWishlist={() => handleToggleWishlist(deal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Deals Grid/List */}
            {paginatedDeals.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No deals found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Try adjusting your filters or check back later for new deals.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setPriceRange([0, 1000]);
                    setMinRating(0);
                    setActiveCategory('all');
                  }}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors text-sm sm:text-base"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                  : 'space-y-3 sm:space-y-4'
                }>
                  <AnimatePresence mode="wait">
                    {paginatedDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        viewMode={viewMode}
                        formatCurrency={formatCurrency}
                        formatTimeRemaining={formatTimeRemaining}
                        getStockPercentage={getStockPercentage}
                        handleAddToCart={handleAddToCart}
                        handleBuyNow={handleBuyNow}
                        handleQuickView={handleQuickView}
                        isInWishlist={isInWishlist}
                        onToggleWishlist={() => handleToggleWishlist(deal)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && quickViewDeal && (
          <QuickViewModal
            deal={quickViewDeal}
            isOpen={showQuickView}
            onClose={() => {
              setShowQuickView(false);
              setQuickViewDeal(null);
            }}
            formatCurrency={formatCurrency}
            formatTimeRemaining={formatTimeRemaining}
            getStockPercentage={getStockPercentage}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            handleToggleWishlist={handleToggleWishlist}
            isInWishlist={isInWishlist}
            onNavigateToProduct={(productId) => {
              navigate(`/products/${productId}`);
              setShowQuickView(false);
              setQuickViewDeal(null);
            }}
          />
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}

// Quick View Modal Component
interface QuickViewModalProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatTimeRemaining: (endsAt: string) => string;
  getStockPercentage: (stockLeft?: number, totalStock?: number) => number;
  handleAddToCart: (deal: Deal) => void;
  handleBuyNow: (deal: Deal) => void;
  handleToggleWishlist: (deal: Deal) => void;
  isInWishlist: (productId: string) => boolean;
  onNavigateToProduct: (productId: string) => void;
}

function QuickViewModal({
  deal,
  isOpen,
  onClose,
  formatCurrency,
  formatTimeRemaining,
  getStockPercentage,
  handleAddToCart,
  handleBuyNow,
  handleToggleWishlist,
  isInWishlist,
  onNavigateToProduct,
}: QuickViewModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    deal.endsAt ? formatTimeRemaining(deal.endsAt) : ''
  );

  useEffect(() => {
    if (!deal.endsAt) return;

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(deal.endsAt!));
    }, 1000);

    return () => clearInterval(interval);
  }, [deal.endsAt, formatTimeRemaining]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg max-w-4xl w-full h-full sm:h-auto max-h-[90vh] overflow-y-auto border-0 sm:border border-gray-200 dark:border-gray-700 shadow-none sm:shadow-2xl"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Quick View
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative">
                <img
                  src={deal.product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                  alt={deal.product.title}
                  className="w-full h-64 sm:h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                  -{deal.discount}%
                </div>
                {deal.exclusiveTo && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    {deal.exclusiveTo === 'new' ? 'New User' : deal.exclusiveTo === 'app' ? 'App Only' : 'Exclusive'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {deal.product.title}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(deal.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {deal.rating.toFixed(1)} ({deal.reviewCount} reviews)
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(deal.dealPrice)}
                  </span>
                  <span className="text-base sm:text-lg text-gray-500 dark:text-gray-400 line-through ml-2">
                    {formatCurrency(deal.originalPrice)}
                  </span>
                </div>
                {deal.endsAt && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Ends in: {timeRemaining}
                    </span>
                  </div>
                )}
                {deal.couponCode && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700 dark:text-purple-300">Use code:</span>
                      <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                        {deal.couponCode}
                      </span>
                    </div>
                  </div>
                )}
                {deal.stockLeft && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                      <span className={`font-medium ${
                        deal.stockLeft < 10
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {deal.stockLeft} left
                      </span>
                    </div>
                    {deal.totalStock && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${getStockPercentage(deal.stockLeft, deal.totalStock)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-4">
                  {deal.product.description || 'No description available.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(deal);
                      onClose();
                    }}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleBuyNow(deal);
                      onClose();
                    }}
                    className="px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleToggleWishlist(deal)}
                    className={`p-2.5 sm:p-3 rounded-lg transition-colors ${
                      isInWishlist(deal.product.id)
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={isInWishlist(deal.product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist(deal.product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <button
                  onClick={() => onNavigateToProduct(deal.product.id)}
                  className="w-full mt-3 px-4 py-2 text-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 transition-colors"
                >
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Deal Card Component
interface DealCardProps {
  deal: Deal;
  viewMode: 'grid' | 'list';
  formatCurrency: (amount: number) => string;
  formatTimeRemaining: (endsAt: string) => string;
  getStockPercentage: (stockLeft?: number, totalStock?: number) => number;
  handleAddToCart: (deal: Deal) => void;
  handleBuyNow: (deal: Deal) => void;
  handleQuickView: (deal: Deal) => void;
  isInWishlist: (productId: string) => boolean;
  onToggleWishlist: () => void;
}

function DealCard({
  deal,
  viewMode,
  formatCurrency,
  formatTimeRemaining,
  getStockPercentage,
  handleAddToCart,
  handleBuyNow,
  handleQuickView,
  isInWishlist,
  onToggleWishlist,
}: DealCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    deal.endsAt ? formatTimeRemaining(deal.endsAt) : ''
  );

  useEffect(() => {
    if (!deal.endsAt) return;

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(deal.endsAt!));
    }, 1000);

    return () => clearInterval(interval);
  }, [deal.endsAt, formatTimeRemaining]);

  const stockPercentage = getStockPercentage(deal.stockLeft, deal.totalStock);
  const isLowStock = stockPercentage < 20 && stockPercentage > 0;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
            <img
              src={deal.product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
              alt={deal.product.title}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              -{deal.discount}%
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">
              {deal.product.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(deal.dealPrice)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {formatCurrency(deal.originalPrice)}
              </span>
            </div>
            {deal.endsAt && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Ends in: {timeRemaining}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button
                onClick={() => handleAddToCart(deal)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors text-xs sm:text-sm font-medium"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleBuyNow(deal)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium"
              >
                Buy Now
              </button>
              <button
                onClick={onToggleWishlist}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isInWishlist(deal.product.id)
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={isInWishlist(deal.product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist(deal.product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => handleQuickView(deal)}
                className="p-1.5 sm:p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Quick View"
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all group"
    >
      <div className="relative">
        <Link to={`/products/${deal.product.id}`}>
          <img
            src={deal.product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
            alt={deal.product.title}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Discount Badge */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-red-500 text-white text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
          -{deal.discount}%
        </div>

        {/* Exclusive Badge */}
        {deal.exclusiveTo && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {deal.exclusiveTo === 'new' ? 'New User' : deal.exclusiveTo === 'app' ? 'App Only' : 'Exclusive'}
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleWishlist}
            className={`p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg ${
              isInWishlist(deal.product.id)
                ? 'text-red-500'
                : 'text-gray-600 dark:text-gray-400'
            } hover:scale-110 transition-transform`}
            aria-label={isInWishlist(deal.product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist(deal.product.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView(deal);
            }}
            className="p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg text-gray-600 dark:text-gray-400 hover:scale-110 transition-transform"
            title="Quick View"
            aria-label="Quick view"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Stock Progress Bar */}
        {isLowStock && deal.stockLeft && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Only {deal.stockLeft} left!</span>
              <span>{Math.round(stockPercentage)}% remaining</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full transition-all"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <Link to={`/products/${deal.product.id}`}>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {deal.product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {deal.rating.toFixed(1)}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            ({deal.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(deal.dealPrice)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 line-through">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>

        {/* Countdown Timer */}
        {deal.endsAt && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium text-orange-600 dark:text-orange-400 truncate">
              Ends in: {timeRemaining}
            </span>
          </div>
        )}

        {/* Coupon Code */}
        {deal.couponCode && (
          <div className="mb-2 sm:mb-3 p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-300">Use code:</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                {deal.couponCode}
              </span>
            </div>
          </div>
        )}

        {/* Bulk Deal Info */}
        {deal.minQuantity && (
          <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            Buy {deal.minQuantity}+ for bulk pricing
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleAddToCart(deal)}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors text-xs sm:text-sm font-medium"
          >
            Add to Cart
          </button>
          <button
            onClick={() => handleBuyNow(deal)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

