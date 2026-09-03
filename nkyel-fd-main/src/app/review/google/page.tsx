/**
 * Ñkyel AI — Google Review Production Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * CRITICAL PERMANENT IMMUTABLE ROUTE:
 * https://nkyel.smartandjai.com/review/google/
 *
 * Direct entry point for Google application reviewers.
 * - Resolves HTTP 200 directly
 * - Zero redirect loop / No Clerk auth wall
 * - Clean browser & incognito support
 * - Automatically initializes restricted Google review session
 * - Mounts the REAL sovereign Ñkyel application shell and chat workspace
 * - Hardened with 8s maximum spinner safety net and 5s fetch timeouts
 */

'use client';

import React, { useEffect, useState } from 'react';
import NkyelAppShell from '@/components/shell/NkyelAppShell';
import ChatPage from '@/app/(main)/chat/page';
import { getApiBaseUrl } from '@/lib/api';

export const GOOGLE_REVIEW_PATH = '/review/google';
export const CANONICAL_GOOGLE_TOKEN = 'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0';
export const REVIEW_PROFILE = 'google';

export default function GoogleReviewPage({ initialToken }: { initialToken?: string } = {}) {
  const [isReady, setIsReady] = useState(false);
  const effectiveToken = initialToken || CANONICAL_GOOGLE_TOKEN;

  useEffect(() => {
    let active = true;
    let settled = false;

    const markReady = () => {
      if (active && !settled) {
        settled = true;
        setIsReady(true);
      }
    };

    // Filet de sécurité absolu : jamais plus de 8s de spinner, quoi qu'il arrive
    const hardTimeout = setTimeout(markReady, 8000);

    const withTimeout = (url: string, opts: RequestInit, ms = 5000) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), ms);
      return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(t));
    };

    async function initializeGoogleReview() {
      try {
        const baseUrl = getApiBaseUrl(); // Maintenant DANS le try

        // 1. Authenticate with the canonical Google review token
        const res = await withTimeout(`${baseUrl}/api/v1/review/auth/${effectiveToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }, 5000);

        if (res.ok) {
          const data = await res.json();
          if (typeof window !== 'undefined') {
            if (data.session_token) {
              localStorage.setItem('nkyel_review_token', data.session_token);
            }
            if (data.workspace_id) {
              localStorage.setItem('nkyel_review_workspace', data.workspace_id);
              window.__nkyel_workspace_id = data.workspace_id;
            }
          }
          return markReady();
        }

        // 2. Fallback to /google/session
        const sessionRes = await withTimeout(`${baseUrl}/api/v1/review/google/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }, 5000);

        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (typeof window !== 'undefined') {
            if (data.session_token) {
              localStorage.setItem('nkyel_review_token', data.session_token);
            }
            if (data.workspace_id) {
              localStorage.setItem('nkyel_review_workspace', data.workspace_id);
              window.__nkyel_workspace_id = data.workspace_id;
            }
          }
          return markReady();
        }

        // 3. Fallback: check status
        const statusRes = await withTimeout(`${baseUrl}/api/v1/review/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }, 5000);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.active) {
            return markReady();
          }
        }
      } catch (err) {
        console.warn('[Google Review] Auth notice:', err);
      } finally {
        markReady(); // Toujours atteint — timeout, succès ou erreur
      }
    }

    initializeGoogleReview();

    return () => {
      active = false;
      clearTimeout(hardTimeout);
    };
  }, [effectiveToken]);

  if (!isReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090D] text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#D5AE57] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 font-mono tracking-wide">
            Initialisation de l&apos;espace souverain Google Review…
          </p>
        </div>
      </div>
    );
  }

  // Mount the REAL sovereign product surfaces
  return (
    <NkyelAppShell>
      <ChatPage />
    </NkyelAppShell>
  );
}
