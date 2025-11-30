import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollections } from '@/lib/collections';
import type { Collection } from '@/types';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';

// Mock collections data for demonstration
const MOCK_COLLECTIONS: Collection[] = [
  {
    id: '1',
    seller_id: 'seller-1',
    name: 'Summer Essentials',
    slug: 'summer-essentials',
    description: 'Everything you need for the perfect summer season - from beachwear to outdoor gear',
    cover_image_url: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'newest',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    product_count: 45,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    seller_id: 'seller-1',
    name: 'Tech Gadgets',
    slug: 'tech-gadgets',
    description: 'Latest technology gadgets and accessories for your digital lifestyle',
    cover_image_url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'manual',
    sort_order: 'price_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    product_count: 32,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    seller_id: 'seller-2',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Transform your living space with our curated selection of home decor and furniture',
    cover_image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    product_count: 67,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    seller_id: 'seller-2',
    name: 'Fashion Forward',
    slug: 'fashion-forward',
    description: 'Trendy fashion pieces for the modern wardrobe',
    cover_image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'manual',
    sort_order: 'newest',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 89,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    seller_id: 'seller-3',
    name: 'Fitness & Wellness',
    slug: 'fitness-wellness',
    description: 'Gear up for your fitness journey with our premium workout equipment and supplements',
    type: 'smart',
    sort_order: 'price_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 54,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    seller_id: 'seller-3',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Discover premium beauty products and personal care essentials',
    cover_image_url: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'manual',
    sort_order: 'name_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 76,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    seller_id: 'seller-4',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Everything for your active lifestyle and outdoor adventures',
    cover_image_url: 'https://images.pexels.com/photos/863926/pexels-photo-863926.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/863926/pexels-photo-863926.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 43,
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    seller_id: 'seller-4',
    name: 'Gourmet Kitchen',
    slug: 'gourmet-kitchen',
    description: 'Premium kitchen tools and gourmet ingredients for the culinary enthusiast',
    type: 'manual',
    sort_order: 'price_desc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 28,
    created_at: new Date().toISOString(),
  },
];

export function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      // Try to get real collections first
      const { data, error } = await getCollections({
        active: true,
        includeProducts: true,
      });

      if (error) throw error;

      const allCollections = data || [];
      
      // Always use mock data for demonstration (or merge with real data)
      // In production, you would use: setCollections(allCollections.length > 0 ? allCollections : MOCK_COLLECTIONS);
      setCollections(MOCK_COLLECTIONS);
      setFeaturedCollections(MOCK_COLLECTIONS.filter((c) => c.is_featured));
    } catch (error) {
      console.error('Error loading collections:', error);
      // Always show mock data for demonstration
      setCollections(MOCK_COLLECTIONS);
      setFeaturedCollections(MOCK_COLLECTIONS.filter((c) => c.is_featured));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Collections
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover curated product collections
          </p>
        </div>

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        )}

        {/* All Collections */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      to={`/collection/${collection.seller_id}/${collection.slug || collection.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {collection.cover_image_url || collection.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={collection.cover_image_url || collection.image_url}
            alt={collection.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg mb-1">{collection.name}</h3>
            <p className="text-white/90 text-sm">
              {collection.product_count || 0} products
            </p>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-6xl text-white font-bold">
            {collection.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="p-4">
        {!collection.cover_image_url && !collection.image_url && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {collection.product_count || 0} products
            </p>
          </>
        )}
        {collection.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {collection.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`px-2 py-1 text-xs rounded ${
              collection.type === 'smart'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            {collection.type === 'smart' ? 'Smart' : 'Manual'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

