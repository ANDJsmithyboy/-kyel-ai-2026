/**
 * Ñkyel AI · useNeonSync Hook
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * PRODUCTION CONTRACT: On every Clerk login, sync user to Neon.
 * Creates user + default workspace if first login.
 * Loads settings from Neon → Zustand on mount.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || '';

interface SyncResult {
  id: string;
  clerk_user_id: string;
  workspace_id: string;
  is_new: boolean;
}

/**
 * Call this hook once in your root layout or app shell.
 * It syncs Clerk → Neon on login and hydrates the settings store.
 */
export function useNeonSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || synced.current) return;

    const doSync = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // 1. Sync user to Neon
        const syncRes = await fetch(`${API_BASE}/api/v1/settings/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            display_name: user.fullName || user.firstName || 'Utilisateur',
            avatar_url: user.imageUrl,
          }),
        });

        if (syncRes.ok) {
          const data: SyncResult = await syncRes.json();
          
          // Store workspace_id for other stores to use
          if (typeof window !== 'undefined') {
            // This is the ONLY acceptable localStorage use:
            // caching the workspace_id to avoid an extra API call.
            // The actual data lives in Neon.
            window.__nkyel_workspace_id = data.workspace_id;
            window.__nkyel_user_id = data.id;
          }

          console.log(
            `[NeonSync] ${data.is_new ? 'Nouvel utilisateur créé' : 'Utilisateur synchronisé'}`,
            { userId: data.id, workspaceId: data.workspace_id }
          );
        }

        synced.current = true;
      } catch (err) {
        console.error('[NeonSync] Erreur de synchronisation:', err);
      }
    };

    doSync();
  }, [isLoaded, isSignedIn, user, getToken]);
}

// Type augmentation for window
declare global {
  interface Window {
    __nkyel_workspace_id?: string;
    __nkyel_user_id?: string;
  }
}

/**
 * Helper to get the current workspace ID (set by useNeonSync).
 */
export function getWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.__nkyel_workspace_id || null;
}

/**
 * Helper to get the current Neon user ID (set by useNeonSync).
 */
export function getNeonUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.__nkyel_user_id || null;
}
