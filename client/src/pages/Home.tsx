import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { usePerformanceOptimization } from '../hooks/usePerformance';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { ProductFilters, type FilterState } from '../components/buyer/ProductFilters';
import { FlashSaleSection } from '../components/buyer/FlashSaleSection';
import { FeaturedCollections } from '../components/buyer/FeaturedCollections';
import { ProductSection } from '../components/buyer/ProductSection';
import { AIRecommendations } from '../components/buyer/AIRecommendations';
import { BrandSpotlight } from '../components/buyer/BrandSpotlight';
import { SponsoredAds } from '../components/buyer/SponsoredAds';
import { ShopByCategory } from '../components/buyer/ShopByCategory';
import { LocalStores } from '../components/buyer/LocalStores';
import { TrustSection } from '../components/buyer/TrustSection';
import { Testimonials } from '../components/buyer/Testimonials';
import { RecentlyViewed } from '../components/buyer/RecentlyViewed';
import { Footer } from '../components/buyer/Footer';
import { TrendingUp, Sparkles, Award, Filter } from 'lucide-react';
import { getCollections } from '../lib/collections';
import type { Product, Collection } from '../types';

// Mock products for demonstration
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation',
    price: 299.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 50,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 0,
    images: [{ id: 'img-1', product_id: '1', url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, created_at: new Date().toISOString() }],
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    description: 'Track your health and fitness with GPS and heart rate monitor',
    price: 249.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 75,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 0,
    images: [{ id: 'img-2', product_id: '2', url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, created_at: new Date().toISOString() }],
  },
  {
    id: '3',
    title: 'Premium Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment',
    price: 189.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 30,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 0,
    images: [{ id: 'img-3', product_id: '3', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, created_at: new Date().toISOString() }],
  },
  {
    id: '4',
    title: 'Minimalist Sneakers',
    description: 'Comfortable all-day wear sneakers with eco-friendly materials',
    price: 129.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 100,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 0,
    images: [{ id: 'img-4', product_id: '4', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, created_at: new Date().toISOString() }],
  },
];

export function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allProductsData, setAllProductsData] = useState<Product[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilters, setProductFilters] = useState<FilterState>({
    sort: 'relevance',
    category: [],
    brand: [],
    priceRange: [0, 2000],
    color: [],
    size: [],
    rating: null,
    seller: [],
    delivery: [],
    stock: [],
    quickFilters: [],
  });

  // Performance optimizations
  usePerformanceOptimization();

  // Get filter from URL
  const categoryFilter = searchParams.get('category') || 'all';
  const subcategoryFilter = searchParams.get('subcategory') || null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products from MongoDB API
      const API_BASE = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/products?status=in_stock&limit=50&sort=createdAt&order=desc`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const apiProducts = (data.products || []).map((p: any) => {
          const product: Product = {
            id: p._id || p.id,
            title: p.name,
            description: p.description || '',
            price: p.price,
            compare_at_price: p.discount ? p.price + p.discount : undefined,
            category_id: p.category || '',
            status: p.status === 'in_stock' || p.status === 'low_stock' ? 'active' : 'inactive',
            seller_id: p.sellerId?.toString() || '',
            created_at: p.createdAt || new Date().toISOString(),
            updated_at: p.updatedAt || new Date().toISOString(),
            stock_quantity: p.stock || 0,
            is_shippable: true,
            low_stock_threshold: 10,
            views_count: p.views || 0,
            sku: p.sku || '',
            images: p.images?.map((img: string, index: number) => ({
              id: `img-${p._id || p.id}-${index}`,
              product_id: p._id || p.id,
              url: img.startsWith('http') ? img : `http://localhost:5000${img}`,
              position: index,
              is_primary: index === 0,
              created_at: new Date().toISOString(),
            })) || [],
            tags: p.tags || [],
          };

          // Sort images by position
          if (product.images) {
            product.images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          }

          return product;
        });

        setAllProductsData(apiProducts.length > 0 ? apiProducts : MOCK_PRODUCTS);
      } else {
        // Use mock data if API fails
        setAllProductsData(MOCK_PRODUCTS);
      }

      // Load collections
      const collectionsRes = await getCollections({ featured: true, active: true });
      if (collectionsRes.data) {
        setFeaturedCollections(collectionsRes.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data on error
      setAllProductsData(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on category, subcategory, and product filters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProductsData];

    // Apply category filter
    if (categoryFilter !== 'all') {
      const categoryMap: Record<string, string> = {
        'electronics': 'electronics',
        'fashion': 'fashion',
        'groceries': 'groceries',
        'baby': 'baby',
        'automotive': 'automotive',
        'appliances': 'appliances',
      };
      
      const expectedCategoryId = categoryMap[categoryFilter];
      if (expectedCategoryId) {
        filtered = filtered.filter(product => product.category_id === expectedCategoryId);
      }
    }

    // Apply category filter
    if (productFilters.category.length > 0) {
      filtered = filtered.filter(product => 
        productFilters.category.includes(product.category_id || '')
      );
    }

    // Apply brand filter
    if (productFilters.brand.length > 0) {
      // In production, filter by actual brand field
      filtered = filtered.filter(product => 
        productFilters.brand.some(brand => product.title.toLowerCase().includes(brand.toLowerCase()))
      );
    }

    // Apply price range filter
    if (productFilters.priceRange[0] !== 0 || productFilters.priceRange[1] !== 2000) {
      filtered = filtered.filter(product => 
        product.price >= productFilters.priceRange[0] && product.price <= productFilters.priceRange[1]
      );
    }

    // Apply stock filter
    if (productFilters.stock.length > 0) {
      if (productFilters.stock.includes('in_stock')) {
        filtered = filtered.filter(product => product.stock_quantity > 0);
      }
      if (productFilters.stock.includes('out_of_stock')) {
        filtered = filtered.filter(product => product.stock_quantity === 0);
      }
    }

    // Apply quick filters
    if (productFilters.quickFilters.includes('in_stock')) {
      filtered = filtered.filter(product => product.stock_quantity > 0);
    }
    if (productFilters.quickFilters.includes('discounted')) {
      filtered = filtered.filter(product => product.compare_at_price && product.compare_at_price > product.price);
    }

    // Apply sorting
    if (productFilters.sort !== 'relevance') {
      filtered.sort((a, b) => {
        switch (productFilters.sort) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'rating':
            // Would need rating data
            return 0;
          case 'popular':
            return (b.views_count || 0) - (a.views_count || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [allProductsData, categoryFilter, subcategoryFilter, productFilters]);

  // Split filtered products into sections
  const trendingProducts = useMemo(() => {
    return filteredProducts.slice(0, 4);
  }, [filteredProducts]);

  const newArrivals = useMemo(() => {
    return filteredProducts.slice(4, 8);
  }, [filteredProducts]);

  const topRated = useMemo(() => {
    return filteredProducts.slice(8, 12);
  }, [filteredProducts]);

  const allProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />
      <ProductFilters products={allProductsData} onFilterChange={setProductFilters} />
      
      <main className="transition-all duration-300">
        {/* Flash Sale Section */}
        {allProducts.length > 0 && <FlashSaleSection products={allProducts} />}

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <FeaturedCollections collections={featuredCollections} />
        )}

        {/* No Products Found Message */}
        {filteredProducts.length === 0 && !loading && (
          <div className="py-12 sm:py-16 lg:py-20 text-center px-4">
            <div className="max-w-md mx-auto">
              <Filter className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your filters or browse all categories
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  navigate(`/?${params.toString()}`, { replace: true });
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Popular/Trending Products */}
        {trendingProducts.length > 0 && (
          <ProductSection
            title="Popular Products"
            products={trendingProducts}
            icon={TrendingUp}
            link={`/products?sort=popular${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}${productFilters.category.length > 0 ? `&categories=${productFilters.category.join(',')}` : ''}`}
            badge="Trending"
            showQuickView
          />
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <ProductSection
            title="New Arrivals"
            products={newArrivals}
            icon={Sparkles}
            link={`/products?new=true${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}${productFilters.category.length > 0 ? `&categories=${productFilters.category.join(',')}` : ''}`}
            badge="New"
            showQuickView
          />
        )}

        {/* Top Rated Products */}
        {topRated.length > 0 && (
          <ProductSection
            title="Top Rated Products"
            products={topRated}
            icon={Award}
            link={`/products?sort=rating${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}${productFilters.category.length > 0 ? `&categories=${productFilters.category.join(',')}` : ''}`}
            badge="4.8+"
            showQuickView
          />
        )}

        {/* AI Recommendations */}
        {allProducts.length > 0 && <AIRecommendations products={allProducts} />}

        {/* Brand Spotlight */}
        <BrandSpotlight />

        {/* Sponsored Ads */}
        <SponsoredAds />

        {/* Shop by Category */}
        <ShopByCategory />

        {/* Local Stores */}
        <LocalStores />

        {/* Trust Section */}
        <TrustSection />

        {/* Testimonials */}
        <Testimonials />

        {/* Recently Viewed */}
        <RecentlyViewed />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
