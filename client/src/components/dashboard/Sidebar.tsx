import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Box, 
  BarChart3, 
  Crown, 
  Settings, 
  X,
  ShieldCheck,
  LucideIcon,
  FolderKanban,
  MessageCircle,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menuItems?: MenuItem[];
  title: string;
  tier: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, menuItems, title, tier }) => {
  const defaultMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
    { id: 'inbox', label: 'Inbox & RFQs', icon: MessageCircle },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'collections', label: 'Collections', icon: FolderKanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'support', label: 'Support Center', icon: LifeBuoy },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const itemsToRender = menuItems || defaultMenuItems;

  const sidebarContent = (
  <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black border-r border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/30 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{title}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{tier}</p>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {itemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden group",
                  isActive 
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/40" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId={`activeTab-${title}`}
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="font-medium relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700/30 transition-colors duration-300 text-xs text-gray-500 dark:text-gray-400">
        <p className="text-center">
          Need help? Open <span className="font-semibold">Support Center</span> in the menu.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

