'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setGlobalTokenGetter } from '@/lib/api/client';
import { ThemeProvider } from './ThemeProvider';
import { AccentProvider } from './AccentProvider';
import { LocaleProvider } from './LocaleProvider';
import { TypographyPreferenceProvider } from './TypographyPreferenceProvider';
import { DensityProvider } from './DensityProvider';

function AuthTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setGlobalTokenGetter(getToken);
  }, [getToken]);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AccentProvider>
        <LocaleProvider>
          <TypographyPreferenceProvider>
            <DensityProvider>
              <AuthTokenSync />
              {children}
            </DensityProvider>
          </TypographyPreferenceProvider>
        </LocaleProvider>
      </AccentProvider>
    </ThemeProvider>
  );
}

