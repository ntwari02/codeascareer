import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  Star,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Flame
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ProductAnalytics() {
  const { currency } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [category, setCategory] = useState<string>('all');

  // Mock analytics data
  const stats = [
    {
      title: 'Total Products Viewed',
      value: '1,234',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Average Price',
      value: currency === 'USD' ? '$129.99' : currency === 'EUR' ? '€119.99' : 'Fr 150,000',
      change: '-5.3%',
      trend: 'down' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Products in Cart',
      value: '12',
      change: '+25.0%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Average Rating',
      value: '4.6',
      change: '+0.2',
      trend: 'up' as const,
      icon: Star,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', views: 1234, price: 299.99, rating: 4.8, trend: 'up' },
    { name: 'Smart Fitness Watch', views: 987, price: 249.99, rating: 4.6, trend: 'up' },
    { name: 'Premium Leather Backpack', views: 654, price: 189.99, rating: 4.5, trend: 'down' },
    { name: 'Minimalist Sneakers', views: 1456, price: 129.99, rating: 4.7, trend: 'up' },
    { name: 'Portable Phone Charger', views: 2341, price: 39.99, rating: 4.4, trend: 'up' },
  ];

  const priceTrends = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 125 },
    { month: 'Mar', value: 118 },
    { month: 'Apr', value: 130 },
    { month: 'May', value: 125 },
    { month: 'Jun', value: 129 },
  ];

  const categoryDistribution = [
    { name: 'Electronics', value: 45, color: 'bg-blue-500' },
    { name: 'Fashion', value: 30, color: 'bg-purple-500' },
    { name: 'Home & Living', value: 15, color: 'bg-green-500' },
    { name: 'Sports', value: 10, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Product Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and trends for products you're interested in
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Living</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Price Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Price Trends
              </h2>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {priceTrends.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer"
                      style={{ height: `${(item.value / 130) * 100}%` }}
                      title={`${item.month}: ${item.value}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-orange-600" />
              Category Distribution
            </h2>
            <div className="space-y-4">
              {categoryDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`${item.color} h-2.5 rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-orange-600" />
            Top Viewed Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Views</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/products/${index + 1}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{product.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Fr '}
                      {product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{product.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {product.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Products Link */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Package className="w-5 h-5" />
            Browse All Products
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

