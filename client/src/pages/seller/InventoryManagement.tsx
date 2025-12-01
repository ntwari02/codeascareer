import React, { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, Edit, Trash2, AlertTriangle, Download, Upload, History, MapPin, Filter, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location?: string;
  variants?: { color?: string; size?: string; sku: string; stock: number }[];
  tiers?: { minQty: number; maxQty?: number; price: number }[];
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
  const [inventory, setInventory] = useState<InventoryItem[]>([
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
      ],
      tiers: [
        { minQty: 1, maxQty: 9, price: 149.99 },
        { minQty: 10, maxQty: 49, price: 139.99 },
        { minQty: 50, price: 129.99 },
      ],
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
      ],
      tiers: [
        { minQty: 1, maxQty: 4, price: 299.99 },
        { minQty: 5, maxQty: 19, price: 284.99 },
        { minQty: 20, price: 269.99 },
      ],
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

  // Product edit & tiered pricing state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // CSV import / export
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const openEditModal = (item: InventoryItem) => {
    // Work on a shallow copy so edits are local until saved
    setEditingItem({
      ...item,
      tiers: item.tiers ? [...item.tiers] : [],
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const updateEditingTier = (index: number, field: 'minQty' | 'maxQty' | 'price', value: string) => {
    if (!editingItem) return;
    const tiers = editingItem.tiers ? [...editingItem.tiers] : [];
    const parsed = value === '' ? undefined : Number(value);

    if (!tiers[index]) {
      tiers[index] = { minQty: 1, price: editingItem.price };
    }

    if (field === 'price' && parsed !== undefined) {
      tiers[index] = { ...tiers[index], price: parsed };
    } else if (field === 'minQty' && parsed !== undefined) {
      tiers[index] = { ...tiers[index], minQty: parsed };
    } else if (field === 'maxQty') {
      tiers[index] = { ...tiers[index], maxQty: parsed };
    }

    setEditingItem({ ...editingItem, tiers });
  };

  const addTierRow = () => {
    if (!editingItem) return;
    const tiers = editingItem.tiers ? [...editingItem.tiers] : [];
    tiers.push({
      minQty: tiers.length > 0 ? tiers[tiers.length - 1].minQty + 1 : 1,
      price: editingItem.price,
    });
    setEditingItem({ ...editingItem, tiers });
  };

  const removeTierRow = (index: number) => {
    if (!editingItem || !editingItem.tiers) return;
    const tiers = editingItem.tiers.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, tiers });
  };

  const handleSaveProduct = () => {
    if (!editingItem) return;
    setInventory((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    closeEditModal();
  };

  const handleExportCsv = () => {
    const header = [
      'id',
      'name',
      'sku',
      'stock',
      'price',
      'status',
      'location',
    ].join(',');

    const rows = inventory.map((item) =>
      [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        item.sku,
        item.stock,
        item.price.toFixed(2),
        item.status,
        item.location ?? '',
      ].join(',')
    );

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;

      const [, ...dataLines] = lines;
      const imported: InventoryItem[] = dataLines
        .map((line) => {
          const cells = line.split(',');
          if (cells.length < 6) return null;

          const [id, rawName, sku, stock, price, status, location] = cells;
          const name = rawName.replace(/^"|"$/g, '').replace(/""/g, '"');

          return {
            id: id.trim() || crypto.randomUUID(),
            name: name.trim(),
            sku: sku.trim(),
            stock: Number(stock) || 0,
            price: Number(price) || 0,
            status: (status.trim() as InventoryItem['status']) || 'in_stock',
            location: location?.trim() || undefined,
          } as InventoryItem;
        })
        .filter((item): item is InventoryItem => !!item && !!item.name && !!item.sku);

      if (imported.length > 0) {
        setInventory(imported);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        onChange={handleImportCsv}
        className="hidden"
      />
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
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-700"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-700"
            onClick={handleImportClick}
          >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      onClick={() => openEditModal(item)}
                    >
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 dark:text-gray-400"
                                onClick={() => openEditModal(item)}
                              >
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

      {/* Product Edit / Tiered Pricing Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => (open ? setShowEditModal(true) : closeEditModal())}>
        <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Layers className="w-5 h-5 text-red-400" />
                Edit Product & B2B Pricing
              </DialogTitle>
              <DialogDescription>
                Adjust core details and configure tiered pricing for volume-based B2B orders.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={closeEditModal}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6 mt-2">
              {/* Basic product summary */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingItem.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    SKU: <span className="font-mono">{editingItem.sku}</span>
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Base Price</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${editingItem.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Available Stock</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {editingItem.stock} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Tiered pricing editor */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Tiered Pricing (B2B)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Define volume breaks and discounted unit prices for qualified buyers.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-dashed border-gray-300 dark:border-gray-600"
                    onClick={addTierRow}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Tier
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700/60">
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Min Qty
                        </th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Max Qty (optional)
                        </th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">
                          Unit Price
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingItem.tiers || []).map((tier, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800/60">
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={1}
                              value={tier.minQty}
                              onChange={(e) =>
                                updateEditingTier(index, 'minQty', e.target.value)
                              }
                              className="w-24 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={tier.minQty}
                              value={tier.maxQty ?? ''}
                              onChange={(e) =>
                                updateEditingTier(index, 'maxQty', e.target.value)
                              }
                              placeholder="No upper limit"
                              className="w-32 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={tier.price}
                                onChange={(e) =>
                                  updateEditingTier(index, 'price', e.target.value)
                                }
                                className="w-28 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-red-500"
                              onClick={() => removeTierRow(index)}
                              aria-label="Remove tier"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {(editingItem.tiers?.length ?? 0) === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 px-2 text-xs text-gray-500 dark:text-gray-400 text-center"
                          >
                            No tiered pricing defined yet. Use "Add Tier" to create volume
                            discounts.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  These pricing tiers are local to this session and can be exported via CSV for
                  further processing in your B2B systems.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    onClick={handleSaveProduct}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
