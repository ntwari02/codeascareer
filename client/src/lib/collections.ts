import { supabase } from './supabase';
import type { Collection, CollectionCondition, Product, ProductCollection } from '@/types';

/**
 * Collection Service - Handles all collection-related operations
 */

// =====================================================
// COLLECTION CRUD OPERATIONS
// =====================================================

export async function getCollections(options?: {
  sellerId?: string;
  featured?: boolean;
  active?: boolean;
  includeProducts?: boolean;
}) {
  let query = supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.sellerId) {
    query = query.eq('seller_id', options.sellerId);
  }

  if (options?.featured !== undefined) {
    query = query.eq('is_featured', options.featured);
  }

  if (options?.active !== undefined) {
    query = query.eq('is_active', options.active);
  } else {
    // Default: only show active and published collections
    query = query.eq('is_active', true);
    query = query.or('published_at.is.null,published_at.lte.' + new Date().toISOString());
    query = query.or('scheduled_publish_at.is.null,scheduled_publish_at.lte.' + new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching collections:', error);
    return { data: null, error };
  }

  // Get product counts if needed
  if (data && options?.includeProducts) {
    const collectionsWithCounts = await Promise.all(
      data.map(async (collection) => {
        const count = await getCollectionProductCount(collection.id);
        return { ...collection, product_count: count };
      })
    );
    return { data: collectionsWithCounts, error: null };
  }

  return { data, error: null };
}

export async function getCollection(id: string, includeProducts = false) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return { data: null, error };
  }

  if (includeProducts && data) {
    const products = await getCollectionProducts(id, data.sort_order);
    return { data: { ...data, products }, error: null };
  }

  return { data, error: null };
}

export async function getCollectionBySlug(slug: string, sellerId: string, includeProducts = false) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('seller_id', sellerId)
    .single();

  if (error) {
    console.error('Error fetching collection by slug:', error);
    return { data: null, error };
  }

  if (includeProducts && data) {
    const products = await getCollectionProducts(data.id, data.sort_order);
    return { data: { ...data, products }, error: null };
  }

  return { data, error: null };
}

export async function createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) {
  // Generate slug if not provided
  let slug = collection.slug;
  if (!slug && collection.name) {
    slug = generateSlug(collection.name);
    // Ensure uniqueness
    const { data: existing } = await supabase
      .from('collections')
      .select('slug')
      .eq('seller_id', collection.seller_id)
      .eq('slug', slug)
      .single();
    
    if (existing) {
      let counter = 1;
      let uniqueSlug = `${slug}-${counter}`;
      while (true) {
        const { data: check } = await supabase
          .from('collections')
          .select('slug')
          .eq('seller_id', collection.seller_id)
          .eq('slug', uniqueSlug)
          .single();
        if (!check) break;
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      slug = uniqueSlug;
    }
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      ...collection,
      slug,
      published_at: collection.published_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    return { data: null, error };
  }

  // If smart collection, sync products
  if (data.type === 'smart' && data.conditions && data.conditions.length > 0) {
    await syncSmartCollection(data.id);
  }

  return { data, error: null };
}

export async function updateCollection(
  id: string,
  updates: Partial<Omit<Collection, 'id' | 'created_at' | 'seller_id'>>
) {
  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    return { data: null, error };
  }

  // If smart collection conditions changed, re-sync products
  if (data.type === 'smart' && updates.conditions !== undefined) {
    await syncSmartCollection(id);
  }

  return { data, error: null };
}

export async function deleteCollection(id: string) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting collection:', error);
    return { error };
  }

  return { error: null };
}

// =====================================================
// PRODUCT-COLLECTION RELATIONSHIPS
// =====================================================

export async function getCollectionProducts(collectionId: string, sortOrder?: string) {
  let query = supabase
    .from('product_collections')
    .select(`
      *,
      product:products(
        *,
        images:product_images(url, position, alt_text)
      )
    `)
    .eq('collection_id', collectionId);

  // Apply sorting
  switch (sortOrder) {
    case 'price_asc':
      query = query.order('product.price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('product.price', { ascending: false });
      break;
    case 'newest':
      query = query.order('product.created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('product.created_at', { ascending: true });
      break;
    case 'name_asc':
      query = query.order('product.title', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('product.title', { ascending: false });
      break;
    case 'best_selling':
      // This would require order_items aggregation - simplified for now
      query = query.order('product.views_count', { ascending: false });
      break;
    default: // manual
      query = query.order('position', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching collection products:', error);
    return [];
  }

  return data?.map((pc: any) => pc.product).filter(Boolean) || [];
}

export async function getCollectionProductCount(collectionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('product_collections')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId);

  if (error) {
    console.error('Error counting collection products:', error);
    return 0;
  }

  return count || 0;
}

export async function addProductToCollection(productId: string, collectionId: string, position?: number) {
  const { data, error } = await supabase
    .from('product_collections')
    .insert({
      product_id: productId,
      collection_id: collectionId,
      position: position || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding product to collection:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function removeProductFromCollection(productId: string, collectionId: string) {
  const { error } = await supabase
    .from('product_collections')
    .delete()
    .eq('product_id', productId)
    .eq('collection_id', collectionId);

  if (error) {
    console.error('Error removing product from collection:', error);
    return { error };
  }

  return { error: null };
}

export async function updateProductPosition(
  productId: string,
  collectionId: string,
  position: number
) {
  const { data, error } = await supabase
    .from('product_collections')
    .update({ position })
    .eq('product_id', productId)
    .eq('collection_id', collectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product position:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function bulkAddProductsToCollection(
  productIds: string[],
  collectionId: string
) {
  const items = productIds.map((productId, index) => ({
    product_id: productId,
    collection_id: collectionId,
    position: index,
  }));

  const { data, error } = await supabase
    .from('product_collections')
    .insert(items)
    .select();

  if (error) {
    console.error('Error bulk adding products to collection:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function bulkRemoveProductsFromCollection(
  productIds: string[],
  collectionId: string
) {
  const { error } = await supabase
    .from('product_collections')
    .delete()
    .eq('collection_id', collectionId)
    .in('product_id', productIds);

  if (error) {
    console.error('Error bulk removing products from collection:', error);
    return { error };
  }

  return { error: null };
}

// =====================================================
// SMART COLLECTIONS
// =====================================================

export async function syncSmartCollection(collectionId: string) {
  // This calls the database function to evaluate and sync smart collection products
  const { data, error } = await supabase.rpc('evaluate_smart_collection', {
    collection_uuid: collectionId,
  });

  if (error) {
    console.error('Error syncing smart collection:', error);
    return { error };
  }

  // The database function returns product IDs that match
  // We need to sync the product_collections table
  // This is handled by the database trigger, but we can manually trigger it
  const { data: collection } = await getCollection(collectionId);
  if (collection && collection.type === 'smart') {
    // Get all matching products
    const matchingProducts = data || [];
    
    // Get current products in collection
    const currentProducts = await getCollectionProducts(collectionId);
    const currentProductIds = currentProducts.map((p: Product) => p.id);

    // Add new products
    const toAdd = matchingProducts
      .filter((p: { product_id: string }) => !currentProductIds.includes(p.product_id))
      .map((p: { product_id: string }) => p.product_id);
    
    if (toAdd.length > 0) {
      await bulkAddProductsToCollection(toAdd, collectionId);
    }

    // Remove products that no longer match
    const toRemove = currentProductIds.filter(
      (id: string) => !matchingProducts.some((p: { product_id: string }) => p.product_id === id)
    );
    
    if (toRemove.length > 0) {
      await bulkRemoveProductsFromCollection(toRemove, collectionId);
    }
  }

  return { error: null };
}

export async function previewSmartCollection(conditions: CollectionCondition[], sellerId: string) {
  // This is a simplified preview - in production, you'd want to call a database function
  // that evaluates the conditions and returns matching products
  let query = supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('status', 'active');

  // Apply conditions (simplified - full implementation would be more complex)
  conditions.forEach((condition) => {
    switch (condition.type) {
      case 'tag':
        if (condition.operator === 'contains') {
          query = query.contains('tags', [condition.value]);
        }
        break;
      case 'price':
        if (condition.operator === 'greater_than' && condition.value) {
          query = query.gt('price', parseFloat(condition.value));
        } else if (condition.operator === 'less_than' && condition.value) {
          query = query.lt('price', parseFloat(condition.value));
        } else if (condition.operator === 'between' && condition.min && condition.max) {
          query = query.gte('price', parseFloat(condition.min)).lte('price', parseFloat(condition.max));
        }
        break;
      case 'category':
        if (condition.value) {
          query = query.eq('category_id', condition.value);
        }
        break;
      case 'stock':
        if (condition.operator === 'in_stock') {
          query = query.gt('stock_quantity', 0);
        } else if (condition.operator === 'out_of_stock') {
          query = query.eq('stock_quantity', 0);
        }
        break;
    }
  });

  const { data, error } = await query.limit(50); // Preview limit

  if (error) {
    console.error('Error previewing smart collection:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getProductCollections(productId: string) {
  const { data, error } = await supabase
    .from('product_collections')
    .select(`
      *,
      collection:collections(*)
    `)
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching product collections:', error);
    return [];
  }

  return data?.map((pc: any) => pc.collection).filter(Boolean) || [];
}

