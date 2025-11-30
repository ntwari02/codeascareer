import { useState } from 'react';
import { Sparkles, Calendar, Package, Star, Filter, Clock } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

const MOCK_NEW_ARRIVALS: (Product & {
  arrival_date: string;
  is_new: boolean;
  stock_level: 'high' | 'medium' | 'low';
  rating: number;
  review_count: number;
})[] = [
  {
    id: 'n1',
    title: 'Ultra-Slim Laptop Stand',
    description: 'Aluminum alloy, adjustable height, perfect for ergonomic setup',
    price: 49.99,
    arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'high',
    rating: 4.9,
    review_count: 23,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 892,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n2',
    title: 'Smart Home Hub 2024',
    description: 'Control all your smart devices, voice assistant, touchscreen display',
    price: 129.99,
    arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'medium',
    rating: 4.7,
    review_count: 45,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 1543,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1109543/pexels-photo-1109543.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n3',
    title: 'Minimalist Canvas Backpack',
    description: 'Water-resistant, multiple compartments, stylish design',
    price: 69.99,
    arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'high',
    rating: 4.8,
    review_count: 67,
    category_id: 2,
    status: 'active',
    is_shippable: true,
    views_count: 2134,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n4',
    title: 'Wireless Charging Pad Pro',
    description: 'Fast charge 3 devices simultaneously, LED indicators, non-slip surface',
    price: 39.99,
    arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'high',
    rating: 4.6,
    review_count: 89,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 3421,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n5',
    title: 'Premium Yoga Set',
    description: 'Includes mat, blocks, strap, and carry bag - eco-friendly materials',
    price: 79.99,
    arrival_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'medium',
    rating: 4.9,
    review_count: 34,
    category_id: 4,
    status: 'active',
    is_shippable: true,
    views_count: 1876,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n6',
    title: 'Smart LED Desk Lamp',
    description: 'Color temperature control, USB charging port, touch control',
    price: 54.99,
    arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'low',
    rating: 4.7,
    review_count: 56,
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 987,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n7',
    title: 'Bamboo Coffee Table',
    description: 'Sustainable bamboo, modern design, easy assembly',
    price: 149.99,
    arrival_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'high',
    rating: 4.8,
    review_count: 28,
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 654,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n8',
    title: 'Wireless Gaming Mouse',
    description: 'RGB lighting, 12000 DPI, programmable buttons, 80-hour battery',
    price: 59.99,
    arrival_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'medium',
    rating: 4.9,
    review_count: 112,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 4532,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n9',
    title: 'Insulated Water Bottle',
    description: 'Keeps drinks cold 24hrs/hot 12hrs, BPA-free, leak-proof',
    price: 29.99,
    arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'high',
    rating: 4.6,
    review_count: 201,
    category_id: 4,
    status: 'active',
    is_shippable: true,
    views_count: 3245,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4177796/pexels-photo-4177796.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'n10',
    title: 'Noise-Canceling Headphones',
    description: 'Premium sound quality, 40-hour battery, foldable design',
    price: 179.99,
    arrival_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_new: true,
    stock_level: 'low',
    rating: 4.9,
    review_count: 143,
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 5621,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

export function NewArrivals() {
  const [products, setProducts] = useState(MOCK_NEW_ARRIVALS);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [stockFilter, setStockFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const filteredProducts = products.filter(p =>
    stockFilter === 'all' || p.stock_level === stockFilter
  ).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime();
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const NewArrivalCard = ({ product }: { product: typeof MOCK_NEW_ARRIVALS[0] }) => (
    <div className="group relative bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Sparkles className="h-4 w-4" />
          NEW
        </span>
        <span className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
          product.stock_level === 'high' ? 'bg-green-500' :
          product.stock_level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {product.stock_level === 'low' ? 'Low Stock' : 'In Stock'}
        </span>
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.images[0]?.url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {product.rating}
            </span>
            <span className="text-xs text-gray-500">({product.review_count})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{getDaysAgo(product.arrival_date)}</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Package className="h-3 w-3" />
            <span>Free Shipping</span>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:shadow-lg">
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                New Arrivals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Fresh products just added to our collection
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stock:
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="high">High Stock</option>
                  <option value="medium">Medium Stock</option>
                  <option value="low">Low Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {filteredProducts.length} new products
            </span>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Added in the last 5 days</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <NewArrivalCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
