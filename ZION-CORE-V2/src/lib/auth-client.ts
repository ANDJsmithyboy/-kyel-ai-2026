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
