import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { Collection } from '../../types';

interface FeaturedCollectionsProps {
  collections: Collection[];
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  if (collections.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-dark-secondary">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="flex items-center gap-2 text-sm sm:text-base text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold whitespace-nowrap"
          >
            View All <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.slice(0, 3).map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.seller_id}/${collection.slug || collection.id}`}
              className="group block bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {collection.cover_image_url || collection.image_url ? (
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={collection.cover_image_url || collection.image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1">{collection.name}</h3>
                    <p className="text-white/90 text-xs sm:text-sm mb-2 line-clamp-2">
                      {collection.description}
                    </p>
                    <p className="text-white/80 text-xs">
                      {collection.product_count || 0} products
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl sm:text-6xl text-white font-bold">
                    {collection.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

