import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Pages that don't require authentication — 401 here should NOT redirect to /login
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/terms', '/privacy', '/contact'];

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30s — tolerates Vercel cold starts
  headers: { 'Content-Type': 'application/json' },
});

// Only redirect to /login on 401 from protected pages.
// Never redirect on network errors/timeouts (cold start).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    if (is401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p));
      if (!isPublic) {
        api.post('/auth/logout').catch(() => {});
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
