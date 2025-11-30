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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user, loading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();

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
  },
}));
