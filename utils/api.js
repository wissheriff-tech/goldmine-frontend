import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // 30s — tolerates Vercel cold starts
  headers: { 'Content-Type': 'application/json' },
});

// Only redirect to /login on 401 — never on network errors or timeouts.
// Network errors during cold start should NOT log the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (is401 && !onLoginPage) {
      api.post('/auth/logout').catch(() => {});
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
