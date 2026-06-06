'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';

export default function AuthProvider({ children }) {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    // Session is carried by httpOnly cookie — always probe the API on mount
    // to rehydrate auth state without touching localStorage.
    api.get('/user/dashboard')
      .then(({ data }) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        useAuthStore.setState({ isInitializing: false });
      });

    // Keep the backend warm — ping every 4 min to prevent Vercel cold starts
    const ping = () => api.get('/health').catch(() => {});
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return children;
}
