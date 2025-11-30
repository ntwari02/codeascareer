import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { ProductCard } from '../components/ProductCard';

export function Wishlist() {
  const { user } = useAuthStore();
  const { items, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Wishlist</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => item.product && (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Save your favorite items here</p>
            <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
