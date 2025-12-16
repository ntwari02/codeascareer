import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import type { Brand } from '../types';
import {
  Search,
  Star,
  CheckCircle2,
  Shield,
  Award,
  MapPin,
  Package,
  Users,
  Sparkles,
  Filter,
  ChevronRight,
  Heart,
  Grid3x3,
  List,
  ChevronLeft,
  Store,
  Flag,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'products' | 'rating' | 'followers' | 'newest';

// Mock Brands Data
const MOCK_BRANDS: Brand[] = [
  {
    id: '1',
    name: 'Samsung',
    slug: 'samsung',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Leading electronics and technology brand',
    bio: 'Samsung is a global leader in electronics, offering innovative products from smartphones to home appliances.',
    country: 'South Korea',
    country_code: 'KR',
    product_count: 1245,
    follower_count: 125000,
    seller_rating: 4.8,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    categories: ['Electronics', 'Phones', 'Computers', 'Appliances'],
    tags: ['premium', 'international'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Nike',
    slug: 'nike',
    logo: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Just Do It - Athletic wear and footwear',
    bio: 'Nike creates innovative athletic footwear, apparel, and equipment for athletes worldwide.',
    country: 'United States',
    country_code: 'US',
    product_count: 892,
    follower_count: 98000,
    seller_rating: 4.9,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    categories: ['Fashion', 'Accessories'],
    tags: ['sports', 'premium'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Apple',
    slug: 'apple',
    logo: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Think Different - Premium technology products',
    bio: 'Apple designs and manufactures consumer electronics, software, and online services.',
    country: 'United States',
    country_code: 'US',
    product_count: 567,
    follower_count: 150000,
    seller_rating: 4.9,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: false,
    categories: ['Electronics', 'Phones', 'Computers', 'Accessories'],
    tags: ['premium', 'luxury'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Tecno',
    slug: 'tecno',
    logo: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Affordable smartphones for Africa',
    bio: 'Tecno Mobile is a leading smartphone brand in Africa, offering quality devices at affordable prices.',
    country: 'China',
    country_code: 'CN',
    product_count: 234,
    follower_count: 45000,
    seller_rating: 4.6,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    is_local: false,
    categories: ['Phones', 'Electronics'],
    tags: ['affordable', 'popular'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Hisense',
    slug: 'hisense',
    logo: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Smart TVs and home appliances',
    bio: 'Hisense offers innovative smart TVs, refrigerators, and home appliances.',
    country: 'China',
    country_code: 'CN',
    product_count: 456,
    follower_count: 32000,
    seller_rating: 4.5,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: false,
    categories: ['Appliances', 'Electronics'],
    tags: ['smart', 'home'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Adidas',
    slug: 'adidas',
    logo: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Impossible is Nothing - Sportswear and footwear',
    bio: 'Adidas creates performance and lifestyle sportswear, footwear, and accessories.',
    country: 'Germany',
    country_code: 'DE',
    product_count: 678,
    follower_count: 87000,
    seller_rating: 4.7,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    categories: ['Fashion', 'Accessories'],
    tags: ['sports', 'premium'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Infinix',
    slug: 'infinix',
    logo: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Smartphones designed for young consumers',
    bio: 'Infinix Mobile offers feature-rich smartphones with cutting-edge technology.',
    country: 'China',
    country_code: 'CN',
    product_count: 189,
    follower_count: 28000,
    seller_rating: 4.4,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: true,
    categories: ['Phones', 'Electronics'],
    tags: ['youth', 'affordable'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Kigali Tech Hub',
    slug: 'kigali-tech-hub',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Local technology solutions from Rwanda',
    bio: 'Kigali Tech Hub provides innovative tech solutions and electronics for the East African market.',
    country: 'Rwanda',
    country_code: 'RW',
    product_count: 45,
    follower_count: 1200,
    seller_rating: 4.3,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: false,
    is_local: true,
    is_new: true,
    categories: ['Electronics', 'Computers'],
    tags: ['local', 'rwanda', 'africa'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'Nairobi Fashion Co.',
    slug: 'nairobi-fashion-co',
    logo: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Made in Kenya - Authentic African fashion',
    bio: 'Nairobi Fashion Co. creates contemporary African-inspired fashion and accessories.',
    country: 'Kenya',
    country_code: 'KE',
    product_count: 78,
    follower_count: 3500,
    seller_rating: 4.5,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: false,
    is_local: true,
    categories: ['Fashion', 'Beauty'],
    tags: ['local', 'kenya', 'africa', 'fashion'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Kampala Electronics',
    slug: 'kampala-electronics',
    logo: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Quality electronics from Uganda',
    bio: 'Kampala Electronics offers reliable electronics and home appliances.',
    country: 'Uganda',
    country_code: 'UG',
    product_count: 123,
    follower_count: 2100,
    seller_rating: 4.2,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: false,
    is_local: true,
    categories: ['Electronics', 'Appliances'],
    tags: ['local', 'uganda', 'africa'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'Dar es Salaam Wholesale',
    slug: 'dar-es-salaam-wholesale',
    logo: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Bulk wholesale products for businesses',
    bio: 'Dar es Salaam Wholesale provides wholesale products for retailers and businesses.',
    country: 'Tanzania',
    country_code: 'TZ',
    product_count: 567,
    follower_count: 8900,
    seller_rating: 4.4,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: false,
    is_local: true,
    is_wholesale: true,
    categories: ['Wholesale'],
    tags: ['wholesale', 'tanzania', 'africa', 'business'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'Beauty Essentials',
    slug: 'beauty-essentials',
    logo: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Premium beauty and skincare products',
    bio: 'Beauty Essentials offers high-quality beauty and skincare products.',
    country: 'United States',
    country_code: 'US',
    product_count: 234,
    follower_count: 15000,
    seller_rating: 4.6,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    is_trending: true,
    categories: ['Beauty'],
    tags: ['beauty', 'skincare'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Beauty',
  'Appliances',
  'Phones',
  'Computers',
  'Accessories',
  'Home & Office',
  'Wholesale',
];

const COUNTRIES = [
  'All Countries',
  'Rwanda',
  'Kenya',
  'Uganda',
  'Tanzania',
  'South Korea',
  'United States',
  'China',
  'Germany',
];

export function Brands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'All Countries');
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('rating') || '0'));
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [wholesaleOnly, setWholesaleOnly] = useState(searchParams.get('wholesale') === 'true');
  const [freeShippingOnly, setFreeShippingOnly] = useState(searchParams.get('freeShipping') === 'true');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(searchParams.get('letter') || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [followedBrands, setFollowedBrands] = useState<Set<string>>(new Set());
  const brandsPerPage = 24;
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Filter and sort brands
  const filteredBrands = useMemo(() => {
    let filtered = [...MOCK_BRANDS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(query) ||
          brand.description?.toLowerCase().includes(query) ||
          brand.categories?.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((brand) =>
        brand.categories?.includes(selectedCategory)
      );
    }

    // Country filter
    if (selectedCountry !== 'All Countries') {
      filtered = filtered.filter((brand) => brand.country === selectedCountry);
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((brand) => (brand.seller_rating || 0) >= minRating);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter((brand) => brand.is_verified);
    }

    // Wholesale filter
    if (wholesaleOnly) {
      filtered = filtered.filter((brand) => brand.is_wholesale);
    }

    // Free shipping filter
    if (freeShippingOnly) {
      filtered = filtered.filter((brand) => brand.offers_free_shipping);
    }

    // Alphabet filter
    if (selectedLetter) {
      filtered = filtered.filter((brand) =>
        brand.name.toUpperCase().startsWith(selectedLetter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return b.product_count - a.product_count;
        case 'rating':
          return (b.seller_rating || 0) - (a.seller_rating || 0);
        case 'followers':
          return (b.follower_count || 0) - (a.follower_count || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedCountry, minRating, verifiedOnly, wholesaleOnly, freeShippingOnly, selectedLetter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * brandsPerPage;
    return filteredBrands.slice(start, start + brandsPerPage);
  }, [filteredBrands, currentPage]);

  // Featured brands
  const featuredBrands = useMemo(() => MOCK_BRANDS.filter((b) => b.is_featured), []);
  const topBrands = useMemo(() => MOCK_BRANDS.filter((b) => b.is_top_brand), []);
  const trendingBrands = useMemo(() => MOCK_BRANDS.filter((b) => b.is_trending), []);
  const localBrands = useMemo(() => MOCK_BRANDS.filter((b) => b.is_local), []);
  const newBrands = useMemo(() => MOCK_BRANDS.filter((b) => b.is_new), []);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    if (selectedCountry !== 'All Countries') params.set('country', selectedCountry);
    if (minRating > 0) params.set('rating', minRating.toString());
    if (verifiedOnly) params.set('verified', 'true');
    if (wholesaleOnly) params.set('wholesale', 'true');
    if (freeShippingOnly) params.set('freeShipping', 'true');
    if (selectedLetter) params.set('letter', selectedLetter);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedCountry, minRating, verifiedOnly, wholesaleOnly, freeShippingOnly, selectedLetter, setSearchParams]);

  const handleFollow = useCallback((brandId: string) => {
    setFollowedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandId)) {
        newSet.delete(brandId);
      } else {
        newSet.add(brandId);
      }
      return newSet;
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // SEO Metadata
  useEffect(() => {
    document.title = 'Shop by Brands | REAGLEX - Discover Top Brands & Verified Sellers';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Browse top brands, verified sellers, and trending manufacturers on REAGLEX. Shop electronics, fashion, beauty, appliances, and more from trusted brands worldwide.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content =
        'Browse top brands, verified sellers, and trending manufacturers on REAGLEX. Shop electronics, fashion, beauty, appliances, and more from trusted brands worldwide.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AnnouncementBar />
      <Header />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Shop by Brands
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover top brands, verified sellers, and trending manufacturers on REAGLEX.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLetter(null); // Clear letter filter when typing
              }}
              placeholder="Search brands by name, category, or description..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Alphabet Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filter:</span>
            <button
              onClick={() => {
                setSelectedLetter(null);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                selectedLetter === null
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-orange-500'
              }`}
            >
              All
            </button>
            {alphabet.map((letter) => {
              const hasBrands = MOCK_BRANDS.some((brand) =>
                brand.name.toUpperCase().startsWith(letter)
              );
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSearchQuery(''); // Clear search when using letter filter
                    setCurrentPage(1);
                  }}
                  disabled={!hasBrands}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    selectedLetter === letter
                      ? 'bg-orange-600 text-white'
                      : hasBrands
                      ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-orange-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filters - Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-orange-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Sort by Name</option>
              <option value="products">Most Products</option>
              <option value="rating">Highest Rating</option>
              <option value="followers">Most Followers</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedBrands.length} of {filteredBrands.length} brands
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(parseFloat(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                >
                  <option value="0">Any Rating</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => {
                        setVerifiedOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Verified Only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={wholesaleOnly}
                      onChange={(e) => {
                        setWholesaleOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Wholesale Only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={freeShippingOnly}
                      onChange={(e) => {
                        setFreeShippingOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Free Shipping
                  </label>
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMinRating(0);
                    setSelectedCountry('All Countries');
                    setVerifiedOnly(false);
                    setWholesaleOnly(false);
                    setFreeShippingOnly(false);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Brand Banners */}
        {featuredBrands.length > 0 && currentPage === 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-orange-600" />
              Featured Brands
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBrands.slice(0, 6).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {brand.banner_image && (
                    <div className="absolute inset-0 opacity-30">
                      <img
                        src={brand.banner_image}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      {brand.logo && (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-16 h-16 rounded-lg bg-white p-2 object-contain"
                        />
                      )}
                      {brand.is_verified && (
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{brand.name}</h3>
                    <p className="text-gray-200 mb-4 line-clamp-2">{brand.description}</p>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      Shop Now <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Brand Grid/List */}
        {paginatedBrands.length > 0 ? (
          <section>
            {currentPage === 1 && (
              <>
                {/* Top Brands Section */}
                {topBrands.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500" />
                      Top Brands
                    </h2>
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
                      {topBrands.map((brand) => (
                        <BrandCard
                          key={brand.id}
                          brand={brand}
                          viewMode={viewMode}
                          isFollowed={followedBrands.has(brand.id)}
                          onFollow={handleFollow}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Brands */}
                {trendingBrands.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-orange-500" />
                      Trending Brands
                    </h2>
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
                      {trendingBrands.map((brand) => (
                        <BrandCard
                          key={brand.id}
                          brand={brand}
                          viewMode={viewMode}
                          isFollowed={followedBrands.has(brand.id)}
                          onFollow={handleFollow}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Brands */}
                {localBrands.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Flag className="h-6 w-6 text-green-500" />
                      Local Brands (Made in Africa)
                    </h2>
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
                      {localBrands.map((brand) => (
                        <BrandCard
                          key={brand.id}
                          brand={brand}
                          viewMode={viewMode}
                          isFollowed={followedBrands.has(brand.id)}
                          onFollow={handleFollow}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* New & Emerging Brands */}
                {newBrands.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-blue-500" />
                      New & Emerging Brands
                    </h2>
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
                      {newBrands.map((brand) => (
                        <BrandCard
                          key={brand.id}
                          brand={brand}
                          viewMode={viewMode}
                          isFollowed={followedBrands.has(brand.id)}
                          onFollow={handleFollow}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* All Brands Grid */}
            <div className="mb-8">
              {currentPage > 1 && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  All Brands
                </h2>
              )}
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'}`}>
                {paginatedBrands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    viewMode={viewMode}
                    isFollowed={followedBrands.has(brand.id)}
                    onFollow={handleFollow}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No brands found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No brands match your filters. Try adjusting your search.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setSelectedCountry('All Countries');
                setMinRating(0);
                setVerifiedOnly(false);
                setWholesaleOnly(false);
                setFreeShippingOnly(false);
                setSelectedLetter(null);
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Brand Card Component
interface BrandCardProps {
  brand: Brand;
  viewMode: ViewMode;
  isFollowed: boolean;
  onFollow: (brandId: string) => void;
}

function BrandCard({ brand, viewMode, isFollowed, onFollow }: BrandCardProps) {
  if (viewMode === 'list') {
    return (
      <Link
        to={`/brands/${brand.slug}`}
        className="group flex items-center gap-4 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
      >
        {brand.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-20 h-20 rounded-lg object-contain bg-gray-100 dark:bg-gray-800 p-2"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name}</h3>
            {brand.is_verified && (
              <div className="group relative" title="Verified Brand">
                <div className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
                  <span className="sr-only">Verified Brand</span>
                </div>
              </div>
            )}
            {brand.is_top_brand && (
              <div className="group relative" title="Top Brand">
                <div className="inline-flex items-center justify-center rounded-full bg-yellow-500/10 p-1">
                  <Award className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                  <span className="sr-only">Top Brand</span>
                </div>
              </div>
            )}
            {brand.is_trusted_seller && (
              <div className="group relative" title="Trusted Seller">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-500/10 p-1">
                  <Shield className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  <span className="sr-only">Trusted Seller</span>
                </div>
              </div>
            )}
          </div>
          {brand.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {brand.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
            {brand.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {brand.country}
              </span>
            )}
            {brand.seller_rating && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {brand.seller_rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {brand.product_count} products
            </span>
            {brand.follower_count && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {brand.follower_count.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onFollow(brand.id);
            }}
            variant={isFollowed ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isFollowed ? 'fill-current' : ''}`} />
            {isFollowed ? 'Following' : 'Follow'}
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-2">
            Visit Store <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/brands/${brand.slug}`}
      className="group bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 p-3 group-hover:scale-110 transition-transform duration-300">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <Store className="w-full h-full text-gray-400" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 flex gap-1">
            {brand.is_verified && (
              <div className="group relative" title="Verified Brand">
                <div className="inline-flex items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
                  <span className="sr-only">Verified Brand</span>
                </div>
              </div>
            )}
            {brand.is_top_brand && (
              <div className="group relative" title="Top Brand">
                <div className="inline-flex items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
                  <Award className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                  <span className="sr-only">Top Brand</span>
                </div>
              </div>
            )}
            {brand.is_trusted_seller && (
              <div className="group relative" title="Trusted Seller">
                <div className="inline-flex items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
                  <Shield className="h-5 w-5 text-blue-500" aria-hidden="true" />
                  <span className="sr-only">Trusted Seller</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {brand.name}
        </h3>
        {brand.country && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {brand.country}
          </p>
        )}
        {brand.seller_rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {brand.seller_rating.toFixed(1)}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          {brand.product_count} products
        </p>
        <div className="w-full space-y-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onFollow(brand.id);
            }}
            variant={isFollowed ? 'default' : 'outline'}
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isFollowed ? 'fill-current' : ''}`} />
            {isFollowed ? 'Following' : 'Follow'}
          </Button>
          <Button variant="default" size="sm" className="w-full flex items-center justify-center gap-2">
            Visit Store <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

