import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  demoLogin: (email: string, name?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('demo_user');
    set({ user: null });
  },

  demoLogin: (email: string, name?: string) => {
    // Create a mock user profile for demo purposes
    const demoUser: Profile = {
      id: 'demo-user-' + Date.now(),
      email: email,
      full_name: name || email.split('@')[0],
      avatar_url: undefined,
      role: 'buyer',
      phone: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    set({ user: demoUser, loading: false });
  },

  initialize: async () => {
    try {
      // Check for demo user first
      const demoUserStr = localStorage.getItem('demo_user');
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          set({ user: demoUser, loading: false, initialized: true });
          return;
        } catch (e) {
          localStorage.removeItem('demo_user');
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const session = data?.session;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        set({ user: profile, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        (async () => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            set({ user: profile, loading: false });
          } else {
            set({ user: null, loading: false });
          }
        })();
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
