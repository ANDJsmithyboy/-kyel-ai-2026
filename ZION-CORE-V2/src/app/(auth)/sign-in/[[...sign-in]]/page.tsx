/**
 * Ñkyel AI — Sign In Page · SmartANDJ AI Technologies
 * Expérience d'authentification souveraine Ñkyel propulsée par Clerk :
 * - Intégration du composant officiel Clerk <SignIn />
 * - Thème et design tokens 100% alignés sur Ñkyel (Geist, #c39a52)
 * - Aucune dépendance à des mocks de développement
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';
import { nkyelClerkAppearance } from '@/lib/clerk-theme';

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <div className="w-full flex justify-center">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/chat"
          appearance={nkyelClerkAppearance}
        />
      </div>
    </AuthShell>
  );
}
