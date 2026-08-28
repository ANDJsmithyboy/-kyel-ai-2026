/* Ñkyel AI · auth-client.ts · SmartANDJ AI Technologies
   Canonical Clerk Auth Client Module
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import React from 'react';
import {
  useUser,
  useAuth,
  useClerk,
  SignInButton,
  SignUpButton,
  UserButton,
  SignIn,
  SignUp,
} from '@clerk/nextjs';

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? React.createElement(React.Fragment, null, children) : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? React.createElement(React.Fragment, null, children) : null;
}

export {
  useUser,
  useAuth,
  useClerk,
  SignInButton,
  SignUpButton,
  UserButton,
  SignIn,
  SignUp,
};

// Aliases matching repository conventions for smooth backwards compatibility
export const useSafeUser = useUser;
export const useSafeAuth = useAuth;
export const useSafeClerk = useClerk;
