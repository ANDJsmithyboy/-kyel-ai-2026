/* Ñkyel AI · auth-client.ts · SmartANDJ AI Technologies
   Canonical Clerk Auth Client Module
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import {
  useUser,
  useAuth,
  useClerk,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  SignIn,
  SignUp,
} from '@clerk/nextjs';

export {
  useUser,
  useAuth,
  useClerk,
  SignedIn,
  SignedOut,
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
