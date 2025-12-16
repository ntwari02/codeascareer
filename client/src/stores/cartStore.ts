import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useToastStore } from './toastStore';
import type { CartItem, Product, ProductVariant, Profile } from '../types';

export interface SellerGroup {
  sellerId: string;
  seller: Profile | null;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon: { code: string; discount: number } | null;
  shippingMethod?: string;
  deliveryEstimate?: string;
  isAvailable: boolean;
  warnings: string[];
}

export interface CartValidation {
  itemId: string;
  isValid: boolean;
  warnings: string[];
  priceChanged?: boolean;
  stockChanged?: boolean;
  unavailable?: boolean;
}

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  selectedItems: Set<string>;
  loading: boolean;
  validating: boolean;
  appliedCoupon: { code: string; discount: number } | null;
  sellerCoupons: Record<string, { code: string; discount: number }>;
  selectedSellers: Set<string>;
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (userId: string | null | undefined, product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeItemsBySeller: (sellerId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  applyCoupon: (code: string, subtotal: number, sellerId?: string) => Promise<void>;
  removeCoupon: (sellerId?: string) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getSellerGroups: () => Promise<SellerGroup[]>;
  validateCart: () => Promise<CartValidation[]>;
  syncCartPrices: () => Promise<void>;
  selectSeller: (sellerId: string, selected: boolean) => void;
  selectAllSellers: () => void;
  deselectAllSellers: () => void;
  getSelectedItems: () => CartItem[];
  getSelectedSubtotal: () => number;
  getSelectedTotal: () => number;
  selectItem: (itemId: string, selected: boolean) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  removeSelectedItems: () => Promise<void>;
  moveSelectedToWishlist: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  savedForLater: [],
  selectedItems: new Set<string>(),
  loading: false,
  validating: false,
  appliedCoupon: null,
  sellerCoupons: {},
  selectedSellers: new Set<string>(),

  fetchCart: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*, images:product_images(url, position)),
        variant:product_variants(*)
      `)
      .eq('user_id', userId);

    if (!error && data) {
      set({ items: data as CartItem[], loading: false });
      // Auto-select all sellers by default
      const sellerIds = new Set(data.map((item: CartItem) => item.product?.seller_id).filter(Boolean));
      set({ selectedSellers: sellerIds });
      // Validate cart after fetching (don't await to avoid blocking)
      get().validateCart().catch(err => console.error('Cart validation error:', err));
    } else {
      // Only clear items if there's an actual error, not if cart is just empty
      if (error) {
        console.error('Error fetching cart:', error);
        // Don't clear items on error - keep existing items
      } else {
        // Cart is empty - set empty array
        set({ items: [], loading: false });
      }
    }
  },

  addToCart: async (userId, product, variant, quantity = 1) => {
    // Flowchart Step 1: Buyer Clicks Add to Cart
    // Flowchart Step 2: Check if Buyer is Logged In
    // - If not logged in (userId is null/undefined), proceed with guest mode
    // - If logged in, proceed with user cart
    // - If demo user (userId starts with 'demo-'), treat as guest mode
    
    const variantId = variant?.id;
    
    // Flowchart Step 3: Check if Product Already in Cart
    const existing = get().items.find(
      item => item.product_id === product.id && item.variant_id === variantId
    );

    // Guest cart or demo user: keep everything client-side only
    const isGuestOrDemo = !userId || userId.startsWith('demo-');
    if (isGuestOrDemo) {
      // Flowchart: Not Logged In → Guest Mode → Proceed to Cart
      if (existing) {
        // Flowchart: Product Already in Cart → Increase Quantity
        set({
          items: get().items.map(item =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + quantity, updated_at: new Date().toISOString() }
              : item
          ),
        });
      } else {
        // Flowchart: Product Not in Cart → Add Product as New Cart Item
        const now = new Date().toISOString();
        const newItem: CartItem = {
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: userId || 'guest',
          product_id: product.id,
          variant_id: variantId,
          quantity,
          created_at: now,
          updated_at: now,
          product,
          variant,
        };
        set({ items: [...get().items, newItem] });
      }
      // Save to localStorage for guest/demo users
      const currentItems = get().items;
      localStorage.setItem('guest_cart', JSON.stringify(currentItems));
      
      // Show toast notification
      const toastStore = useToastStore.getState();
      if (existing) {
        toastStore.showToast(`${product.title} quantity updated in cart!`, 'success');
      } else {
        toastStore.showToast(`${product.title} added to cart!`, 'success');
      }
      
      // After adding/updating, cart will automatically recalculate via useEffect in Cart component
      // Flowchart: → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
      return;
    }

    // Real logged-in user: persist to Supabase
    if (existing) {
      // Flowchart: Product Already in Cart → Increase Quantity
      await get().updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      // Flowchart: Product Not in Cart → Add Product as New Cart Item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: product.id,
          variant_id: variantId,
          quantity,
        })
        .select(`
          *,
          product:products(*, images:product_images(url, position)),
          variant:product_variants(*)
        `)
        .single();

      if (!error && data) {
        set({ items: [...get().items, data as CartItem] });
        
        // Show toast notification
        const toastStore = useToastStore.getState();
        toastStore.showToast(`${product.title} added to cart!`, 'success');
      } else if (error) {
        // If Supabase fails, fall back to localStorage for demo/guest mode
        console.warn('Failed to add to cart in Supabase, using localStorage:', error);
        const now = new Date().toISOString();
        const newItem: CartItem = {
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: userId,
          product_id: product.id,
          variant_id: variantId,
          quantity,
          created_at: now,
          updated_at: now,
          product,
          variant,
        };
        set({ items: [...get().items, newItem] });
        localStorage.setItem('guest_cart', JSON.stringify(get().items));
      }
    }
    // After adding/updating, cart will automatically recalculate via useEffect in Cart component
    // Flowchart: → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    // Flowchart: User Updates Cart → Change Quantity → Loop back to Increase Quantity
    const existing = get().items.find(item => item.id === itemId);
    if (!existing) return;

    // Guest cart item: update locally only
    if (itemId.startsWith('guest-')) {
      set({
        items: get().items.map(item =>
          item.id === itemId ? { ...item, quantity, updated_at: new Date().toISOString() } : item
        ),
      });
      // Flowchart: After quantity change → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (!error) {
      set({
        items: get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
      // Flowchart: After quantity change → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
    }
  },

  removeItem: async (itemId: string) => {
    // Flowchart: User Updates Cart → Remove Item → Delete Cart Item → Loop back to Group Items by Seller
    const item = get().items.find(i => i.id === itemId);
    const productTitle = item?.product?.title || 'Item';
    
    // Guest cart item: remove locally only
    if (itemId.startsWith('guest-')) {
      set({ items: get().items.filter(item => item.id !== itemId) });
      
      // Show toast notification
      const toastStore = useToastStore.getState();
      toastStore.showToast(`${productTitle} removed from cart`, 'success');
      
      // Flowchart: After removal → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      set({ items: get().items.filter(item => item.id !== itemId) });
      
      // Show toast notification
      const toastStore = useToastStore.getState();
      toastStore.showToast(`${productTitle} removed from cart`, 'success');
      
      // Flowchart: After removal → Group Items by Seller → Recalculate Subtotal → Calculate Shipping → Calculate Taxes
    }
  },

  clearCart: async (userId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (!error) {
      set({ items: [], appliedCoupon: null });
    }
  },

  applyCoupon: async (code: string, subtotal: number, sellerId?: string) => {
    // Flowchart: User Updates Cart → Apply Coupon → Validate Coupon → Apply Discount → Update Cart Summary
    // Step 1: Validate Coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      throw new Error('Coupon has expired');
    }

    if (subtotal < coupon.min_purchase_amount) {
      throw new Error(`Minimum purchase amount is $${coupon.min_purchase_amount}`);
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit reached');
    }

    // Step 2: Apply Discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    // Step 3: Update Cart Summary (store discount)
    if (sellerId) {
      set({ sellerCoupons: { ...get().sellerCoupons, [sellerId]: { code: coupon.code, discount } } });
    } else {
      set({ appliedCoupon: { code: coupon.code, discount } });
    }
    // Flowchart: After discount applied → Update Cart Summary → Recalculate totals
  },

  removeCoupon: (sellerId?: string) => {
    if (sellerId) {
      const { [sellerId]: removed, ...rest } = get().sellerCoupons;
      set({ sellerCoupons: rest });
    } else {
      set({ appliedCoupon: null });
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.variant?.price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().appliedCoupon?.discount || 0;
    return Math.max(0, subtotal - discount);
  },

  getSellerGroups: async (): Promise<SellerGroup[]> => {
    // Flowchart: Group Items by Seller → Recalculate Subtotal → Calculate Shipping Per Seller → Calculate Taxes
    const items = get().items;
    const groups: Record<string, SellerGroup> = {};

    // Step 1: Group Items by Seller
    for (const item of items) {
      if (!item.product?.seller_id) continue;
      const sellerId = item.product.seller_id;

      if (!groups[sellerId]) {
        // Fetch seller profile
        const { data: seller } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .maybeSingle();

        groups[sellerId] = {
          sellerId,
          seller: seller as Profile | null,
          items: [],
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          discount: 0,
          total: 0,
          appliedCoupon: get().sellerCoupons[sellerId] || null,
          isAvailable: true,
          warnings: [],
        };
      }

      groups[sellerId].items.push(item);
      const price = item.variant?.price || item.product?.price || 0;
      // Step 2: Recalculate Subtotal (per seller)
      groups[sellerId].subtotal += price * item.quantity;
    }

    // Step 3: Calculate totals for each group
    const result = Object.values(groups).map(group => {
      const discount = group.appliedCoupon?.discount || 0;
      const subtotalAfterDiscount = Math.max(0, group.subtotal - discount);
      // Step 4: Calculate Taxes (per seller)
      group.tax = subtotalAfterDiscount * 0.1;
      // Step 5: Calculate Shipping Per Seller
      group.shippingCost = 5;
      group.total = subtotalAfterDiscount + group.tax + group.shippingCost;
      return group;
    });

    return result;
  },

  validateCart: async (): Promise<CartValidation[]> => {
    set({ validating: true });
    const items = get().items;
    const validations: CartValidation[] = [];

    for (const item of items) {
      if (!item.product_id) continue;

      const validation: CartValidation = {
        itemId: item.id,
        isValid: true,
        warnings: [],
      };

      // Fetch current product data
      const { data: product } = await supabase
        .from('products')
        .select('*, variant:product_variants(*)')
        .eq('id', item.product_id)
        .maybeSingle();

      if (!product || product.status !== 'active') {
        validation.isValid = false;
        validation.unavailable = true;
        validation.warnings.push('Product is no longer available');
      } else {
        const currentPrice = item.variant_id
          ? product.variant?.find((v: ProductVariant) => v.id === item.variant_id)?.price || product.price
          : product.price;
        const cartPrice = item.variant?.price || item.product?.price || 0;

        if (currentPrice !== cartPrice) {
          validation.priceChanged = true;
          validation.warnings.push(`Price changed from ${cartPrice} to ${currentPrice}`);
        }

        const currentStock = item.variant_id
          ? product.variant?.find((v: ProductVariant) => v.id === item.variant_id)?.stock_quantity || product.stock_quantity
          : product.stock_quantity;

        if (currentStock < item.quantity) {
          validation.isValid = false;
          validation.stockChanged = true;
          validation.warnings.push(`Only ${currentStock} items available (requested ${item.quantity})`);
        }
      }

      validations.push(validation);
    }

    set({ validating: false });
    return validations;
  },

  syncCartPrices: async () => {
    const items = get().items;
    const updatedItems: CartItem[] = [];

    for (const item of items) {
      // Keep guest items and items without product_id as-is
      if (!item.product_id || item.id.startsWith('guest-')) {
        updatedItems.push(item);
        continue;
      }

      // Only sync prices for logged-in user items with product_id
      const { data: product } = await supabase
        .from('products')
        .select('*, images:product_images(url, position), variant:product_variants(*)')
        .eq('id', item.product_id)
        .maybeSingle();

      if (product) {
        const currentPrice = item.variant_id
          ? product.variant?.find((v: ProductVariant) => v.id === item.variant_id)?.price || product.price
          : product.price;

        updatedItems.push({
          ...item,
          product: product as Product,
          variant: item.variant_id
            ? product.variant?.find((v: ProductVariant) => v.id === item.variant_id)
            : undefined,
        });
      } else {
        // Keep item even if product not found (might be deleted)
        updatedItems.push(item);
      }
    }

    set({ items: updatedItems });
  },

  selectSeller: (sellerId: string, selected: boolean) => {
    const selectedSellers = new Set(get().selectedSellers);
    if (selected) {
      selectedSellers.add(sellerId);
    } else {
      selectedSellers.delete(sellerId);
    }
    set({ selectedSellers });
  },

  selectAllSellers: () => {
    const items = get().items;
    const sellerIds = new Set(items.map(item => item.product?.seller_id).filter(Boolean));
    set({ selectedSellers: sellerIds });
  },

  deselectAllSellers: () => {
    set({ selectedSellers: new Set() });
  },

  removeItemsBySeller: async (sellerId: string) => {
    const items = get().items;
    const itemsToRemove = items.filter(item => item.product?.seller_id === sellerId);
    
    for (const item of itemsToRemove) {
      await get().removeItem(item.id);
    }
  },

  getSelectedItems: () => {
    const items = get().items;
    const selectedSellers = get().selectedSellers;
    return items.filter(item => item.product?.seller_id && selectedSellers.has(item.product.seller_id));
  },

  getSelectedSubtotal: () => {
    return get().getSelectedItems().reduce((sum, item) => {
      const price = item.variant?.price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  },

  getSelectedTotal: () => {
    const subtotal = get().getSelectedSubtotal();
    const discount = get().appliedCoupon?.discount || 0;
    // Simple calculation - in real app, calculate shipping and tax per seller
    const estimatedShipping = get().selectedSellers.size * 5;
    const estimatedTax = (subtotal - discount) * 0.1;
    return Math.max(0, subtotal - discount + estimatedShipping + estimatedTax);
  },

  saveForLater: async (itemId: string) => {
    const item = get().items.find(i => i.id === itemId);
    if (!item) return;

    // Remove from cart
    await get().removeItem(itemId);
    
    // Add to saved for later
    set({ savedForLater: [...get().savedForLater, item] });
    
    // Save to localStorage for guest users
    const savedItems = get().savedForLater;
    if (item.user_id?.startsWith('guest-')) {
      localStorage.setItem('saved_for_later', JSON.stringify(savedItems));
    }
  },

  moveToCart: async (itemId: string) => {
    const item = get().savedForLater.find(i => i.id === itemId);
    if (!item || !item.product) return;

    // Remove from saved for later
    set({ savedForLater: get().savedForLater.filter(i => i.id !== itemId) });
    
    // Add back to cart
    const userId = item.user_id && !item.user_id.startsWith('guest-') ? item.user_id : null;
    await get().addToCart(userId, item.product, item.variant, item.quantity);
  },

  selectItem: (itemId: string, selected: boolean) => {
    const selectedItems = new Set(get().selectedItems);
    if (selected) {
      selectedItems.add(itemId);
    } else {
      selectedItems.delete(itemId);
    }
    set({ selectedItems });
  },

  selectAllItems: () => {
    const itemIds = new Set(get().items.map(item => item.id));
    set({ selectedItems: itemIds });
  },

  deselectAllItems: () => {
    set({ selectedItems: new Set() });
  },

  removeSelectedItems: async () => {
    const selectedItems = get().selectedItems;
    for (const itemId of selectedItems) {
      await get().removeItem(itemId);
    }
    set({ selectedItems: new Set() });
  },

  moveSelectedToWishlist: async () => {
    const { useWishlistStore } = await import('./wishlistStore');
    const { addToWishlist } = useWishlistStore.getState();
    const selectedItems = get().selectedItems;
    const items = get().items;
    
    for (const itemId of selectedItems) {
      const item = items.find(i => i.id === itemId);
      if (item?.product) {
        const userId = item.user_id && !item.user_id.startsWith('guest-') ? item.user_id : null;
        await addToWishlist(userId, item.product);
        await get().removeItem(itemId);
      }
    }
    set({ selectedItems: new Set() });
  },
}));
