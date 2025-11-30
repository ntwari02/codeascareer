import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 shadow-lg hover:shadow-red-500/20 hover:border-red-500/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${color} rounded-lg shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1 transition-colors duration-300">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{value}</p>
    </motion.div>
  );
};

export default StatCard;

