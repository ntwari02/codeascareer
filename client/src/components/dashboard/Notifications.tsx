import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertTriangle, DollarSign, MessageSquare, CheckCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  type: string;
  icon: LucideIcon;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  color: string;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'order',
      icon: Package,
      title: 'New Order Received',
      message: 'Order #ORD-2847 for $324.99 needs processing',
      time: '2 minutes ago',
      unread: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      type: 'alert',
      icon: AlertTriangle,
      title: 'Low Stock Alert',
      message: 'Wireless Headphones stock is running low (12 units)',
      time: '15 minutes ago',
      unread: true,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 3,
      type: 'payment',
      icon: DollarSign,
      title: 'Payment Received',
      message: 'Payment of $189.50 confirmed for order #ORD-2846',
      time: '1 hour ago',
      unread: false,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 4,
      type: 'message',
      icon: MessageSquare,
      title: 'New Customer Message',
      message: 'Alice Johnson sent you a message about order #ORD-2847',
      time: '2 hours ago',
      unread: false,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 5,
      type: 'success',
      icon: CheckCircle,
      title: 'Order Delivered',
      message: 'Order #ORD-2844 has been delivered successfully',
      time: '3 hours ago',
      unread: false,
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black border-l border-gray-200 dark:border-gray-700/30 z-50 overflow-hidden flex flex-col transition-colors duration-300"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700/30 flex items-center justify-between transition-colors duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Notifications</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                  {notifications.filter(n => n.unread).length} unread
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.map((notification, index) => {
                const Icon = notification.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      notification.unread
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/50'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-br ${notification.color} rounded-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm transition-colors duration-300">{notification.title}</h3>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2 transition-colors duration-300">
                          {notification.message}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs transition-colors duration-300">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-700/30">
              <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Mark All as Read
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notifications;

