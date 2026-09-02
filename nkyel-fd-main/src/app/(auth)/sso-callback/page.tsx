/**
 * Ñkyel AI — SSO Callback Handler
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Handles OAuth redirects (Google OAuth) for Clerk authentication.
 * Includes error handling and safe diagnostic logging.
 */

'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SSOCallbackPage() {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL for any Clerk error params (safe diagnostics)
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    const errorDesc = params.get('error_description');

    if (errorCode) {
      console.error('[Ñkyel SSO Callback] OAuth error detected:', {
        code: errorCode,
        description: errorDesc,
      });
      setHasError(true);
      setErrorInfo(errorDesc || errorCode);
    }

    // Safety timeout: if callback hasn't completed in 15 seconds, show error
    const timer = setTimeout(() => {
      console.warn('[Ñkyel SSO Callback] Callback processing timeout after 15s');
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className="nkyel-auth-page">
        <div className="nkyel-auth-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#18181b' }}>
            Authentication Error
          </h2>
          <p style={{ margin: '0 0 16px', color: '#71717a', fontSize: '14px' }}>
            {errorInfo || 'The authentication callback could not be completed.'}
          </p>
          <a
            href="/sign-in"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: '12px',
              background: '#18181b',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Return to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="nkyel-auth-page">
      <div className="nkyel-auth-card" style={{ textAlign: 'center', padding: '40px' }}>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/chat"
          signUpFallbackRedirectUrl="/chat"
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <div className="nkyel-spinner" />
          <p style={{ margin: 0, color: '#71717a', fontSize: '14px' }}>Authenticating with Google...</p>
        </div>
      </div>
    </div>
  );
}
