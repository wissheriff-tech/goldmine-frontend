'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';

export default function AuthProvider({ children }) {
  const { setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Restore user from token on every page load
    setToken(token);
    api.get('/user/dashboard')
      .then(({ data }) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        // Token invalid/expired — clear auth state
        logout();
      });
  }, []);

  return children;
}
