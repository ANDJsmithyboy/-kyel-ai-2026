'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const { density } = useSettingsStore();

  useEffect(() => {
    // This attribute hooks into tokens.css variables to adjust padding, margins, and gaps globally
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  return <>{children}</>;
}
