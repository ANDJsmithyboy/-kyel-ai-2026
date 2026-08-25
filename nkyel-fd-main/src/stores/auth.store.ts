/* Nkyel AI · auth.store.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Store authentification Zustand */

import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'pending';
  profile_image_url: string;
  token?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user: User | null) => {
    if (typeof window !== 'undefined' && user?.token) {
      localStorage.setItem('token', user.token);
    }
    set({ user, token: user?.token || null, isAuthenticated: !!user, isLoading: false });
  },

  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('nkyel_user_email');
      localStorage.removeItem('nkyel_access_token');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (v: boolean) => set({ isLoading: v }),
}));
