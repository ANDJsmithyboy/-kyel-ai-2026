/**
 * Ñkyel AI · usePWAInstall Hook
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Manages PWA installation lifecycle across Chrome/Android, Edge, and iOS Safari.
 * Captures `beforeinstallprompt`, stores deferredPrompt, and triggers native browser prompt.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSSafari = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const mobile = /iphone|ipad|ipod|android|blackberry|windows phone/i.test(userAgent);
    setIsIOS(isIOSSafari);
    setIsMobileDevice(mobile);

    // Capture beforeinstallprompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      if (isIOS) {
        return 'unsupported'; // Trigger manual iOS instructions
      }
      return 'unsupported';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      return 'unsupported';
    }
  }, [deferredPrompt, isIOS]);

  return {
    isInstallable: isInstallable || (isIOS && !isStandalone),
    isNativePromptReady: !!deferredPrompt,
    isInstalled,
    isIOS,
    isMobileDevice,
    isStandalone,
    promptInstall,
  };
}
