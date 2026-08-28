/**
 * Ñkyel AI · PWAInstallPrompt
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Mobile & Desktop Native PWA Install Banner with:
 * - Direct triggering of native browser install prompt (Android / Chrome / Edge)
 * - Clear visual guide for iOS Safari (Share ⎋ -> Add to Home Screen ⊕)
 * - Discrete dismissal with localStorage cooldown
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DownloadSimple,
  X,
  ShareNetwork,
  PlusSquare,
  Sparkle,
  DeviceMobile,
  CheckCircle,
} from '@phosphor-icons/react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { PantherMissionGlyph } from '@/components/icons';

const PWA_DISMISS_KEY = 'nkyel_pwa_install_dismissed_until';

export default function PWAInstallPrompt() {
  const { isInstallable, isNativePromptReady, isInstalled, isIOS, isStandalone, promptInstall } =
    usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    if (typeof window !== 'undefined') {
      const dismissedUntil = localStorage.getItem(PWA_DISMISS_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    }

    // Show prompt after brief delay if installable and not already standalone
    if (isInstallable && !isStandalone && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone, isInstalled]);

  const handleInstallClick = async () => {
    if (isNativePromptReady) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem(PWA_DISMISS_KEY, (Date.now() + 7 * 86400000).toString());
    }
  };

  if (!isVisible || isStandalone || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 start-4 end-4 sm:start-auto sm:end-6 sm:max-w-md z-[120] p-4 rounded-2xl border border-[var(--accent-muted)] bg-[var(--surface-raised, #10131A)]/95 backdrop-blur-xl shadow-2xl"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-muted)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 end-3 p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5 pe-6">
          {/* Brand Icon Badge */}
          <div className="w-11 h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shrink-0 shadow-md">
            <PantherMissionGlyph size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Installer l&apos;application Ñkyel
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold uppercase">
                PWA
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Ajoutez Ñkyel à votre écran d&apos;accueil pour un lancement instantané, plein écran et une réactivité native.
            </p>

            {/* iOS Specific Guide */}
            {showIOSGuide ? (
              <div className="mt-3 p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--accent)]">
                  <DeviceMobile size={15} />
                  <span>Installation sur iOS Safari :</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <ShareNetwork size={14} className="text-sky-400 shrink-0" />
                  <span>1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <PlusSquare size={14} className="text-emerald-400 shrink-0" />
                  <span>2. Faites défiler et touchez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mt-3 pt-1">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Installer sur mon téléphone</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Plus tard
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
