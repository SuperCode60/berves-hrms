import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { swError } from '@/lib/swal';

/** Laravel serves JSON under /api/v1; env often omits the path by mistake. */
function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '/api/v1';
  // e.g. http://127.0.0.1:8000 — no path
  if (/^https?:\/\/[^/]+$/i.test(raw)) return `${raw}/api/v1`;
  // e.g. http://host/api or /api — version segment missing
  if (/\/api$/i.test(raw)) return `${raw}/v1`;
  return raw;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
  withCredentials: false, // Bearer token auth — no cookies needed
  timeout: 20000,
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      swError('You do not have permission to perform this action.');
    } else if (status === 419) {
      swError('Session expired. Please refresh the page and log in again.');
    } else if (status >= 500) {
      swError('A server error occurred. Please try again.');
    } else if (message && status !== 422) {
      swError(message);
    }

    return Promise.reject(error);
  }
);

export default api;