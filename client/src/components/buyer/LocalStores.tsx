import { Link } from 'react-router-dom';
import { Star, Shield, TrendingUp, Store, MapPin } from 'lucide-react';

interface Seller {
  id: string;
  name: string;
  storeName: string;
  rating: number;
  verified: boolean;
  totalSales: number;
  location: string;
  image?: string;
  badge?: string;
}

const MOCK_SELLERS: Seller[] = [
  {
    id: '1',
    name: 'Tech Store',
    storeName: 'Tech Store Official',
    rating: 4.8,
    verified: true,
    totalSales: 12500,
    location: 'Kigali, Rwanda',
    badge: 'Top Seller',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Fashion Hub',
    storeName: 'Fashion Hub',
    rating: 4.6,
    verified: true,
    totalSales: 9800,
    location: 'Kigali, Rwanda',
    badge: 'Featured',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Electronics Plus',
    storeName: 'Electronics Plus',
    rating: 4.9,
    verified: true,
    totalSales: 15200,
    location: 'Kigali, Rwanda',
    badge: 'Best Rated',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    name: 'Home Essentials',
    storeName: 'Home Essentials Store',
    rating: 4.7,
    verified: true,
    totalSales: 11200,
    location: 'Kigali, Rwanda',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export function LocalStores() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Shop Local Stores
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Featured sellers in Rwanda
            </p>
          </div>
          <Link
            to="/sellers"
            className="text-sm sm:text-base text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold whitespace-nowrap"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {MOCK_SELLERS.map((seller) => (
            <Link
              key={seller.id}
              to={`/store/${seller.id}`}
              className="group bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="relative mb-4">
                {/* Store Photo */}
                <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4">
                  {seller.image ? (
                    <img
                      src={seller.image}
                      alt={seller.storeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-teal-500 flex items-center justify-center text-white text-4xl font-bold">
                      {seller.storeName.charAt(0)}
                    </div>
                  )}
                  {/* Badge overlay */}
                  {seller.badge && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-amber-600/90 backdrop-blur-sm text-white text-xs font-bold rounded shadow-lg">
                        {seller.badge}
                      </span>
                    </div>
                  )}
                  {/* Verified badge */}
                  {seller.verified && (
                    <div className="absolute top-2 left-2" title="Verified seller">
                      <div className="bg-blue-600/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" aria-hidden="true" />
                        <span className="sr-only">Verified seller</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Store Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    {seller.storeName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {seller.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seller.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{seller.totalSales.toLocaleString()} sales</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold group-hover:underline flex items-center gap-2">
                  Visit Store <Store className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

