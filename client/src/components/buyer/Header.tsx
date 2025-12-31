import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, Heart, Bell, User, Sun, Moon, 
  ChevronDown, Mic, X, Image as ImageIcon, Camera, Package, MessageSquare, 
  Wallet, Eye, LogOut, Store, BarChart3, Plus, CheckCircle, 
  Shield, CreditCard, TrendingUp, Sparkles, Zap, Flame, Menu, Home,
  MapPin, Filter, Clock, Gift, AlertCircle, Star, Tag, Building2, HelpCircle,
  ExternalLink, Settings
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useTheme } from '../../contexts/ThemeContext';

// Helper to resolve avatar URL (handles both full URLs and relative paths)
// Adds cache-busting parameter to ensure fresh image loads
const resolveAvatarUrl = (url: string | null | undefined, cacheBust?: boolean): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    // For data URLs, return as-is
    if (url.startsWith('data:')) return url;
    // For HTTP URLs, add cache-busting if needed
    if (cacheBust) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  // If it's a relative path, prepend the API host
  const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fullUrl = `${API_HOST}${url}`;
  // Add cache-busting parameter to force fresh load
  if (cacheBust) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}t=${Date.now()}`;
  }
  return fullUrl;
};
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { ChatWidget } from './ChatWidget';
import type { Product, Notification, CartItem } from '../../types';

// Helper: Fuzzy search with typo correction
function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return items
    .filter(item => {
      const lowerItem = item.toLowerCase();
      if (lowerItem.includes(lowerQuery)) return true;
      // Simple Levenshtein-like matching for typos
      if (lowerItem.length >= lowerQuery.length - 1 && lowerItem.length <= lowerQuery.length + 1) {
        let diff = 0;
        for (let i = 0; i < Math.min(lowerItem.length, lowerQuery.length); i++) {
          if (lowerItem[i] !== lowerQuery[i]) diff++;
        }
        return diff <= 2;
      }
      return false;
    })
    .slice(0, 5);
}

// Helper: Get recent searches from localStorage
function getRecentSearches(): string[] {
  const stored = localStorage.getItem('recentSearches');
  if (!stored) return [];
  try {
    return JSON.parse(stored).slice(0, 5);
  } catch {
    return [];
  }
}

// Helper: Save search to recent searches
function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches();
  const updated = [query, ...recent.filter(s => s !== query)].slice(0, 10);
  localStorage.setItem('recentSearches', JSON.stringify(updated));
}

// Helper: Get trending searches (mock data - replace with real API)
function getTrendingSearches(): string[] {
  return ['Wireless Headphones', 'Smartphone', 'Laptop', 'Fashion', 'Home Decor'];
}

// Helper: Get recently viewed products
function getRecentlyViewed(): Product[] {
  const stored = localStorage.getItem('recentlyViewed');
  if (!stored) return [];
  try {
    return JSON.parse(stored).slice(0, 5);
  } catch {
    return [];
  }
}

// Helper: Format currency
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    RWF: 'Fr',
    KES: 'KSh',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

// Mock products for search suggestions (replace with real API)
const mockProducts: Product[] = [
  {
    id: '1',
    seller_id: 'seller1',
    title: 'Wireless Bluetooth Headphones',
    price: 99.99,
    stock_quantity: 50,
    low_stock_threshold: 10,
    is_shippable: true,
    status: 'active',
    views_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: '1', product_id: '1', url: 'https://images.pexels.com/photos/3394655/pexels-photo-3394655.jpeg', position: 0, created_at: new Date().toISOString() }],
  },
  {
    id: '2',
    seller_id: 'seller1',
    title: 'Smartphone Pro Max',
    price: 899.99,
    stock_quantity: 30,
    low_stock_threshold: 10,
    is_shippable: true,
    status: 'active',
    views_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: '2', product_id: '2', url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', position: 0, created_at: new Date().toISOString() }],
  },
];

// Mock notifications (replace with real API)
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD-1234 has been shipped',
    is_read: false,
    link: '/orders/1234',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    user_id: 'user1',
    type: 'promotion',
    title: 'Flash Sale Alert',
    message: 'Up to 50% off on Electronics - Limited time!',
    is_read: false,
    link: '/products?sale=true',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    user_id: 'user1',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-1233 has been delivered successfully',
    is_read: true,
    link: '/orders/1233',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '4',
    user_id: 'user1',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from seller regarding order #ORD-1234',
    is_read: false,
    link: '/messages',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

export function Header() {
  const { user } = useAuthStore();
  // Force re-render when user.avatar_url changes
  const avatarUrl = user?.avatar_url;
  const { items: cartItems, getSubtotal, getTotal } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme, currency } = useTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    categories: string[];
    brands: string[];
  }>({ products: [], categories: [], brands: [] });
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchModalPosition, setSearchModalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Force re-render counter for avatar updates

  const { toast } = useToast();

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Listen for avatar updates and user state changes
  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarKey(prev => prev + 1); // Force image re-render
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  // Also react to user.avatar_url changes from Zustand
  useEffect(() => {
    if (avatarUrl) {
      setAvatarKey(prev => prev + 1); // Force re-render when avatar URL changes
    }
  }, [avatarUrl]);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      // TODO: Replace with real API call
      setNotifications(mockNotifications);
    }
  }, [user]);

  // Close mobile search when clicking outside
  useEffect(() => {
    if (mobileSearchOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          searchRef.current &&
          !searchRef.current.contains(target) &&
          !target.closest('[data-search-modal]')
        ) {
          setMobileSearchOpen(false);
          setShowSearchSuggestions(false);
          setSearchModalPosition(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [mobileSearchOpen]);

  // Search suggestions with AI-like autocomplete
  useEffect(() => {
    if (searchQuery.length > 0) {
      // Simulate AI search suggestions
      const allProducts = [...mockProducts, ...getRecentlyViewed()];
      const matchingProducts = allProducts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      const categories = ['Electronics', 'Fashion', 'Groceries', 'Baby Products', 'Automotive'];
      const matchingCategories = categories.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'];
      const matchingBrands = brands.filter(b =>
        b.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults({
        products: matchingProducts,
        categories: matchingCategories,
        brands: matchingBrands,
      });
    } else {
      setSearchResults({ products: [], categories: [], brands: [] });
    }
  }, [searchQuery]);


  // Update search modal position on scroll/resize
  useEffect(() => {
    if (!showSearchSuggestions || !searchRef.current) return;

    const updatePosition = () => {
      if (searchRef.current) {
        const rect = searchRef.current.getBoundingClientRect();
        setSearchModalPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSearchSuggestions]);


  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (searchRef.current && !searchRef.current.contains(target) && !target.closest('[data-search-modal]')) {
        setShowSearchSuggestions(false);
        setSearchModalPosition(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'en-US';

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        saveRecentSearch(transcript);
        navigate(`/products?q=${encodeURIComponent(transcript)}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const handleImageSearch = () => {
    setShowImageSearch(true);
  };

  const handleImageSelected = (file: File | null) => {
    if (!file) return;
    setImageFileName(file.name);
    // For now we simulate an image-based search; in a real app, we'd send this to a backend/AI service
    toast({
      title: 'Image search activated',
      description: `We are using "${file.name}" to find similar products. (Demo mode)`,
    });
    navigate('/products?image_search=1');
    setShowImageSearch(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchSuggestions(false);
      setSearchModalPosition(null);
    }
  };

  const handleSearchSelect = (query: string) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    navigate(`/products?q=${encodeURIComponent(query)}`);
    setShowSearchSuggestions(false);
    setSearchModalPosition(null);
  };

  const recentSearches = useMemo(() => getRecentSearches(), []);
  const trendingSearches = useMemo(() => getTrendingSearches(), []);
  const recentlyViewed = useMemo(() => getRecentlyViewed(), []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const filteredUnreadCount = filteredNotifications.filter(n => !n.is_read).length;

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Get notification icon and colors
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return { Icon: Package, bg: 'bg-blue-100 dark:bg-blue-900/20', color: 'text-blue-600 dark:text-blue-400' };
      case 'promotion':
        return { Icon: Gift, bg: 'bg-orange-100 dark:bg-orange-900/20', color: 'text-orange-600 dark:text-orange-400' };
      case 'message':
        return { Icon: MessageSquare, bg: 'bg-purple-100 dark:bg-purple-900/20', color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { Icon: Bell, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  // Get action label based on type
  const getActionLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'Track Order';
      case 'promotion':
        return 'Shop Now';
      case 'message':
        return 'View Message';
      default:
        return 'View Details';
    }
  };

  // Filter tabs
  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'order', label: 'Orders', icon: Package },
    { id: 'promotion', label: 'Promotions', icon: Gift },
    { id: 'message', label: 'Messages', icon: MessageSquare },
  ];
  const cartSubtotal = getSubtotal();
  const cartTotal = getTotal();

  const isSeller = user?.role === 'seller' || user?.role === 'admin';
  // A seller is only considered "verified" once explicitly approved by admin/government
  const isVerifiedSeller = user?.role === 'seller' && user?.seller_status === 'approved';

  return (
    <>
      {/* Promo Strip */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-1.5 sm:py-2 text-xs sm:text-sm font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 animate-pulse" />
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 px-2">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
          <span className="truncate">🔥 Flash Sale: Up to 50% OFF - Ends in 23:45:12</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">🚚 Free Shipping on Orders Over $50</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group">
              <img
                src="/logo.jpg"
                alt="REAGLE-X"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-base sm:text-lg lg:text-xl font-script text-gray-900 dark:text-white hidden sm:block">
                REAGLE-X
              </span>
            </Link>

            {/* Enhanced Search Bar - Desktop/Tablet */}
            <div className="hidden sm:flex flex-1 max-w-2xl mx-2 sm:mx-4 relative" ref={searchRef}>
              <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (value.length > 0 && searchRef.current) {
                      const rect = searchRef.current.getBoundingClientRect();
                      setSearchModalPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                    setShowSearchSuggestions(value.length > 0);
                  }}
                  onFocus={() => {
                    if (searchRef.current) {
                      const rect = searchRef.current.getBoundingClientRect();
                      setSearchModalPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                    setShowSearchSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearchSuggestions(false);
                      setSearchModalPosition(null);
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        handleSearch(e as any);
                      }
                      return;
                    }
                    if (e.key === 'ArrowDown' && showSearchSuggestions) {
                      e.preventDefault();
                      const firstSuggestion = searchRef.current?.querySelector('button, a');
                      if (firstSuggestion) {
                        (firstSuggestion as HTMLElement).focus();
                      }
                      return;
                    }
                  }}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-9 sm:pl-10 pr-24 sm:pr-28 lg:pr-32 py-2 sm:py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm hover:shadow-md"
                  aria-label="Search products"
                  autoComplete="off"
                  spellCheck="false"
                />
                <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={handleImageSearch}
                    className="hidden md:block p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500 transition-colors"
                    title="Search by Image"
                    aria-label="Search by image"
                  >
                    <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      isListening ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-orange-500'
                    }`}
                    title="Voice Search"
                    aria-label="Voice search"
                  >
                    <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchSuggestions(false);
                        setSearchModalPosition(null);
                      }}
                      className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Bar - Compact visible version */}
            <div className="sm:hidden flex-1 max-w-xs mx-2 relative">
              <div className="relative group w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (value.length > 0) {
                      setMobileSearchOpen(true);
                      setShowSearchSuggestions(true);
                      setSearchModalPosition({
                        top: 73,
                        left: 8,
                        width: window.innerWidth - 16,
                      });
                    } else {
                      setShowSearchSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    setMobileSearchOpen(true);
                    setShowSearchSuggestions(true);
                    setSearchModalPosition({
                      top: 73,
                      left: 8,
                      width: window.innerWidth - 16,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearchSuggestions(false);
                      setSearchModalPosition(null);
                      setMobileSearchOpen(false);
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        handleSearch(e as any);
                        setMobileSearchOpen(false);
                      }
                      return;
                    }
                  }}
                  placeholder="Search..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 transition-all"
                  aria-label="Search products"
                  autoComplete="off"
                  spellCheck="false"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchSuggestions(false);
                      setSearchModalPosition(null);
                      setMobileSearchOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Smart Search Results Preview - Shared for both desktop and mobile */}
            {showSearchSuggestions && searchModalPosition && createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9997]"
                  onClick={() => {
                    setShowSearchSuggestions(false);
                    setSearchModalPosition(null);
                    setMobileSearchOpen(false);
                  }}
                />
                  <div 
                    className="fixed bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-[calc(100vh-10rem)] sm:max-h-[600px] overflow-y-auto backdrop-blur-xl z-[9999]"
                    data-search-modal
                    style={{
                      top: window.innerWidth < 640 ? '73px' : `${searchModalPosition.top}px`,
                      left: window.innerWidth < 640 ? '8px' : `${searchModalPosition.left}px`,
                      width: window.innerWidth < 640 ? 'calc(100vw - 16px)' : `${searchModalPosition.width}px`,
                      maxWidth: window.innerWidth < 640 ? 'calc(100vw - 16px)' : undefined,
                    }}
                  >
                    {searchQuery.length === 0 ? (
                      <div className="p-4">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                              Recent Searches
                            </p>
                            <div className="space-y-1">
                              {recentSearches.map((search, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSearchSelect(search)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  {search}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Searches */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            Trending Searches
                          </p>
                          <div className="flex flex-wrap gap-2 px-2">
                            {trendingSearches.map((search, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(search)}
                                className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all"
                              >
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Recently Viewed */}
                        {recentlyViewed.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                              <Eye className="h-3 w-3" />
                              Recently Viewed
                            </p>
                            <div className="space-y-2 px-2">
                              {recentlyViewed.slice(0, 3).map((product) => (
                                <Link
                                  key={product.id}
                                  to={`/products/${product.id}`}
                                  onClick={() => {
                                    setShowSearchSuggestions(false);
                                    setSearchModalPosition(null);
                                  }}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                  <img
                                    src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                                    alt={product.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {product.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatCurrency(product.price, currency)}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4">
                        {/* Products Preview */}
                        {searchResults.products.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                              Products
                            </p>
                            <div className="space-y-2">
                              {searchResults.products.map((product) => (
                                <Link
                                  key={product.id}
                                  to={`/products/${product.id}`}
                                  onClick={() => {
                                    setShowSearchSuggestions(false);
                                    setSearchModalPosition(null);
                                  }}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                                >
                                  <img
                                    src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                                    alt={product.title}
                                    className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                      {product.title}
                                    </p>
                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                      {formatCurrency(product.price, currency)}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Categories */}
                        {searchResults.categories.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                              Categories
                            </p>
                            <div className="space-y-1">
                              {searchResults.categories.map((category, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSearchSelect(category)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Tag className="h-4 w-4 text-gray-400" />
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Brands */}
                        {searchResults.brands.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                              Brands
                            </p>
                            <div className="space-y-1">
                              {searchResults.brands.map((brand, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSearchSelect(brand)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                  {brand}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Search Button */}
                        <button
                          onClick={() => handleSearchSelect(searchQuery)}
                          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Search className="h-4 w-4" />
                          Search for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                </>,
                document.body
              )}

            {/* Right Side Actions */}

            {/* Smart Search Results Preview - Shared for both desktop and mobile */}
            {showSearchSuggestions && searchModalPosition && createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9997]"
                  onClick={() => {
                    setShowSearchSuggestions(false);
                    setSearchModalPosition(null);
                    setMobileSearchOpen(false);
                  }}
                />
                <div 
                  className="fixed bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-[calc(100vh-10rem)] sm:max-h-[600px] overflow-y-auto backdrop-blur-xl z-[9999]"
                  data-search-modal
                  style={{
                    top: window.innerWidth < 640 ? '73px' : `${searchModalPosition.top}px`,
                    left: window.innerWidth < 640 ? '8px' : `${searchModalPosition.left}px`,
                    width: window.innerWidth < 640 ? 'calc(100vw - 16px)' : `${searchModalPosition.width}px`,
                    maxWidth: window.innerWidth < 640 ? 'calc(100vw - 16px)' : undefined,
                  }}
                >
                  {searchQuery.length === 0 ? (
                    <div className="p-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                            Recent Searches
                          </p>
                          <div className="space-y-1">
                            {recentSearches.map((search, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(search)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                              >
                                <Clock className="h-4 w-4 text-gray-400" />
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Searches */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Trending Searches
                        </p>
                        <div className="flex flex-wrap gap-2 px-2">
                          {trendingSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearchSelect(search)}
                              className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recently Viewed */}
                      {recentlyViewed.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            Recently Viewed
                          </p>
                          <div className="space-y-2 px-2">
                            {recentlyViewed.slice(0, 3).map((product) => (
                              <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  setSearchModalPosition(null);
                                  setMobileSearchOpen(false);
                                }}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <img
                                  src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                                  alt={product.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {product.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(product.price, currency)}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      {/* Products Preview */}
                      {searchResults.products.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                            Products
                          </p>
                          <div className="space-y-2">
                            {searchResults.products.map((product) => (
                              <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  setSearchModalPosition(null);
                                  setMobileSearchOpen(false);
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                              >
                                <img
                                  src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                                  alt={product.title}
                                  className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                                    {product.title}
                                  </p>
                                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(product.price, currency)}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      {searchResults.categories.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                            Categories
                          </p>
                          <div className="space-y-1">
                            {searchResults.categories.map((category, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(category)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                              >
                                <Tag className="h-4 w-4 text-gray-400" />
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Brands */}
                      {searchResults.brands.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                            Brands
                          </p>
                          <div className="space-y-1">
                            {searchResults.brands.map((brand, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSearchSelect(brand)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white flex items-center gap-2 transition-colors"
                              >
                                <Building2 className="h-4 w-4 text-gray-400" />
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Button */}
                      <button
                        onClick={() => handleSearchSelect(searchQuery)}
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Search for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              </>,
              document.body
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Products Link */}
              <Link
                to="/products"
                className="hidden md:block p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Products"
                title="All Products"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              </Link>

              {/* Theme Toggle - Only Dark/Light Mode */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-orange-600 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Wishlist - Hidden on very small screens, shown in mobile menu */}
              <Link
                to="/wishlist"
                className="relative hidden sm:block p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Notifications Button - Hidden on very small screens */}
              {user && (
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative hidden sm:block p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              )}

              {/* Notifications Modal Panel */}
              {user && createPortal(
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNotifications(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      />
                      
                      {/* Notification Panel */}
                      <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ 
                          type: "spring", 
                          damping: 30, 
                          stiffness: 300,
                          mass: 0.8
                        }}
                        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col"
                      >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                                <button
                                  onClick={() => setShowNotifications(false)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  aria-label="Close notifications"
                                >
                                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {filteredUnreadCount > 0 ? `${filteredUnreadCount} unread` : 'All caught up!'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {unreadNotifications > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              >
                                Mark All Read
                              </button>
                            )}
                          </div>

                          {/* Filter Tabs */}
                          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide mt-4">
                            {filters.map((filter) => {
                              const Icon = filter.icon;
                              const count = filter.id === 'all' 
                                ? unreadNotifications 
                                : notifications.filter(n => n.type === filter.id && !n.is_read).length;
                              const isActive = activeFilter === filter.id;
                              
                              return (
                                <button
                                  key={filter.id}
                                  onClick={() => setActiveFilter(filter.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                    isActive
                                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  <span>{filter.label}</span>
                                  {count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      isActive
                                        ? 'bg-orange-600 dark:bg-orange-500 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}>
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                          {filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                              {filteredNotifications.map((notification) => {
                                const { Icon, bg, color } = getNotificationIcon(notification.type);
                                const actionLabel = getActionLabel(notification.type);
                                
                                return (
                                  <div
                                    key={notification.id}
                                    className={`relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                      !notification.is_read ? 'bg-orange-50/30 dark:bg-orange-900/10 border-l-2 border-orange-500' : ''
                                    }`}
                                  >
                                    {!notification.is_read && (
                                      <div className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full" />
                                    )}
                                    <div className="flex items-start gap-3 pr-6">
                                      <div className={`p-2.5 rounded-lg ${bg} flex-shrink-0`}>
                                        <Icon className={`h-5 w-5 ${color}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                          {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(notification.created_at).toLocaleDateString('en-GB', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric'
                                            })}
                                          </p>
                                          {notification.link && (
                                            <Link
                                              to={notification.link}
                                              onClick={() => setShowNotifications(false)}
                                              className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 transition-colors"
                                            >
                                              {actionLabel}
                                              <ExternalLink className="h-3 w-3" />
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 transition-colors"
                          >
                            View All Notifications
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setShowNotifications(false)}
                            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body
              )}

              {/* Support Chat Icon */}
              <div className="relative hidden sm:block">
                <ChatWidget variant="header" />
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="User menu"
                  >
                    {user.avatar_url ? (
                      <img
                        key={`${user.avatar_url}-${user.updated_at || Date.now()}-${avatarKey}`} // Force re-render when avatar changes
                        src={resolveAvatarUrl(user.avatar_url, true) || ''} // Cache-bust to ensure fresh image
                        alt={user.full_name || user.email}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover relative"
                        loading="eager" // Load immediately, don't lazy load
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-teal-500 rounded-full flex items-center justify-center text-white relative">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        {isVerifiedSeller && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card" title="Verified Seller" />
                        )}
                      </div>
                    )}
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden md:block" />
                  </button>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 backdrop-blur-xl">
                        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {user.email}
                          </p>
                          {isVerifiedSeller && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Verified Seller
                            </div>
                          )}
                        </div>
                        <div className="py-1.5">
                          {/* Combined Account & Shopping */}
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile & Settings
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Package className="h-4 w-4" />
                            Orders & History
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Heart className="h-4 w-4" />
                            Wishlist
                          </Link>
                          <Link
                            to="/cart"
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Shopping Cart
                            {cartCount > 0 && (
                              <span className="ml-auto bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cartCount > 9 ? '9+' : cartCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            to="/messages"
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Messages & Wallet
                          </Link>
                          {isSeller && (
                            <>
                              <div className="my-1.5 border-t border-gray-200 dark:border-gray-700" />
                              <Link
                                to="/seller/dashboard"
                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-orange-600 dark:text-orange-400 transition-colors font-medium"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Store className="h-4 w-4" />
                                Seller Dashboard
                              </Link>
                            </>
                          )}
                          <div className="my-1.5 border-t border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400 transition-colors font-medium"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg safe-area-inset-bottom">
          <div className="flex items-center justify-around py-1.5 sm:py-2">
            <Link
              to="/"
              className="flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] sm:text-xs">Home</span>
            </Link>
            <Link
              to="/products"
              className="flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
            >
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] sm:text-xs">Products</span>
            </Link>
            <button
              onClick={() => {
                setMobileSearchOpen(true);
                setShowSearchSuggestions(true);
                setSearchModalPosition({
                  top: 73,
                  left: 8,
                  width: window.innerWidth - 16,
                });
                // Focus the search input after modal opens
                setTimeout(() => {
                  const mobileSearchInput = document.querySelector('#mobile-search-input') as HTMLInputElement;
                  if (mobileSearchInput) {
                    mobileSearchInput.focus();
                  }
                }, 100);
              }}
              className="flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] sm:text-xs">Search</span>
            </button>
            <Link
              to="/cart"
              className="relative flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-0 sm:right-0 bg-orange-600 text-white text-[8px] sm:text-xs font-bold rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
              <span className="text-[10px] sm:text-xs">Cart</span>
            </Link>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
              <ChatWidget variant="header" />
            </div>
            {user ? (
              <Link
                to="/profile"
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-[10px] sm:text-xs">Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 active:text-orange-600 dark:active:text-orange-400"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-[10px] sm:text-xs">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm bg-white dark:bg-dark-card border border-red-200 dark:border-red-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">
              Logout
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to log out from your account? You will need to log in again to manage your orders and seller dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              onClick={() => {
                useAuthStore.getState().signOut();
                setShowLogoutConfirm(false);
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Search Modal - Full Screen */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white dark:bg-dark-card z-[9999] lg:hidden flex flex-col">
          {/* Header with Search Input */}
          <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card sticky top-0 z-10">
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setShowSearchSuggestions(false);
                setSearchModalPosition(null);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.length > 0) {
                    setShowSearchSuggestions(true);
                    setSearchModalPosition({
                      top: 73,
                      left: 8,
                      width: window.innerWidth - 16,
                    });
                  } else {
                    setShowSearchSuggestions(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setMobileSearchOpen(false);
                    setShowSearchSuggestions(false);
                    setSearchModalPosition(null);
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      handleSearch(e as any);
                      setMobileSearchOpen(false);
                    }
                    return;
                  }
                }}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-10 py-3 text-base bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                aria-label="Search products"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchSuggestions(false);
                    setSearchModalPosition(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Suggestions Content */}
          <div className="flex-1 overflow-y-auto">
            {showSearchSuggestions && searchQuery.length === 0 ? (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                      Recent Searches
                    </p>
                    <div className="space-y-1">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSearchSelect(search);
                            setMobileSearchOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-base text-gray-900 dark:text-white flex items-center gap-3 transition-colors"
                        >
                          <Clock className="h-5 w-5 text-gray-400" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {trendingSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSearchSelect(search);
                          setMobileSearchOpen(false);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Recently Viewed
                    </p>
                    <div className="space-y-2 px-2 mt-2">
                      {recentlyViewed.slice(0, 5).map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => {
                            setMobileSearchOpen(false);
                            setShowSearchSuggestions(false);
                            setSearchModalPosition(null);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <img
                            src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={product.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {product.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(product.price, currency)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : showSearchSuggestions && searchQuery.length > 0 ? (
              <div className="p-4">
                {/* Products Preview */}
                {searchResults.products.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                      Products
                    </p>
                    <div className="space-y-2">
                      {searchResults.products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => {
                            setMobileSearchOpen(false);
                            setShowSearchSuggestions(false);
                            setSearchModalPosition(null);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                        >
                          <img
                            src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={product.title}
                            className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                              {product.title}
                            </p>
                            <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(product.price, currency)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {searchResults.categories.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                      Categories
                    </p>
                    <div className="space-y-1">
                      {searchResults.categories.map((category, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSearchSelect(category);
                            setMobileSearchOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-base text-gray-900 dark:text-white flex items-center gap-3 transition-colors"
                        >
                          <Tag className="h-5 w-5 text-gray-400" />
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {searchResults.brands.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 uppercase tracking-wide">
                      Brands
                    </p>
                    <div className="space-y-1">
                      {searchResults.brands.map((brand, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSearchSelect(brand);
                            setMobileSearchOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-base text-gray-900 dark:text-white flex items-center gap-3 transition-colors"
                        >
                          <Building2 className="h-5 w-5 text-gray-400" />
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Button */}
                <button
                  onClick={() => {
                    handleSearchSelect(searchQuery);
                    setMobileSearchOpen(false);
                  }}
                  className="w-full mt-4 px-4 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Search className="h-5 w-5" />
                  Search for "{searchQuery}"
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base">Start typing to search...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Search Modal */}
      <Dialog open={showImageSearch} onOpenChange={setShowImageSearch}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Search by Image</DialogTitle>
            <DialogDescription>
              Upload a photo or screenshot of a product and we&apos;ll try to find similar items (demo feature).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center">
              <Camera className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Click below to choose an image from your device.
              </p>
              <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium cursor-pointer hover:bg-orange-700 transition-colors">
                <ImageIcon className="h-4 w-4" />
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelected(e.target.files?.[0] || null)}
                />
              </label>
              {imageFileName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-full">
                  Selected: {imageFileName}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              In production, this image would be analyzed by an AI service to detect products and run a visual search.
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => {
                setShowImageSearch(false);
                setImageFileName(null);
              }}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-dark-card z-[9999] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-card z-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Shop Now Banner */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Shop Now</span>
                  <span>→</span>
                </div>
                <button
                  onClick={() => {}}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Close banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Countdown Banner */}
              <div className="bg-red-600 text-white p-3 text-center text-sm">
                <span>Ends in 23:45:12</span>
              </div>

              {/* User Actions */}
              <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                {user ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">Login</span>
                  </Link>
                )}
              </div>

              {/* Quick Filters */}
              <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filters</h3>
                
                {/* Price Filter */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                    <span className="text-gray-900 dark:text-white font-medium">Price</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Color Filter */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                    <span className="text-gray-900 dark:text-white font-medium">Color</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Active Filter Tags */}
              <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Stock Only
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Verified Seller
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1 flex-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                {user && (
                  <>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                    >
                      <Package className="h-5 w-5" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Sign Up Button (if not logged in) */}
              {!user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
