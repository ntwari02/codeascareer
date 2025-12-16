import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import type { Brand, Product } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Shield,
  Award,
  MapPin,
  Package,
  Users,
  Heart,
  Share2,
  Truck,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Grid3x3,
  List,
  Filter,
  ShoppingCart,
  Sparkles,
  Tag,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';

// Extended Brand interface for store page
interface BrandStore extends Brand {
  total_orders?: number;
  brand_story?: string;
  mission?: string;
  certifications?: string[];
  deals?: Deal[];
  best_sellers?: Product[];
  new_arrivals?: Product[];
}

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  end_time: string;
  product_ids: string[];
}

interface BrandReview {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Mock data
const MOCK_BRANDS: BrandStore[] = [
  {
    id: '1',
    name: 'Nike',
    slug: 'nike',
    logo: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Just Do It - Athletic wear and footwear',
    bio: 'Nike creates innovative athletic footwear, apparel, and equipment for athletes worldwide.',
    brand_story: 'Founded in 1964 as Blue Ribbon Sports, Nike has grown to become the world\'s leading athletic brand. Our mission is to bring inspiration and innovation to every athlete in the world.',
    mission: 'To bring inspiration and innovation to every athlete in the world. If you have a body, you are an athlete.',
    country: 'United States',
    country_code: 'US',
    website: 'https://www.nike.com',
    email: 'contact@nike.com',
    phone: '+1-800-344-6453',
    product_count: 892,
    follower_count: 98000,
    total_orders: 125000,
    seller_rating: 4.9,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    categories: ['Fashion', 'Accessories', 'Shoes', 'Sportswear'],
    tags: ['sports', 'premium', 'athletic'],
    offers_free_shipping: true,
    certifications: ['ISO 9001', 'Fair Trade Certified', 'Carbon Neutral'],
    policies: {
      returns: '60-day return policy. Items must be unworn and in original packaging.',
      warranty: '2-year manufacturer warranty on all footwear. 1-year warranty on apparel.',
      shipping: 'Free shipping on orders over $75. Express shipping available. 2-5 business days delivery.',
    },
    performance_stats: {
      response_time: '< 1 hour',
      fulfillment_rate: 99.2,
      on_time_delivery: 98.5,
    },
    deals: [
      {
        id: '1',
        title: 'Flash Sale - Up to 50% Off',
        description: 'Limited time offer on selected items',
        discount_percent: 50,
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        product_ids: ['1', '2', '3'],
      },
    ],
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Samsung',
    slug: 'samsung',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Leading electronics and technology brand',
    bio: 'Samsung is a global leader in electronics, offering innovative products from smartphones to home appliances.',
    brand_story: 'Samsung has been at the forefront of innovation for over 50 years, creating products that enhance people\'s lives.',
    mission: 'To inspire the world with our innovative technologies, products, and designs.',
    country: 'South Korea',
    country_code: 'KR',
    website: 'https://www.samsung.com',
    email: 'contact@samsung.com',
    phone: '+82-2-2255-0114',
    product_count: 1245,
    follower_count: 125000,
    total_orders: 250000,
    seller_rating: 4.8,
    is_verified: true,
    is_top_brand: true,
    is_trusted_seller: true,
    is_featured: true,
    is_trending: true,
    categories: ['Electronics', 'Phones', 'Computers', 'Appliances'],
    tags: ['premium', 'international'],
    offers_free_shipping: true,
    certifications: ['ISO 9001', 'Energy Star'],
    policies: {
      returns: '30-day return policy. Items must be in original condition.',
      warranty: '1-2 years manufacturer warranty on all products.',
      shipping: 'Free shipping on orders over $50. Standard shipping 3-5 business days.',
    },
    performance_stats: {
      response_time: '< 2 hours',
      fulfillment_rate: 98.5,
      on_time_delivery: 96.2,
    },
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'TechWorld',
    slug: 'techworld',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Premium Electronics',
    bio: 'TechWorld delivers high-quality electronics and accessories for modern lifestyles.',
    country: 'United States',
    country_code: 'US',
    website: 'https://example.com/techworld',
    product_count: 245,
    follower_count: 5200,
    total_orders: 18000,
    seller_rating: 4.6,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    categories: ['Electronics', 'Computers', 'Accessories'],
    tags: ['premium', 'electronics'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'FashionHub',
    slug: 'fashionhub',
    logo: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Trendy Fashion',
    bio: 'FashionHub brings the latest trends in apparel and accessories.',
    country: 'United States',
    country_code: 'US',
    website: 'https://example.com/fashionhub',
    product_count: 189,
    follower_count: 6100,
    total_orders: 12000,
    seller_rating: 4.5,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    categories: ['Fashion', 'Accessories'],
    tags: ['fashion', 'trendy'],
    offers_free_shipping: true,
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'HomeEssentials',
    slug: 'homeessentials',
    logo: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Home & Living',
    bio: 'HomeEssentials provides quality products for your home and lifestyle.',
    country: 'United States',
    country_code: 'US',
    website: 'https://example.com/homeessentials',
    product_count: 156,
    follower_count: 4300,
    total_orders: 9800,
    seller_rating: 4.4,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    categories: ['Home & Office', 'Appliances', 'Accessories'],
    tags: ['home', 'living'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'SportsPro',
    slug: 'sportspro',
    logo: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200',
    banner_image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Sports & Outdoors',
    bio: 'SportsPro offers performance gear and outdoor equipment for athletes.',
    country: 'United States',
    country_code: 'US',
    website: 'https://example.com/sportspro',
    product_count: 98,
    follower_count: 3100,
    total_orders: 7600,
    seller_rating: 4.3,
    is_verified: true,
    is_top_brand: false,
    is_trusted_seller: true,
    is_featured: false,
    categories: ['Sportswear', 'Accessories'],
    tags: ['sports', 'outdoors'],
    offers_free_shipping: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max cushioning',
    price: 150.00,
    compare_at_price: 180.00,
    category_id: 'shoes',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 50,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 1234,
    images: [
      {
        id: 'img-1',
        product_id: '1',
        url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      },
    ],
    tags: ['new', 'bestseller'],
  },
  {
    id: '2',
    title: 'Nike Dri-FIT Training T-Shirt',
    description: 'Moisture-wicking athletic t-shirt',
    price: 35.00,
    compare_at_price: 45.00,
    category_id: 'sportswear',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 100,
    is_shippable: true,
    low_stock_threshold: 20,
    views_count: 987,
    images: [
      {
        id: 'img-2',
        product_id: '2',
        url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      },
    ],
    tags: ['new', 'trending'],
  },
  {
    id: '3',
    title: 'Nike Sportswear Backpack',
    description: 'Durable backpack for sports and everyday use',
    price: 65.00,
    category_id: 'accessories',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 75,
    is_shippable: true,
    low_stock_threshold: 15,
    views_count: 654,
    images: [
      {
        id: 'img-3',
        product_id: '3',
        url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      },
    ],
    tags: ['bestseller'],
  },
];

const MOCK_REVIEWS: BrandReview[] = [
  {
    id: '1',
    user_name: 'John D.',
    rating: 5,
    comment: 'Amazing brand! Fast shipping and great quality products.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_name: 'Sarah M.',
    rating: 5,
    comment: 'Love Nike products. Always reliable and stylish.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type TabType = 'all' | 'categories' | 'new' | 'bestsellers' | 'deals' | 'reviews' | 'about';
type SortOption = 'price-asc' | 'price-desc' | 'popularity' | 'rating' | 'newest' | 'name';

export function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlistStore();
  
  const [brand, setBrand] = useState<BrandStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stickyNav, setStickyNav] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setStickyNav(rect.top <= 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const foundBrand = MOCK_BRANDS.find((b) => b.slug === slug);
    if (foundBrand) {
      setBrand(foundBrand);
      // In production, fetch products for this brand
      setProducts(MOCK_PRODUCTS);
      
      // SEO Metadata
      document.title = `${foundBrand.name} | REAGLEX Brand Store`;
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = foundBrand.bio || foundBrand.description || `Shop ${foundBrand.name} products on REAGLEX`;
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
    setLoading(false);
  }, [slug]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Tab filters
    switch (activeTab) {
      case 'new':
        filtered = filtered.filter((p) => p.tags?.includes('new'));
        break;
      case 'bestsellers':
        filtered = filtered.filter((p) => p.tags?.includes('bestseller'));
        break;
      case 'deals':
        filtered = filtered.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popularity':
          return b.views_count - a.views_count;
        case 'rating':
          return 0; // Would need rating data
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, selectedCategory, priceRange, activeTab, sortBy]);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(user?.id || null, product, undefined, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist(product.id)) {
        // Find and remove
        const wishlistItem = useWishlistStore.getState().items.find((item) => item.product_id === product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        }
      } else {
        await addToWishlist(user?.id || null, product);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
        <AnnouncementBar />
        <Header />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Brand Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The brand you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/brands')}>Back to Brands</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <AnnouncementBar />
      <Header />

      {/* Brand Header (Hero Section) */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
        {brand.banner_image && (
          <img
            src={brand.banner_image}
            alt={brand.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="relative w-full px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex items-end gap-6 w-full max-w-7xl mx-auto">
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white p-3 object-contain shadow-lg"
              />
            )}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold">{brand.name}</h1>
                {brand.is_verified && (
                  <div className="group relative" title="Verified Brand">
                    <div className="inline-flex items-center justify-center rounded-full bg-green-500/20 p-1.5">
                      <CheckCircle2 className="h-6 w-6 text-green-400" aria-hidden="true" />
                      <span className="sr-only">Verified Brand</span>
                    </div>
                  </div>
                )}
                {brand.is_top_brand && (
                  <div className="group relative" title="Top Brand">
                    <div className="inline-flex items-center justify-center rounded-full bg-yellow-500/20 p-1.5">
                      <Award className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                      <span className="sr-only">Top Brand</span>
                    </div>
                  </div>
                )}
                {brand.is_trusted_seller && (
                  <div className="group relative" title="Trusted Seller">
                    <div className="inline-flex items-center justify-center rounded-full bg-blue-500/20 p-1.5">
                      <Shield className="h-6 w-6 text-blue-400" aria-hidden="true" />
                      <span className="sr-only">Trusted Seller</span>
                    </div>
                  </div>
                )}
              </div>
              {brand.description && (
                <p className="text-lg text-gray-200 mb-3">{brand.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm flex-wrap">
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
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setIsFollowed(!isFollowed)}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFollowed ? 'fill-current' : ''}`} />
                {isFollowed ? 'Following' : 'Follow'}
              </Button>
              {brand.website && (
                <Button
                  variant="outline"
                  onClick={() => window.open(brand.website, '_blank')}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Trust & Metrics Panel */}
      <div className="w-full bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-2xl font-bold">{brand.seller_rating?.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Package className="h-5 w-5" />
                <span className="text-2xl font-bold">{brand.product_count.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Products</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{brand.total_orders?.toLocaleString() || '0'}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Orders</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{brand.follower_count?.toLocaleString() || '0'}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Tabs */}
      <div
        ref={navRef}
        className={`w-full bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 transition-all ${
          stickyNav ? 'fixed top-0 z-50 shadow-md' : 'relative'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: Grid3x3 },
              { id: 'new', label: 'New Arrivals', icon: Sparkles },
              { id: 'bestsellers', label: 'Best Sellers', icon: TrendingUp },
              { id: 'deals', label: 'Deals', icon: Tag },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'about', label: 'About Brand', icon: Info },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {stickyNav && <div className="h-16" />} {/* Spacer for sticky nav */}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/brands')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brands
          </Button>

          {/* Tab Content */}
          {activeTab === 'all' && (
            <div>
              {/* Filters and Sort */}
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
                    <option value="popularity">Sort by Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
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
                  {filteredProducts.length} products
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mb-6 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white"
                      >
                        <option value="all">All Categories</option>
                        {brand.categories?.map((cat) => (
                          <option key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No products found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {brand.categories?.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveTab('all');
                      setSelectedCategory(category.toLowerCase());
                    }}
                    className="p-4 bg-gray-50 dark:bg-dark-secondary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {products.filter((p) => p.category_id === category.toLowerCase()).length} products
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bestsellers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Best Sellers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter((p) => p.tags?.includes('bestseller')).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode="grid"
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isInWishlist(product.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'new' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Arrivals</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter((p) => p.tags?.includes('new')).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode="grid"
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isInWishlist(product.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deals' && brand.deals && brand.deals.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Deals & Promotions</h2>
              {brand.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Reviews</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Average rating: {brand.seller_rating?.toFixed(1)} / 5.0
                  </p>
                </div>
                <Button>Write a Review</Button>
              </div>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{review.user_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {brand.brand_story && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brand Story</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{brand.brand_story}</p>
                </div>
              )}
              {brand.mission && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{brand.mission}</p>
                </div>
              )}
              {brand.certifications && brand.certifications.length > 0 && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {brand.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {brand.policies && (
                <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shipping & Returns</h2>
                  <div className="space-y-4">
                    {brand.policies.shipping && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="h-5 w-5 text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">Shipping</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{brand.policies.shipping}</p>
                      </div>
                    )}
                    {brand.policies.returns && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <RefreshCw className="h-5 w-5 text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">Returns</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{brand.policies.returns}</p>
                      </div>
                    )}
                    {brand.policies.warranty && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="h-5 w-5 text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">Warranty</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{brand.policies.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Brands Section */}
        {activeTab === 'all' && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Similar Brands</h2>
              <Link
                to="/brands"
                className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                View All Brands <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {MOCK_BRANDS.filter((b) => b.id !== brand.id && b.categories?.some((c) => brand.categories?.includes(c)))
                .slice(0, 6)
                .map((relatedBrand) => (
                  <Link
                    key={relatedBrand.id}
                    to={`/brands/${relatedBrand.slug}`}
                    className="group bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all text-center"
                  >
                    {relatedBrand.logo && (
                      <img
                        src={relatedBrand.logo}
                        alt={relatedBrand.name}
                        className="w-16 h-16 mx-auto mb-2 rounded-lg object-contain group-hover:scale-110 transition-transform"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{relatedBrand.name}</h3>
                    {relatedBrand.seller_rating && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {relatedBrand.seller_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  isInWishlist: boolean;
}

function ProductCard({ product, viewMode, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/products/${product.id}`}
        className="group flex items-center gap-4 p-4 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
      >
        {product.images && product.images[0] && (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="w-24 h-24 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleWishlist(product, e)}
            className={`p-2 rounded-lg transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-white' : ''}`} />
          </button>
          <Button onClick={(e) => onAddToCart(product, e)} size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.images && product.images[0] && (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            -{discountPercent}%
          </div>
        )}
        {product.tags?.includes('new') && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            NEW
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onToggleWishlist(product, e)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-white' : ''}`} />
          </button>
        </div>
        <button
          onClick={(e) => onAddToCart(product, e)}
          className="absolute bottom-2 right-2 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{product.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(123)</span>
        </div>
      </div>
    </Link>
  );
}

// Deal Card Component
interface DealCardProps {
  deal: Deal;
}

function DealCard({ deal }: DealCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(deal.end_time).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deal.end_time]);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
          <p className="text-orange-100 mb-4">{deal.description}</p>
          {timeLeft && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs text-orange-100">Hours</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-orange-100">Minutes</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-orange-100">Seconds</div>
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" className="bg-white text-orange-600 hover:bg-gray-100">
          Shop Now <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
