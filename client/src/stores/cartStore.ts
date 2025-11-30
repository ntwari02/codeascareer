import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  appliedCoupon: { code: string; discount: number } | null;
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (userId: string | null | undefined, product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  applyCoupon: (code: string, subtotal: number) => Promise<void>;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  appliedCoupon: null,

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
    } else {
      set({ loading: false });
    }
  },

  addToCart: async (userId, product, variant, quantity = 1) => {
    const variantId = variant?.id;
    const existing = get().items.find(
      item => item.product_id === product.id && item.variant_id === variantId
    );

    // Guest cart: keep everything client-side only
    if (!userId) {
      if (existing) {
        set({
          items: get().items.map(item =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + quantity, updated_at: new Date().toISOString() }
              : item
          ),
        });
      } else {
        const now = new Date().toISOString();
        const newItem: CartItem = {
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user_id: 'guest',
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
      return;
    }

    // Logged-in user: persist to Supabase
    if (existing) {
      await get().updateQuantity(existing.id, existing.quantity + quantity);
    } else {
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
      }
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const existing = get().items.find(item => item.id === itemId);
    if (!existing) return;

    // Guest cart item: update locally only
    if (itemId.startsWith('guest-')) {
      set({
        items: get().items.map(item =>
          item.id === itemId ? { ...item, quantity, updated_at: new Date().toISOString() } : item
        ),
      });
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
    }
  },

  removeItem: async (itemId: string) => {
    // Guest cart item: remove locally only
    if (itemId.startsWith('guest-')) {
      set({ items: get().items.filter(item => item.id !== itemId) });
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      set({ items: get().items.filter(item => item.id !== itemId) });
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

  applyCoupon: async (code: string, subtotal: number) => {
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

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    set({ appliedCoupon: { code: coupon.code, discount } });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
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
}));
