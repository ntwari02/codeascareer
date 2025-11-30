import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store as StoreIcon, Package, ShoppingCart, DollarSign, 
  AlertTriangle, Truck, Bell, Megaphone, Star, FolderKanban, FileText, 
  BarChart3, Zap, RefreshCw, Settings, Code, Activity 
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Notifications from '@/components/dashboard/Notifications';
import AdminOverview from '@/pages/admin/AdminOverview';
import UserManagement from '@/pages/admin/UserManagement';
import SellerStoreManagement from '@/pages/admin/SellerStoreManagement';
import ProductManagementAdmin from '@/pages/admin/ProductManagementAdmin';
import OrderManagementAdmin from '@/pages/admin/OrderManagementAdmin';
import PaymentsFinancial from '@/pages/admin/PaymentsFinancial';
import DisputesSupport from '@/pages/admin/DisputesSupport';
import LogisticsDelivery from '@/pages/admin/LogisticsDelivery';
import NotificationsCommunication from '@/pages/admin/NotificationsCommunication';
import MarketingTools from '@/pages/admin/MarketingTools';
import ReviewsModeration from '@/pages/admin/ReviewsModeration';
import PlatformSettings from '@/pages/admin/PlatformSettings';
import DataInsights from '@/pages/admin/DataInsights';
import DeveloperTools from '@/pages/admin/DeveloperTools';
import CollectionsManagementAdmin from '@/pages/admin/CollectionsManagementAdmin';
import CMSManagement from '@/pages/admin/CMSManagement';
import TaskAutomation from '@/pages/admin/TaskAutomation';
import RefundsSystem from '@/pages/admin/RefundsSystem';
import PlatformHealth from '@/pages/admin/PlatformHealth';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Extract the route segment after /admin/
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const adminIndex = pathSegments.indexOf('admin');
  const activeTab = adminIndex >= 0 && pathSegments.length > adminIndex + 1 
    ? pathSegments[adminIndex + 1] 
    : 'dashboard';
  
  // Ensure we're on a valid route
  useEffect(() => {
    const validRoutes = [
      'dashboard', 'users', 'sellers', 'products', 'orders', 'payments', 
      'disputes', 'logistics', 'notifications', 'marketing', 'reviews', 
      'settings', 'analytics', 'developer', 'collections', 'cms', 
      'automation', 'refunds', 'health'
    ];
    if (pathSegments.length === adminIndex + 1) {
      // We're on /admin, which is fine (index route)
      return;
    }
    const currentRoute = pathSegments[adminIndex + 1];
    if (currentRoute && !validRoutes.includes(currentRoute)) {
      // Invalid route, redirect to dashboard
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate, pathSegments, adminIndex]);

  const setActiveTab = (tabId: string) => {
    if (tabId === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tabId}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Admin Panel"
        tier="Super Admin"
        menuItems={[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'sellers', label: 'Seller Stores', icon: StoreIcon },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'payments', label: 'Payments & Finance', icon: DollarSign },
          { id: 'disputes', label: 'Disputes & Support', icon: AlertTriangle },
          { id: 'logistics', label: 'Logistics', icon: Truck },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'marketing', label: 'Marketing', icon: Megaphone },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'collections', label: 'Collections', icon: FolderKanban },
          { id: 'cms', label: 'CMS', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'automation', label: 'Automation', icon: Zap },
          { id: 'refunds', label: 'Refunds', icon: RefreshCw },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'developer', label: 'Developer', icon: Code },
          { id: 'health', label: 'System Health', icon: Activity },
        ]}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          userName="Admin User"
          userRole="Super Admin"
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/30 p-4 md:p-6 lg:p-8 transition-colors duration-300">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="sellers" element={<SellerStoreManagement />} />
            <Route path="products" element={<ProductManagementAdmin />} />
            <Route path="orders" element={<OrderManagementAdmin />} />
            <Route path="payments" element={<PaymentsFinancial />} />
            <Route path="disputes" element={<DisputesSupport />} />
            <Route path="logistics" element={<LogisticsDelivery />} />
            <Route path="notifications" element={<NotificationsCommunication />} />
            <Route path="marketing" element={<MarketingTools />} />
            <Route path="reviews" element={<ReviewsModeration />} />
            <Route path="collections" element={<CollectionsManagementAdmin />} />
            <Route path="cms" element={<CMSManagement />} />
            <Route path="analytics" element={<DataInsights />} />
            <Route path="automation" element={<TaskAutomation />} />
            <Route path="refunds" element={<RefundsSystem />} />
            <Route path="settings" element={<PlatformSettings />} />
            <Route path="developer" element={<DeveloperTools />} />
            <Route path="health" element={<PlatformHealth />} />
          </Routes>
        </main>
      </div>

      <Notifications 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;

