import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, Edit, Trash2, AlertTriangle, Download, Upload, History, MapPin, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location?: string;
  variants?: { color?: string; size?: string; sku: string; stock: number }[];
}

interface StockHistory {
  id: string;
  productName: string;
  sku: string;
  change: number;
  reason: string;
  date: string;
  type: 'added' | 'removed' | 'sold';
}

const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'warehouse' | 'history' | 'variants'>('stock');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [inventory] = useState<InventoryItem[]>([
    { 
      id: '1', 
      name: 'Wireless Headphones', 
      sku: 'WH-001', 
      stock: 45, 
      price: 149.99, 
      status: 'in_stock',
      location: 'Warehouse A',
      variants: [
        { color: 'Black', size: 'Standard', sku: 'WH-001-BLK', stock: 20 },
        { color: 'White', size: 'Standard', sku: 'WH-001-WHT', stock: 25 },
      ]
    },
    { 
      id: '2', 
      name: 'Smart Watch', 
      sku: 'SW-002', 
      stock: 12, 
      price: 299.99, 
      status: 'low_stock',
      location: 'Warehouse B',
      variants: [
        { color: 'Silver', size: '42mm', sku: 'SW-002-SLV-42', stock: 5 },
        { color: 'Black', size: '46mm', sku: 'SW-002-BLK-46', stock: 7 },
      ]
    },
    { 
      id: '3', 
      name: 'Laptop Stand', 
      sku: 'LS-003', 
      stock: 0, 
      price: 79.99, 
      status: 'out_of_stock',
      location: 'Warehouse A',
    },
    { 
      id: '4', 
      name: 'USB-C Cable', 
      sku: 'UC-004', 
      stock: 128, 
      price: 19.99, 
      status: 'in_stock',
      location: 'Warehouse C',
    },
  ]);

  const [warehouses] = useState([
    { id: '1', name: 'Warehouse A', address: '123 Main St, City', capacity: 1000, currentStock: 450 },
    { id: '2', name: 'Warehouse B', address: '456 Oak Ave, City', capacity: 800, currentStock: 320 },
    { id: '3', name: 'Warehouse C', address: '789 Pine Rd, City', capacity: 600, currentStock: 280 },
  ]);

  const [stockHistory] = useState<StockHistory[]>([
    { id: '1', productName: 'Wireless Headphones', sku: 'WH-001-BLK', change: 50, reason: 'Restocked', date: '2024-01-15', type: 'added' },
    { id: '2', productName: 'Smart Watch', sku: 'SW-002-SLV-42', change: -3, reason: 'Sold', date: '2024-01-14', type: 'sold' },
    { id: '3', productName: 'USB-C Cable', sku: 'UC-004', change: 100, reason: 'Bulk Purchase', date: '2024-01-13', type: 'added' },
    { id: '4', productName: 'Laptop Stand', sku: 'LS-003', change: -5, reason: 'Damaged', date: '2024-01-12', type: 'removed' },
  ]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'low_stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(item => item.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <Package className="w-8 h-8 text-red-400" />
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Manage your product inventory and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-300 dark:border-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" className="border-gray-300 dark:border-gray-700">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
              {outOfStockItems.length > 0 && `${outOfStockItems.length} items out of stock`}
              {outOfStockItems.length > 0 && lowStockItems.length > 0 && ' • '}
              {lowStockItems.length > 0 && `${lowStockItems.length} items low on stock`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/30">
        {[
          { id: 'stock', label: 'Stock Management' },
          { id: 'warehouse', label: 'Warehouse/Location' },
          { id: 'history', label: 'Inventory History' },
          { id: 'variants', label: 'Variants & SKUs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors duration-300 border-b-2 ${
              activeTab === tab.id
                ? 'border-red-500 text-red-500 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stock Management Tab */}
      {activeTab === 'stock' && (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
              />
            </div>
            {selectedItems.length > 0 && (
              <Button 
                onClick={() => setShowBulkUpdate(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Bulk Update ({selectedItems.length})
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Product Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">SKU</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Location</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Price</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Status</th>
                  <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold transition-colors duration-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-gray-200 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-300 ${
                      item.status === 'out_of_stock' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'out_of_stock' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {item.status === 'low_stock' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">{item.sku}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white transition-colors duration-300">{item.stock} units</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">{item.location || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white transition-colors duration-300">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)} font-medium`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouse/Location Management Tab */}
      {activeTab === 'warehouse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Storage Locations</h2>
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((warehouse, index) => (
              <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{warehouse.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{warehouse.address}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Capacity</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{warehouse.capacity} units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Current Stock</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{warehouse.currentStock} units</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(warehouse.currentStock / warehouse.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
              <History className="w-6 h-6 text-red-400" />
              Stock Change Logs
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>All Changes</option>
                <option>Added</option>
                <option>Removed</option>
                <option>Sold</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {stockHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      entry.type === 'added' ? 'bg-green-500' : 
                      entry.type === 'sold' ? 'bg-blue-500' : 
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{entry.productName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{entry.sku} • {entry.reason}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    entry.type === 'added' ? 'text-green-500' : 
                    entry.type === 'sold' ? 'text-blue-500' : 
                    'text-red-500'
                  }`}>
                    {entry.type === 'added' ? '+' : ''}{entry.change}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{entry.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Variants & SKUs Tab */}
      {activeTab === 'variants' && (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Product Variants & SKUs</h2>
          <div className="space-y-6">
            {inventory.filter(item => item.variants && item.variants.length > 0).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{item.name}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700/30">
                        <th className="text-left py-2 px-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">Color</th>
                        <th className="text-left py-2 px-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">Size</th>
                        <th className="text-left py-2 px-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">SKU</th>
                        <th className="text-left py-2 px-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">Stock</th>
                        <th className="text-right py-2 px-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.variants?.map((variant, vIndex) => (
                        <tr key={vIndex} className="border-b border-gray-200 dark:border-gray-700/30">
                          <td className="py-2 px-3 text-gray-900 dark:text-white">{variant.color || 'N/A'}</td>
                          <td className="py-2 px-3 text-gray-900 dark:text-white">{variant.size || 'N/A'}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400 font-mono text-sm">{variant.sku}</td>
                          <td className="py-2 px-3">
                            <span className={`text-sm px-2 py-1 rounded ${
                              variant.stock === 0 ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                              variant.stock < 10 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                              'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            }`}>
                              {variant.stock} units
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
