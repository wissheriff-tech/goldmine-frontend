import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// C-5 FIX: withCredentials ensures the httpOnly cookie (access_token) is sent on every
// request. Tokens must never be stored in or read from localStorage.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Best-effort server-side session invalidation, then redirect to login.
      // The server will clear the httpOnly cookies via Set-Cookie on the /logout response.
      api.post('/auth/logout').catch(() => {});
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
