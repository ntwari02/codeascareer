import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

export type ProductWithImages = Product & { images?: { url: string; position?: number }[] };

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', slug: 'electronics', is_active: true },
  { id: 2, name: 'Fashion & Apparel', slug: 'fashion', is_active: true },
  { id: 3, name: 'Beauty & Personal Care', slug: 'beauty', is_active: true },
  { id: 4, name: 'Home & Living', slug: 'home', is_active: true },
  { id: 5, name: 'Sports & Outdoors', slug: 'sports', is_active: true },
  { id: 6, name: 'Health & Wellness', slug: 'health', is_active: true },
  { id: 7, name: 'Baby & Kids', slug: 'baby', is_active: true },
  { id: 8, name: 'Automotive & Motorcycles', slug: 'automotive', is_active: true },
  { id: 9, name: 'Tools & Hardware', slug: 'tools', is_active: true },
  { id: 10, name: 'Groceries', slug: 'groceries', is_active: true },
  { id: 11, name: 'Office & School Supplies', slug: 'office', is_active: true },
  { id: 12, name: 'Pets Supplies', slug: 'pets', is_active: true },
  { id: 13, name: 'Gaming', slug: 'gaming', is_active: true },
  { id: 14, name: 'Jewelry & Watches', slug: 'jewelry', is_active: true },
  { id: 15, name: 'Books & Media', slug: 'books', is_active: true },
  { id: 16, name: 'Smart Home', slug: 'smart-home', is_active: true },
  { id: 17, name: 'Appliances', slug: 'appliances', is_active: true },
];

export const MOCK_PRODUCTS: ProductWithImages[] = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling headphones with 30-hour battery life',
    price: 149.99,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 1234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '2',
    title: 'Smart Watch Pro',
    description: 'Fitness tracking, heart rate monitor, GPS, and more',
    price: 299.99,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 2156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '3',
    title: 'Designer Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment',
    price: 189.99,
    category_id: 2,
    status: 'active',
    is_shippable: true,
    views_count: 892,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '4',
    title: 'Portable Power Bank 20000mAh',
    description: 'Fast charging portable charger for all your devices',
    price: 49.99,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 3421,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '5',
    title: 'Premium Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt available in multiple colors',
    price: 29.99,
    category_id: 2,
    status: 'active',
    is_shippable: true,
    views_count: 567,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '6',
    title: '4K Ultra HD Action Camera',
    description: 'Waterproof action camera with stabilization',
    price: 249.99,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 1876,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '7',
    title: 'Yoga Mat Premium',
    description: 'Non-slip eco-friendly yoga mat with carrying strap',
    price: 39.99,
    category_id: 4,
    status: 'active',
    is_shippable: true,
    views_count: 745,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '8',
    title: 'Modern Table Lamp',
    description: 'Minimalist LED desk lamp with adjustable brightness',
    price: 79.99,
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 432,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: '9',
    title: 'Bestseller Book Collection',
    description: 'Set of 5 award-winning fiction novels',
    price: 59.99,
    category_id: 5,
    status: 'active',
    is_shippable: true,
    views_count: 654,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductWithImages[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    shippable: searchParams.get('shippable') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get('q') || '';
    if (searchFromUrl && searchFromUrl !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data && data.length > 0) {
      setCategories(data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);

    let query = supabase
      .from('products')
      .select(`
        *,
        images:product_images(url, position, is_primary, alt_text)
      `)
      .eq('status', 'active');

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.category) {
      const category = categories.find(c => c.slug === filters.category);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (filters.minPrice) {
      query = query.gte('price', parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.lte('price', parseFloat(filters.maxPrice));
    }

    if (filters.shippable !== 'all') {
      query = query.eq('is_shippable', filters.shippable === 'true');
    }

    switch (filters.sort) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'trending':
        query = query.order('views_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;

    if (data && data.length > 0) {
      data.forEach(product => {
        if (product.images) {
          product.images.sort((a: any, b: any) => a.position - b.position);
        }
      });
      setProducts(data);
    } else {
      applyFiltersToMockData();
    }

    setLoading(false);
  };

  const applyFiltersToMockData = () => {
    let filtered = [...MOCK_PRODUCTS];

    if (filters.search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      const category = categories.find(c => c.slug === filters.category);
      if (category) {
        filtered = filtered.filter(p => p.category_id === category.id);
      }
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    if (filters.shippable !== 'all') {
      filtered = filtered.filter(p => p.is_shippable === (filters.shippable === 'true'));
    }

    switch (filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setProducts(filtered);
  };

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params: any = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params[k] = v;
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      shippable: 'all',
      sort: 'newest',
    });
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.shippable !== 'all';

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{products.length} products found</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="$1000"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Delivery Type
              </label>
              <select
                value={filters.shippable}
                onChange={(e) => updateFilter('shippable', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Types</option>
                <option value="true">Shippable Items</option>
                <option value="false">Pickup Only</option>
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="newest">Newest First</option>
                <option value="trending">Trending</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-card rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
