import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Grid3x3,
  List,
  CheckSquare,
  Square,
  Star,
  Loader2,
  Copy,
  Mail,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  TrendingDown,
  Bell,
  Eye,
  Edit,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { Product } from '../types';

type SortOption = 'date' | 'price-low' | 'price-high' | 'name' | 'popularity';
type ViewMode = 'grid' | 'list';

export function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart, items: cartItems } = useCartStore();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [wishlistTitle, setWishlistTitle] = useState('My Wishlist');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [filterInStock, setFilterInStock] = useState(false);

  useEffect(() => {
    // Always load from localStorage first (frontend-only approach)
    if (user?.id) {
      const stored = localStorage.getItem(`wishlist_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          useWishlistStore.setState({ items: parsed, loading: false });
        } catch (e) {
          console.error('Failed to load wishlist from localStorage', e);
          // Try to fetch from API as fallback (but don't fail if it errors)
          fetchWishlist(user.id).catch(() => {
            useWishlistStore.setState({ loading: false });
          });
        }
      } else {
        // No localStorage data, try to fetch (but don't fail if it errors)
        fetchWishlist(user.id).catch(() => {
          useWishlistStore.setState({ loading: false });
        });
      }
    } else {
      // Load guest wishlist from localStorage
      const guestWishlist = localStorage.getItem('guest_wishlist');
      if (guestWishlist) {
        try {
          const parsed = JSON.parse(guestWishlist);
          useWishlistStore.setState({ items: parsed, loading: false });
        } catch (e) {
          console.error('Failed to load guest wishlist', e);
          useWishlistStore.setState({ loading: false });
        }
      } else {
        useWishlistStore.setState({ loading: false });
      }
    }
  }, [user, fetchWishlist]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (!user?.id && items.length > 0) {
      localStorage.setItem('guest_wishlist', JSON.stringify(items));
    } else if (!user?.id && items.length === 0) {
      localStorage.removeItem('guest_wishlist');
    }
  }, [items, user]);

  // Load item notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wishlist_notes');
    if (stored) {
      try {
        setItemNotes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load wishlist notes', e);
      }
    }
  }, []);

  // Save item notes to localStorage
  useEffect(() => {
    if (Object.keys(itemNotes).length > 0) {
      localStorage.setItem('wishlist_notes', JSON.stringify(itemNotes));
    }
  }, [itemNotes]);

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product_id === productId);
  };

  const handleSelectItem = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleRemoveSelected = async () => {
    for (const itemId of selectedItems) {
      await removeFromWishlist(itemId);
    }
    setSelectedItems(new Set());
  };

  const handleMoveSelectedToCart = async () => {
    for (const itemId of selectedItems) {
      const item = items.find(i => i.id === itemId);
      if (item?.product) {
        await addToCart(user?.id || null, item.product);
      }
    }
    setSelectedItems(new Set());
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(user?.id || null, product);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromWishlist(itemId);
  };

  const handleShareWishlist = () => {
    const link = `${window.location.origin}/wishlist/${user?.id || 'guest'}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    // Show toast notification (you can implement a toast system)
    alert('Link copied to clipboard!');
  };

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.product?.price || 0) - (b.product?.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.product?.price || 0) - (a.product?.price || 0));
      case 'name':
        return sorted.sort((a, b) => (a.product?.title || '').localeCompare(b.product?.title || ''));
      case 'popularity':
        return sorted.sort((a, b) => (b.product?.views_count || 0) - (a.product?.views_count || 0));
      case 'date':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [items, sortBy]);

  const totalEstimatedCost = useMemo(() => {
    return sortedItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  }, [sortedItems]);

  const totalSavings = useMemo(() => {
    return sortedItems.reduce((sum, item) => {
      const product = item.product;
      if (product?.compare_at_price && product.compare_at_price > product.price) {
        return sum + (product.compare_at_price - product.price);
      }
      return sum;
    }, 0);
  }, [sortedItems]);

  const inStockItems = useMemo(() => {
    return sortedItems.filter(item => (item.product?.stock_quantity || 0) > 0);
  }, [sortedItems]);

  const outOfStockItems = useMemo(() => {
    return sortedItems.filter(item => (item.product?.stock_quantity || 0) === 0);
  }, [sortedItems]);

  const priceDropItems = useMemo(() => {
    // Check if price decreased (mock - in real app, compare with saved price)
    return sortedItems.filter(item => {
      const product = item.product;
      if (!product) return false;
      // Mock: items with compare_at_price might have had a price drop
      return product.compare_at_price && product.compare_at_price > product.price;
    });
  }, [sortedItems]);

  const filteredItems = useMemo(() => {
    let filtered = [...sortedItems];
    
    if (filterInStock) {
      filtered = filtered.filter(item => (item.product?.stock_quantity || 0) > 0);
    }
    
    return filtered;
  }, [sortedItems, filterInStock]);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  // Initialize loading state properly
  useEffect(() => {
    if (loading && items.length === 0) {
      // If still loading after 1 second, stop loading to show empty state
      const timer = setTimeout(() => {
        useWishlistStore.setState({ loading: false });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, items.length]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
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
        {/* Enhanced Wishlist Header */}
        <div className="mb-4 sm:mb-6">
          <div className="relative bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-xl p-4 sm:p-5 border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl backdrop-blur-sm overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-100/30 to-transparent dark:from-pink-900/20 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Title Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl shadow-lg">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                      <input
                        type="text"
                        value={wishlistTitle}
                        onChange={(e) => setWishlistTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingTitle(false);
                          if (e.key === 'Escape') {
                            setWishlistTitle('My Wishlist');
                            setIsEditingTitle(false);
                          }
                        }}
                        className="text-xl sm:text-2xl font-extrabold bg-transparent border-2 border-orange-500 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                          {wishlistTitle}
                        </h1>
                        <button
                          onClick={() => setIsEditingTitle(true)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit title"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                    {items.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} • Total: {formatCurrency(totalEstimatedCost, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                        {totalSavings > 0 && (
                          <span className="text-green-600 dark:text-green-400 ml-2">
                            • Save {formatCurrency(totalSavings, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="hidden sm:flex"
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <List className="w-4 h-4 mr-1" />
                        List
                      </>
                    ) : (
                      <>
                        <Grid3x3 className="w-4 h-4 mr-1" />
                        Grid
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareWishlist}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  {items.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleMoveSelectedToCart}
                      disabled={selectedItems.size === 0}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Move All to Cart</span>
                      <span className="sm:hidden">Add All</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              {items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Items</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{items.length}</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalEstimatedCost, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}</p>
                  </div>
                  {totalSavings > 0 && (
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-green-600 dark:text-green-400">Savings</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(totalSavings, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}</p>
                    </div>
                  )}
                  <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">In Stock</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{inStockItems.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Actions Bar */}
        {items.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border-2 border-gray-200/60 dark:border-gray-700/60 shadow-lg mb-4 sm:mb-6">
            <div className="flex flex-col gap-3">
              {/* Top Row: Select All & View Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {selectedItems.size === items.length ? (
                    <CheckSquare className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  Select All ({selectedItems.size}/{items.length})
                </button>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* View Toggle - Mobile */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="sm:hidden"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                  </Button>
                  
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:flex-none"
                  >
                    <option value="date">Date Added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Row */}
              {selectedItems.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    onClick={handleMoveSelectedToCart}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Move {selectedItems.size} to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSelected}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareWishlist}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share Selected
                  </Button>
                </div>
              )}

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterInStock}
                    onChange={(e) => setFilterInStock(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  In Stock Only
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Price Drop & Stock Alerts */}
        {items.length > 0 && (priceDropItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="space-y-2 mb-6">
            {priceDropItems.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Price Drop Alert!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {priceDropItems.length} item(s) have reduced prices
                    </p>
                  </div>
                </div>
              </div>
            )}
            {outOfStockItems.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      {outOfStockItems.length} item(s) out of stock
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      We'll notify you when they're back in stock
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-1" />
                    Notify Me
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Empty State */}
        {items.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-xl p-12 text-center border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <Heart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Start saving your favorite items! When you find something you love, click the heart icon to add it to your wishlist.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  💡 Why use a wishlist?
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Save items for later purchase</li>
                  <li>• Get notified when prices drop</li>
                  <li>• Share with friends and family</li>
                  <li>• Track items you're interested in</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/')} size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    // Navigate to trending/popular products
                    navigate('/?sort=popularity');
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Trending Items
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block w-full">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === items.length && items.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Stock</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredItems.map((item) => {
                        const product = item.product;
                        const imageUrl = product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
                        const price = product?.price || 0;
                        const comparePrice = product?.compare_at_price;
                        const stock = product?.stock_quantity || 0;
                        const isOutOfStock = stock === 0;
                        const rating = 4.5;
                        const reviewCount = 128;
                        const isItemSelected = selectedItems.has(item.id);
                        const itemInCart = isInCart(item.product_id);

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                              isItemSelected ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isItemSelected}
                                onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                            </td>

                            {/* Product Image & Name */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={imageUrl}
                                    alt={product?.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (product && handleQuickView) {
                                        handleQuickView(product);
                                      }
                                    }}
                                    className="absolute top-1 right-1 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all opacity-0 group-hover:opacity-100"
                                    title="Quick view"
                                  >
                                    <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                  </button>
                                  {/* Future: share from card */}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Link
                                      to={`/products/${product?.id}`}
                                      className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                                    >
                                      {product?.title}
                                    </Link>
                                    <Heart className="w-4 h-4 fill-red-500 text-red-500 flex-shrink-0" />
                                  </div>
                                  {comparePrice && comparePrice > price && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                        {formatCurrency(comparePrice, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                                      </span>
                                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                                        {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Rating */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                  ({reviewCount})
                                </span>
                              </div>
                            </td>

                            {/* Stock Status */}
                            <td className="px-4 py-4">
                              {isOutOfStock ? (
                                <span className="text-red-600 dark:text-red-400 text-sm">Out of Stock</span>
                              ) : (
                                <span className="text-green-600 dark:text-green-400 text-sm">In Stock • Delivers in 2 days</span>
                              )}
                            </td>

                            {/* Price */}
                            <td className="px-4 py-4 text-right">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(price, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {itemInCart ? (
                                  <Button variant="outline" size="sm" disabled>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    In Cart
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={isOutOfStock}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Add to Cart
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  More
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                      <tr>
                        <td colSpan={6} className="px-4 py-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                TOTAL ESTIMATED:
                              </h3>
                              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(totalEstimatedCost, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={handleMoveSelectedToCart}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add All to Cart
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleShareWishlist}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Wishlist
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Card View - Visible on Mobile Only */}
            <div className="md:hidden space-y-4">
              {filteredItems.map((item) => {
                const product = item.product;
                const imageUrl = product?.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
                const price = product?.price || 0;
                const comparePrice = product?.compare_at_price;
                const stock = product?.stock_quantity || 0;
                const isOutOfStock = stock === 0;
                const rating = 4.5;
                const reviewCount = 128;
                const isItemSelected = selectedItems.has(item.id);
                const itemInCart = isInCart(item.product_id);

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border ${
                      isItemSelected ? 'border-orange-500 ring-2 ring-orange-500' : 'border-gray-200 dark:border-gray-700'
                    } p-4`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={isItemSelected}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
                      />
                      <img
                        src={imageUrl}
                        alt={product?.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${product?.id}`}
                          className="font-semibold text-sm text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 mb-1 block line-clamp-2"
                        >
                          {product?.title}
                        </Link>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                            ({reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            {formatCurrency(price, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                          </span>
                          {comparePrice && comparePrice > price && (
                            <>
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                {formatCurrency(comparePrice, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                              </span>
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                                {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mb-2">
                          {isOutOfStock ? (
                            <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                          ) : (
                            <span className="text-xs text-green-600 dark:text-green-400">In Stock • Delivers in 2 days</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {itemInCart ? (
                            <Button variant="outline" size="sm" disabled className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              In Cart
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={isOutOfStock}
                              className="text-xs"
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add to Cart
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Mobile Footer Summary */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      TOTAL ESTIMATED:
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalEstimatedCost, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-orange-600 hover:bg-orange-700 text-white w-full text-sm"
                      onClick={handleMoveSelectedToCart}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add All to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShareWishlist}
                      className="w-full text-sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Wishlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Your Wishlist
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <Button onClick={handleCopyLink} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`mailto:?subject=Check out my wishlist&body=${shareLink}`, '_blank');
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=Check out my wishlist&url=${encodeURIComponent(shareLink)}`, '_blank');
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick View
                </h3>
                <button
                  onClick={() => {
                    setShowQuickView(false);
                    setQuickViewProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={quickViewProduct.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                    alt={quickViewProduct.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {quickViewProduct.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < 4
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      (128 reviews)
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(quickViewProduct.price, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                    </span>
                    {quickViewProduct.compare_at_price && (
                      <span className="text-lg text-gray-500 dark:text-gray-400 line-through ml-2">
                        {formatCurrency(quickViewProduct.compare_at_price, currency as 'USD' | 'EUR' | 'RWF' | 'KES')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-4">
                    {quickViewProduct.description || 'No description available.'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        setShowQuickView(false);
                      }}
                      disabled={(quickViewProduct.stock_quantity || 0) === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/products/${quickViewProduct.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}