/* Nkyel AI · auth.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Authentification et gestion de session Open WebUI */

export * from './auth.store';
import { useAuthStore, type User } from './auth.store';

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
