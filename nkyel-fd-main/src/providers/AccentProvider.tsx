'use client';

import React, { useEffect } from 'react';
import { useSettingsStore, applyDOMAccent } from '@/stores/settings.store';

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const { accent } = useSettingsStore();

  useEffect(() => {
    applyDOMAccent(accent);
  }, [accent]);

  return <>{children}</>;
}
