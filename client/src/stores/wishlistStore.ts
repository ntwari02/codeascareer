import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useToastStore } from './toastStore';
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
    
    // Frontend-only: Load from localStorage instead of Supabase
    try {
      const stored = localStorage.getItem(`wishlist_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ items: parsed, loading: false });
        return;
      }
    } catch (e) {
      console.error('Failed to load wishlist from localStorage', e);
    }
    
    // Fallback: Try Supabase if available, but don't fail if it errors
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (!error && data) {
        set({ items: data as WishlistItem[], loading: false });
        // Save to localStorage for offline access
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(data));
      } else {
        set({ loading: false });
      }
    } catch (error) {
      // Supabase not available - just use localStorage
      console.log('Supabase not available, using localStorage only');
      set({ loading: false });
    }
  },

  addToWishlist: async (userId, product) => {
    const existing = get().items.find(item => item.product_id === product.id);

    // Frontend-only: Always use localStorage
    if (existing) return;

    const now = new Date().toISOString();
    const itemId = userId 
      ? `user-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const newItem: WishlistItem = {
      id: itemId,
      user_id: userId || 'guest',
      product_id: product.id,
      created_at: now,
      product,
    };

    const updatedItems = [...get().items, newItem];
    set({ items: updatedItems });

    // Save to localStorage
    if (userId) {
      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedItems));
    } else {
      localStorage.setItem('guest_wishlist', JSON.stringify(updatedItems));
    }

    // Show toast notification
    const toastStore = useToastStore.getState();
    toastStore.showToast(`${product.title} added to wishlist!`, 'success');

    // Try to save to Supabase if available (non-blocking)
    if (userId) {
      try {
        await supabase
          .from('wishlist_items')
          .insert({ user_id: userId, product_id: product.id });
      } catch (error) {
        // Supabase not available - that's okay, we have localStorage
        console.log('Supabase not available, saved to localStorage only');
      }
    }
  },

  removeFromWishlist: async (itemId: string) => {
    const item = get().items.find(i => i.id === itemId);
    const userId = item?.user_id;
    const productTitle = item?.product?.title || 'Item';
    
    // Remove from state
    const updatedItems = get().items.filter(item => item.id !== itemId);
    set({ items: updatedItems });

    // Save to localStorage
    if (userId && userId !== 'guest') {
      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedItems));
    } else {
      localStorage.setItem('guest_wishlist', JSON.stringify(updatedItems));
    }

    // Show toast notification
    const toastStore = useToastStore.getState();
    toastStore.showToast(`${productTitle} removed from wishlist`, 'success');

    // Try to remove from Supabase if available (non-blocking)
    if (userId && userId !== 'guest' && !itemId.startsWith('guest-') && !itemId.startsWith('user-')) {
      try {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', itemId);
      } catch (error) {
        // Supabase not available - that's okay, we have localStorage
        console.log('Supabase not available, removed from localStorage only');
      }
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.product_id === productId);
  },
}));
