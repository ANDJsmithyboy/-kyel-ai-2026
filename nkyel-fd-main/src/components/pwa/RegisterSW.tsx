/**
 * Ñkyel AI · RegisterSW
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Registers the service worker globally and handles update notifications.
 * Mounted in root layout so SW is registered on ALL pages (auth + app).
 */

'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        /* SW registration failed — likely localhost HTTP or unsupported browser */
      });

    // Detect when a new service worker takes over (update deployed)
    const isFirstLoad = !navigator.serviceWorker.controller;

    const handleControllerChange = () => {
      if (isFirstLoad) return; // First SW install, not an update

      toast('Nouvelle version disponible', {
        description: 'Rechargez pour appliquer la dernière version de Ñkyel.',
        action: {
          label: 'Recharger',
          onClick: () => window.location.reload(),
        },
        duration: 20000,
      });
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return null;
}
