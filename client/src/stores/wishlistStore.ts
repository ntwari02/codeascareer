import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { WishlistItem, Product } from '../types';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  addToWishlist: (userId: string | null | undefined, product: Product) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (!error && data) {
      set({ items: data as WishlistItem[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  addToWishlist: async (userId, product) => {
    const existing = get().items.find(item => item.product_id === product.id);

    // Guest wishlist: keep everything client-side only
    if (!userId) {
      if (existing) return;

      const now = new Date().toISOString();
      const newItem: WishlistItem = {
        id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user_id: 'guest',
        product_id: product.id,
        created_at: now,
        product,
      };
      set({ items: [...get().items, newItem] });
      return;
    }

    // Logged-in user: persist to Supabase
    if (existing && !existing.id.startsWith('guest-')) return;

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: userId, product_id: product.id })
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (!error && data) {
      set({ items: [...get().items.filter(i => !i.id.startsWith('guest-') || i.product_id !== product.id), data as WishlistItem] });
    }
  },

  removeFromWishlist: async (itemId: string) => {
    // Guest wishlist item: remove locally only
    if (itemId.startsWith('guest-')) {
      set({ items: get().items.filter(item => item.id !== itemId) });
      return;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      set({ items: get().items.filter(item => item.id !== itemId) });
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.product_id === productId);
  },
}));
