import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import {
  Sparkles,
  ShoppingCart,
  Heart,
  Loader2,
  TrendingUp,
  Package,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Product } from '../../types';

interface AIRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{ product?: Product }>;
}

export function AIRecommendationsModal({ isOpen, onClose, cartItems }: AIRecommendationsModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency } = useTheme();
  const { addToCart } = useCartStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract categories from cart items
  const cartCategories = Array.from(
    new Set(cartItems.map(item => item.product?.category_id).filter(Boolean))
  ) as string[];

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen, cartItems]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // AI-powered recommendation logic:
      // 1. Get products from same categories as cart items
      // 2. Get trending/popular products
      // 3. Get frequently bought together products
      
      let query = supabase
        .from('products')
        .select('*, images:product_images(url, position)')
        .eq('status', 'active')
        .gt('stock_quantity', 0);

      // If we have categories from cart, prioritize those
      if (cartCategories.length > 0) {
        query = query.in('category_id', cartCategories);
      }

      // Get trending products (high views, recent)
      const { data: trendingProducts } = await query
        .order('views_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(12);

      if (trendingProducts) {
        // Filter out products already in cart
        const cartProductIds = cartItems
          .map(item => item.product?.id)
          .filter(Boolean) as string[];
        
        const filtered = trendingProducts.filter(
          (p: Product) => !cartProductIds.includes(p.id)
        ) as Product[];

        // If we don't have enough from same category, get popular products
        if (filtered.length < 6) {
          const { data: popularProducts } = await supabase
            .from('products')
            .select('*, images:product_images(url, position)')
            .eq('status', 'active')
            .gt('stock_quantity', 0)
            .not('id', 'in', `(${cartProductIds.length > 0 ? cartProductIds.join(',') : 'null'})`)
            .order('views_count', { ascending: false })
            .limit(12 - filtered.length);

          if (popularProducts) {
            filtered.push(...(popularProducts as Product[]));
          }
        }

        setRecommendations(filtered.slice(0, 12));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(user?.id || null, product, undefined, 1);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => (a.position || 0) - (b.position || 0));
      return sortedImages[0]?.url || product.images[0]?.url;
    }
    return 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">AI-Powered Recommendations</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Personalized product suggestions based on your cart
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing your cart and finding perfect matches...
              </p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No recommendations available at the moment
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter by category */}
            {cartCategories.length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {cartCategories.map((catId) => (
                  <button
                    key={catId}
                    onClick={() => setSelectedCategory(catId)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === catId
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Category {catId.slice(0, 8)}
                  </button>
                ))}
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendations
                .filter(product => !selectedCategory || product.category_id === selectedCategory)
                .map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
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
                      <div className="flex items-center justify-between mb-2">
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
                      <div className="flex items-center gap-2 text-xs mb-3">
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/products/${product.id}`)}
                          title="View details"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Powered by AI • Based on your cart preferences</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

