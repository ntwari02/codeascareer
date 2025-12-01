import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, AlertTriangle, Package, TrendingUp, MessageCircle, Star, ShieldCheck, Calendar, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentOrders from '@/components/dashboard/RecentOrders';
import SalesChart from '@/components/dashboard/SalesChart';
import { BarChart } from '@/components/charts/BarChart';
import { ComboChart } from '@/components/charts/ComboChart';
import { DonutChart } from '@/components/charts/DonutChart';

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const DashboardOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const salesStats: Stat[] = [
    {
      title: 'Total Sales',
      value: timeRange === 'today' ? '$2,450' : timeRange === 'week' ? '$45,231' : '$189,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Active Orders',
      value: '342',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Low Stock Items',
      value: '28',
      change: '+5.4%',
      trend: 'up',
      icon: Package,
      color: 'from-red-500 to-orange-500',
    },
  ];

  // B2B-focused KPIs
  const b2bStats: Stat[] = [
    {
      title: 'Pending RFQs',
      value: '18',
      change: '+6 new today',
      trend: 'up',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Avg. Order Value (AOV)',
      value: timeRange === 'today' ? '$1,240' : timeRange === 'week' ? '$1,180' : '$1,095',
      change: '+3.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-sky-500 to-indigo-500',
    },
  ];

  const orderStats = [
    { label: 'Pending', count: 12, color: 'bg-yellow-500', icon: Clock },
    { label: 'In Transit', count: 45, color: 'bg-blue-500', icon: Truck },
    { label: 'Completed', count: 234, color: 'bg-green-500', icon: CheckCircle },
    { label: 'Cancelled', count: 3, color: 'bg-red-500', icon: XCircle },
  ];

  const bestSellingProducts = [
    { name: 'Wireless Headphones', sales: 234, revenue: '$35,100', stock: 45 },
    { name: 'Smart Watch', sales: 189, revenue: '$56,700', stock: 12 },
    { name: 'USB-C Cable', sales: 456, revenue: '$9,120', stock: 128 },
    { name: 'Laptop Stand', sales: 78, revenue: '$6,240', stock: 0 },
  ];

  const notifications = [
    { type: 'message', text: 'New message from Alice Johnson', time: '2m ago', unread: true },
    { type: 'review', text: 'New 5-star review for Wireless Headphones', time: '15m ago', unread: true },
    { type: 'dispute', text: 'New dispute opened for order #ORD-2847', time: '1h ago', unread: false },
    { type: 'subscription', text: 'Subscription renewal in 5 days', time: '2h ago', unread: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Updates Active
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'today' | 'week' | 'month')}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Sales Overview Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {salesStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </motion.div>

      {/* B2B KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {b2bStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
        {/* Spacer card to balance layout / future KPIs */}
        <div className="hidden lg:block bg-gradient-to-r from-gray-50/60 to-gray-100/60 dark:from-gray-900/60 dark:to-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          Optimise for key B2B outcomes like RFQs won, contract value, and reorder cadence.
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Recent Orders */}
        <div>
          <RecentOrders />
        </div>
      </div>

      {/* Revenue, Conversions & Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend & Forecast - Bar Chart */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 shadow-xl transition-colors duration-300 h-full">
          <BarChart
            title="Revenue Trend & Forecast"
            data={[
              { date: '2024-01-01', value: 45000 },
              { date: '2024-01-08', value: 52000 },
              { date: '2024-01-15', value: 48000 },
              { date: '2024-01-22', value: 61000 },
              { date: '2024-01-29', value: 55000 },
              { date: '2024-02-05', value: 67000 },
              { date: '2024-02-12', value: 72000 },
              { date: '2024-02-19', value: 68000 },
              { date: '2024-02-26', value: 75000 },
              { date: '2024-03-05', value: 82000 },
              { date: '2024-03-12', value: 78000 },
              { date: '2024-03-19', value: 89000 },
            ]}
            forecastData={[
              { date: '2024-03-26', value: 92000, isForecast: true },
              { date: '2024-04-02', value: 95000, isForecast: true },
              { date: '2024-04-09', value: 98000, isForecast: true },
              { date: '2024-04-16', value: 101000, isForecast: true },
            ]}
            height={350}
            yAxisLabel="Revenue ($)"
          />
        </div>

        {/* Conversions - Donut Chart */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 shadow-xl transition-colors duration-300 flex flex-col h-full">
          <DonutChart
            title="Conversions"
            value={65.2}
            maxValue={100}
            label="Returning Customer"
            size={180}
            strokeWidth={16}
          />
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">23.5k</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Week</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">41.05k</span>
            </div>
            <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors">
              View Details
            </button>
          </div>
        </div>

        {/* Performance Chart - Combo Chart */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 shadow-xl transition-colors duration-300 h-full">
          <ComboChart
            title="Performance"
            data={[
              { label: 'Jan', barValue: 45, lineValue: 28 },
              { label: 'Feb', barValue: 68, lineValue: 32 },
              { label: 'Mar', barValue: 52, lineValue: 35 },
              { label: 'Apr', barValue: 75, lineValue: 48 },
              { label: 'May', barValue: 58, lineValue: 45 },
              { label: 'Jun', barValue: 62, lineValue: 38 },
              { label: 'Jul', barValue: 55, lineValue: 42 },
              { label: 'Aug', barValue: 70, lineValue: 50 },
              { label: 'Sep', barValue: 78, lineValue: 55 },
              { label: 'Oct', barValue: 65, lineValue: 52 },
              { label: 'Nov', barValue: 72, lineValue: 48 },
              { label: 'Dec', barValue: 80, lineValue: 60 },
            ]}
            barLabel="Page Views"
            lineLabel="Clicks"
            height={350}
          />
        </div>
      </div>

      {/* Orders Summary */}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-red-400" />
          Orders Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {orderStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 ${stat.color} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{stat.count}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
              <Package className="w-6 h-6 text-red-400" />
              Product Performance
            </h2>
            <button className="text-sm text-red-500 dark:text-red-400 hover:underline transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">Best Selling</span>
            </div>
            {bestSellingProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{product.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    <span>{product.sales} sold</span>
                    <span>{product.revenue} revenue</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  product.stock === 0 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : product.stock < 20
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                }`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications, Action Required & Account Status */}
        <div className="space-y-6">
          {/* Action Required - B2B Task List */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Action Required
            </h2>
            <div className="space-y-3">
              {[
                {
                  title: 'Review high-value RFQs',
                  meta: '5 RFQs over $10k waiting for response',
                  priority: 'High',
                  due: 'Due in 2 hours',
                },
                {
                  title: 'Approve new B2B buyer accounts',
                  meta: '3 enterprise buyers pending verification',
                  priority: 'Medium',
                  due: 'Today',
                },
                {
                  title: 'Follow up on expiring contracts',
                  meta: '2 key accounts renew in the next 7 days',
                  priority: 'High',
                  due: 'This week',
                },
              ].map((task, index) => (
                <motion.div
                  key={task.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                        {task.meta}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            task.priority === 'High'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          <Clock className="h-3 w-3" />
                          {task.due}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="mt-1 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-900/50 p-1.5 text-gray-500 hover:text-green-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                    aria-label="Mark task as done"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-red-400" />
              Notifications
            </h2>
            <div className="space-y-2">
              {notifications.map((notif, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border transition-colors duration-300 ${
                    notif.unread
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">{notif.text}</p>
                    {notif.unread && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">{notif.time}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-400" />
              Account Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-lg border border-red-200 dark:border-red-500/30">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Seller Tier</p>
                  <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">Premium</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Verification Status</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-medium">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Store Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">4.8</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">(1,234 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
