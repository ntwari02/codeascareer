import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Truck, MapPin, Star, ChevronLeft, Package, Shield, MessageCircle, FolderKanban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getProductCollections } from '../lib/collections';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { ProductGallery } from '../components/ProductGallery';
import type { Product, ProductVariant, Review, QuestionAnswer, Collection } from '../types';
import { MOCK_PRODUCTS, type ProductWithImages } from './Products';

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'questions'>('description');
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const applyMockFallback = (productId: string | undefined) => {
    if (!productId) return false;
    const mockProduct = MOCK_PRODUCTS.find((p) => p.id === productId) as ProductWithImages | undefined;
    if (!mockProduct) return false;

    setProduct(mockProduct);
    setImages(mockProduct.images || []);
    setVariants([]);
    setReviews([]);
    setQuestions([]);
    return true;
  };

  const loadProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const [productRes, imagesRes, variantsRes, reviewsRes, questionsRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_images').select('*').eq('product_id', id).order('is_primary', { ascending: false }).order('position'),
        supabase.from('product_variants').select('*').eq('product_id', id),
        supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }),
        supabase.from('questions_answers').select('*').eq('product_id', id).order('created_at', { ascending: false }),
      ]);

      if (productRes.data) {
        setProduct(productRes.data);
        setImages(imagesRes.data || []);
        setVariants(variantsRes.data || []);
        setReviews(reviewsRes.data || []);
        setQuestions(questionsRes.data || []);
        
        // Load collections for this product
        const productCollections = await getProductCollections(id);
        setCollections(productCollections);
        
        await supabase.rpc('increment', { row_id: id, table_name: 'products', column_name: 'views_count' });
      } else if (!applyMockFallback(id)) {
        setProduct(null);
      }
    } catch (error) {
      if (!applyMockFallback(id)) {
        setProduct(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      const variant = selectedVariant
        ? variants.find(v => v.id === selectedVariant)
        : undefined;
      await addToCart(user?.id || null, product, variant, quantity);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      const item = useWishlistStore.getState().items.find(i => i.product_id === product.id);
      if (item) await removeFromWishlist(item.id);
    } else {
      await addToWishlist(user?.id || null, product);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || !newQuestion.trim()) return;

    await supabase.from('questions_answers').insert({
      product_id: product.id,
      user_id: user.id,
      question: newQuestion.trim(),
    });

    setNewQuestion('');
    loadProduct();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? variants.find(v => v.id === selectedVariant)?.price || product.price
    : product.price;

  const currentStock = selectedVariant
    ? variants.find(v => v.id === selectedVariant)?.stock_quantity || 0
    : product.stock_quantity;

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Ensure we have at least one image for the gallery
  const displayImages = images.length > 0
    ? images
    : [{ 
        id: 'placeholder',
        product_id: product?.id || '',
        url: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', 
        alt_text: product?.title || 'Product image',
        position: 0,
        is_primary: true,
        created_at: new Date().toISOString()
      }];

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ChevronLeft className="h-5 w-5" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <ProductGallery 
              images={displayImages} 
              productTitle={product?.title || ''}
            />
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.title}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">${product.compare_at_price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {Math.round(((product.compare_at_price - currentPrice) / product.compare_at_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Collections */}
            {collections.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Part of Collections:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collection/${collection.seller_id}/${collection.slug || collection.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {collections.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Part of Collections:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collection/${collection.seller_id}/${collection.slug || collection.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                {product.is_shippable ? (
                  <>
                    <Truck className="h-5 w-5 text-green-600" />
                    <span>Free shipping available</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Pickup only - {product.location}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-5 w-5" />
                <span>
                  {currentStock > 0 ? (
                    currentStock <= product.low_stock_threshold ? (
                      <span className="text-orange-600 font-semibold">Only {currentStock} left!</span>
                    ) : (
                      <span className="text-green-600">In Stock</span>
                    )
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Protected by escrow payment</span>
              </div>
            </div>

            {variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Variant</label>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.stock_quantity === 0}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        selectedVariant === variant.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : variant.stock_quantity === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {variant.name}
                      {variant.stock_quantity === 0 && <span className="block text-xs">Out of stock</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center px-3 py-2 border border-gray-300 dark:border-dark bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition"
              >
                <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === 'description'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === 'questions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Q&A ({questions.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        {review.is_verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                {user && (
                  <form onSubmit={handleAskQuestion} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ask a Question</label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="What would you like to know about this product?"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newQuestion.trim()}
                      className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                      Submit Question
                    </button>
                  </form>
                )}

                {questions.length > 0 ? (
                  questions.map((qa) => (
                    <div key={qa.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex gap-2 mb-2">
                        <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">Q: {qa.question}</p>
                          {qa.answer ? (
                            <p className="text-gray-700 ml-7">A: {qa.answer}</p>
                          ) : (
                            <p className="text-gray-500 text-sm ml-7">No answer yet</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">
                        {new Date(qa.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No questions yet. Be the first to ask!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
