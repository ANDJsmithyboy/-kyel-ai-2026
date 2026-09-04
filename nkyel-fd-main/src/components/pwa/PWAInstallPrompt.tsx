/**
 * Ñkyel AI · PWAInstallPrompt
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Mobile & Desktop Native PWA Install Banner with:
 * - Direct triggering of native browser install prompt (Android / Chrome / Edge)
 * - Clear visual guide for iOS Safari (Share → Add to Home Screen)
 * - Discrete dismissal with localStorage cooldown (7 days)
 * - Full i18n: en-US, fr-FR, es-ES, zh-Hans, ar
 * - Accessibility: role=dialog, aria-labelledby, Escape key dismiss
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DownloadSimple,
  X,
  ShareNetwork,
  PlusSquare,
  DeviceMobile,
} from '@phosphor-icons/react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { PantherMissionGlyph } from '@/components/icons';

const PWA_DISMISS_KEY = 'nkyel_pwa_install_dismissed_until';

/* ── i18n ─────────────────────────────────────────────────── */

type Lang = 'en' | 'fr' | 'es' | 'zh' | 'ar';

const TRANSLATIONS: Record<
  Lang,
  {
    title: string;
    description: string;
    install: string;
    later: string;
    iosTitle: string;
    iosStep1: string;
    iosStep2: string;
    dismiss: string;
  }
> = {
  en: {
    title: 'Install Ñkyel',
    description:
      'Install Ñkyel on your device for faster access and a fullscreen experience.',
    install: 'Install',
    later: 'Later',
    iosTitle: 'Install on iOS Safari:',
    iosStep1: '1. Tap the Share button at the bottom of Safari.',
    iosStep2: '2. Scroll and tap "Add to Home Screen".',
    dismiss: 'Close',
  },
  fr: {
    title: 'Installer Ñkyel',
    description:
      'Installez Ñkyel sur votre appareil pour un accès plus rapide et une expérience plein écran.',
    install: 'Installer',
    later: 'Plus tard',
    iosTitle: 'Installation sur iOS Safari :',
    iosStep1: '1. Appuyez sur le bouton Partager en bas de Safari.',
    iosStep2: "2. Faites défiler et touchez « Sur l\u2019écran d\u2019accueil ».",
    dismiss: 'Fermer',
  },
  es: {
    title: 'Instalar Ñkyel',
    description:
      'Instala Ñkyel en tu dispositivo para un acceso más rápido y pantalla completa.',
    install: 'Instalar',
    later: 'Más tarde',
    iosTitle: 'Instalación en iOS:',
    iosStep1: '1. Toca el botón Compartir en la parte inferior de Safari.',
    iosStep2: '2. Desplázate y toca "Añadir a pantalla de inicio".',
    dismiss: 'Cerrar',
  },
  zh: {
    title: '安装 Ñkyel',
    description: '在设备上安装 Ñkyel，享受更快的访问和全屏体验。',
    install: '安装',
    later: '稍后',
    iosTitle: '在 iOS 上安装：',
    iosStep1: '1. 点击 Safari 底部的分享按钮。',
    iosStep2: '2. 滚动并点击"添加到主屏幕"。',
    dismiss: '关闭',
  },
  ar: {
    title: 'تثبيت Ñkyel',
    description: 'ثبّت Ñkyel على جهازك للوصول الأسرع وتجربة ملء الشاشة.',
    install: 'تثبيت',
    later: 'لاحقاً',
    iosTitle: 'التثبيت على iOS:',
    iosStep1: '1. اضغط على زر المشاركة في أسفل Safari.',
    iosStep2: '2. مرر واضغط على "إضافة إلى الشاشة الرئيسية".',
    dismiss: 'إغلاق',
  },
};

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const nav = navigator.language?.toLowerCase() ?? 'en';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ar')) return 'ar';
  return 'en';
}

/* ── Component ────────────────────────────────────────────── */

export default function PWAInstallPrompt() {
  const {
    isInstallable,
    isNativePromptReady,
    isInstalled,
    isIOS,
    isMobileDevice,
    isStandalone,
    promptInstall,
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const lang = detectLang();
  const t = TRANSLATIONS[lang];

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone, isInstalled]);

  const handleInstallClick = useCallback(async () => {
    if (isNativePromptReady) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  }, [isNativePromptReady, isIOS, promptInstall]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    // Dismiss for 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        PWA_DISMISS_KEY,
        (Date.now() + 7 * 86400000).toString()
      );
    }
  }, []);

  // Escape key closes the prompt
  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible, handleDismiss]);

  if (!isVisible || isStandalone || isInstalled || !isMobileDevice) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="false"
        aria-labelledby="nkyel-pwa-install-title"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 start-4 end-4 sm:start-auto sm:end-6 sm:max-w-md z-[120] p-4 rounded-2xl border border-[var(--accent-muted)] bg-[var(--surface-raised,#10131A)]/95 backdrop-blur-xl shadow-2xl"
        style={{
          boxShadow:
            '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-muted)',
          paddingBottom:
            'max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px))',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 end-3 p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
          aria-label={t.dismiss}
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
              <h3
                id="nkyel-pwa-install-title"
                className="font-bold text-sm text-[var(--text-primary)]"
              >
                {t.title}
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold uppercase">
                PWA
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t.description}
            </p>

            {/* iOS Specific Guide */}
            {showIOSGuide ? (
              <div className="mt-3 p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--accent)]">
                  <DeviceMobile size={15} />
                  <span>{t.iosTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <ShareNetwork
                    size={14}
                    className="text-sky-400 shrink-0"
                  />
                  <span>{t.iosStep1}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <PlusSquare
                    size={14}
                    className="text-emerald-400 shrink-0"
                  />
                  <span>{t.iosStep2}</span>
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
                  <span>{t.install}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-xl text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t.later}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
