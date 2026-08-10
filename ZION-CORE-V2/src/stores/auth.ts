/* GabomaGPT · auth.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Authentification et gestion de session Open WebUI */

import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'pending';
  profile_image_url: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (v: boolean) => set({ isLoading: v }),
}));

// Initialize from localStorage on client side only
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    useAuthStore.setState({ token, isAuthenticated: true, isLoading: false });
  } else {
    useAuthStore.setState({ isLoading: false });
  }
}

/* ── API Auth helpers ──────────────────────────────── */
const BASE = '/api/v1';

export async function signIn(email: string, password: string) {
  const res = await fetch(`${BASE}/auths/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Échec de connexion');
  }
  return res.json();
}

export async function signUp(name: string, email: string, password: string) {
  const res = await fetch(`${BASE}/auths/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Échec de l'inscription");
  }
  return res.json();
}

export async function getUser(token: string): Promise<User> {
  const res = await fetch(`${BASE}/auths/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session expirée');
  return res.json();
}
