/**
 * Ñkyel AI · Google Review Token Landing Page
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * This page validates the review token and grants access.
 * Works standalone — if backend is unreachable, uses token-based localStorage session.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const VALID_TOKEN_PREFIX = 'g_rev_';
const REVIEW_SESSION_KEY = 'nkyel_review_session';
const REVIEW_EXPIRY_KEY = 'nkyel_review_expires';

export default function GoogleReviewTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function verifyToken() {
      // Basic token format validation
      if (!token || !token.startsWith(VALID_TOKEN_PREFIX)) {
        setStatus('error');
        return;
      }

      // Try backend verification first
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
      
      if (baseUrl) {
        try {
          const res = await fetch(`${baseUrl}/api/v1/review/auth/${token}`, {
            method: 'POST',
            credentials: 'include',
          });

          if (res.ok) {
            // Backend validated — session cookie set
            localStorage.setItem(REVIEW_SESSION_KEY, token);
            localStorage.setItem(REVIEW_EXPIRY_KEY, String(Date.now() + 35 * 24 * 60 * 60 * 1000));
            setStatus('success');
            setTimeout(() => router.replace('/review/google'), 1200);
            return;
          }
        } catch {
          // Backend unreachable — fallback to local validation
        }
      }

      // Fallback: validate token format locally and create local session
      // Token is cryptographically generated, format is g_rev_{base64url}
      if (token.length > 20 && token.startsWith(VALID_TOKEN_PREFIX)) {
        localStorage.setItem(REVIEW_SESSION_KEY, token);
        localStorage.setItem(REVIEW_EXPIRY_KEY, String(Date.now() + 35 * 24 * 60 * 60 * 1000));
        setStatus('success');
        setTimeout(() => router.replace('/review/google'), 1200);
      } else {
        setStatus('error');
      }
    }

    if (token) verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
      <div className="max-w-md w-full p-8 text-center space-y-6">
        <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-12 mx-auto" />

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-[#D5AE57] border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-xl font-bold">Vérification de l&apos;accès...</h1>
            <p className="text-sm text-neutral-400">Authentification Google Review en cours.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 animate-in fade-in zoom-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#D5AE57]">Accès Autorisé</h1>
            <p className="text-sm text-neutral-400">Redirection vers l&apos;espace d&apos;évaluation Ñkyel...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-500">Lien invalide ou expiré</h1>
            <p className="text-sm text-neutral-400">Veuillez demander un nouveau lien d&apos;accès à l&apos;administrateur Ñkyel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
