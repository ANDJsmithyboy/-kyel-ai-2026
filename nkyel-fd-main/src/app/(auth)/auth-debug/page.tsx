/**
 * Ñkyel AI — Auth Debug Page (TEMPORARY DIAGNOSTIC)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Uses the official Clerk <SignIn /> component to isolate
 * whether authentication issues come from:
 * A) Clerk config / keys / domain / instance
 * B) Our custom AuthForm implementation
 *
 * ✅ If this page works but AuthForm fails → bug is in AuthForm
 * ❌ If this page also fails → bug is in Clerk config
 *
 * DELETE OR PROTECT THIS PAGE after diagnosis.
 */

'use client';

import { SignIn, useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { isSignedIn, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();
  const [tokenInfo, setTokenInfo] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && getToken) {
      getToken().then((t) => {
        if (t) {
          // Only show first 20 and last 10 chars for safety
          const safe = `${t.slice(0, 20)}...${t.slice(-10)}`;
          setTokenInfo(safe);

          // Test FastAPI /me endpoint
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nkyel.smartandjai.com';
          fetch(`${apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${t}` },
          })
            .then(async (res) => {
              const body = await res.json().catch(() => ({}));
              setApiResult(
                `HTTP ${res.status}: ${JSON.stringify(body, null, 2)}`
              );
            })
            .catch((err) => {
              setApiResult(`FETCH ERROR: ${err.message}`);
            });
        } else {
          setTokenInfo('getToken() returned null');
        }
      });
    }
  }, [isSignedIn, getToken]);

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
        🔧 Auth Debug — TEMPORARY
      </h1>
      <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>
        Official Clerk SignIn + session diagnostics. Delete after use.
      </p>

      {/* Session Status */}
      <div
        style={{
          background: '#f4f4f5',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '13px',
          fontFamily: 'monospace',
        }}
      >
        <div><strong>isSignedIn:</strong> {String(isSignedIn)}</div>
        <div><strong>userId:</strong> {userId || 'none'}</div>
        <div><strong>sessionId:</strong> {sessionId || 'none'}</div>
        <div><strong>user.email:</strong> {user?.primaryEmailAddress?.emailAddress || 'none'}</div>
        <div><strong>token (safe):</strong> {tokenInfo || 'loading...'}</div>
      </div>

      {/* FastAPI /me result */}
      {apiResult && (
        <div
          style={{
            background: '#fefce8',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <strong>FastAPI /api/auth/me:</strong>
          <br />
          {apiResult}
        </div>
      )}

      {/* Official Clerk SignIn component */}
      {!isSignedIn && (
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>
            Official Clerk &lt;SignIn /&gt;
          </h2>
          <SignIn
            fallbackRedirectUrl="/auth-debug"
            signUpUrl="/sign-up"
          />
        </div>
      )}

      {isSignedIn && (
        <div
          style={{
            background: '#f0fdf4',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#16a34a', fontSize: '16px', fontWeight: 600 }}>
            ✅ Clerk session active. Auth works.
          </p>
          <a href="/chat" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Go to /chat →
          </a>
        </div>
      )}
    </div>
  );
}
