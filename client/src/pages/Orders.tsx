import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useTheme } from '../contexts/ThemeContext';
import type { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  X,
  Star,
  RefreshCw,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
  ChevronDown,
  FileText,
  Repeat,
  ShoppingBag,
  RotateCcw,
  Upload,
  UserCheck,
  Store,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToastStore } from '../stores/toastStore';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  payment_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  seller: {
    id: string;
    name: string;
  };
  timeline?: Array<{
    status: string;
    date: Date | string;
    time: string;
  }>;
}

// Mock Orders Data
const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    order_number: 'ORD-2024-001',
    status: 'delivered',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-1',
        product_id: '1',
        product_title: 'Wireless Noise-Cancelling Headphones',
        product_image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
        variant: 'Black',
        quantity: 1,
        price: 299.99,
        total: 299.99,
      },
      {
        id: 'item-2',
        product_id: '2',
        product_title: 'Smart Fitness Watch',
        product_image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
        variant: 'Silver',
        quantity: 1,
        price: 249.99,
        total: 249.99,
      }
    ],
    subtotal: 549.98,
    shipping: 10.00,
    tax: 55.00,
    discount: 50.00,
    total: 564.98,
    shipping_address: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    payment_method: 'Visa •••• 4242',
    tracking_number: 'TRK123456789',
    estimated_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      id: 'seller-1',
      name: 'Tech Store Official',
    }
  },
  {
    id: 'order-2',
    order_number: 'ORD-2024-002',
    status: 'shipped',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-3',
        product_id: '3',
        product_title: 'Premium Leather Backpack',
        product_image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400',
        variant: 'Brown',
        quantity: 1,
        price: 189.99,
        total: 189.99,
      }
    ],
    subtotal: 189.99,
    shipping: 5.00,
    tax: 19.00,
    discount: 0,
    total: 213.99,
    shipping_address: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    payment_method: 'PayPal',
    tracking_number: 'TRK987654321',
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      id: 'seller-2',
      name: 'Fashion Hub',
    }
  },
  {
    id: 'order-3',
    order_number: 'ORD-2024-003',
    status: 'processing',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-4',
        product_id: '4',
        product_title: 'Minimalist Sneakers',
        product_image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
        variant: 'White, Size 42',
        quantity: 2,
        price: 129.99,
        total: 259.98,
      }
    ],
    subtotal: 259.98,
    shipping: 8.00,
    tax: 26.00,
    discount: 0,
    total: 293.98,
    shipping_address: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    payment_method: 'Visa •••• 4242',
    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      id: 'seller-3',
      name: 'Electronics Plus',
    }
  },
  {
    id: 'order-4',
    order_number: 'ORD-2024-004',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-5',
        product_id: '5',
        product_title: 'Portable Phone Charger 10000mAh',
        product_image: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=400',
        quantity: 1,
        price: 39.99,
        total: 39.99,
      }
    ],
    subtotal: 39.99,
    shipping: 5.00,
    tax: 4.00,
    discount: 0,
    total: 48.99,
    shipping_address: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    payment_method: 'Visa •••• 4242',
    seller: {
      id: 'seller-1',
      name: 'Tech Store Official',
    }
  },
  {
    id: 'order-5',
    order_number: 'ORD-2024-005',
    status: 'cancelled',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-6',
        product_id: '6',
        product_title: 'Designer Sunglasses',
        product_image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
        variant: 'Black',
        quantity: 1,
        price: 89.99,
        total: 89.99,
      }
    ],
    subtotal: 89.99,
    shipping: 5.00,
    tax: 9.00,
    discount: 0,
    total: 103.99,
    shipping_address: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    payment_method: 'PayPal',
    seller: {
      id: 'seller-2',
      name: 'Fashion Hub',
    }
  }
];

type OrderStatus = 'all' | 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
type SortOption = 'newest' | 'oldest' | 'total-high' | 'total-low';

const returnReasons = [
  'Damaged or Defective Item',
  'Wrong Item Delivered',
  'Item Not as Described',
  'Missing Accessories',
  'Fake/Low-Quality/Counterfeit',
  'Expired Product',
  'Wrong Size (Fashion)',
  'Broken on Arrival',
  'Changed My Mind',
  'Other',
];

const returnSteps = [
  { step: 1, icon: UserCheck, title: 'Log into Your Account', description: 'Access your REAGLEX account and navigate to your orders' },
  { step: 2, icon: FileText, title: 'Go to Orders > Request Return', description: 'Find the order you want to return and click "Request Return"' },
  { step: 3, icon: Upload, title: 'Select Reason + Upload Images', description: 'Choose your return reason and upload photos as evidence' },
  { step: 4, icon: Store, title: 'Seller Reviews Request', description: 'Seller has 48 hours to review and approve your return request' },
  { step: 5, icon: Package, title: 'Shipping Label Generated', description: 'Once approved, you\'ll receive a return shipping label' },
  { step: 6, icon: Truck, title: 'Buyer Ships Back Item', description: 'Package the item securely and ship it back using the provided label' },
  { step: 7, icon: CheckCircle2, title: 'Seller/Warehouse Confirms', description: 'Seller or warehouse confirms receipt and inspects the returned item' },
  { step: 8, icon: DollarSign, title: 'Refund Released (via Escrow)', description: 'Refund is processed and released to your original payment method' },
];

export function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading, initialized } = useAuthStore();
  const { currency } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [returnRequested, setReturnRequested] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const { showToast } = useToastStore();

  // Fetch orders from API
  useEffect(() => {
    if (user && initialized) {
      loadOrders();
    }
  }, [user, initialized, statusFilter, currentPage]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE = 'http://localhost:5000/api';
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      
      const response = await fetch(`${API_BASE}/orders?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      
      console.log('Orders API Response:', data); // Debug log
      console.log('Orders array:', data.orders); // Debug log
      console.log('Orders count:', data.orders?.length); // Debug log
      
      if (!data.orders || !Array.isArray(data.orders)) {
        console.error('Invalid orders data:', data);
        setError('Invalid response from server');
        setOrders([]);
        setTotalOrders(0);
        return;
      }
      
      // Map API response to Order interface
      const mappedOrders: Order[] = data.orders.map((order: any) => {
        console.log('Mapping order:', order); // Debug log
        return {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: (order.items || []).map((item: any) => {
          // Handle product image - could be string, array, or object
          let productImage = '';
          if (typeof item.product_image === 'string') {
            productImage = item.product_image.startsWith('http') 
              ? item.product_image 
              : item.product_image 
                ? `http://localhost:5000${item.product_image}`
                : 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
          } else if (Array.isArray(item.product_image) && item.product_image.length > 0) {
            productImage = item.product_image[0].startsWith('http')
              ? item.product_image[0]
              : `http://localhost:5000${item.product_image[0]}`;
          } else {
            productImage = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
          }
          
          return {
            id: item.id || item.product_id || String(item.product_id),
            product_id: String(item.product_id || item.id),
            product_title: item.product_title || 'Unknown Product',
            product_image: productImage,
            variant: item.variant || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: item.total || (item.price || 0) * (item.quantity || 1),
          };
        }),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        discount: order.discount || 0,
        total: order.total,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
        seller: order.seller || { id: '', name: 'Unknown Seller' },
        timeline: order.timeline || [],
      };
      });

      setOrders(mappedOrders);
      setTotalPages(data.pagination?.pages || 1);
      setTotalOrders(data.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.product_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'total-high':
        return sorted.sort((a, b) => b.total - a.total);
      case 'total-low':
        return sorted.sort((a, b) => a.total - b.total);
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [orders, searchQuery, statusFilter, sortBy]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancellingOrder(orderToCancel);
    try {
      const API_BASE = 'http://localhost:5000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE}/orders/${orderToCancel}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      // Reload orders to reflect the cancellation
      await loadOrders();
      showToast('Order cancelled successfully', 'success');
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      showToast(err.message || 'Failed to cancel order. Please try again.', 'error');
    } finally {
      setCancellingOrder(null);
      setOrderToCancel(null);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      const { addToCart } = useCartStore.getState();
      const { user } = useAuthStore.getState();
      
      // Add all items from the order back to cart
      for (const item of order.items) {
        // Fetch product details
        const API_BASE = 'http://localhost:5000/api';
        const productResponse = await fetch(`${API_BASE}/products/${item.product_id}`);
        
        if (productResponse.ok) {
          const productData = await productResponse.json();
          const product: Product = {
            id: productData._id || productData.id,
            title: productData.name || productData.title,
            price: productData.price,
            images: productData.images || [],
            seller_id: productData.sellerId || order.seller.id,
            description: productData.description || '',
            category_id: productData.category || '',
            stock_quantity: productData.stock || 0,
            low_stock_threshold: 10,
            status: 'active',
            is_shippable: true,
            views_count: productData.views || 0,
            created_at: productData.createdAt || new Date().toISOString(),
            updated_at: productData.updatedAt || new Date().toISOString(),
          };
          
          await addToCart(user?.id || null, product, item.variant ? { name: item.variant } : undefined, item.quantity);
        }
      }
      
      // Navigate to cart
      navigate('/cart');
      showToast('Items added to cart successfully', 'success');
    } catch (err: any) {
      console.error('Error reordering:', err);
      showToast('Failed to add items to cart. Please try again.', 'error');
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      // Generate invoice data
      const invoiceData = {
        orderNumber: order.order_number,
        date: new Date(order.created_at).toLocaleDateString(),
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
      };

      // Create CSV content
      const csvRows: string[] = [];
      
      // Header section
      csvRows.push('INVOICE');
      csvRows.push(`Order Number,${invoiceData.orderNumber}`);
      csvRows.push(`Date,${invoiceData.date}`);
      csvRows.push(''); // Empty row
      
      // Items header
      csvRows.push('Items');
      csvRows.push('Product Name,Quantity,Unit Price,Total Price');
      
      // Items data
      invoiceData.items.forEach(item => {
        const unitPrice = item.total / item.quantity;
        csvRows.push(`"${item.product_title.replace(/"/g, '""')}",${item.quantity},"${formatCurrency(unitPrice, currency)}","${formatCurrency(item.total, currency)}"`);
      });
      
      csvRows.push(''); // Empty row
      
      // Summary section
      csvRows.push('Summary');
      csvRows.push(`Subtotal,"${formatCurrency(invoiceData.subtotal, currency)}"`);
      csvRows.push(`Shipping,"${formatCurrency(invoiceData.shipping, currency)}"`);
      csvRows.push(`Tax,"${formatCurrency(invoiceData.tax, currency)}"`);
      if (invoiceData.discount > 0) {
        csvRows.push(`Discount,"-${formatCurrency(invoiceData.discount, currency)}"`);
      }
      csvRows.push(`Total,"${formatCurrency(invoiceData.total, currency)}"`);
      csvRows.push(''); // Empty row
      
      // Shipping Address section
      csvRows.push('Shipping Address');
      csvRows.push(`Full Name,"${invoiceData.shippingAddress.fullName.replace(/"/g, '""')}"`);
      csvRows.push(`Address,"${invoiceData.shippingAddress.address.replace(/"/g, '""')}"`);
      csvRows.push(`City,"${invoiceData.shippingAddress.city.replace(/"/g, '""')}"`);
      csvRows.push(`State/Province,"${(invoiceData.shippingAddress.state || 'N/A').replace(/"/g, '""')}"`);
      csvRows.push(`Country,"${invoiceData.shippingAddress.country.replace(/"/g, '""')}"`);
      csvRows.push(`Postal Code,"${invoiceData.shippingAddress.postalCode || 'N/A'}"`);
      csvRows.push(`Phone,"${invoiceData.shippingAddress.phone.replace(/"/g, '""')}"`);
      csvRows.push(''); // Empty row
      
      // Payment Method
      csvRows.push('Payment Information');
      csvRows.push(`Payment Method,"${invoiceData.paymentMethod.replace(/"/g, '""')}"`);
      
      // Join all rows with newlines
      const csvContent = csvRows.join('\n');
      
      // Add BOM for Excel compatibility (UTF-8 BOM)
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Create and download file
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceData.orderNumber}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Invoice downloaded successfully', 'success');
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      showToast('Failed to download invoice. Please try again.', 'error');
    }
  };

  const handleRateReview = (order: Order, item?: OrderItem) => {
    // Navigate to product page with review modal or open review modal
    if (item) {
      navigate(`/products/${item.product_id}?review=true`);
    } else {
      // If no specific item, navigate to first product
      if (order.items.length > 0) {
        navigate(`/products/${order.items[0].product_id}?review=true`);
      }
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 shadow-sm';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 shadow-sm';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 shadow-sm';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 shadow-sm';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'packed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const stats = useMemo(() => {
    return {
      total: totalOrders,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders, totalOrders]);

  // Wait for auth to initialize before checking user
  useEffect(() => {
    if (!authLoading && initialized && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, initialized, user, navigate]);

  // Show loading while auth is initializing
  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but return null to prevent render)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your order history</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadOrders}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/products">
                <Button className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Orders</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl shadow-lg p-4 border border-yellow-200 dark:border-yellow-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl shadow-lg p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.processing}</div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Processing</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg p-4 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.shipped}</div>
              <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Shipped</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-lg p-4 border border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.delivered}</div>
              <div className="text-xs text-green-700 dark:text-green-300 font-medium">Delivered</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg p-4 border border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(stats.totalSpent, currency)}</div>
              <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Total Spent</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, products, or sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as OrderStatus);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total-high">Total: High to Low</option>
                <option value="total-low">Total: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && orders.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Error Loading Orders</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={loadOrders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : !loading && orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : filteredAndSortedOrders.length === 0 && (searchQuery || statusFilter !== 'all') ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Match Your Filters</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search query or status filter to see more orders.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
              <Link to="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transform hover:-translate-y-1"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Order {order.order_number}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.status === 'delivered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowReturnModal(true);
                                setCurrentStep(1);
                                setReturnRequested(false);
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Request Return
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Placed {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4" />
                            <span>{order.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(order.total, currency)}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Saved {formatCurrency(order.discount, currency)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-wrap gap-4 mb-4">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.product_title}
                            </p>
                            {item.variant && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.variant}</p>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Qty: {item.quantity} × {formatCurrency(item.price, currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                      {order.tracking_number && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => navigate(`/track?id=${order.tracking_number}`)}
                        >
                          <Truck className="h-4 w-4" />
                          Track Order
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleRateReview(order)}
                          >
                            <Star className="h-4 w-4" />
                            Rate & Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleReorder(order)}
                          >
                            <Repeat className="h-4 w-4" />
                            Reorder
                          </Button>
                        </>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-red-600 hover:text-red-700"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                        >
                          {cancellingOrder === order.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleDownloadInvoice(order)}
                      >
                        <Download className="h-4 w-4" />
                        Invoice
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Shipping Address */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.shipping_address.fullName}</p>
                            <p>{order.shipping_address.address}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.country} {order.shipping_address.postalCode}</p>
                            <p>{order.shipping_address.phone}</p>
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Order Timeline
                          </h4>
                          <div className="space-y-3">
                            {order.timeline && order.timeline.length > 0 ? (
                              order.timeline.map((entry: any, index: number) => {
                                const isActive = index === order.timeline!.length - 1;
                                const statusColors: Record<string, string> = {
                                  pending: 'bg-yellow-500',
                                  processing: 'bg-blue-500',
                                  packed: 'bg-indigo-500',
                                  shipped: 'bg-purple-500',
                                  delivered: 'bg-green-500',
                                  cancelled: 'bg-red-500',
                                };
                                
                                return (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className="mt-1 relative">
                                      <div className={`w-3 h-3 rounded-full ${statusColors[entry.status] || 'bg-gray-500'} ${isActive ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-orange-500' : ''}`} />
                                      {index < order.timeline!.length - 1 && (
                                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ')}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(entry.date).toLocaleString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <>
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-green-500" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Order Placed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(order.created_at).toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                {order.status !== 'pending' && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 relative">
                                      <div className={`w-3 h-3 rounded-full ${
                                        order.status === 'processing' || order.status === 'packed' || order.status === 'shipped' || order.status === 'delivered'
                                          ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                      }`} />
                                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Processing</p>
                                      {(order.status === 'processing' || order.status === 'packed') && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(order.updated_at).toLocaleString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {(order.status === 'shipped' || order.status === 'delivered') && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 relative">
                                      <div className={`w-3 h-3 rounded-full ${
                                        order.status === 'delivered' ? 'bg-green-500' : 'bg-purple-500'
                                      }`} />
                                      {order.status !== 'delivered' && (
                                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Shipped</p>
                                      {order.tracking_number && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Tracking: {order.tracking_number}
                                        </p>
                                      )}
                                      {order.estimated_delivery && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {order.status === 'delivered' && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-green-500" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Delivered</p>
                                      {order.estimated_delivery && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(order.estimated_delivery).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* All Order Items */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/products/${item.product_id}`}
                                  className="text-sm sm:text-base font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                  {item.product_title}
                                </Link>
                                {item.variant && (
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{item.variant}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <span>Quantity: {item.quantity}</span>
                                  <span>Price: {formatCurrency(item.price, currency)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(item.total, currency)}
                                </div>
                                {order.status === 'delivered' && (
                                  <div className="flex flex-col gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="gap-1 text-xs"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setSelectedItem(item);
                                        setShowReturnModal(true);
                                        setCurrentStep(1);
                                        setReturnRequested(false);
                                      }}
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      Return Item
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="gap-1 text-xs"
                                      onClick={() => handleRateReview(order, item)}
                                    >
                                      <Star className="h-3 w-3" />
                                      Review
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal, currency)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Discount</span>
                              <span className="text-green-600 dark:text-green-400">-{formatCurrency(order.discount, currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(order.shipping, currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tax</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax, currency)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(order.total, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Return Request Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Return
            </DialogTitle>
          </DialogHeader>

          {!returnRequested ? (
            <div className="space-y-6">
              {/* Return Process Flow */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Return Process Flow
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {returnSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep >= step.step;
                    return (
                      <div
                        key={index}
                        className={`relative bg-white dark:bg-gray-700 p-4 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'border-orange-500 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isActive
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {step.step}
                          </div>
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                            isActive
                              ? 'bg-orange-100 dark:bg-orange-900/30'
                              : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isActive
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-gray-400 dark:text-gray-500'
                            }`} />
                          </div>
                        </div>
                        <h4 className={`text-sm font-semibold mb-1 ${
                          isActive
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.title}
                        </h4>
                        <p className={`text-xs ${
                          isActive
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                        {index < returnSteps.length - 1 && (
                          <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                            <ChevronRight className={`h-4 w-4 ${
                              isActive
                                ? 'text-orange-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Select Item */}
              {currentStep === 1 && selectedOrder && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Select Item to Return
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setCurrentStep(2);
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedItem?.id === item.id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.product_title}
                            </p>
                            {item.variant && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Qty: {item.quantity} × {formatCurrency(item.price, currency)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(item.total, currency)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Reason */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Select Return Reason
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {returnReasons.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => {
                          setReturnReason(reason);
                          setCurrentStep(3);
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          returnReason === reason
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Upload Images & Description */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Upload Images & Add Description
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value)}
                      placeholder="Describe the issue or reason for return..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Upload Photos (Optional but Recommended)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setReturnImages(files);
                        }}
                        className="hidden"
                        id="return-images"
                      />
                      <label
                        htmlFor="return-images"
                        className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Choose Files
                      </label>
                      {returnImages.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {returnImages.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        // Submit return request
                        setReturnRequested(true);
                        setCurrentStep(4);
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Submit Return Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && returnRequested && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Return Request Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your return request has been submitted. The seller will review it within 48 hours.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>What's Next?</strong> You'll receive an email notification once the seller reviews your request. 
                      If approved, you'll receive a return shipping label.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setShowReturnModal(false);
                        setSelectedOrder(null);
                        setSelectedItem(null);
                        setReturnReason('');
                        setReturnDescription('');
                        setReturnImages([]);
                        setCurrentStep(1);
                        setReturnRequested(false);
                      }}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
      />
    </div>
  );
}

