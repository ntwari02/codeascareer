import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollectionBySlug, getCollectionProducts } from '@/lib/collections';
import type { Collection, Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { 
  ChevronRight, SlidersHorizontal, Grid3x3, List, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CollectionDetail() {
  const { sellerId, slug } = useParams<{ sellerId: string; slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Filter states
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    category: '',
    brand: '',
    color: '',
    size: '',
    availability: 'all',
    condition: 'all',
    rating: '',
    discount: '',
    shipping: 'all',
  });

  useEffect(() => {
    if (sellerId && slug) {
      loadCollection();
    }
  }, [sellerId, slug]);

  useEffect(() => {
    if (collection) {
      loadProducts();
    }
  }, [collection, sortOrder, filters, currentPage]);

  const loadCollection = async () => {
    if (!sellerId || !slug) return;
    setLoading(true);
    try {
      const { data, error } = await getCollectionBySlug(slug, sellerId, false);
      if (error) throw error;
      setCollection(data);
      if (data) {
        setSortOrder(data.sort_order || 'featured');
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock products for demonstration
  const MOCK_PRODUCTS: Product[] = [
    {
      id: 'prod-1',
      seller_id: sellerId || 'seller-1',
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      compare_at_price: 249.99,
      stock_quantity: 15,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'WH-001',
      status: 'active',
      is_shippable: true,
      weight: 0.5,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-1-1',
        product_id: 'prod-1',
        url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      seller_id: sellerId || 'seller-1',
      title: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with health tracking',
      price: 299.99,
      compare_at_price: 349.99,
      stock_quantity: 8,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'SW-002',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-2-1',
        product_id: 'prod-2',
        url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      seller_id: sellerId || 'seller-1',
      title: 'Laptop Stand Ergonomic',
      description: 'Adjustable laptop stand for better posture',
      price: 49.99,
      compare_at_price: 69.99,
      stock_quantity: 25,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'LS-003',
      status: 'active',
      is_shippable: true,
      weight: 1.2,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-3-1',
        product_id: 'prod-3',
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      seller_id: sellerId || 'seller-1',
      title: 'Mechanical Keyboard RGB',
      description: 'Gaming mechanical keyboard with RGB lighting',
      price: 129.99,
      compare_at_price: 159.99,
      stock_quantity: 12,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'KB-004',
      status: 'active',
      is_shippable: true,
      weight: 1.0,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-4-1',
        product_id: 'prod-4',
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      seller_id: sellerId || 'seller-1',
      title: 'Wireless Mouse Ergonomic',
      description: 'Comfortable wireless mouse for long work sessions',
      price: 39.99,
      compare_at_price: 49.99,
      stock_quantity: 30,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'MS-005',
      status: 'active',
      is_shippable: true,
      weight: 0.2,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-5-1',
        product_id: 'prod-5',
        url: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-6',
      seller_id: sellerId || 'seller-1',
      title: 'USB-C Hub Multiport',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 59.99,
      compare_at_price: 79.99,
      stock_quantity: 18,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'HB-006',
      status: 'active',
      is_shippable: true,
      weight: 0.15,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-6-1',
        product_id: 'prod-6',
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-7',
      seller_id: sellerId || 'seller-1',
      title: 'Monitor Stand with Storage',
      description: 'Dual monitor stand with built-in storage compartments',
      price: 89.99,
      compare_at_price: 119.99,
      stock_quantity: 10,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'MS-007',
      status: 'active',
      is_shippable: true,
      weight: 3.5,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-7-1',
        product_id: 'prod-7',
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-8',
      seller_id: sellerId || 'seller-1',
      title: 'Webcam HD 1080p',
      description: 'High-definition webcam with auto-focus and microphone',
      price: 79.99,
      compare_at_price: 99.99,
      stock_quantity: 20,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'WC-008',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-8-1',
        product_id: 'prod-8',
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-9',
      seller_id: sellerId || 'seller-1',
      title: 'Desk Organizer Set',
      description: 'Bamboo desk organizer with multiple compartments',
      price: 34.99,
      compare_at_price: 44.99,
      stock_quantity: 35,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'DO-009',
      status: 'active',
      is_shippable: true,
      weight: 0.8,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-9-1',
        product_id: 'prod-9',
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-10',
      seller_id: sellerId || 'seller-1',
      title: 'Cable Management Kit',
      description: 'Complete cable management solution with clips and sleeves',
      price: 24.99,
      compare_at_price: 34.99,
      stock_quantity: 40,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'CM-010',
      status: 'active',
      is_shippable: true,
      weight: 0.4,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-10-1',
        product_id: 'prod-10',
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-11',
      seller_id: sellerId || 'seller-1',
      title: 'External SSD 1TB',
      description: 'Fast external SSD with USB-C connectivity',
      price: 149.99,
      compare_at_price: 179.99,
      stock_quantity: 14,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'SSD-011',
      status: 'active',
      is_shippable: true,
      weight: 0.1,
      category_id: 'cat-1',
      images: [{
        id: 'img-prod-11-1',
        product_id: 'prod-11',
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-12',
      seller_id: sellerId || 'seller-1',
      title: 'LED Desk Lamp',
      description: 'Adjustable LED desk lamp with USB charging port',
      price: 44.99,
      compare_at_price: 59.99,
      stock_quantity: 22,
      low_stock_threshold: 5,
      views_count: 0,
      sku: 'LD-012',
      status: 'active',
      is_shippable: true,
      weight: 0.6,
      category_id: 'cat-2',
      images: [{
        id: 'img-prod-12-1',
        product_id: 'prod-12',
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString(),
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const loadProducts = async () => {
    if (!collection) return;
    try {
      let products = await getCollectionProducts(collection.id, sortOrder);
      
      // If no products found, use mock data for demonstration
      if (products.length === 0) {
        products = MOCK_PRODUCTS;
      }
      
      // Apply filters
      products = applyFilters(products);
      
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      // On error, use mock data
      let products = applyFilters(MOCK_PRODUCTS);
      setProducts(products);
    }
  };

  const applyFilters = (productList: Product[]) => {
    return productList.filter(product => {
      // Price filter
      if (filters.priceMin && product.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && product.price > parseFloat(filters.priceMax)) return false;
      
      // Category filter
      if (filters.category && product.category_id !== filters.category) return false;
      
      // Availability filter
      if (filters.availability === 'in_stock' && product.stock_quantity === 0) return false;
      if (filters.availability === 'out_of_stock' && product.stock_quantity > 0) return false;
      
      // Shipping filter
      if (filters.shipping === 'shippable' && !product.is_shippable) return false;
      if (filters.shipping === 'pickup_only' && product.is_shippable) return false;
      
      return true;
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      category: '',
      brand: '',
      color: '',
      size: '',
      availability: 'all',
      condition: 'all',
      rating: '',
      discount: '',
      shipping: 'all',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

  // Pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Collection Not Found
            </h1>
            <Link
              to="/collections"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Browse all collections →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to="/collections" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Collections
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{collection.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {collection.cover_image_url || collection.image_url ? (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={collection.cover_image_url || collection.image_url}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-xl text-white/90 max-w-3xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{products.length} products</span>
            <span>•</span>
            <span
              className={`px-3 py-1 rounded-full ${
                collection.type === 'smart'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}
            >
              {collection.type === 'smart' ? 'Smart Collection' : 'Manual Collection'}
            </span>
            {collection.is_featured && (
              <>
                <span>•</span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Featured
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {Object.values(filters).filter(v => v && v !== 'all').length}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="best_selling">Best Selling</option>
              <option value="name_asc">Alphabetically: A-Z</option>
              <option value="name_desc">Alphabetically: Z-A</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shipping
                </label>
                <select
                  value={filters.shipping}
                  onChange={(e) => handleFilterChange('shipping', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="shippable">Shippable</option>
                  <option value="pickup_only">Pickup Only</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No products found matching your filters.
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Load More Button (Alternative to pagination) */}
            {currentPage < totalPages && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
