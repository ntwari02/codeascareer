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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    set({ user: null });
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Map backend user to Profile format (MongoDB uses _id)
      const userProfile: Profile = {
        id: data.user.id?.toString() || data.user._id?.toString() || '',
        email: data.user.email,
        full_name: data.user.fullName,
        role: data.user.role,
        seller_status: data.user.sellerVerificationStatus,
        seller_verified: data.user.isSellerVerified,
        phone: undefined,
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store token in localStorage for persistence
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(userProfile));

      set({ user: userProfile, loading: false });
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error. Please try again.' };
    }
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
      // Check for stored user from MongoDB backend
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const token = localStorage.getItem('auth_token');
          
          // Verify token is still valid by calling /me endpoint
          if (token) {
            try {
              const response = await fetch('http://localhost:5000/api/auth/me', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
              });

              if (response.ok) {
                const data = await response.json();
                // Map backend user to Profile format (MongoDB uses _id)
                const userProfile: Profile = {
                  id: data.user._id?.toString() || data.user.id?.toString() || '',
                  email: data.user.email,
                  full_name: data.user.fullName,
                  role: data.user.role,
                  seller_status: data.user.sellerVerificationStatus,
                  seller_verified: data.user.isSellerVerified,
                  phone: undefined,
                  avatar_url: undefined,
                  created_at: data.user.createdAt || new Date().toISOString(),
                  updated_at: data.user.updatedAt || new Date().toISOString(),
                };
                // Update localStorage with fresh data
                localStorage.setItem('user', JSON.stringify(userProfile));
                set({ user: userProfile, loading: false, initialized: true });
                return;
              } else {
                // Token invalid, clear storage
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
              }
            } catch (e) {
              // Network error, use stored user
              set({ user, loading: false, initialized: true });
              return;
            }
          } else {
            set({ user, loading: false, initialized: true });
            return;
          }
        } catch (e) {
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
        }
      }

      // Check for demo user (fallback)
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

      // Try Supabase session (legacy)
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
