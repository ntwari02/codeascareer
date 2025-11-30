import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function OrderManagementAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(id, email, full_name),
          seller:profiles!orders_seller_id_fkey(id, email, full_name),
          items:order_items(
            *,
            product:products(id, title, price)
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
      setShowOrderModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      disputed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    disputed: orders.filter(o => o.status === 'disputed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage all platform orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{statusCounts.pending}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400">Processing</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{statusCounts.processing}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
          <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-200">{statusCounts.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled', 'disputed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${statusCounts[status as keyof typeof statusCounts]})`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {order.buyer?.full_name || order.buyer?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {order.seller?.full_name || order.seller?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus }: any) {
  const [newStatus, setNewStatus] = useState(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.order_number}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product?.title || 'Product'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${item.total?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buyer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.buyer?.full_name || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.buyer?.email || 'N/A'}</p>
                <p><span className="font-medium">Address:</span> {JSON.stringify(order.shipping_address)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.seller?.full_name || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.seller?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <span className="text-gray-900 dark:text-white">${order.shipping_cost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-white">${order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="text-green-600 dark:text-green-400">-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button
                onClick={() => onUpdateStatus(order.id, newStatus)}
                disabled={newStatus === order.status}
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
