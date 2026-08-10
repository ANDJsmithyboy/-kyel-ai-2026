'use client';

import React, { useEffect, useState } from 'react';
import { useGabomaShortcuts } from '@/hooks/useGabomaShortcuts';
import ShortcutsOverlay from './ShortcutsOverlay';

export default function GlobalShortcuts() {
  const { isShortcutsOverlayOpen, setIsShortcutsOverlayOpen } = useGabomaShortcuts();
  
  // Custom event listener for toggling shortcuts manually via 'mod+/'
  useEffect(() => {
    const handleOpen = () => setIsShortcutsOverlayOpen(true);
    window.addEventListener('open-shortcuts', handleOpen);
    return () => window.removeEventListener('open-shortcuts', handleOpen);
  }, [setIsShortcutsOverlayOpen]);

  return (
    <ShortcutsOverlay 
      isOpen={isShortcutsOverlayOpen} 
      onClose={() => setIsShortcutsOverlayOpen(false)} 
    />
  );
}
