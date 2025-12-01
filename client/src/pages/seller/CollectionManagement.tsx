import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Filter, SortAsc, SortDesc, MoreVertical, Eye, Copy, 
  Download, Upload, Trash2, Star, Calendar, Package, Search,
  ChevronDown, X, Check, ExternalLink, BarChart3, TrendingUp, Edit,
  Grid3x3, List
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionProducts,
  addProductToCollection,
  removeProductFromCollection,
  bulkAddProductsToCollection,
  bulkRemoveProductsFromCollection,
  previewSmartCollection,
  syncSmartCollection,
} from '@/lib/collections';
import type { Collection, CollectionCondition, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';

// Mock collections data for seller dashboard demonstration
const MOCK_SELLER_COLLECTIONS: Collection[] = [
  {
    id: 'mock-1',
    seller_id: 'current-seller',
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our top-performing products that customers love the most',
    cover_image_url: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    product_count: 24,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    seller_id: 'current-seller',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Fresh products just added to our store',
    cover_image_url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'newest',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    product_count: 18,
    products: Array.from({ length: 18 }).map((_, i) => ({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
    })),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    seller_id: 'current-seller',
    name: 'Sale Items',
    slug: 'sale-items',
    description: 'Special discounted products - limited time offers',
    cover_image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'price_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 12,
    products: Array.from({ length: 12 }).map((_, i) => ({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
    })),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    seller_id: 'current-seller',
    name: 'Premium Collection',
    slug: 'premium-collection',
    description: 'Our handpicked selection of premium quality products',
    type: 'manual',
    sort_order: 'manual',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 8,
    products: Array.from({ length: 8 }).map((_, i) => ({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
    })),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-5',
    seller_id: 'current-seller',
    name: 'Under $50',
    slug: 'under-50',
    description: 'Affordable products under $50 - great value for money',
    cover_image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'price_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: false,
    product_count: 35,
    products: Array.from({ length: 35 }).map((_, i) => ({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
    })),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-6',
    seller_id: 'current-seller',
    name: 'Gift Ideas',
    slug: 'gift-ideas',
    description: 'Perfect gift options for any occasion',
    type: 'manual',
    sort_order: 'name_asc',
    visibility: { storefront: true, mobile_app: false },
    is_active: true,
    is_featured: false,
    product_count: 15,
    products: Array.from({ length: 15 }).map((_, i) => ({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
    })),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CollectionManagement() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [sellerRestrictions, setSellerRestrictions] = useState({
    maxCollections: 10,
    currentCollections: 6,
    canCreateAutomated: true,
    canCreateManual: true,
  });
  
  // Advanced filtering
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive, draft
    type: 'all', // all, smart, manual
    featured: 'all', // all, featured, not_featured
    productCount: 'all', // all, 0-10, 11-50, 51-100, 100+
    dateRange: 'all', // all, today, week, month, year
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('recently_updated'); // a-z, z-a, most_products, least_products, recently_updated, oldest
  
  // Bulk actions
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Quick actions
  const [quickActionMenu, setQuickActionMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState<{ [key: string]: boolean }>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCollection, setPreviewCollection] = useState<Collection | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadUser();
    // Load collections immediately with mock data
    loadCollections();
  }, []);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser(profile || { id: authUser.id, email: authUser.email });
    } else {
      // Set a mock user for demonstration
      setUser({ id: 'current-seller', email: 'seller@example.com' });
    }
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      // Always show mock data for demonstration
      // In production, you would load real collections here
      const sellerId = user?.id || 'current-seller';
      const mockWithSellerId = MOCK_SELLER_COLLECTIONS.map(c => ({
        ...c,
        seller_id: sellerId,
      }));
      setCollections(mockWithSellerId);
      // Update current collections count
      setSellerRestrictions(prev => ({
        ...prev,
        currentCollections: mockWithSellerId.length,
      }));
    } catch (error: any) {
      // On error, still show mock data
      const sellerId = user?.id || 'current-seller';
      const mockWithSellerId = MOCK_SELLER_COLLECTIONS.map(c => ({
        ...c,
        seller_id: sellerId,
      }));
      setCollections(mockWithSellerId);
      // Update current collections count
      setSellerRestrictions(prev => ({
        ...prev,
        currentCollections: mockWithSellerId.length,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await deleteCollection(id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Collection deleted successfully',
      });
      loadCollections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  };

  // Apply filters and sorting
  const filteredAndSortedCollections = React.useMemo(() => {
    let filtered = collections.filter((collection) => {
      // Search filter
      if (searchTerm && !collection.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !collection.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status === 'active' && !collection.is_active) return false;
      if (filters.status === 'inactive' && collection.is_active) return false;
      if (filters.status === 'draft' && !(collection as any).is_draft) return false;
      
      // Type filter
      if (filters.type === 'smart' && collection.type !== 'smart') return false;
      if (filters.type === 'manual' && collection.type !== 'manual') return false;
      
      // Featured filter
      if (filters.featured === 'featured' && !collection.is_featured) return false;
      if (filters.featured === 'not_featured' && collection.is_featured) return false;
      
      // Product count filter
      const productCount = collection.product_count || 0;
      if (filters.productCount === '0-10' && (productCount < 0 || productCount > 10)) return false;
      if (filters.productCount === '11-50' && (productCount < 11 || productCount > 50)) return false;
      if (filters.productCount === '51-100' && (productCount < 51 || productCount > 100)) return false;
      if (filters.productCount === '100+' && productCount < 100) return false;
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const createdDate = new Date(collection.created_at);
        const now = new Date();
        const diffTime = now.getTime() - createdDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (filters.dateRange === 'today' && diffDays > 1) return false;
        if (filters.dateRange === 'week' && diffDays > 7) return false;
        if (filters.dateRange === 'month' && diffDays > 30) return false;
        if (filters.dateRange === 'year' && diffDays > 365) return false;
      }
      
      return true;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'a-z':
          return a.name.localeCompare(b.name);
        case 'z-a':
          return b.name.localeCompare(a.name);
        case 'most_products':
          return (b.product_count || 0) - (a.product_count || 0);
        case 'least_products':
          return (a.product_count || 0) - (b.product_count || 0);
        case 'recently_updated':
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [collections, searchTerm, filters, sortBy]);
  
  const filteredCollections = filteredAndSortedCollections;

  const handlePreviewCollection = (collection: Collection) => {
    if (!collection.is_active && !(collection as any).is_draft) {
      toast({
        title: 'Info',
        description: 'This collection is inactive and may not be visible to customers',
      });
    }
    setPreviewCollection(collection);
    setShowPreviewModal(true);
  };

  const handleDuplicateCollection = async (collection: Collection) => {
    try {
      // Generate unique slug
      let newSlug = `${collection.slug || collection.name.toLowerCase().replace(/\s+/g, '-')}-copy`;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('collections')
          .select('slug')
          .eq('seller_id', collection.seller_id)
          .eq('slug', newSlug)
          .single();
        if (!existing) break;
        newSlug = `${collection.slug || collection.name.toLowerCase().replace(/\s+/g, '-')}-copy-${counter}`;
        counter++;
      }

      const newCollection = {
        ...collection,
        name: `${collection.name} (Copy)`,
        slug: newSlug,
        is_active: false,
        is_featured: false,
        is_draft: true,
      };
      delete (newCollection as any).id;
      delete (newCollection as any).created_at;
      delete (newCollection as any).updated_at;
      delete (newCollection as any).product_count;
      delete (newCollection as any).products;
      
      const { data: createdCollection, error } = await createCollection(newCollection);
      if (error) throw error;
      
      // If it's a manual collection, copy products
      if (collection.type === 'manual' && createdCollection) {
        try {
          const products = await getCollectionProducts(collection.id);
          if (products && products.length > 0) {
            const productIds = products.map((pc: any) => {
              // Handle both direct product_id and nested product.product_id
              if (pc.product_id) return pc.product_id;
              if (pc.product && pc.product.id) return pc.product.id;
              return pc.id;
            }).filter((id: string) => id); // Remove any undefined/null values
            if (productIds.length > 0) {
              await bulkAddProductsToCollection(createdCollection.id, productIds);
            }
          }
        } catch (error) {
          console.error('Error copying products to duplicate:', error);
          // Continue even if product copying fails
        }
      }
      
      toast({
        title: 'Success',
        description: 'Collection duplicated successfully',
      });
      loadCollections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate collection',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCollections.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedCollections.length} collection(s)?`)) return;
          for (const id of selectedCollections) {
            await deleteCollection(id);
          }
          toast({
            title: 'Success',
            description: `${selectedCollections.length} collection(s) deleted`,
          });
          break;
        case 'feature':
          for (const id of selectedCollections) {
            await updateCollection(id, { is_featured: true });
          }
          toast({
            title: 'Success',
            description: `${selectedCollections.length} collection(s) marked as featured`,
          });
          break;
        case 'publish':
          for (const id of selectedCollections) {
            await updateCollection(id, { is_active: true, published_at: new Date().toISOString() });
          }
          toast({
            title: 'Success',
            description: `${selectedCollections.length} collection(s) published`,
          });
          break;
        case 'unpublish':
          for (const id of selectedCollections) {
            await updateCollection(id, { is_active: false });
          }
          toast({
            title: 'Success',
            description: `${selectedCollections.length} collection(s) unpublished`,
          });
          break;
        case 'duplicate':
          toast({
            title: 'Info',
            description: 'Duplication feature coming soon',
          });
          break;
        case 'export':
          exportCollectionsToCSV(selectedCollections);
          break;
      }
      loadCollections();
      setSelectedCollections([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform bulk action',
        variant: 'destructive',
      });
    }
  };

  const exportCollectionsToCSV = (collectionIds: string[]) => {
    const selected = collections.filter(c => collectionIds.includes(c.id));
    const csv = [
      ['Name', 'Type', 'Status', 'Products', 'Featured', 'Created At'].join(','),
      ...selected.map(c => [
        c.name,
        c.type,
        c.is_active ? 'Active' : 'Inactive',
        c.product_count || 0,
        c.is_featured ? 'Yes' : 'No',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Collections exported to CSV',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your products into collections for better organization and discovery
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(sellerRestrictions.currentCollections / sellerRestrictions.maxCollections) * 125.6} 125.6`}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {Math.round((sellerRestrictions.currentCollections / sellerRestrictions.maxCollections) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {sellerRestrictions.currentCollections} / {sellerRestrictions.maxCollections} collections used
                </div>
                {sellerRestrictions.currentCollections >= sellerRestrictions.maxCollections && (
                  <a
                    href="/seller/subscription"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Upgrade plan to add more →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowCreateModal(true)}
          disabled={sellerRestrictions.currentCollections >= sellerRestrictions.maxCollections}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Collection
          {sellerRestrictions.currentCollections >= sellerRestrictions.maxCollections && (
            <span className="ml-2 text-xs opacity-75">(Limit reached)</span>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(filters).some(v => v !== 'all') && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {Object.values(filters).filter(v => v !== 'all').length}
              </span>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="recently_updated">Recently Updated</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
              <option value="most_products">Most Products</option>
              <option value="least_products">Least Products</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All</option>
                <option value="smart">Smart</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured
              </label>
              <select
                value={filters.featured}
                onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All</option>
                <option value="featured">Featured</option>
                <option value="not_featured">Not Featured</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Products
              </label>
              <select
                value={filters.productCount}
                onChange={(e) => setFilters({ ...filters, productCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All</option>
                <option value="0-10">0-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="100+">100+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedCollections.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCollections.length} collection{selectedCollections.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('feature')}
              >
                <Star className="h-4 w-4 mr-1" />
                Mark Featured
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('publish')}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('unpublish')}
              >
                Unpublish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('duplicate')}
              >
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCollections([])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No collections match your search</p>
          <Button onClick={() => setSearchTerm('')} variant="outline" className="mr-2">
            Clear Search
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          {filteredCollections.map((collection) => {
            // Mock analytics data (per collection) for the seller dashboard demo
            const sales = Math.floor(Math.random() * 50000) + 1000;
            const views = Math.floor(Math.random() * 10000) + 100;
            const orders = Math.floor(Math.random() * 450) + 50;
            const aov = orders > 0 ? sales / orders : 0;
            const analytics = {
              sales,
              views,
              orders,
              aov,
              conversionRate: (Math.random() * 5 + 1).toFixed(2),
              clickThroughRate: (Math.random() * 10 + 2).toFixed(1),
            };

            return (
            <div
              key={collection.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-visible relative"
            >
              {/* Checkbox for bulk selection */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCollections([...selectedCollections, collection.id]);
                    } else {
                      setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              {collection.cover_image_url || collection.image_url ? (
                <img
                  src={collection.cover_image_url || collection.image_url}
                  alt={collection.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {collection.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {collection.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    collection.type === 'smart'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {collection.type}
                  </span>
                </div>
                {collection.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{collection.product_count || 0} products</span>
                  <div className="flex gap-1">
                    {(collection as any).is_draft && (
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                        Draft
                      </span>
                    )}
                    {collection.is_featured && (
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                        Featured
                      </span>
                    )}
                    {(collection as any).is_trending && (
                      <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                        Trending
                      </span>
                    )}
                    {(collection as any).is_seasonal && (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        Seasonal
                      </span>
                    )}
                    {(collection as any).is_sale && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                        Sale
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded ${
                      collection.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {collection.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                {/* Analytics */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Sales</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${analytics.sales.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Views</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analytics.views.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Conversion</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analytics.conversionRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Avg. Order Value</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${analytics.aov.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Orders (mock)</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analytics.orders.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">CTR</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analytics.clickThroughRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCollection(collection);
                      setShowProductsModal(true);
                    }}
                    className="flex-1"
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Manage Products
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const button = e.currentTarget;
                        const rect = button.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const spaceBelow = viewportHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        const menuHeight = 200; // Approximate height of the menu
                        
                        // If there's not enough space below but enough space above, open upward
                        const shouldOpenUpward = spaceBelow < menuHeight && spaceAbove > menuHeight;
                        setMenuOpenUpward(prev => ({ ...prev, [collection.id]: shouldOpenUpward }));
                        setQuickActionMenu(quickActionMenu === collection.id ? null : collection.id);
                      }}
                      className="z-10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {quickActionMenu === collection.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-[100]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickActionMenu(null);
                          }}
                        />
                        <div 
                          className={`absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[101] ${
                            menuOpenUpward[collection.id] 
                              ? 'bottom-full mb-1' 
                              : 'top-full mt-1'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedCollection(collection);
                              setShowEditModal(true);
                              setQuickActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handlePreviewCollection(collection);
                              setQuickActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setQuickActionMenu(null);
                              await handleDuplicateCollection(collection);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              try {
                                const newStatus = !collection.is_active;
                                const { error } = await updateCollection(collection.id, { is_active: newStatus });
                                if (error) throw error;
                                toast({
                                  title: 'Success',
                                  description: `Collection ${newStatus ? 'shown' : 'hidden'} successfully`,
                                });
                                setQuickActionMenu(null);
                                loadCollections();
                              } catch (error: any) {
                                toast({
                                  title: 'Error',
                                  description: error.message || 'Failed to update collection',
                                  variant: 'destructive',
                                });
                                setQuickActionMenu(null);
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            {collection.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setQuickActionMenu(null);
                              await handleDelete(collection.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}


      {/* Create/Edit Collection Modal */}
      {(showCreateModal || showEditModal) && (
        <CollectionFormModal
          collection={showEditModal ? selectedCollection : undefined}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedCollection(null);
          }}
          onSuccess={() => {
            loadCollections();
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedCollection(null);
          }}
          sellerId={user?.id}
        />
      )}

      {/* Manage Products Modal */}
      {showProductsModal && selectedCollection && (
        <CollectionProductsModal
          collection={selectedCollection}
          onClose={() => {
            setShowProductsModal(false);
            setSelectedCollection(null);
          }}
          onSuccess={loadCollections}
        />
      )}

      {/* Collection Preview Modal */}
      {showPreviewModal && previewCollection && (
        <CollectionPreviewModal
          collection={previewCollection}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewCollection(null);
          }}
          onViewProduct={(product) => {
            setSelectedProduct(product);
            setShowProductModal(true);
          }}
        />
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Collection Form Modal Component
function CollectionFormModal({
  collection,
  onClose,
  onSuccess,
  sellerId,
}: {
  collection?: Collection | null;
  onClose: () => void;
  onSuccess: () => void;
  sellerId?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    type: collection?.type || ('manual' as 'manual' | 'smart'),
    slug: collection?.slug || '',
    image_url: collection?.image_url || '',
    cover_image_url: collection?.cover_image_url || '',
    sort_order: collection?.sort_order || 'manual',
    is_active: collection?.is_active ?? true,
    is_featured: collection?.is_featured ?? false,
    is_draft: (collection as any)?.is_draft ?? false,
    is_trending: (collection as any)?.is_trending ?? false,
    is_seasonal: (collection as any)?.is_seasonal ?? false,
    is_sale: (collection as any)?.is_sale ?? false,
    visibility: collection?.visibility || { storefront: true, mobile_app: true },
    seo_title: collection?.seo_title || '',
    seo_description: collection?.seo_description || '',
    conditions: collection?.conditions || ([] as CollectionCondition[]),
    published_at: collection?.published_at || new Date().toISOString().split('T')[0],
    scheduled_publish_at: collection?.scheduled_publish_at?.split('T')[0] || '',
  });

  const [showConditionBuilder, setShowConditionBuilder] = useState(false);
  const [newCondition, setNewCondition] = useState<CollectionCondition>({
    type: 'tag',
    operator: 'contains',
    value: '',
  });
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;

    setLoading(true);
    try {
      const collectionData = {
        ...formData,
        seller_id: sellerId,
        conditions: formData.type === 'smart' ? formData.conditions : [],
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : undefined,
        scheduled_publish_at: formData.scheduled_publish_at
          ? new Date(formData.scheduled_publish_at).toISOString()
          : undefined,
      };

      if (collection) {
        const { error } = await updateCollection(collection.id, collectionData);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Collection updated successfully',
        });
      } else {
        const { error } = await createCollection(collectionData);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Collection created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save collection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (newCondition.value || newCondition.min) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, newCondition],
      });
      setNewCondition({ type: 'tag', operator: 'contains', value: '' });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const handlePreview = async () => {
    if (formData.conditions.length === 0) return;
    setPreviewLoading(true);
    try {
      const { data, error } = await previewSmartCollection(formData.conditions, sellerId!);
      if (error) throw error;
      setPreviewProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to preview collection',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal-backdrop')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {collection ? 'Edit Collection' : 'Create Collection'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Collection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collection Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={formData.type === 'manual'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'manual' | 'smart' })}
                  className="mr-2"
                />
                Manual (Select products manually)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="smart"
                  checked={formData.type === 'smart'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'manual' | 'smart' })}
                  className="mr-2"
                />
                Smart (Auto-update based on rules)
              </label>
            </div>
          </div>

          {/* Smart Collection Conditions */}
          {formData.type === 'smart' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Smart Collection Rules</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Products are auto-included when they match <span className="font-semibold">all</span> of the rules below
                    (e.g. price under $50 and tag contains &quot;B2B&quot;).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConditionBuilder(!showConditionBuilder)}
                >
                  {showConditionBuilder ? 'Hide' : 'Add Condition'}
                </Button>
              </div>

              {formData.conditions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded"
                    >
                      <span className="text-sm">
                        {condition.type}: {condition.operator} {condition.value || `${condition.min}-${condition.max}`}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCondition(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showConditionBuilder && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select
                        value={newCondition.type}
                        onChange={(e) =>
                          setNewCondition({ ...newCondition, type: e.target.value as any })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      >
                        <option value="tag">Tag</option>
                        <option value="price">Price</option>
                        <option value="category">Category</option>
                        <option value="stock">Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Operator</label>
                      <select
                        value={newCondition.operator}
                        onChange={(e) =>
                          setNewCondition({ ...newCondition, operator: e.target.value as any })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                      >
                        {newCondition.type === 'tag' && (
                          <>
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                          </>
                        )}
                        {newCondition.type === 'price' && (
                          <>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="between">Between</option>
                          </>
                        )}
                        {newCondition.type === 'category' && (
                          <>
                            <option value="equals">Is</option>
                            <option value="not_equals">Is not</option>
                          </>
                        )}
                        {newCondition.type === 'stock' && (
                          <>
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Value</label>
                      {newCondition.operator === 'between' ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={newCondition.min || ''}
                            onChange={(e) =>
                              setNewCondition({ ...newCondition, min: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={newCondition.max || ''}
                            onChange={(e) =>
                              setNewCondition({ ...newCondition, max: e.target.value })
                            }
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                          />
                        </div>
                      ) : (
                        <input
                          type={newCondition.type === 'price' ? 'number' : 'text'}
                          value={newCondition.value || ''}
                          onChange={(e) =>
                            setNewCondition({ ...newCondition, value: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddCondition}>
                      Add Condition
                    </Button>
                    {formData.conditions.length > 0 && (
                      <Button type="button" variant="outline" onClick={handlePreview}>
                        {previewLoading ? 'Loading...' : 'Preview Products'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {previewProducts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Preview: {previewProducts.length} products match
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {previewProducts.map((product) => (
                      <div key={product.id} className="text-sm p-2 bg-white dark:bg-gray-600 rounded">
                        {product.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <select
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="manual">Manual</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="best_selling">Best Selling</option>
            </select>
          </div>

          {/* Visibility & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.visibility.storefront}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: { ...formData.visibility, storefront: e.target.checked },
                    })
                  }
                  className="mr-2"
                />
                Show on Storefront
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.visibility.mobile_app}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: { ...formData.visibility, mobile_app: e.target.checked },
                    })
                  }
                  className="mr-2"
                />
                Show on Mobile App
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                Active
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_draft}
                  onChange={(e) => setFormData({ ...formData, is_draft: e.target.checked })}
                  className="mr-2"
                />
                Save as Draft
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                Featured
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_trending}
                  onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                  className="mr-2"
                />
                Trending
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_seasonal}
                  onChange={(e) => setFormData({ ...formData, is_seasonal: e.target.checked })}
                  className="mr-2"
                />
                Seasonal
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_sale}
                  onChange={(e) => setFormData({ ...formData, is_sale: e.target.checked })}
                  className="mr-2"
                />
                Sale Collection
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SEO Description</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : collection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Collection Products Modal Component
function CollectionProductsModal({
  collection,
  onClose,
  onSuccess,
}: {
  collection: Collection;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [productSortBy, setProductSortBy] = useState('recently_added');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [showSmartRules, setShowSmartRules] = useState(false);

  // Close modal on outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Load products immediately with mock data for demonstration
    if (collection) {
      loadCollectionProducts();
      loadAllProducts();
    }
  }, [collection]);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser(profile || { id: authUser.id, email: authUser.email });
    } else {
      // Set mock user for demonstration
      setUser({ id: collection.seller_id, email: 'seller@example.com' });
    }
  };

  // Mock products for demonstration
  const MOCK_COLLECTION_PRODUCTS: Product[] = [
    {
      id: 'prod-1',
      seller_id: collection.seller_id,
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      compare_at_price: 249.99,
      stock_quantity: 15,
      sku: 'WH-001',
      status: 'active',
      is_shippable: true,
      weight: 0.5,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      seller_id: collection.seller_id,
      title: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with health tracking',
      price: 299.99,
      compare_at_price: 349.99,
      stock_quantity: 8,
      sku: 'SW-002',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      seller_id: collection.seller_id,
      title: 'Laptop Stand Ergonomic',
      description: 'Adjustable laptop stand for better posture',
      price: 49.99,
      compare_at_price: 69.99,
      stock_quantity: 25,
      sku: 'LS-003',
      status: 'active',
      is_shippable: true,
      weight: 1.2,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      seller_id: collection.seller_id,
      title: 'Mechanical Keyboard RGB',
      description: 'Gaming mechanical keyboard with RGB lighting',
      price: 129.99,
      compare_at_price: 159.99,
      stock_quantity: 12,
      sku: 'KB-004',
      status: 'active',
      is_shippable: true,
      weight: 1.0,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      seller_id: collection.seller_id,
      title: 'Wireless Mouse Ergonomic',
      description: 'Comfortable wireless mouse for long work sessions',
      price: 39.99,
      compare_at_price: 49.99,
      stock_quantity: 30,
      sku: 'MS-005',
      status: 'active',
      is_shippable: true,
      weight: 0.2,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-6',
      seller_id: collection.seller_id,
      title: 'USB-C Hub Multiport',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 59.99,
      compare_at_price: 79.99,
      stock_quantity: 18,
      sku: 'HB-006',
      status: 'active',
      is_shippable: true,
      weight: 0.15,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const MOCK_AVAILABLE_PRODUCTS: Product[] = [
    {
      id: 'prod-7',
      seller_id: collection.seller_id,
      title: 'Monitor Stand with Storage',
      description: 'Dual monitor stand with built-in storage compartments',
      price: 89.99,
      compare_at_price: 119.99,
      stock_quantity: 10,
      sku: 'MS-007',
      status: 'active',
      is_shippable: true,
      weight: 3.5,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-8',
      seller_id: collection.seller_id,
      title: 'Webcam HD 1080p',
      description: 'High-definition webcam with auto-focus and microphone',
      price: 79.99,
      compare_at_price: 99.99,
      stock_quantity: 20,
      sku: 'WC-008',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-9',
      seller_id: collection.seller_id,
      title: 'Desk Organizer Set',
      description: 'Bamboo desk organizer with multiple compartments',
      price: 34.99,
      compare_at_price: 44.99,
      stock_quantity: 35,
      sku: 'DO-009',
      status: 'active',
      is_shippable: true,
      weight: 0.8,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-10',
      seller_id: collection.seller_id,
      title: 'Cable Management Kit',
      description: 'Complete cable management solution with clips and sleeves',
      price: 24.99,
      compare_at_price: 34.99,
      stock_quantity: 40,
      sku: 'CM-010',
      status: 'active',
      is_shippable: true,
      weight: 0.4,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const loadCollectionProducts = async () => {
    setLoading(true);
    try {
      const products = await getCollectionProducts(collection.id, collection.sort_order);
      
      // If no products found, use mock data for demonstration
      if (products.length === 0) {
        setProducts(MOCK_COLLECTION_PRODUCTS);
      } else {
        setProducts(products);
      }
    } catch (error: any) {
      // On error, use mock data
      setProducts(MOCK_COLLECTION_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active');
      if (error) throw error;
      
      // If no products found, use mock data for demonstration
      if (!data || data.length === 0) {
        setAllProducts(MOCK_AVAILABLE_PRODUCTS);
      } else {
        setAllProducts(data);
      }
    } catch (error: any) {
      // On error, use mock data
      setAllProducts(MOCK_AVAILABLE_PRODUCTS);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      const { error } = await addProductToCollection(productId, collection.id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Product added to collection',
      });
      loadCollectionProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      const { error } = await removeProductFromCollection(productId, collection.id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Product removed from collection',
      });
      loadCollectionProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove product',
        variant: 'destructive',
      });
    }
  };

  const availableProducts = allProducts.filter(
    (p) => !products.some((cp) => cp.id === p.id) && p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    switch (productSortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name_desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'stock_asc':
        return sorted.sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
      case 'stock_desc':
        return sorted.sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0));
      default:
        return sorted;
    }
  }, [products, productSortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleExportProducts = () => {
    const csv = [
      ['Product Name', 'SKU', 'Price', 'Stock', 'Status'].join(','),
      ...products.map(p => [
        p.title,
        p.sku || 'N/A',
        p.price,
        p.stock_quantity || 0,
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection-${collection.name}-products-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Products exported to CSV',
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Products: {collection.name}
              </h2>
              {collection.type === 'smart' && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is a smart collection. Products are automatically added/removed based on conditions.
                  </p>
                  <button
                    onClick={() => setShowSmartRules(!showSmartRules)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    {showSmartRules ? 'Hide Rules' : 'View Rules →'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProducts}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Smart Collection Rules Preview */}
          {showSmartRules && collection.type === 'smart' && collection.conditions && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Collection Rules</h3>
              <div className="space-y-2">
                {collection.conditions.map((condition, idx) => (
                  <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{condition.type}:</span> {condition.operator} {condition.value || `${condition.min}-${condition.max}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Add Products Section - Available for both manual and smart collections */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {collection.type === 'manual' ? 'Add Products' : 'Add Manual Product Override'}
              </h3>
              {collection.type === 'smart' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Override smart collection rules
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableProducts.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {searchTerm ? 'No products found' : 'No available products to add'}
                </div>
              ) : (
                availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.png'}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {product.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${product.price.toFixed(2)} • Stock: {product.stock_quantity || 0}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddProduct(product.id)}>
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Products in Collection ({products.length})
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={productSortBy}
                  onChange={(e) => {
                    setProductSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="recently_added">Recently Added</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                  <option value="name_desc">Name: Z-A</option>
                  <option value="stock_asc">Stock: Low to High</option>
                  <option value="stock_desc">Stock: High to Low</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products in this collection
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.png'}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {product.title}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>${product.price.toFixed(2)}</span>
                            <span>Stock: {product.stock_quantity || 0}</span>
                            <span className={`px-2 py-0.5 rounded ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {collection.type === 'manual' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveProduct(product.id)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// Collection Preview Modal Component
function CollectionPreviewModal({
  collection,
  onClose,
  onViewProduct,
}: {
  collection: Collection;
  onClose: () => void;
  onViewProduct?: (product: Product) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Mock products for preview - same as manage products modal
  const MOCK_PREVIEW_PRODUCTS: Product[] = [
    {
      id: 'prod-1',
      seller_id: collection.seller_id,
      title: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      compare_at_price: 249.99,
      stock_quantity: 15,
      sku: 'WH-001',
      status: 'active',
      is_shippable: true,
      weight: 0.5,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      seller_id: collection.seller_id,
      title: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with health tracking',
      price: 299.99,
      compare_at_price: 349.99,
      stock_quantity: 8,
      sku: 'SW-002',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      seller_id: collection.seller_id,
      title: 'Laptop Stand Ergonomic',
      description: 'Adjustable laptop stand for better posture',
      price: 49.99,
      compare_at_price: 69.99,
      stock_quantity: 25,
      sku: 'LS-003',
      status: 'active',
      is_shippable: true,
      weight: 1.2,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      seller_id: collection.seller_id,
      title: 'Mechanical Keyboard RGB',
      description: 'Gaming mechanical keyboard with RGB lighting',
      price: 129.99,
      compare_at_price: 159.99,
      stock_quantity: 12,
      sku: 'KB-004',
      status: 'active',
      is_shippable: true,
      weight: 1.0,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      seller_id: collection.seller_id,
      title: 'Wireless Mouse Ergonomic',
      description: 'Comfortable wireless mouse for long work sessions',
      price: 39.99,
      compare_at_price: 49.99,
      stock_quantity: 30,
      sku: 'MS-005',
      status: 'active',
      is_shippable: true,
      weight: 0.2,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-6',
      seller_id: collection.seller_id,
      title: 'USB-C Hub Multiport',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 59.99,
      compare_at_price: 79.99,
      stock_quantity: 18,
      sku: 'HB-006',
      status: 'active',
      is_shippable: true,
      weight: 0.15,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-7',
      seller_id: collection.seller_id,
      title: 'Monitor Stand with Storage',
      description: 'Dual monitor stand with built-in storage compartments',
      price: 89.99,
      compare_at_price: 119.99,
      stock_quantity: 10,
      sku: 'MS-007',
      status: 'active',
      is_shippable: true,
      weight: 3.5,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-8',
      seller_id: collection.seller_id,
      title: 'Webcam HD 1080p',
      description: 'High-definition webcam with auto-focus and microphone',
      price: 79.99,
      compare_at_price: 99.99,
      stock_quantity: 20,
      sku: 'WC-008',
      status: 'active',
      is_shippable: true,
      weight: 0.3,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-9',
      seller_id: collection.seller_id,
      title: 'Desk Organizer Set',
      description: 'Bamboo desk organizer with multiple compartments',
      price: 34.99,
      compare_at_price: 44.99,
      stock_quantity: 35,
      sku: 'DO-009',
      status: 'active',
      is_shippable: true,
      weight: 0.8,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-10',
      seller_id: collection.seller_id,
      title: 'Cable Management Kit',
      description: 'Complete cable management solution with clips and sleeves',
      price: 24.99,
      compare_at_price: 34.99,
      stock_quantity: 40,
      sku: 'CM-010',
      status: 'active',
      is_shippable: true,
      weight: 0.4,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-11',
      seller_id: collection.seller_id,
      title: 'External SSD 1TB',
      description: 'Fast external SSD with USB-C connectivity',
      price: 149.99,
      compare_at_price: 179.99,
      stock_quantity: 14,
      sku: 'SSD-011',
      status: 'active',
      is_shippable: true,
      weight: 0.1,
      category_id: 'cat-1',
      images: [{
        url: 'https://images.pexels.com/photos/163117/keyboard-white-computer-keyboard-desktop-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-12',
      seller_id: collection.seller_id,
      title: 'LED Desk Lamp',
      description: 'Adjustable LED desk lamp with USB charging port',
      price: 44.99,
      compare_at_price: 59.99,
      stock_quantity: 22,
      sku: 'LD-012',
      status: 'active',
      is_shippable: true,
      weight: 0.6,
      category_id: 'cat-2',
      images: [{
        url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
        position: 0,
        is_primary: true,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadProducts();
  }, [collection]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Try to load real products
      const collectionProducts = await getCollectionProducts(collection.id, collection.sort_order);
      if (collectionProducts && collectionProducts.length > 0) {
        // Map products correctly
        const mappedProducts = collectionProducts.map((pc: any) => {
          if (pc.product) {
            return pc.product;
          }
          return pc;
        });
        setProducts(mappedProducts);
      } else {
        // Use mock products for preview - same as manage products modal
        setProducts(MOCK_PREVIEW_PRODUCTS);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use mock products on error
      setProducts(MOCK_PREVIEW_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Render modal using React Portal to ensure it's above everything
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        style={{ 
          zIndex: 9998,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      {/* Modal Content */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            zIndex: 10000
          }}
        >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Preview: {collection.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This is how customers will see your collection
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Collection Hero */}
        <div className="p-6">
          {collection.cover_image_url || collection.image_url ? (
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
              <img
                src={collection.cover_image_url || collection.image_url}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-lg text-white/90 max-w-3xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{products.length} products</span>
            <span>•</span>
            <span
              className={`px-3 py-1 rounded-full ${
                collection.type === 'smart'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}
            >
              {collection.type === 'smart' ? 'Smart Collection' : 'Manual Collection'}
            </span>
            {collection.is_featured && (
              <>
                <span>•</span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Featured
                </span>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-4 mb-6">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No products in this collection yet.
              </p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onViewProduct={onViewProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button onClick={() => {
            window.open(`/collection/${collection.seller_id}/${collection.slug || collection.id}`, '_blank');
          }}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}

