/**
 * Ñkyel AI · useNeonSync Hook
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * PRODUCTION CONTRACT: On every Clerk login, sync user to Neon.
 * Creates user + preferences if first login.
 * Uses centralized authenticated-fetch for Bearer token handling.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthenticatedFetch } from '@/lib/authenticated-fetch';

interface SyncResult {
  status: string;
  user_id: string;
  clerk_id: string;
  email: string;
  role: string;
  is_admin: boolean;
}

/**
 * Call this hook once in your root layout or app shell.
 * It syncs Clerk → Neon on login via /api/auth/sync-clerk-user.
 */
export function useNeonSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || synced.current) return;

    const doSync = async () => {
      try {
        // Sync Clerk user to Neon PostgreSQL via FastAPI
        // Route: POST /api/auth/sync-clerk-user
        // Body matches backend SyncClerkUserRequest schema
        const syncRes = await authenticatedFetch('/api/auth/sync-clerk-user', {
          method: 'POST',
          body: JSON.stringify({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: user.fullName || user.firstName || 'Utilisateur',
            avatar_url: user.imageUrl || '',
          }),
        });

        if (syncRes.ok) {
          const data: SyncResult = await syncRes.json();

          // Store user_id for other stores to use
          if (typeof window !== 'undefined') {
            window.__nkyel_user_id = data.user_id;
          }

          console.log(
            `[NeonSync] Utilisateur synchronisé: ${data.status}`,
            { userId: data.user_id, role: data.role, isAdmin: data.is_admin }
          );
        } else {
          const errBody = await syncRes.json().catch(() => ({}));
          console.error('[NeonSync] Sync failed:', syncRes.status, errBody);
        }

        synced.current = true;
      } catch (err) {
        console.error('[NeonSync] Erreur de synchronisation:', err);
        // Mark as synced to avoid infinite retry loops
        synced.current = true;
      }
    };

    doSync();
  }, [isLoaded, isSignedIn, user, authenticatedFetch]);
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
