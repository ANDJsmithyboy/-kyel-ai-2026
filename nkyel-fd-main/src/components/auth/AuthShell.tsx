/**
 * Ñkyel AI — Sovereign Authentication Shell
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Premium auth card: centered, calm, minimal, theme-aware.
 * Bilingual EN-US (default) / FR-FR with auto-detection.
 * Mobile-first: card fills width on small screens.
 * Uses existing Ñkyel design tokens — no hardcoded colors.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/language.store';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children: React.ReactNode;
}

/** Detect if browser prefers French */
function detectLocale(): 'en-US' | 'fr-FR' {
  if (typeof navigator === 'undefined') return 'en-US';
  const langs = navigator.languages ?? [navigator.language];
  for (const l of langs) {
    if (l.startsWith('fr')) return 'fr-FR';
  }
  return 'en-US';
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const { t, uiLocale, setUiLocale, translations } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  // Auto-detect browser locale on first visit (before any user preference is stored)
  useEffect(() => {
    setMounted(true);
    // Only auto-detect if no translations loaded yet (first visit)
    if (Object.keys(translations).length === 0) {
      const detected = detectLocale();
      setUiLocale(detected);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFr = uiLocale?.startsWith('fr');

  // Toggle between EN and FR
  const toggleLocale = () => {
    const next = isFr ? 'en-US' : 'fr-FR';
    setUiLocale(next);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="nkyel-auth-page">
        <div className="nkyel-auth-card" />
      </div>
    );
  }

  return (
    <div className="nkyel-auth-page">
      {/* ── Language Switcher (top-right) ── */}
      <div className="nkyel-auth-lang-switcher">
        <button
          onClick={toggleLocale}
          className="nkyel-auth-lang-btn"
          aria-label="Switch language"
          type="button"
        >
          <span className={!isFr ? 'nkyel-auth-lang-active' : 'nkyel-auth-lang-inactive'}>EN</span>
          <span className="nkyel-auth-lang-sep">|</span>
          <span className={isFr ? 'nkyel-auth-lang-active' : 'nkyel-auth-lang-inactive'}>FR</span>
        </button>
      </div>

      {/* ── Auth Card ── */}
      <main className="nkyel-auth-card">
        {/* Brand */}
        <div className="nkyel-auth-brand">
          <img src="/nkyel-ai.svg" alt="Ñkyel Logo" className="nkyel-auth-logo" />
          <h2 className="nkyel-auth-brand-name">ñkyel</h2>
        </div>

        {/* Title & Subtitle */}
        <div className="nkyel-auth-header">
          <h1 className="nkyel-auth-title">
            {mode === 'sign-in' ? t('auth.welcome') : t('auth.signUpTitle')}
          </h1>
          <p className="nkyel-auth-subtitle">
            {mode === 'sign-in' ? t('auth.continueTo') : t('auth.signUpSubtitle')}
          </p>
        </div>

        {/* Clerk Auth Component */}
        {/* Auth Provider Content (Clerk) */}
        {children}

        {/* Switch Link */}
        <div className="nkyel-auth-switch">
          {mode === 'sign-in' ? (
            <p>
              {t('auth.noAccount')} <Link href="/sign-up" className="nkyel-auth-link">{t('auth.createAccount')}</Link>
            </p>
          ) : (
            <p>
              {t('auth.hasAccount')} <Link href="/sign-in" className="nkyel-auth-link">{t('auth.login')}</Link>
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="nkyel-auth-footer">
          <p className="nkyel-auth-footer-brand">
            ñkyel <span className="nkyel-auth-footer-name">par SmartANDJ AI Technologies</span>
          </p>
          <p className="nkyel-auth-footer-copyright">
            © 2026 SmartANDJ AI Technologies
          </p>
          <div className="nkyel-auth-footer-links">
            <a href="#" className="nkyel-auth-footer-link">{t('auth.terms')}</a>
            <a href="#" className="nkyel-auth-footer-link">{t('auth.privacy')}</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
