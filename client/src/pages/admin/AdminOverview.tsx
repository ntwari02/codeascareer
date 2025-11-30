import React, { useState, useEffect } from 'react';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, 
  Store, BarChart3, Clock, XCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/dashboard/StatCard';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { FunnelChart } from '@/components/charts/FunnelChart';

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingApprovals: 0,
    lowStockAlerts: 0,
    activeDisputes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: sellerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      const { count: buyerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'buyer');

      // Load products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Load orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*');

      const activeOrdersCount = orders?.filter(
        o => !['completed', 'cancelled'].includes(o.status)
      ).length || 0;

      // Calculate revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayRevenue = orders?.filter(
        o => new Date(o.created_at) >= today && o.payment_status === 'completed'
      ).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      const weekRevenue = orders?.filter(
        o => new Date(o.created_at) >= weekAgo && o.payment_status === 'completed'
      ).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      const monthRevenue = orders?.filter(
        o => new Date(o.created_at) >= monthAgo && o.payment_status === 'completed'
      ).reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Pending approvals
      const { count: pendingCount } = await supabase
        .from('seller_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Low stock alerts - products where stock is less than or equal to low_stock_threshold
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, stock_quantity, low_stock_threshold')
        .eq('status', 'active');
      
      const lowStockCount = lowStockProducts?.filter(
        p => p.stock_quantity <= (p.low_stock_threshold || 5)
      ).length || 0;

      // Active disputes
      const { count: disputesCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Top sellers (mock for now)
      const { data: sellers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .limit(5);

      // Recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setMetrics({
        totalUsers: userCount || 0,
        totalSellers: sellerCount || 0,
        totalBuyers: buyerCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orders?.length || 0,
        activeOrders: activeOrdersCount,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        pendingApprovals: pendingCount || 0,
        lowStockAlerts: lowStockCount || 0,
        activeDisputes: disputesCount || 0,
      });

      setTopSellers(sellers || []);
      setRecentOrders(recentOrdersData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          subtitle={`${metrics.totalSellers} sellers, ${metrics.totalBuyers} buyers`}
        />
        <StatCard
          title="Total Products"
          value={metrics.totalProducts.toLocaleString()}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
          subtitle="Active listings"
        />
        <StatCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          trend={{ value: 15, isPositive: true }}
          subtitle={`${metrics.activeOrders} active`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${metrics.monthRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 23, isPositive: true }}
          subtitle="This month"
        />
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Revenue</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.todayRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            From completed orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Revenue</h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.weekRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Last 7 days
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue</h3>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.monthRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This month
          </p>
        </div>
      </div>

      {/* Alerts & Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200">
              Pending Approvals
            </h3>
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">
            {metrics.pendingApprovals}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            Seller applications awaiting review
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200">
              Low Stock Alerts
            </h3>
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-200">
            {metrics.lowStockAlerts}
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
            Products running low on stock
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
              Active Disputes
            </h3>
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-200">
            {metrics.activeDisputes}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">
            Disputes requiring attention
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <TrendLineChart
          title="Platform Revenue Trend & Forecast"
          data={[
            { date: '2024-01-01', value: 125000 },
            { date: '2024-01-08', value: 142000 },
            { date: '2024-01-15', value: 138000 },
            { date: '2024-01-22', value: 165000 },
            { date: '2024-01-29', value: 158000 },
            { date: '2024-02-05', value: 189000 },
            { date: '2024-02-12', value: 205000 },
            { date: '2024-02-19', value: 198000 },
            { date: '2024-02-26', value: 225000 },
            { date: '2024-03-05', value: 245000 },
            { date: '2024-03-12', value: 238000 },
            { date: '2024-03-19', value: 268000 },
          ]}
          forecastData={[
            { date: '2024-03-26', value: 275000, isForecast: true },
            { date: '2024-04-02', value: 285000, isForecast: true },
            { date: '2024-04-09', value: 295000, isForecast: true },
            { date: '2024-04-16', value: 305000, isForecast: true },
          ]}
          annotations={[
            { date: '2024-02-05', label: 'Major Campaign', value: 189000 },
            { date: '2024-03-19', label: 'Platform Update', value: 268000 },
          ]}
          height={350}
          yAxisLabel="Revenue ($)"
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <FunnelChart
          title="Platform Conversion Funnel"
          data={[
            { label: 'Website Visitors', value: 50000, percentage: 100 },
            { label: 'Registered Users', value: 12500, percentage: 25 },
            { label: 'Active Buyers', value: 8750, percentage: 17.5 },
            { label: 'Completed Orders', value: 6250, percentage: 12.5 },
            { label: 'Repeat Customers', value: 3125, percentage: 6.25 },
          ]}
          height={350}
        />
      </div>

      {/* Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent orders</div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Order #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${order.total?.toFixed(2)} • {order.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Sellers</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : topSellers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No sellers yet</div>
            ) : (
              <div className="space-y-4">
                {topSellers.map((seller, index) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {seller.full_name || seller.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {seller.email}
                        </p>
                      </div>
                    </div>
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

