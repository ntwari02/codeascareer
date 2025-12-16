import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/utils';
import {
  Package,
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  MessageSquare,
  Download,
  RotateCcw,
  HelpCircle,
  Building2,
  Box,
  Plane,
  Car,
  Home,
  XCircle,
  Loader2,
  Eye,
  ChevronDown,
  Calendar as CalendarIcon,
  Shield,
  Phone,
} from 'lucide-react';

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  courier?: string;
}

interface PackageInfo {
  id: string;
  trackingNumber: string;
  seller: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    image: string;
  }>;
  weight: string;
  dimensions: string;
  packageType: string;
  shippingMethod: 'standard' | 'express' | 'priority';
  courier: {
    name: string;
    logo?: string;
    phone?: string;
  };
  status: 'pending' | 'payment_verified' | 'seller_confirmed' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery';
  events: TrackingEvent[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryImage?: string;
  deliverySignature?: string;
  deliveryPerson?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  failedDeliveryReason?: string;
}

interface OrderTracking {
  orderId: string;
  orderNumber: string;
  packages: PackageInfo[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone: string;
  };
}

const trackingStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: 'yellow' },
  { key: 'payment_verified', label: 'Payment Verified', icon: CheckCircle2, color: 'green' },
  { key: 'seller_confirmed', label: 'Seller Confirmed', icon: Building2, color: 'blue' },
  { key: 'packed', label: 'Item Packed', icon: Box, color: 'purple' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'orange' },
  { key: 'in_transit', label: 'In Transit', icon: Plane, color: 'indigo' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Car, color: 'pink' },
  { key: 'delivered', label: 'Delivered', icon: Home, color: 'green' },
  { key: 'failed_delivery', label: 'Failed Delivery', icon: XCircle, color: 'red' },
];

// Mock tracking data
const MOCK_TRACKING_DATA: OrderTracking[] = [
  {
    orderId: 'order-1',
    orderNumber: 'ORD-2024-001',
    totalAmount: 564.98,
    shippingAddress: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    packages: [
      {
        id: 'pkg-1',
        trackingNumber: 'TRK123456789',
        seller: {
          id: 'seller-1',
          name: 'Tech Store Official',
        },
        items: [
          {
            id: 'item-1',
            name: 'Wireless Noise-Cancelling Headphones',
            quantity: 1,
            image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
          {
            id: 'item-2',
            name: 'Smart Fitness Watch',
            quantity: 1,
            image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        ],
        weight: '2.5 kg',
        dimensions: '30 × 25 × 15 cm',
        packageType: 'Standard Box',
        shippingMethod: 'express',
        courier: {
          name: 'DHL Express',
          logo: 'https://logos-world.net/wp-content/uploads/2021/02/DHL-Logo.png',
          phone: '+250 788 123 456',
        },
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: {
          lat: -1.9441,
          lng: 30.0619,
          address: 'Kigali Sorting Center, Rwanda',
        },
        events: [
          {
            id: 'evt-1',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            location: 'Kigali, Rwanda',
            description: 'Order placed',
          },
          {
            id: 'evt-2',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            status: 'payment_verified',
            location: 'Kigali, Rwanda',
            description: 'Payment verified',
          },
          {
            id: 'evt-3',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'seller_confirmed',
            location: 'Kigali, Rwanda',
            description: 'Seller confirmed order',
          },
          {
            id: 'evt-4',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'packed',
            location: 'Kigali, Rwanda',
            description: 'Item packed and ready for shipment',
          },
          {
            id: 'evt-5',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'shipped',
            location: 'Kigali, Rwanda',
            description: 'Package handed to courier',
            courier: 'DHL Express',
          },
          {
            id: 'evt-6',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in_transit',
            location: 'Kigali Sorting Center, Rwanda',
            description: 'Arrived at sorting center',
            courier: 'DHL Express',
          },
          {
            id: 'evt-7',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'in_transit',
            location: 'Kigali Sorting Center, Rwanda',
            description: 'Departed facility',
            courier: 'DHL Express',
          },
        ],
      },
    ],
  },
  {
    orderId: 'order-2',
    orderNumber: 'ORD-2024-002',
    totalAmount: 213.99,
    shippingAddress: {
      fullName: 'John Doe',
      address: 'KG 123 St',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '00000',
      phone: '+250 788 123 456',
    },
    packages: [
      {
        id: 'pkg-2',
        trackingNumber: 'TRK987654321',
        seller: {
          id: 'seller-2',
          name: 'Fashion Hub',
        },
        items: [
          {
            id: 'item-3',
            name: 'Premium Leather Backpack',
            quantity: 1,
            image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400',
          },
        ],
        weight: '1.2 kg',
        dimensions: '40 × 30 × 15 cm',
        packageType: 'Standard Box',
        shippingMethod: 'standard',
        courier: {
          name: 'Local Courier',
          phone: '+250 788 123 456',
        },
        status: 'delivered',
        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actualDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryPerson: 'James K.',
        events: [
          {
            id: 'evt-8',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            location: 'Kigali, Rwanda',
            description: 'Order placed',
          },
          {
            id: 'evt-9',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            status: 'payment_verified',
            location: 'Kigali, Rwanda',
            description: 'Payment verified',
          },
          {
            id: 'evt-10',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'seller_confirmed',
            location: 'Kigali, Rwanda',
            description: 'Seller confirmed order',
          },
          {
            id: 'evt-11',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'packed',
            location: 'Kigali, Rwanda',
            description: 'Item packed and ready for shipment',
          },
          {
            id: 'evt-12',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'shipped',
            location: 'Kigali, Rwanda',
            description: 'Package handed to courier',
            courier: 'Local Courier',
          },
          {
            id: 'evt-13',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in_transit',
            location: 'Kigali Sorting Center, Rwanda',
            description: 'Arrived at sorting center',
            courier: 'Local Courier',
          },
          {
            id: 'evt-14',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'out_for_delivery',
            location: 'Kigali, Rwanda',
            description: 'Out for delivery',
            courier: 'Local Courier',
          },
          {
            id: 'evt-15',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            status: 'delivered',
            location: 'KG 123 St, Kigali, Rwanda',
            description: 'Delivered',
            courier: 'Local Courier',
          },
        ],
      },
    ],
  },
];

export default function Track() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [trackingData, setTrackingData] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  // Auto-detect active orders if user is logged in
  useEffect(() => {
    if (user && !trackingId && MOCK_TRACKING_DATA.length > 0) {
      // Auto-load first active order
      setTrackingData(MOCK_TRACKING_DATA[0]);
      setTrackingId(MOCK_TRACKING_DATA[0].orderNumber);
    }
  }, [user]);

  // Load tracking from URL param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingId(id);
      handleTrack(id);
    }
  }, [searchParams]);

  const handleTrack = async (id?: string) => {
    const trackId = id || trackingId.trim();
    if (!trackId) {
      setError('Please enter a tracking ID or order number');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      const found = MOCK_TRACKING_DATA.find(
        (order) => order.orderNumber === trackId || order.packages.some((pkg) => pkg.trackingNumber === trackId)
      );

      if (found) {
        setTrackingData(found);
        setSearchParams({ id: trackId });
        setExpandedPackages(new Set(found.packages.map((pkg) => pkg.id)));
      } else {
        setError('Tracking ID not found. Please check your number.');
        setTrackingData(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStatusIndex = (status: string) => {
    return trackingStatuses.findIndex((s) => s.key === status);
  };

  const getStatusInfo = (status: string) => {
    return trackingStatuses.find((s) => s.key === status) || trackingStatuses[0];
  };

  const togglePackageExpansion = (packageId: string) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedPackages(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedDeliveryMessage = (packageInfo: PackageInfo) => {
    if (packageInfo.status === 'delivered') {
      return 'Delivered';
    }
    if (packageInfo.estimatedDelivery) {
      const daysUntil = Math.ceil(
        (new Date(packageInfo.estimatedDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil < 0) {
        return 'May arrive earlier';
      }
      if (daysUntil === 0) {
        return 'Expected today';
      }
      if (daysUntil === 1) {
        return 'Expected tomorrow';
      }
      return `Expected in ${daysUntil} days`;
    }
    return 'Delivery estimate pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Enter your order number or tracking ID to see real-time updates
            </p>
          </div>

          {/* Tracking Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Order ID / Tracking Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                    placeholder="Enter order number or tracking ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Phone or Email (Optional)
                </label>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="Optional verification"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => handleTrack()}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
            </div>
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Logged in as {user.email}. Your active orders are shown below.
                </p>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Tracking ID Not Found</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Please check your order number or tracking ID and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackingData && !error && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Tracking Information</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your order number or tracking ID above to view tracking details.
              </p>
            </div>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Order {trackingData.orderNumber}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Total: {formatCurrency(trackingData.totalAmount, currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Invoice
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Contact Seller
                    </Button>
                    <Link to="/orders">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Order
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">Delivery Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.shippingAddress.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.shippingAddress.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.shippingAddress.city}, {trackingData.shippingAddress.country}{' '}
                        {trackingData.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Package Tracking */}
              {trackingData.packages.map((packageInfo, pkgIndex) => {
                const isExpanded = expandedPackages.has(packageInfo.id);
                const statusInfo = getStatusInfo(packageInfo.status);
                const StatusIcon = statusInfo.icon;
                const currentStatusIndex = getStatusIndex(packageInfo.status);

                return (
                  <div
                    key={packageInfo.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Package Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Package {pkgIndex + 1}
                            </h3>
                            {trackingData.packages.length > 1 && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                From {packageInfo.seller.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Tracking: <strong className="text-gray-900 dark:text-white">{packageInfo.trackingNumber}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className={`h-4 w-4 ${
                                  statusInfo.color === 'green'
                                    ? 'text-green-600 dark:text-green-400'
                                    : statusInfo.color === 'red'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}
                              />
                              <span
                                className={`font-semibold ${
                                  statusInfo.color === 'green'
                                    ? 'text-green-600 dark:text-green-400'
                                    : statusInfo.color === 'red'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePackageExpansion(packageInfo.id)}
                          className="gap-2"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Package Content */}
                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        {/* Real-Time Timeline */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Delivery Timeline
                          </h4>
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                            <div className="space-y-6">
                              {trackingStatuses.map((status, index) => {
                                const StatusIcon = status.icon;
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const event = packageInfo.events.find((e) => e.status === status.key);

                                return (
                                  <div key={status.key} className="relative flex items-start gap-4">
                                    <div
                                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                                        isCompleted
                                          ? status.color === 'green'
                                            ? 'bg-green-600 dark:bg-green-500'
                                            : status.color === 'red'
                                            ? 'bg-red-600 dark:bg-red-500'
                                            : 'bg-orange-600 dark:bg-orange-500'
                                          : 'bg-gray-300 dark:bg-gray-600'
                                      }`}
                                    >
                                      <StatusIcon
                                        className={`h-4 w-4 ${
                                          isCompleted ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 pt-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5
                                          className={`font-semibold ${
                                            isCurrent
                                              ? 'text-orange-600 dark:text-orange-400'
                                              : isCompleted
                                              ? 'text-gray-900 dark:text-white'
                                              : 'text-gray-500 dark:text-gray-400'
                                          }`}
                                        >
                                          {status.label}
                                        </h5>
                                        {isCurrent && (
                                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                                            Current
                                          </span>
                                        )}
                                      </div>
                                      {event && (
                                        <>
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            {event.description}
                                          </p>
                                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <MapPin className="h-3 w-3" />
                                              {event.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {formatDate(event.timestamp)}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                      {!event && isCompleted && (
                                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                          Status updated
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Package Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Package Details</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {packageInfo.weight}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {packageInfo.dimensions}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Package Type:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {packageInfo.packageType}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Shipping Method:</span>
                                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                  {packageInfo.shippingMethod}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Courier Information</h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                {packageInfo.courier.logo ? (
                                  <img
                                    src={packageInfo.courier.logo}
                                    alt={packageInfo.courier.name}
                                    className="h-12 object-contain"
                                  />
                                ) : (
                                  <Truck className="h-8 w-8 text-gray-400" />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {packageInfo.courier.name}
                                  </p>
                                  {packageInfo.courier.phone && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {packageInfo.courier.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Tracking Number:
                                </p>
                                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                  {packageInfo.trackingNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items in Package */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Items in Package</h4>
                          <div className="space-y-3">
                            {packageInfo.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Estimates */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                                Delivery Estimate
                              </h5>
                              <p className="text-sm text-blue-800 dark:text-blue-300">
                                {getEstimatedDeliveryMessage(packageInfo)}
                              </p>
                              {packageInfo.estimatedDelivery && packageInfo.status !== 'delivered' && (
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                  Expected: {new Date(packageInfo.estimatedDelivery).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Confirmation */}
                        {packageInfo.status === 'delivered' && packageInfo.actualDelivery && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                                  Delivered Successfully
                                </h5>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                  Delivered on{' '}
                                  {new Date(packageInfo.actualDelivery).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                {packageInfo.deliveryPerson && (
                                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    Delivered by: {packageInfo.deliveryPerson}
                                  </p>
                                )}
                                <div className="mt-3 flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm Delivery
                                  </Button>
                                  <Link to="/orders">
                                    <Button variant="outline" size="sm">
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Request Return
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Failed Delivery */}
                        {packageInfo.status === 'failed_delivery' && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                                  Delivery Attempt Failed
                                </h5>
                                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                                  {packageInfo.failedDeliveryReason ||
                                    'Recipient not available at the time of delivery.'}
                                </p>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  Reschedule Delivery
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Shipping Events Log */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Shipping Events Log
                          </h4>
                          <div className="space-y-3">
                            {packageInfo.events.map((event) => (
                              <div
                                key={event.id}
                                className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                              >
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-2" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                                    {event.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {event.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(event.timestamp)}
                                    </span>
                                    {event.courier && (
                                      <span className="flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        {event.courier}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button variant="outline" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Contact Seller
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Report Issue
                          </Button>
                          {packageInfo.status !== 'delivered' && packageInfo.status !== 'failed_delivery' && (
                            <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                              <X className="h-4 w-4" />
                              Cancel Order
                            </Button>
                          )}
                          {packageInfo.status === 'delivered' && (
                            <Link to="/orders">
                              <Button variant="outline" size="sm" className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Request Return
                              </Button>
                            </Link>
                          )}
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Contact Support Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="gap-2 justify-start">
                    <MessageSquare className="h-4 w-4" />
                    Chat with Support
                  </Button>
                  <Button variant="outline" className="gap-2 justify-start">
                    <Shield className="h-4 w-4" />
                    Open a Dispute
                  </Button>
                  <a
                    href="https://wa.me/14313062173"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <Phone className="h-4 w-4" />
                      WhatsApp Support
                    </Button>
                  </a>
                  <Link to="/support">
                    <Button variant="outline" className="w-full gap-2 justify-start">
                      <HelpCircle className="h-4 w-4" />
                      Help Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

