import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import DashboardOverview from '@/pages/seller/DashboardOverview';
import InventoryManagement from '@/pages/seller/InventoryManagement';
import OrdersPage from '@/pages/seller/OrdersPage';
import DisputeResolution from '@/pages/seller/DisputeResolution';
import ProductManagement from '@/pages/seller/ProductManagement';
import CollectionManagement from '@/pages/seller/CollectionManagement';
import Analytics from '@/pages/seller/Analytics';
import SubscriptionTiers from '@/pages/seller/SubscriptionTiers';
import ProfilePage from '@/pages/seller/ProfilePage';
import Notifications from '@/components/dashboard/Notifications';

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Extract the route segment after /seller/
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const sellerIndex = pathSegments.indexOf('seller');
  const activeTab = sellerIndex >= 0 && pathSegments.length > sellerIndex + 1 
    ? pathSegments[sellerIndex + 1] 
    : 'dashboard';
  
  // Ensure we're on a valid route
  useEffect(() => {
    const validRoutes = ['dashboard', 'inventory', 'orders', 'disputes', 'products', 'collections', 'analytics', 'subscription', 'settings'];
    if (pathSegments.length === sellerIndex + 1) {
      // We're on /seller, which is fine (index route)
      return;
    }
    const currentRoute = pathSegments[sellerIndex + 1];
    if (currentRoute && !validRoutes.includes(currentRoute)) {
      // Invalid route, redirect to dashboard
      navigate('/seller', { replace: true });
    }
  }, [location.pathname, navigate, pathSegments, sellerIndex]);

  const setActiveTab = (tabId: string) => {
    if (tabId === 'dashboard') {
      navigate('/seller');
    } else {
      navigate(`/seller/${tabId}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Seller Hub"
        tier="Premium Tier"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          userName="John Seller"
          userRole="Premium Account"
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/30 p-4 md:p-6 lg:p-8 transition-colors duration-300">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="disputes" element={<DisputeResolution />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="collections" element={<CollectionManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="subscription" element={<SubscriptionTiers />} />
            <Route path="settings" element={<ProfilePage />} />
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

export default SellerDashboard;

