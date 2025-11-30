import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Eye, Package, Truck, CheckCircle, XCircle, Filter, Printer, Upload, X, MapPin, CreditCard, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  timeline: {
    status: string;
    date: string;
    time: string;
  }[];
}

const OrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2847',
      customer: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      customerPhone: '+1 234-567-8900',
      items: [
        { id: '1', name: 'Wireless Headphones', quantity: 2, price: 149.99, variant: 'Black' },
        { id: '2', name: 'USB-C Cable', quantity: 1, price: 19.99 },
      ],
      subtotal: 319.97,
      shipping: 5.00,
      tax: 25.60,
      total: 350.57,
      status: 'processing',
      date: '2024-01-15',
      shippingAddress: {
        name: 'Alice Johnson',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
      paymentMethod: 'Credit Card •••• 4242',
      timeline: [
        { status: 'Order Placed', date: '2024-01-15', time: '10:30 AM' },
        { status: 'Processing', date: '2024-01-15', time: '11:00 AM' },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-2846',
      customer: 'Bob Smith',
      customerEmail: 'bob@example.com',
      customerPhone: '+1 234-567-8901',
      items: [
        { id: '3', name: 'Smart Watch', quantity: 1, price: 299.99, variant: 'Silver, 42mm' },
      ],
      subtotal: 299.99,
      shipping: 10.00,
      tax: 24.00,
      total: 333.99,
      status: 'shipped',
      date: '2024-01-14',
      shippingAddress: {
        name: 'Bob Smith',
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
      },
      paymentMethod: 'PayPal',
      trackingNumber: 'TRACK123456789',
      timeline: [
        { status: 'Order Placed', date: '2024-01-14', time: '09:15 AM' },
        { status: 'Processing', date: '2024-01-14', time: '09:45 AM' },
        { status: 'Packed', date: '2024-01-14', time: '02:30 PM' },
        { status: 'Shipped', date: '2024-01-14', time: '04:00 PM' },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-2845',
      customer: 'Carol White',
      customerEmail: 'carol@example.com',
      customerPhone: '+1 234-567-8902',
      items: [
        { id: '4', name: 'Laptop Stand', quantity: 1, price: 79.99 },
        { id: '5', name: 'USB-C Cable', quantity: 2, price: 19.99 },
        { id: '6', name: 'Wireless Headphones', quantity: 1, price: 149.99, variant: 'White' },
      ],
      subtotal: 269.96,
      shipping: 8.00,
      tax: 22.20,
      total: 300.16,
      status: 'delivered',
      date: '2024-01-13',
      shippingAddress: {
        name: 'Carol White',
        street: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA',
      },
      paymentMethod: 'Credit Card •••• 5678',
      trackingNumber: 'TRACK987654321',
      timeline: [
        { status: 'Order Placed', date: '2024-01-13', time: '08:00 AM' },
        { status: 'Processing', date: '2024-01-13', time: '08:30 AM' },
        { status: 'Packed', date: '2024-01-13', time: '12:00 PM' },
        { status: 'Shipped', date: '2024-01-13', time: '03:00 PM' },
        { status: 'Delivered', date: '2024-01-15', time: '10:00 AM' },
      ],
    },
    {
      id: '4',
      orderNumber: 'ORD-2844',
      customer: 'David Brown',
      customerEmail: 'david@example.com',
      customerPhone: '+1 234-567-8903',
      items: [
        { id: '7', name: 'USB-C Cable', quantity: 1, price: 19.99 },
      ],
      subtotal: 19.99,
      shipping: 3.00,
      tax: 1.84,
      total: 24.83,
      status: 'pending',
      date: '2024-01-12',
      shippingAddress: {
        name: 'David Brown',
        street: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        country: 'USA',
      },
      paymentMethod: 'Credit Card •••• 9012',
      timeline: [
        { status: 'Order Placed', date: '2024-01-12', time: '03:45 PM' },
      ],
    },
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': case 'packed': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'packed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'shipped': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleMarkAsPacked = (orderId: string) => {
    // Implementation would update order status
    console.log('Mark as packed:', orderId);
  };

  const handleMarkAsShipped = (orderId: string) => {
    setShowTrackingModal(true);
    setSelectedOrder(orders.find(o => o.id === orderId) || null);
  };

  const handleSubmitTracking = () => {
    if (selectedOrder && trackingNumber) {
      // Implementation would update order with tracking number
      console.log('Tracking submitted:', trackingNumber);
      setShowTrackingModal(false);
      setTrackingNumber('');
    }
  };

  const handleCancelOrder = () => {
    if (selectedOrder && cancelReason) {
      // Implementation would cancel order
      console.log('Cancel order:', cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setShowOrderDetails(false);
    }
  };

  const handlePrintInvoice = (order: Order) => {
    window.print();
  };

  const handlePrintPackingSlip = (order: Order) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <ShoppingCart className="w-8 h-8 text-red-400" />
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">View and manage all your orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700/50 hover:border-red-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                      <StatusIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">{order.orderNumber}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)} font-medium capitalize`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                        {order.customer} • {order.items.length} items • {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-400" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white">{selectedOrder.customer}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerEmail}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-400" />
                  Payment Method
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.paymentMethod}</p>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items in Order</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.variant && <p className="text-sm text-gray-600 dark:text-gray-400">Variant: {item.variant}</p>}
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-400" />
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((event, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === selectedOrder.timeline.length - 1 ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.status}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{event.date} at {event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedOrder.status === 'processing' && (
                  <Button 
                    onClick={() => handleMarkAsPacked(selectedOrder.id)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Mark as Packed
                  </Button>
                )}
                {(selectedOrder.status === 'packed' || selectedOrder.status === 'processing') && (
                  <Button 
                    onClick={() => handleMarkAsShipped(selectedOrder.id)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Mark as Shipped
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="border-gray-300 dark:border-gray-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrintPackingSlip(selectedOrder)}
                  className="border-gray-300 dark:border-gray-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Packing Slip
                </Button>
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowCancelModal(true);
                      setShowOrderDetails(false);
                    }}
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Number Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Upload Tracking Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTrackingModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitTracking}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Cancellation (Required)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                rows={4}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Close
              </Button>
              <Button 
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
