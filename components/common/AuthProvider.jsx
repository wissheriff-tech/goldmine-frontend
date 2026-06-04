'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';

export default function AuthProvider({ children }) {
  const { setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      useAuthStore.setState({ isInitializing: false });
      return;
    }

    setToken(token);
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
  }, []);

  return children;
}
