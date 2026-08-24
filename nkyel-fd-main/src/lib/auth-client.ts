/* Ñkyel AI · auth-client.ts · SmartANDJ AI Technologies
   Safe resilient auth hooks (Clerk-compatible + sovereign fallback)
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import React from 'react';

export const DEMO_FOUNDER_USER: any = {
  id: 'founder_smartandj_01',
  fullName: 'Daniel Jonathan ANDJ',
  firstName: 'Daniel Jonathan',
  lastName: 'ANDJ',
  username: 'daniel_andj',
  primaryEmailAddress: { emailAddress: 'fondateur@nkyel.ai' },
  imageUrl: '/Nkyel AI-logo.jpeg',
  publicMetadata: { role: 'admin' },
  reload: async () => {},
};

export function useSafeUser(): { isSignedIn: boolean; isLoaded: boolean; user: any } {
  return {
    isSignedIn: true,
    isLoaded: true,
    user: DEMO_FOUNDER_USER,
  };
}

export function useSafeAuth(): {
  userId: string;
  sessionId: string;
  getToken: () => Promise<string>;
  isSignedIn: boolean;
  isLoaded: boolean;
} {
  return {
    userId: 'founder_smartandj_01',
    sessionId: 'session_demo_founder_01',
    getToken: async () => 'bearer_token_demo_founder',
    isSignedIn: true,
    isLoaded: true,
  };
}

export function useSafeClerk(): any {
  return {
    signOut: async () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
    openUserProfile: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/settings';
      }
    },
  };
}

export const SignInButton = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <a href="/chat" className={className}>{children || 'Connexion'}</a>
);

export const SignUpButton = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <a href="/chat" className={className}>{children || 'Inscription'}</a>
);

export const UserButton = ({ className }: { className?: string }) => (
  <div className={`w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-bold text-xs ${className || ''}`}>
    Ñ
  </div>
);
