import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { getCollections } from '../lib/collections';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, Collection } from '../types';

const CATEGORY_FILTERS = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'fashion', name: 'Fashion & Apparel', slug: 'fashion' },
  { id: 'beauty', name: 'Beauty & Personal Care', slug: 'beauty' },
  { id: 'home', name: 'Home & Living', slug: 'home' },
  { id: 'sports', name: 'Sports & Outdoors', slug: 'sports' },
  { id: 'health', name: 'Health & Wellness', slug: 'health' },
  { id: 'baby', name: 'Baby & Kids', slug: 'baby' },
  { id: 'automotive', name: 'Automotive & Motorcycles', slug: 'automotive' },
  { id: 'tools', name: 'Tools & Hardware', slug: 'tools' },
  { id: 'groceries', name: 'Groceries', slug: 'groceries' },
  { id: 'office', name: 'Office & School Supplies', slug: 'office' },
  { id: 'pets', name: 'Pets Supplies', slug: 'pets' },
  { id: 'gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'jewelry', name: 'Jewelry & Watches', slug: 'jewelry' },
  { id: 'books', name: 'Books & Media', slug: 'books' },
  { id: 'smart-home', name: 'Smart Home', slug: 'smart-home' },
  { id: 'appliances', name: 'Appliances', slug: 'appliances' },
];

const HERO_IMAGES = [
  {
    id: 1,
    type: 'B2B',
    title: 'Business-to-Business Solutions',
    description: 'Connect with suppliers, manage bulk orders, and streamline your business operations',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 2,
    type: 'B2C',
    title: 'Shop for Everyone',
    description: 'Discover amazing products for your home, family, and personal needs',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 3,
    type: 'B2B',
    title: 'Wholesale & Distribution',
    description: 'Access bulk pricing, manage inventory, and grow your business with trusted partners',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 4,
    type: 'B2C',
    title: 'Personal Shopping Experience',
    description: 'Find the perfect products for your lifestyle with personalized recommendations',
    image: 'https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 5,
    type: 'B2B',
    title: 'Enterprise Solutions',
    description: 'Scale your business with enterprise-grade tools and dedicated support',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 6,
    type: 'B2C',
    title: 'Retail Shopping Made Easy',
    description: 'Browse thousands of products, compare prices, and shop with confidence',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
];

const MOCK_TRENDING_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life',
    price: 299.99,
    category: 'electronics',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 50,
    images: [{ url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness with GPS, heart rate monitor, and sleep tracking',
    price: 249.99,
    category: 'electronics',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 75,
    images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '3',
    name: 'Premium Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment and multiple pockets',
    price: 189.99,
    category: 'fashion',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 30,
    images: [{ url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '4',
    name: 'Minimalist Sneakers',
    description: 'Comfortable all-day wear sneakers with eco-friendly materials and modern design',
    price: 129.99,
    category: 'fashion',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 100,
    images: [{ url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

const MOCK_NEW_ARRIVALS: Product[] = [
  {
    id: '5',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with 360-degree sound and 12-hour playtime',
    price: 79.99,
    category: 'electronics',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 60,
    images: [{ url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '6',
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable t-shirt made from 100% organic cotton',
    price: 34.99,
    category: 'fashion',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 200,
    images: [{ url: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours',
    price: 29.99,
    category: 'home-goods',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 150,
    images: [{ url: 'https://images.pexels.com/photos/4021262/pexels-photo-4021262.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '8',
    name: 'Aromatherapy Diffuser',
    description: 'Ultrasonic essential oil diffuser with LED lights and auto shut-off',
    price: 49.99,
    category: 'home-goods',
    status: 'active',
    seller_id: 'mock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 80,
    images: [{ url: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

export function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const loadProducts = async () => {
    const [productsRes, collectionsRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          images:product_images(url, position)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12),
      getCollections({ featured: true, active: true, includeProducts: true }),
    ]);

    if (productsRes.data && productsRes.data.length > 0) {
      productsRes.data.forEach((product: any) => {
        if (product.images) {
          product.images.sort((a: any, b: any) => a.position - b.position);
        }
      });

      setTrendingProducts(productsRes.data.slice(0, 4));
      setNewArrivals(productsRes.data.slice(4, 8));
    } else {
      setTrendingProducts(MOCK_TRENDING_PRODUCTS);
      setNewArrivals(MOCK_NEW_ARRIVALS);
    }

    if (collectionsRes.data) {
      setFeaturedCollections(collectionsRes.data.slice(0, 3));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Image Carousel */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((hero, index) => (
            <div
              key={hero.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={hero.image}
                alt={hero.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-teal-600/80 to-teal-800/80" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center text-white">
              <div
                key={currentSlide}
                className="animate-fadeIn"
              >
                <div className="inline-block mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  {HERO_IMAGES[currentSlide].type}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                  {HERO_IMAGES[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
                  {HERO_IMAGES[currentSlide].description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/products"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  Explore Products
                </Link>
                <Link
                  to="/deals"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 border-2 border-white/30"
                >
                  Shop Deals
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-dark-primary to-transparent z-10" />
      </section>

      <section className="py-12 bg-gray-50 dark:bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {CATEGORY_FILTERS.slice(0, showAllCategories ? CATEGORY_FILTERS.length : 9).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary'
                }`}
              >
                {category.name}
              </button>
            ))}
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-6 py-2 rounded-full font-medium bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all hover:scale-105 flex items-center gap-2"
            >
              {showAllCategories ? (
                <>
                  Less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  More
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Trending Now
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-dark-card rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    Hot
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            New Arrivals
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-dark-card rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    New
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections Section */}
      {featuredCollections.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-dark-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Collections
              </h2>
              <Link
                to="/collections"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCollections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collection/${collection.seller_id}/${collection.slug || collection.id}`}
                  className="group block bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {collection.cover_image_url || collection.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={collection.cover_image_url || collection.image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-1">{collection.name}</h3>
                        <p className="text-white/90 text-sm">
                          {collection.product_count || 0} products
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-6xl text-white font-bold">
                        {collection.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {collection.description && (
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {collection.description}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Start Selling Today
              </h2>
              <p className="text-xl text-orange-100 mb-8">
                Join thousands of sellers on REAGLE-X and reach millions of customers worldwide. It's free to get started!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-all hover:scale-105 active:scale-95 border-2 border-white/30"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Free Registration</h3>
                      <p className="text-orange-100 text-sm">No setup fees or hidden costs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Secure Payments</h3>
                      <p className="text-orange-100 text-sm">Get paid safely and on time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Powerful Tools</h3>
                      <p className="text-orange-100 text-sm">Manage your store with ease</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
