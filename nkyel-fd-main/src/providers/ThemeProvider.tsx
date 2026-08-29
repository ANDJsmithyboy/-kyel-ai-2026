'use client';

import React, { useEffect } from 'react';
import { useSettingsStore, applyDOMTheme } from '@/stores/settings.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themeMode, fetchFromServer } = useSettingsStore();

  // Load preferences from server on initial mount
  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  // Sync theme with DOM and system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-color-scheme: light)');
    
    const updateTheme = () => {
      let resolvedTheme = theme;
      if (themeMode === 'auto' || theme === 'system') {
        resolvedTheme = media.matches ? 'light' : 'dark';
      }
      applyDOMTheme(resolvedTheme);
    };

    updateTheme();
    
    if (media.addEventListener) {
      media.addEventListener('change', updateTheme);
      return () => media.removeEventListener('change', updateTheme);
    }
  }, [theme, themeMode]);

  return <>{children}</>;
}
