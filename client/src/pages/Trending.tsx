import { useState } from 'react';
import { TrendingUp, Flame, Eye, Heart, ShoppingCart, Award, Filter, BarChart3 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

const MOCK_TRENDING: (Product & {
  trending_score: number;
  views_growth: number;
  sales_count: number;
  wishlist_count: number;
  trending_rank: number;
  trending_category: 'hot' | 'rising' | 'popular';
})[] = [
  {
    id: 't1',
    title: 'AirPods Pro Max',
    description: 'Premium wireless headphones with active noise cancellation',
    price: 549.99,
    trending_score: 98,
    views_growth: 245,
    sales_count: 1234,
    wishlist_count: 3456,
    trending_rank: 1,
    trending_category: 'hot',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 15432,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't2',
    title: 'Smart Watch Series 8',
    description: 'Advanced fitness tracking with ECG and blood oxygen monitoring',
    price: 399.99,
    trending_score: 95,
    views_growth: 189,
    sales_count: 987,
    wishlist_count: 2891,
    trending_rank: 2,
    trending_category: 'hot',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 12876,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't3',
    title: 'Gaming Laptop RTX 4080',
    description: 'High-performance laptop for gaming and creative work',
    price: 1899.99,
    trending_score: 92,
    views_growth: 156,
    sales_count: 543,
    wishlist_count: 2134,
    trending_rank: 3,
    trending_category: 'hot',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 9876,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't4',
    title: 'Designer Leather Jacket',
    description: 'Premium quality genuine leather, modern fit',
    price: 299.99,
    trending_score: 88,
    views_growth: 134,
    sales_count: 876,
    wishlist_count: 1987,
    trending_rank: 4,
    trending_category: 'rising',
    category_id: 2,
    status: 'active',
    is_shippable: true,
    views_count: 8765,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't5',
    title: 'Wireless Gaming Mouse Pro',
    description: 'Ultra-lightweight design with precision sensor',
    price: 79.99,
    trending_score: 85,
    views_growth: 198,
    sales_count: 2341,
    wishlist_count: 1654,
    trending_rank: 5,
    trending_category: 'rising',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 7654,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't6',
    title: 'Standing Desk Converter',
    description: 'Adjustable height, spacious surface, cable management',
    price: 249.99,
    trending_score: 82,
    views_growth: 112,
    sales_count: 654,
    wishlist_count: 1432,
    trending_rank: 6,
    trending_category: 'rising',
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 6543,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't7',
    title: 'Smart LED Light Strips',
    description: 'RGB colors, music sync, smartphone control',
    price: 34.99,
    trending_score: 79,
    views_growth: 167,
    sales_count: 3456,
    wishlist_count: 987,
    trending_rank: 7,
    trending_category: 'popular',
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 5432,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't8',
    title: 'Portable SSD 2TB',
    description: 'Ultra-fast storage, compact design, shock-resistant',
    price: 159.99,
    trending_score: 76,
    views_growth: 89,
    sales_count: 1876,
    wishlist_count: 876,
    trending_rank: 8,
    trending_category: 'popular',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 4321,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't9',
    title: 'Premium Coffee Maker',
    description: 'Programmable, thermal carafe, built-in grinder',
    price: 189.99,
    trending_score: 73,
    views_growth: 76,
    sales_count: 765,
    wishlist_count: 654,
    trending_rank: 9,
    trending_category: 'popular',
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 3210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 't10',
    title: 'Fitness Tracker Band',
    description: 'Heart rate, sleep tracking, 7-day battery life',
    price: 49.99,
    trending_score: 70,
    views_growth: 145,
    sales_count: 2987,
    wishlist_count: 543,
    trending_rank: 10,
    trending_category: 'popular',
    category_id: 4,
    status: 'active',
    is_shippable: true,
    views_count: 2109,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

export function Trending() {
  const [products, setProducts] = useState(MOCK_TRENDING);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'hot' | 'rising' | 'popular'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'views' | 'sales' | 'wishlist'>('score');

  const filteredProducts = products
    .filter(p => categoryFilter === 'all' || p.trending_category === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.trending_score - a.trending_score;
        case 'views':
          return b.views_count - a.views_count;
        case 'sales':
          return b.sales_count - a.sales_count;
        case 'wishlist':
          return b.wishlist_count - a.wishlist_count;
        default:
          return 0;
      }
    });

  const TrendingCard = ({ product }: { product: typeof MOCK_TRENDING[0] }) => (
    <div className="group relative bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className={`text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 ${
          product.trending_category === 'hot' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
          product.trending_category === 'rising' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
          'bg-gradient-to-r from-orange-500 to-pink-500'
        }`}>
          {product.trending_category === 'hot' && <Flame className="h-4 w-4" />}
          {product.trending_category === 'rising' && <TrendingUp className="h-4 w-4" />}
          {product.trending_category === 'popular' && <Award className="h-4 w-4" />}
          {product.trending_category.toUpperCase()}
        </div>
        <div className="bg-gray-900/90 text-white px-3 py-1 rounded-full text-xs font-bold">
          #{product.trending_rank} Trending
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.images[0]?.url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded">
              <Flame className="h-3 w-3 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {product.trending_score}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                +{product.views_growth}%
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-900 dark:text-white">
              {(product.views_count / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
            <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-900 dark:text-white">
              {(product.sales_count / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-500">Sales</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
            <Heart className="h-4 w-4 text-red-600 dark:text-red-400 mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-900 dark:text-white">
              {(product.wishlist_count / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-500">Saves</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
          <Flame className="h-4 w-4" />
          Get Trending Item
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Trending Now
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Most popular products based on views, sales, and community interest
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by trend type:</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('hot')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  categoryFilter === 'hot'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Flame className="h-4 w-4" />
                Hot
              </button>
              <button
                onClick={() => setCategoryFilter('rising')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  categoryFilter === 'rising'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Rising
              </button>
              <button
                onClick={() => setCategoryFilter('popular')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  categoryFilter === 'popular'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Award className="h-4 w-4" />
                Popular
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} trending products
            </span>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="score">Trending Score</option>
                <option value="views">Most Viewed</option>
                <option value="sales">Best Selling</option>
                <option value="wishlist">Most Saved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <TrendingCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
