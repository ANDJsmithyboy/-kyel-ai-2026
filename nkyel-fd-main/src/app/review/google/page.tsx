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
 */

'use client';

import React, { useEffect, useState } from 'react';
import NkyelAppShell from '@/components/shell/NkyelAppShell';
import ChatPage from '@/app/(main)/chat/page';
import { getApiBaseUrl } from '@/lib/api';

export const GOOGLE_REVIEW_PATH = '/review/google';
export const REVIEW_PROFILE = 'google';

export default function GoogleReviewPage() {
  const [isReady, setIsReady] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function initializeGoogleReview() {
      const baseUrl = getApiBaseUrl();

      try {
        // 1. Initialize Google review session from backend
        const res = await fetch(`${baseUrl}/api/v1/review/google/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

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
          if (active) setIsReady(true);
          return;
        }

        // 2. Check if active session cookie already valid
        const statusRes = await fetch(`${baseUrl}/api/v1/review/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.active) {
            if (active) setIsReady(true);
            return;
          }
        }

        const errData = await res.json().catch(() => ({}));
        if (active) {
          setErrorNotice(errData.detail || 'Session Google Review indisponible.');
        }
      } catch (err) {
        console.warn('[Google Review Mode] Fallback notice:', err);
        // Fallback: if localStorage exists, proceed
        if (typeof window !== 'undefined' && localStorage.getItem('nkyel_review_token')) {
          if (active) setIsReady(true);
          return;
        }
        // Gracefully allow entry even if backend status was slow to respond
        if (active) setIsReady(true);
      }
    }

    initializeGoogleReview();

    return () => {
      active = false;
    };
  }, []);

  if (errorNotice) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090D] text-white p-6">
        <div className="max-w-md w-full p-8 text-center space-y-4 border border-white/10 rounded-2xl bg-[#0E121A]/80 backdrop-blur-xl">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-10 mx-auto" />
          <h1 className="text-lg font-bold text-neutral-200">Accès Google Review</h1>
          <p className="text-xs text-neutral-400">{errorNotice}</p>
        </div>
      </div>
    );
  }

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
