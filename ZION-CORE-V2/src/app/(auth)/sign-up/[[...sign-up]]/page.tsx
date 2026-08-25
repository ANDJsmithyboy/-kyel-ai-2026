/**
 * Ñkyel AI — Sign Up Page · SmartANDJ AI Technologies
 * Expérience d'inscription souveraine Ñkyel propulsée par Clerk :
 * - Intégration du composant officiel Clerk <SignUp />
 * - Thème et design tokens 100% alignés sur Ñkyel
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';
import { nkyelClerkAppearance } from '@/lib/clerk-theme';

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <div className="w-full flex justify-center">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/chat"
          appearance={nkyelClerkAppearance}
        />
      </div>
    </AuthShell>
  );
}
