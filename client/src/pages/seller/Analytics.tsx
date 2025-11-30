import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingCart, Eye, Star, TrendingDown, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { ParetoChart } from '@/components/charts/ParetoChart';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const salesStats = [
    {
      title: 'Total Revenue',
      value: '$125,430',
      change: '+18.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+12.5%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Average Order Value',
      value: '$100.58',
      change: '+5.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Repeat Customer Rate',
      value: '42.3%',
      change: '+3.1%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', views: 1234, sold: 234, revenue: 35100, rating: 4.8 },
    { name: 'Smart Watch', views: 987, sold: 189, revenue: 56700, rating: 4.6 },
    { name: 'USB-C Cable', views: 2341, sold: 456, revenue: 9120, rating: 4.9 },
    { name: 'Laptop Stand', views: 45, sold: 0, revenue: 0, rating: 0 },
  ];

  const lowPerformingProducts = [
    { name: 'Laptop Stand', views: 45, sold: 0, revenue: 0 },
    { name: 'Old Product A', views: 12, sold: 1, revenue: 50 },
  ];

  const customerMetrics = [
    { label: 'Return Rate', value: '2.3%', trend: 'down', change: '-0.5%' },
    { label: 'Customer Lifetime Value', value: '$245', trend: 'up', change: '+12%' },
    { label: 'New Customers', value: '156', trend: 'up', change: '+8%' },
  ];

  const marketingInsights = [
    { source: 'Organic Search', traffic: 45, conversions: 3.2 },
    { source: 'Direct', traffic: 28, conversions: 4.1 },
    { source: 'Social Media', traffic: 18, conversions: 2.8 },
    { source: 'Referral', traffic: 9, conversions: 3.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <BarChart3 className="w-8 h-8 text-red-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Track your business performance and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Sales Analytics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Sales Analytics</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {salesStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <SalesChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Analytics */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-400" />
            Product Analytics
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Most Viewed</h3>
              <div className="space-y-2">
                {topProducts.slice().sort((a, b) => b.views - a.views).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-colors duration-300">
                    <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{product.name}</span>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{product.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Most Sold</h3>
              <div className="space-y-2">
                {topProducts.slice().sort((a, b) => b.sold - a.sold).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-colors duration-300">
                    <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{product.name}</span>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500 dark:text-green-400 transition-colors duration-300">{product.sold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Highest Rated</h3>
              <div className="space-y-2">
                {topProducts.filter(p => p.rating > 0).sort((a, b) => b.rating - a.rating).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-colors duration-300">
                    <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{product.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{product.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 transition-colors duration-300">Low Performing</h3>
              <div className="space-y-2">
                {lowPerformingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30 transition-colors duration-300">
                    <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{product.name}</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400 transition-colors duration-300">{product.sold} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-400" />
            Customer Analytics
          </h2>
          <div className="space-y-4">
            {customerMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{metric.label}</span>
                  <div className={`flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="text-xs font-semibold">{metric.change}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{metric.value}</p>
              </div>
            ))}
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-lg border border-red-200 dark:border-red-500/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Buyer Demographics</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">Available in Premium plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Insights */}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Marketing Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Traffic Sources</h3>
            <div className="space-y-3">
              {marketingInsights.map((insight, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-white transition-colors duration-300">{insight.source}</span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{insight.traffic}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${insight.traffic}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Conversion Funnel</h3>
            <FunnelChart
              data={[
                { label: 'Visitors', value: 10000, percentage: 100 },
                { label: 'Product Views', value: 3500, percentage: 35 },
                { label: 'Add to Cart', value: 1200, percentage: 12 },
                { label: 'Checkout', value: 450, percentage: 4.5 },
                { label: 'Completed', value: 324, percentage: 3.24 },
              ]}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
