'use client';

import React from 'react';
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

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
