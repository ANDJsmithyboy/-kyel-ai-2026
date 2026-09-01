/**
 * Ñkyel AI — SSO Callback Handler
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Handles OAuth redirects (Google OAuth) for Clerk authentication.
 */

'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="nkyel-auth-page">
      <div className="nkyel-auth-card" style={{ textAlign: 'center', padding: '40px' }}>
        <AuthenticateWithRedirectCallback />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <div className="nkyel-spinner" />
          <p style={{ margin: 0, color: '#71717a', fontSize: '14px' }}>Authenticating with Google...</p>
        </div>
      </div>
    </div>
  );
}
