import { create } from 'zustand';
  import api from '../utils/api';

  export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,

    login: async (username, password, rememberMe = false) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post('/auth/login', { username,
  password, rememberMe });

        if (!data.requiresTwoFactor) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({ user: data.user, token: data.token, isAuthenticated:
  true, isLoading: false });
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
        const { data } = await api.post('/auth/signup', { username,
  phone, password, referred_by, email });
        set({ isLoading: false });
        return data;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, token: null, isAuthenticated: false });
    },

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
  }));
