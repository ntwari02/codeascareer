import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore, type SellerGroup } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { 
  ShoppingCart, 
  Trash2, 
  Heart, 
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  Sparkles,
  Clock,
  CheckSquare,
  Square,
} from 'lucide-react';
import { CartItemComponent } from '../components/cart/CartItem';
import { SellerGroupComponent } from '../components/cart/SellerGroup';
import { CartSummary } from '../components/cart/CartSummary';
import { CheckoutModal } from '../components/cart/CheckoutModal';
import { AIRecommendationsModal } from '../components/cart/AIRecommendationsModal';
import { formatCurrency } from '../lib/utils';

type CartTab = 'active' | 'saved' | 'wishlist';

export function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const {
    items,
    savedForLater,
    selectedItems,
    validating,
    fetchCart,
    clearCart,
    getSellerGroups,
    validateCart,
    syncCartPrices,
    selectItem,
    selectAllItems,
    deselectAllItems,
    // selectAllSellers,
    // deselectAllSellers,
    // removeSelectedItems,
    // moveSelectedToWishlist,
    saveForLater,
    moveToCart,
  } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<CartTab>('active');
  const [sellerGroups, setSellerGroups] = useState<SellerGroup[]>([]);
  const [loadingSellerGroups, setLoadingSellerGroups] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  // Mock AI Recommendations
  const mockRecommendations = [
    {
      id: 'rec-1',
      seller_id: 'seller-1',
      title: 'Wireless Bluetooth Headphones',
      price: 79.99,
      compare_at_price: 129.99,
      is_shippable: true,
      stock_quantity: 15,
      low_stock_threshold: 5,
      status: 'active' as const,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [{ url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg', position: 0 }],
      category_id: 'cat-1'
    },
    {
      id: 'rec-2',
      seller_id: 'seller-2',
      title: 'Smart Fitness Tracker Watch',
      price: 149.99,
      compare_at_price: undefined,
      is_shippable: true,
      stock_quantity: 8,
      low_stock_threshold: 5,
      status: 'active' as const,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', position: 0 }],
      category_id: 'cat-2'
    },
    {
      id: 'rec-3',
      seller_id: 'seller-3',
      title: 'Premium Leather Wallet',
      price: 49.99,
      compare_at_price: 79.99,
      is_shippable: true,
      stock_quantity: 22,
      low_stock_threshold: 5,
      status: 'active' as const,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [{ url: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', position: 0 }],
      category_id: 'cat-3'
    },
    {
      id: 'rec-4',
      seller_id: 'seller-4',
      title: 'Portable Phone Charger 10000mAh',
      price: 29.99,
      compare_at_price: 39.99,
      is_shippable: true,
      stock_quantity: 30,
      low_stock_threshold: 5,
      status: 'active' as const,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [{ url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg', position: 0 }],
      category_id: 'cat-4'
    }
  ];

  // (Optional) In future we can track viewport size here if CartSummary needs it.

  useEffect(() => {
    // Check if user is demo user or guest
    const isDemoOrGuest = !user?.id || user.id.startsWith('demo-');
    
    if (isDemoOrGuest) {
      // Load guest/demo cart from localStorage
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          useCartStore.setState({ items: parsed });
        } catch (e) {
          console.error('Failed to load guest cart', e);
        }
      }
      // Load saved for later
      const saved = localStorage.getItem('saved_for_later');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          useCartStore.setState({ savedForLater: parsed });
        } catch (e) {
          console.error('Failed to load saved for later', e);
        }
      }
    } else {
      // Real logged-in user: fetch from Supabase
      fetchCart(user.id);
      // Load saved for later
      const saved = localStorage.getItem(`saved_for_later_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          useCartStore.setState({ savedForLater: parsed });
        } catch (e) {
          console.error('Failed to load saved for later', e);
        }
      }
    }
  }, [user, fetchCart]);

  // Save guest/demo cart to localStorage whenever it changes
  useEffect(() => {
    const isDemoOrGuest = !user?.id || user.id.startsWith('demo-');
    if (isDemoOrGuest && items.length > 0) {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    } else if (isDemoOrGuest && items.length === 0) {
      localStorage.removeItem('guest_cart');
    }
  }, [items, user]);

  // Save saved for later
  useEffect(() => {
    if (savedForLater.length > 0) {
      if (user?.id) {
        localStorage.setItem(`saved_for_later_${user.id}`, JSON.stringify(savedForLater));
      } else {
        localStorage.setItem('saved_for_later', JSON.stringify(savedForLater));
      }
    }
  }, [savedForLater, user]);

  useEffect(() => {
    const loadSellerGroups = async () => {
      if (items.length > 0) {
        setLoadingSellerGroups(true);
        try {
          const groups = await getSellerGroups();
          setSellerGroups(groups);
        } catch (error) {
          console.error('Failed to load seller groups:', error);
          // If seller groups fail to load, items will still show via fallback
          setSellerGroups([]);
        } finally {
          setLoadingSellerGroups(false);
        }
      } else {
        setSellerGroups([]);
        setLoadingSellerGroups(false);
      }
    };
    loadSellerGroups();
  }, [items, getSellerGroups]);

  useEffect(() => {
    // Auto-validate cart every 30 seconds (only for logged-in users)
    // Don't sync prices for guest carts to avoid clearing them
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      if (items.length > 0) {
        validateCart();
        syncCartPrices();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [items, validateCart, syncCartPrices, user]);

  // Cart abandonment detection
  useEffect(() => {
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      if (items.length > 0) {
        // Show discount offer (in a real app, this would trigger a modal)
        // For now, just save the cart state
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items]);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    setShowCheckout(true);
  };

  const handleClearCart = async () => {
    if (user?.id) {
      await clearCart(user.id);
    } else {
      useCartStore.setState({ items: [] });
      localStorage.removeItem('guest_cart');
    }
    setShowClearConfirm(false);
  };

  const handleSaveForLater = async (itemId: string) => {
    await saveForLater(itemId);
  };

  const handleMoveToCart = async (itemId: string) => {
    await moveToCart(itemId);
  };

  const selectedCount = selectedItems.size;

  const allItemsEmpty = items.length === 0 && savedForLater.length === 0 && wishlistItems.length === 0;

  // Show empty cart message immediately if no items, even if loading
  if (allItemsEmpty && activeTab === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="py-12 px-4">
          <div className="w-full text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate('/')} size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />
      
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Cart Header - Premium Styling */}
        <div className="mb-4 sm:mb-6">
          <div className="relative bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl backdrop-blur-sm mb-4 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-100/20 to-transparent dark:from-orange-900/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/20 to-transparent dark:from-blue-900/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm" />
                  <ShoppingCart className="relative w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                      Shopping Cart
                    </h1>
                    {items.length > 0 && (
                      <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold shadow-lg transform hover:scale-110 transition-transform duration-200">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                  </p>
                  {items.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-fit">
                      <Truck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Est. delivery: {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {validating && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg text-xs text-gray-700 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                    <span className="hidden sm:inline font-medium">Validating cart...</span>
                    <span className="sm:hidden font-medium">Validating...</span>
                  </div>
                )}
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700"
                  title="Continue Shopping"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Continue Shopping</span>
                  <span className="sm:hidden">Back</span>
                </Link>
                {items.length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowClearConfirm(true)} 
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-300 hover:scale-110"
                    title="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Free Shipping Progress Bar - Premium Styling */}
            {items.length > 0 && (() => {
              const { getSubtotal } = useCartStore.getState();
              const subtotal = getSubtotal();
              const freeShippingThreshold = 50;
              const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
              const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
              
              return subtotal < freeShippingThreshold ? (
                <div className="relative mt-3 p-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-500/5 dark:to-purple-500/5" />
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-100 break-words">
                        Add {formatCurrency(amountToFreeShipping, currency)} more for free shipping
                      </span>
                      <span className="px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-xs font-extrabold shadow-md whitespace-nowrap">
                        {Math.round(progressToFreeShipping)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-blue-200/50 dark:bg-blue-800/50 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{ width: `${progressToFreeShipping}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative mt-3 p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10" />
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 bg-green-500 rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-green-800 dark:text-green-200">
                      🎉 You've unlocked FREE shipping!
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        {/* Enhanced Tabs - Premium Styling */}
        <div className="mb-6 sm:mb-8">
          <div className="relative bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-2xl border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl backdrop-blur-sm p-3 overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/20 to-transparent dark:from-orange-900/10 rounded-full blur-2xl" />
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex gap-2 min-w-max overflow-x-auto scrollbar-hide w-full sm:w-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 sm:px-5 lg:px-7 py-2.5 sm:py-3.5 font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 rounded-xl whitespace-nowrap flex items-center gap-1.5 sm:gap-2.5 transform hover:scale-105 ${
                    activeTab === 'active'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50 scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800'
                  }`}
                >
                  <ShoppingCart className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'active' ? '' : 'opacity-70'}`} />
                  <span className="hidden sm:inline">Active Cart</span>
                  <span className="sm:hidden">Cart</span>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold transition-all ${
                    activeTab === 'active' 
                      ? 'bg-white/30 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {items.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 sm:px-5 lg:px-7 py-2.5 sm:py-3.5 font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 rounded-xl whitespace-nowrap flex items-center gap-1.5 sm:gap-2.5 transform hover:scale-105 ${
                    activeTab === 'saved'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50 scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800'
                  }`}
                >
                  <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'saved' ? '' : 'opacity-70'}`} />
                  <span className="hidden sm:inline">Saved for Later</span>
                  <span className="sm:hidden">Saved</span>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold transition-all ${
                    activeTab === 'saved' 
                      ? 'bg-white/30 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {savedForLater.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`px-3 sm:px-5 lg:px-7 py-2.5 sm:py-3.5 font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 rounded-xl whitespace-nowrap flex items-center gap-1.5 sm:gap-2.5 transform hover:scale-105 ${
                    activeTab === 'wishlist'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50 scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'wishlist' ? '' : 'opacity-70'}`} />
                  <span className="hidden sm:inline">Wishlist</span>
                  <span className="sm:hidden">Wishlist</span>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold transition-all ${
                    activeTab === 'wishlist' 
                      ? 'bg-white/30 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {wishlistItems.length}
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Select All Button */}
                {activeTab === 'active' && items.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedCount === items.length) {
                        deselectAllItems();
                      } else {
                        selectAllItems();
                      }
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all shadow-sm border border-gray-200 dark:border-gray-700 whitespace-nowrap"
                  >
                    {selectedCount === items.length ? (
                      <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    ) : (
                      <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                    <span className="hidden sm:inline">Select All</span>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold">
                      {selectedCount}/{items.length}
                    </span>
                  </button>
                )}
                
                {/* AI Recommendations Button */}
                {activeTab === 'active' && items.length > 0 && (
                  <button
                    onClick={() => setShowAIRecommendations(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all text-purple-700 dark:text-purple-300 font-medium text-sm whitespace-nowrap border border-purple-200 dark:border-purple-800"
                    title="View AI-powered recommendations"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Recommendations</span>
                    <span className="sm:hidden">AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6 lg:gap-8 pb-32 sm:pb-0 lg:pb-0">
          {/* Main Cart Content - 70% width */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Active Cart Tab */}
            {activeTab === 'active' && (
              <>
                {items.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add items to your cart to see them here
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Seller Groups */}
                    {loadingSellerGroups ? (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading cart items...</p>
                      </div>
                    ) : sellerGroups.length > 0 ? (
                      sellerGroups.map((group) => (
                        <SellerGroupComponent 
                          key={group.sellerId} 
                          group={group}
                          onItemSelect={selectItem}
                          selectedItems={selectedItems}
                          onSaveForLater={handleSaveForLater}
                        />
                      ))
                    ) : (
                      // Fallback: Show items directly if seller groups haven't loaded or items don't have seller info
                      <div className="space-y-4">
                        {items.map((item) => (
                          <CartItemComponent 
                            key={item.id} 
                            item={item}
                            isSelected={selectedItems.has(item.id)}
                            onSelect={selectItem}
                            onSaveForLater={handleSaveForLater}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Saved for Later Tab */}
            {activeTab === 'saved' && (
              <>
                {savedForLater.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Clock className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved items</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Items you save for later will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedForLater.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex gap-4">
                          <img
                            src={item.product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={item.product?.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.product?.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {formatCurrency((item.variant?.price || item.product?.price || 0) * item.quantity, currency)}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMoveToCart(item.id)}
                              >
                                Move to Cart
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  useCartStore.getState().removeItem(item.id);
                                  useCartStore.setState({ 
                                    savedForLater: savedForLater.filter(i => i.id !== item.id) 
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Wishlist Quick View Tab */}
            {activeTab === 'wishlist' && (
              <>
                {wishlistItems.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add items to your wishlist to see them here
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.slice(0, 6).map((wishlistItem) => (
                      <div key={wishlistItem.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex gap-3">
                          <img
                            src={wishlistItem.product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={wishlistItem.product?.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                              {wishlistItem.product?.title}
                            </h4>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-2">
                              {formatCurrency(wishlistItem.product?.price || 0, currency)}
                            </p>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={async () => {
                                if (wishlistItem.product) {
                                  await useCartStore.getState().addToCart(
                                    user?.id || null,
                                    wishlistItem.product,
                                    undefined,
                                    1
                                  );
                                }
                              }}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Order Summary Sidebar - 30% width, Sticky */}
          {activeTab === 'active' && items.length > 0 && (
            <div className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-24">
                <CartSummary onCheckout={handleCheckout} />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Upsell/Recommended Products Section - Full Page Width */}
        {activeTab === 'active' && items.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  You Might Also Like
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                  Complete your purchase with these AI-powered recommendations
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIRecommendations(true)}
                className="bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View All Recommendations
              </Button>
            </div>
            
            {/* Product Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mockRecommendations.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.images[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                        title="Quick view"
                      >
                        <ShoppingCart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {product.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(product.price, currency)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(product.compare_at_price, currency)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-1 text-xs mb-3">
                      <Package className={`w-3 h-3 ${
                        product.stock_quantity > 10 
                          ? 'text-green-600 dark:text-green-400' 
                          : product.stock_quantity > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                      }`} />
                      <span className={
                        product.stock_quantity > 10 
                          ? 'text-green-600 dark:text-green-400' 
                          : product.stock_quantity > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                      }>
                        {product.stock_quantity > 10 
                          ? 'In Stock' 
                          : product.stock_quantity > 0
                          ? `Only ${product.stock_quantity} left`
                          : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Actions */}
                    <Button
                      size="sm"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      onClick={async () => {
                        if (user) {
                          await useCartStore.getState().addToCart(
                            user.id,
                            product as any,
                            undefined,
                            1
                          );
                        } else {
                          await useCartStore.getState().addToCart(
                            null,
                            product as any,
                            undefined,
                            1
                          );
                        }
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1.5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center pt-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAIRecommendations(true)}
                className="bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View All {mockRecommendations.length}+ Recommendations
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Floating Checkout Bar */}
      {activeTab === 'active' && items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 z-20 shadow-lg safe-area-inset-bottom">
          <CartSummary onCheckout={handleCheckout} isMobile />
        </div>
      )}
      
      {/* Add bottom padding on mobile to prevent content from being hidden behind floating checkout */}
      {activeTab === 'active' && items.length > 0 && (
        <div className="h-32 sm:h-0 lg:h-0"></div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Cart?</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearCart}>
                Clear Cart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          sellerGroups={sellerGroups}
        />
      )}

      {/* AI Recommendations Modal */}
      <AIRecommendationsModal
        isOpen={showAIRecommendations}
        onClose={() => setShowAIRecommendations(false)}
        cartItems={items}
      />
      
      <Footer />
    </div>
  );
}
