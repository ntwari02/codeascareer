import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Eye, Search, Filter, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function ProductManagementAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles(id, email, full_name),
          category:categories(id, name),
          images:product_images(url, is_primary, position)
        `);

      if (filter === 'pending') {
        query = query.eq('status', 'draft');
      } else if (filter === 'active') {
        query = query.eq('status', 'active');
      } else if (filter === 'rejected') {
        query = query.eq('status', 'archived');
      } else if (filter === 'draft') {
        query = query.eq('status', 'draft');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleReject = async (productId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const handleBulkApprove = async (productIds: string[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .in('id', productIds);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error bulk approving products:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = products.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Approve, moderate, and manage all products on the platform
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-900 dark:text-yellow-200">
                {pendingCount} products pending approval
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({products.filter(p => p.status === 'draft').length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.title}
                            </div>
                            {product.sku && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {product.seller?.full_name || product.seller?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        ${product.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock_quantity > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {product.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : product.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === 'draft' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(product.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onApprove={() => {
            handleApprove(selectedProduct.id);
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onReject={() => {
            handleReject(selectedProduct.id);
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductDetailModal({ product, onClose, onApprove, onReject }: any) {
  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {primaryImage && (
                <img
                  src={primaryImage.url}
                  alt={product.title}
                  className="w-full rounded-lg"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="mt-1 text-gray-900 dark:text-white">{product.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    ${product.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {product.stock_quantity || 0}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seller</label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {product.seller?.full_name || product.seller?.email || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {product.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {product.images && product.images.length > 1 && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Gallery Images
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: any, idx: number) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {product.status === 'draft' && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              onClick={onReject}
              className="text-red-600 hover:text-red-700"
            >
              Reject
            </Button>
            <Button onClick={onApprove}>Approve Product</Button>
          </div>
        )}
      </div>
    </div>
  );
}
