import { create } from 'zustand';
import { getCurrentUser, onAuthStateChange } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { user, session } = await getCurrentUser();
      set({
        user,
        session,
        loading: false,
        isAuthenticated: !!user
      });
    } catch (error) {
      set({ error, loading: false });
    }

    onAuthStateChange((event, session) => {
      set({
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user
      });
    });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set({
    user: null,
    session: null,
    loading: false,
    error: null,
    isAuthenticated: false
  })
}));
