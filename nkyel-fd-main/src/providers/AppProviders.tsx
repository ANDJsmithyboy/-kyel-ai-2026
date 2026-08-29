'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { ThemeProvider } from './ThemeProvider';
import { AccentProvider } from './AccentProvider';
import { LocaleProvider } from './LocaleProvider';
import { TypographyPreferenceProvider } from './TypographyPreferenceProvider';
import { DensityProvider } from './DensityProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in'}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/chat'}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/chat'}
    >
      <ThemeProvider>
        <AccentProvider>
          <LocaleProvider>
            <TypographyPreferenceProvider>
              <DensityProvider>
                {children}
              </DensityProvider>
            </TypographyPreferenceProvider>
          </LocaleProvider>
        </AccentProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
