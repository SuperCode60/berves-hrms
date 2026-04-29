import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      login: (user, token) => {
        if (!token) return;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      /* alias kept for backwards compat */
      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => {
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));
      },

      initAuth: () => {
        const token = localStorage.getItem('token');
        const raw   = localStorage.getItem('user');
        if (token && raw) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, user: JSON.parse(raw), isAuthenticated: true });
          return true;
        }
        return false;
      },
    }),
    { name: 'auth-storage' }
  )
);
