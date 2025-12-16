import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import type { Product } from '../types';
import {
  Star,
  Shield,
  MapPin,
  ShoppingBag,
  Heart,
  Share2,
  Grid3x3,
  List,
  Package,
  Clock,
} from 'lucide-react';

// Mock Store Data
const MOCK_STORES: Record<string, {
  id: string;
  name: string;
  storeName: string;
  rating: number;
  verified: boolean;
  totalSales: number;
  location: string;
  image?: string;
  badge?: string;
  description?: string;
  joinedDate?: string;
  responseTime?: string;
  returnPolicy?: string;
}> = {
  '1': {
    id: '1',
    name: 'Tech Store',
    storeName: 'Tech Store Official',
    rating: 4.8,
    verified: true,
    totalSales: 12500,
    location: 'Kigali, Rwanda',
    badge: 'Top Seller',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Your trusted source for premium electronics and tech accessories. We offer the latest gadgets with warranty and excellent customer service.',
    joinedDate: '2020-01-15',
    responseTime: 'Within 2 hours',
    returnPolicy: '30-day return policy'
  },
  '2': {
    id: '2',
    name: 'Fashion Hub',
    storeName: 'Fashion Hub',
    rating: 4.6,
    verified: true,
    totalSales: 9800,
    location: 'Kigali, Rwanda',
    badge: 'Featured',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Trendy fashion for the modern lifestyle. Discover the latest styles in clothing, accessories, and footwear.',
    joinedDate: '2019-06-20',
    responseTime: 'Within 3 hours',
    returnPolicy: '14-day return policy'
  },
  '3': {
    id: '3',
    name: 'Electronics Plus',
    storeName: 'Electronics Plus',
    rating: 4.9,
    verified: true,
    totalSales: 15200,
    location: 'Kigali, Rwanda',
    badge: 'Best Rated',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Premium electronics and smart devices. Quality guaranteed with professional support and fast shipping.',
    joinedDate: '2018-03-10',
    responseTime: 'Within 1 hour',
    returnPolicy: '30-day return policy'
  },
  '4': {
    id: '4',
    name: 'Home Essentials',
    storeName: 'Home Essentials Store',
    rating: 4.7,
    verified: true,
    totalSales: 11200,
    location: 'Kigali, Rwanda',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Everything you need for your home. From furniture to decor, we have it all.',
    joinedDate: '2021-02-05',
    responseTime: 'Within 4 hours',
    returnPolicy: '14-day return policy'
  }
};

// Mock Products - Filtered by seller_id
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation',
    price: 299.99,
    compare_at_price: 399.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 50,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 1234,
    sku: 'WH-001',
    images: [
      { id: 'img-1-1', product_id: '1', url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['new', 'trending']
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    description: 'Track your health and fitness with GPS and heart rate monitor',
    price: 249.99,
    compare_at_price: 299.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 75,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 987,
    sku: 'SW-002',
    images: [
      { id: 'img-2-1', product_id: '2', url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['trending']
  },
  {
    id: '3',
    title: 'Premium Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment',
    price: 189.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 30,
    is_shippable: true,
    low_stock_threshold: 5,
    views_count: 654,
    sku: 'LB-003',
    images: [
      { id: 'img-3-1', product_id: '3', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '4',
    title: 'Minimalist Sneakers',
    description: 'Comfortable all-day wear sneakers with eco-friendly materials',
    price: 129.99,
    compare_at_price: 179.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: '4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 100,
    is_shippable: true,
    low_stock_threshold: 20,
    views_count: 1456,
    sku: 'MS-004',
    images: [
      { id: 'img-4-1', product_id: '4', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['new']
  },
  {
    id: '5',
    title: 'Portable Phone Charger 10000mAh',
    description: 'Fast charging power bank for all devices',
    price: 39.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 200,
    is_shippable: true,
    low_stock_threshold: 50,
    views_count: 2341,
    sku: 'PC-005',
    images: [
      { id: 'img-5-1', product_id: '5', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '6',
    title: 'Designer Sunglasses',
    description: 'UV protection sunglasses with polarized lenses',
    price: 89.99,
    compare_at_price: 149.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 60,
    is_shippable: true,
    low_stock_threshold: 15,
    views_count: 876,
    sku: 'SG-006',
    images: [
      { id: 'img-6-1', product_id: '6', url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  }
];

type ViewMode = 'grid' | 'list';

export function StorePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { currency } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');

  const store = id ? MOCK_STORES[id] : null;
  const storeProducts = useMemo(() => {
    if (!id) return [];
    return MOCK_PRODUCTS.filter(p => p.seller_id === id);
  }, [id]);

  const sortedProducts = useMemo(() => {
    const sorted = [...storeProducts];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [storeProducts, sortBy]);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="w-full px-4 py-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The store you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (product: Product) => {
    addToCart(user?.id || null, product);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Store Header */}
        <div className="mb-6 sm:mb-8">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            {/* Store Cover Image */}
            <div className="relative h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-orange-500 to-red-500">
              {store.image && (
                <img
                  src={store.image}
                  alt={store.storeName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Badge */}
              {store.badge && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <span className="px-3 py-1.5 bg-orange-600/90 backdrop-blur-sm text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg">
                    {store.badge}
                  </span>
                </div>
              )}

              {/* Verified Badge */}
              {store.verified && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4" title="Verified Seller">
                  <div className="bg-blue-600/90 backdrop-blur-sm p-2 rounded-full shadow-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">Verified Seller</span>
                  </div>
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {store.storeName}
                  </h1>
                  {store.description && (
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
                      {store.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{store.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{store.rating}</span>
                      <span className="text-gray-500">({store.totalSales.toLocaleString()} sales)</span>
                    </div>
                    {store.responseTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{store.responseTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Follow
                  </Button>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {storeProducts.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {store.rating}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {store.totalSales.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {store.verified ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Products ({storeProducts.length})
            </h2>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Products Available</h3>
              <p className="text-gray-600 dark:text-gray-400">This store doesn't have any products yet.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
              : 'space-y-4'
            }>
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : ''
                  }`}
                >
                  {/* Product Image */}
                  <Link
                    to={`/products/${product.id}`}
                    className={`relative group ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48 sm:h-56'}`}
                  >
                    <div className={`w-full h-full bg-gray-200 dark:bg-gray-700 overflow-hidden ${viewMode === 'list' ? 'rounded-lg' : ''}`}>
                      <img
                        src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                    <Link to={`/products/${product.id}`}>
                      <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                        viewMode === 'list' ? 'text-base' : 'text-sm sm:text-base'
                      }`}>
                        {product.title}
                      </h3>
                    </Link>
                    {viewMode === 'list' && product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(product.price, currency)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.compare_at_price, currency)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>4.5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{product.stock_quantity} in stock</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

