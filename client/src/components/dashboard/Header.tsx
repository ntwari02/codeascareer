import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Menu, Search, User, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  userName: string;
  userRole: string;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, notificationsOpen, setNotificationsOpen, userName, userRole }) => {
  const notificationCount = 5;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/30 px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </Button>

        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {notificationCount}
            </motion.span>
          )}
        </motion.button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{userName}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{userRole}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

