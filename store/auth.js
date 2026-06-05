import { create } from 'zustand';
import api from '../utils/api';

// C-5 FIX: Auth tokens must ONLY be stored in httpOnly cookies (set by the server).
// localStorage is accessible to JavaScript and therefore vulnerable to XSS attacks.
// All localStorage.setItem / localStorage.removeItem calls for tokens have been removed.
// The server already sets the access_token and refresh_token as httpOnly cookies on
// every successful login / token refresh response; the browser sends them automatically.

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitializing: true,

  login: async (username, password, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { username, password, rememberMe });
      if (!data.requiresTwoFactor) {
        // Token is already set as an httpOnly cookie by the server — do not store in localStorage.
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (username, phone, password, referred_by, email) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/signup', { username, phone, password, referred_by, email });
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // best-effort — clear client state regardless
    }
    // No localStorage tokens to remove — cookies are cleared by the server response.
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
