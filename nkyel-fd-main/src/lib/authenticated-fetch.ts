/* Ñkyel AI · authenticated-fetch.ts · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ

   Centralized authenticated API client for cross-origin requests
   to the Ñkyel FastAPI backend (api.nkyel.smartandjai.com).

   Usage:
     const { authenticatedFetch } = useAuthenticatedFetch();
     const res = await authenticatedFetch('/api/auth/me');
     const data = await res.json();

   Or standalone (when you already have a getToken function):
     const res = await createAuthenticatedFetch(getTokenFn)('/api/auth/me');
*/

'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useMemo } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.nkyel.smartandjai.com';

/**
 * Creates an authenticated fetch function from a getToken function.
 * The returned function automatically:
 * 1. Retrieves the Clerk session token
 * 2. Adds Authorization: Bearer <token>
 * 3. Adds Content-Type: application/json (if body is provided)
 * 4. Handles 401 responses
 *
 * NEVER sends user_id from the browser as trusted identity.
 * Identity is derived from the JWT on the backend.
 */
export function createAuthenticatedFetch(
  getToken: () => Promise<string | null>,
) {
  return async function authenticatedFetch(
    path: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await getToken();

    if (!token) {
      console.warn('[Ñkyel Auth] No Clerk token available. User may not be signed in.');
      throw new AuthenticationError('No authentication token available');
    }

    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);

    // Add Content-Type for requests with a body (unless it's FormData)
    if (options.body && !(options.body instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.error('[Ñkyel Auth] 401 Unauthorized from FastAPI. Token may be expired or invalid.');
      // Don't automatically redirect — let the caller handle it.
      // The ClerkProvider will handle session expiry via its own mechanisms.
      throw new AuthenticationError(
        'Authentication failed. Your session may have expired.',
        response.status,
      );
    }

    return response;
  };
}

/**
 * React hook that provides an authenticated fetch function
 * using the current Clerk session.
 *
 * Usage:
 *   const { authenticatedFetch, getToken } = useAuthenticatedFetch();
 *   const res = await authenticatedFetch('/api/auth/me');
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = useMemo(
    () => createAuthenticatedFetch(getToken),
    [getToken],
  );

  return { authenticatedFetch, getToken };
}

/**
 * Custom error class for authentication failures.
 * Allows callers to distinguish auth errors from other fetch errors.
 */
export class AuthenticationError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}
