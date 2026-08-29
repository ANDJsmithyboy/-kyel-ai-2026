'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { uiLocale } = useSettingsStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = uiLocale.split('-')[0] || 'fr';
    }
  }, [uiLocale]);

  return <>{children}</>;
}
