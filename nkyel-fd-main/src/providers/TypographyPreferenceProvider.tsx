'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';

export function TypographyPreferenceProvider({ children }: { children: React.ReactNode }) {
  const { fontSize, textStyle, reducedMotion, highContrast } = useSettingsStore();

  useEffect(() => {
    // These attributes hook into tokens.css variables to scale typography globally
    document.documentElement.setAttribute('data-text-size', fontSize);
    document.documentElement.setAttribute('data-text-style', textStyle);
    document.documentElement.setAttribute('data-motion', reducedMotion ? 'reduced' : 'normal');
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
  }, [fontSize, textStyle, reducedMotion, highContrast]);

  return <>{children}</>;
}
