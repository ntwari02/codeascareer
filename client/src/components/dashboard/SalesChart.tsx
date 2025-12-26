import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface ChartData {
  day: string;
  sales: number;
}

interface SalesChartProps {
  data?: ChartData[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data: dataProp = [] }) => {
  const data: ChartData[] = dataProp.length > 0 ? dataProp : [
    { day: 'Mon', sales: 0 },
    { day: 'Tue', sales: 0 },
    { day: 'Wed', sales: 0 },
    { day: 'Thu', sales: 0 },
    { day: 'Fri', sales: 0 },
    { day: 'Sat', sales: 0 },
    { day: 'Sun', sales: 0 },
  ];

  const maxSales = Math.max(...data.map(d => d.sales), 1); // Avoid division by zero

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 shadow-xl h-[364px] flex flex-col transition-colors duration-300">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <BarChart3 className="w-6 h-6 text-red-400" />
            Sales This Week
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Daily revenue overview</p>
        </div>
        <select className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <div className="flex items-end justify-between gap-2 h-64 flex-shrink-0">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.sales / maxSales) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-t-lg relative group cursor-pointer hover:from-red-500 hover:to-orange-400 transition-all"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${item.sales.toLocaleString()}
              </div>
            </motion.div>
            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors duration-300">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;

