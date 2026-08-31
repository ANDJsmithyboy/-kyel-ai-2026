'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR, enUS } from '@clerk/localizations';
import { useLanguageStore } from '@/stores/language.store';
import { ThemeProvider } from './ThemeProvider';
import { AccentProvider } from './AccentProvider';
import { LocaleProvider } from './LocaleProvider';
import { TypographyPreferenceProvider } from './TypographyPreferenceProvider';
import { DensityProvider } from './DensityProvider';

/**
 * Ñkyel AI — AppProviders
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Bilingual Clerk: EN-US default, FR-FR when browser is French.
 * Clerk localization syncs with useLanguageStore.uiLocale.
 */

function ClerkLocaleWrapper({ children }: { children: React.ReactNode }) {
  const { uiLocale } = useLanguageStore();
  const isFr = uiLocale?.startsWith('fr');

  return (
    <ClerkProvider
      localization={isFr ? frFR : enUS}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in'}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/chat'}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/chat'}
    >
      {children}
    </ClerkProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkLocaleWrapper>
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
    </ClerkLocaleWrapper>
  );
}
