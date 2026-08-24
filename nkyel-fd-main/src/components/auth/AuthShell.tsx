/**
 * Ñkyel AI — Sovereign Authentication Architecture
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * MISSION P0 — Design Target:
 * Simple comme Luma · Calme comme Apple · Net comme Geist · Identifiable comme Ñkyel.
 *
 * - Pas de sidebar, pas de dashboard, pas de gros panneau marketing.
 * - Desktop : surface centrée optiquement (max-width: 420px).
 * - Mobile : 100% de largeur avec 20–24px de padding horizontal.
 * - Thèmes Light / Dark / System 100% étanches (Zéro îlot sombre en light, zéro icône noire en dark).
 * - Localisation bilingue instantanée FR / EN.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/language.store';
import { useThemeStore } from '@/stores/theme';
import { Moon, Sun, Globe } from '@phosphor-icons/react';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children: React.ReactNode;
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const { uiLocale, setUiLocale } = useLanguageStore();
  const { currentTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEn = uiLocale.startsWith('en');
  const isLight =
    currentTheme === 'neo-blanc' ||
    currentTheme === 'aurore-ogoue' ||
    (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('light'));

  const toggleLanguage = () => {
    setUiLocale(isEn ? 'fr-FR' : 'en-US');
  };

  const toggleTheme = () => {
    const nextTheme = isLight ? 'black-panther' : 'neo-blanc';
    setTheme(nextTheme);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] flex flex-col justify-between relative px-4 sm:px-6 py-6 sm:py-8 font-sans selection:bg-[var(--accent)]/20 selection:text-[var(--accent)]">
      
      {/* ── Top Header (Minimalist Apple × Geist) ────────────────── */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between shrink-0">
        
        {/* Brand Mark (Left) */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg p-1"
          aria-label="Ñkyel AI Home"
        >
          {/* Minimalist Ñ Emblem */}
          <div className="w-7 h-7 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shadow-sm">
            <span className="text-[var(--text-primary)] font-serif tracking-tighter">Ñ</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[var(--text-primary)]">
            Ñkyel
          </span>
        </Link>

        {/* Quick Controls: Language & Theme (Right) */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-8 px-2.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[12px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title={isEn ? 'Basculer en Français' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Globe size={13} className="text-[var(--text-tertiary)]" />
            <span className="font-semibold">{isEn ? 'EN' : 'FR'}</span>
          </button>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all shadow-sm active:scale-95"
              title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          )}
        </div>
      </header>

      {/* ── Center Auth Surface (Optically Centered 420px) ────────── */}
      <main className="w-full max-w-[420px] mx-auto my-auto py-8 sm:py-12 flex flex-col items-center">
        
        {/* Title & Subtitle */}
        <div className="w-full text-center space-y-1.5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {mode === 'sign-in'
              ? isEn
                ? 'Welcome back'
                : 'Bon retour parmi nous'
              : isEn
              ? 'Create your Ñkyel account'
              : 'Créez votre compte Ñkyel'}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] leading-normal">
            {mode === 'sign-in'
              ? isEn
                ? 'Continue with Ñkyel'
                : 'Continuez avec Ñkyel'
              : isEn
              ? 'Start building with intelligence.'
              : 'Commencez à construire avec intelligence.'}
          </p>
        </div>

        {/* Auth Surface (Paper / Deep Near-Black Solid Layer) */}
        <div className="w-full rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-lg shadow-black/5 p-5 sm:p-7 relative transition-colors">
          {children}
        </div>

        {/* Switch Link (Sign In ↔ Sign Up) */}
        <div className="mt-5 text-center text-xs text-[var(--text-secondary)]">
          {mode === 'sign-in' ? (
            <p>
              {isEn ? 'New to Ñkyel? ' : 'Nouveau sur Ñkyel ? '}
              <Link
                href="/sign-up"
                className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors"
              >
                {isEn ? 'Create an account' : 'Créer un compte'}
              </Link>
            </p>
          ) : (
            <p>
              {isEn ? 'Already have an account? ' : 'Vous avez déjà un compte ? '}
              <Link
                href="/sign-in"
                className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors"
              >
                {isEn ? 'Sign in' : 'Se connecter'}
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* ── Bottom Legal Footer ─────────────────────────────────── */}
      <footer className="w-full max-w-5xl mx-auto text-center shrink-0 pt-6 pb-2 text-[11px] text-[var(--text-tertiary)] space-y-2">
        <p>
          {isEn
            ? 'By continuing, you agree to our '
            : 'En continuant, vous acceptez nos '}
          <Link
            href="/terms"
            className="hover:text-[var(--text-secondary)] underline underline-offset-2 transition-colors"
          >
            {isEn ? 'Terms of Service' : "Conditions d'utilisation"}
          </Link>
          {isEn ? ' and ' : ' et notre '}
          <Link
            href="/privacy"
            className="hover:text-[var(--text-secondary)] underline underline-offset-2 transition-colors"
          >
            {isEn ? 'Privacy Policy' : 'Politique de confidentialité'}
          </Link>
          .
        </p>
        <p className="font-mono text-[10px] opacity-75">
          © 2026 Ñkyel AI · SmartANDJ AI Technologies
        </p>
      </footer>
    </div>
  );
}
