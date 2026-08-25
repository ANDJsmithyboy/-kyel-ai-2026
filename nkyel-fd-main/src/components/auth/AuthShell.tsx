/**
 * Ñkyel AI — Sovereign Authentication Shell (Tavily × Replicate × Replit × Leonardo AI Spirit)
 * SmartANDJ AI Technologies · Founder & Lead Architect: Daniel Jonathan ANDJ
 *
 * Visual Benchmark:
 * - Atmospheric wallpaper background using /brand/nkyel-ai-ios.png with artistic depth & lighting.
 * - Central floating pristine white auth card inspired by Tavily by Nebius.
 * - Wordmark "Ñkyel by SmartANDJ" with sovereign logo emblem.
 * - Google OAuth & Email auth integration.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/language.store';
import { Globe, CheckCircle } from '@phosphor-icons/react';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children: React.ReactNode;
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const { uiLocale, setUiLocale } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEn = uiLocale.startsWith('en');

  const toggleLanguage = () => {
    setUiLocale(isEn ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between items-center px-4 py-6 sm:py-10 font-sans select-none overflow-x-hidden">
      
      {/* ── Background: Replicate / Leonardo AI Atmospheric Wallpaper ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 filter blur-[2px] brightness-[0.9] transition-all duration-700"
        style={{
          backgroundImage: `url('/brand/nkyel-ai-ios.png')`,
        }}
      />
      {/* Dark Ambient Vignette / Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />

      {/* ── Top Header Controls ──────────────────────────────────── */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between shrink-0 relative z-10">
        {/* Brand Mark (Left) */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 group transition-opacity hover:opacity-90 rounded-full px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-lg"
          aria-label="Ñkyel AI Home"
        >
          <div className="w-6 h-6 rounded-full bg-[#D5AE57] text-black flex items-center justify-center font-black text-xs shadow-sm">
            Ñ
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            Ñkyel
          </span>
        </Link>

        {/* Language Pill (Right) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-8 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hover:border-white/30 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
          title={isEn ? 'Basculer en Français' : 'Switch to English'}
        >
          <Globe size={13} className="text-[#D5AE57]" />
          <span className="font-semibold">{isEn ? 'EN' : 'FR'}</span>
        </button>
      </header>

      {/* ── Center Floating Card (Tavily by Nebius Benchmark) ─────── */}
      <main className="w-full max-w-[440px] mx-auto my-auto py-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full rounded-[28px] bg-white text-slate-900 shadow-2xl shadow-black/40 border border-white/40 p-7 sm:p-9 space-y-6">
          
          {/* Card Brand Header (Tavily by Nebius style) */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs">
                Ñ
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                ñkyel
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 font-semibold border border-slate-300 uppercase">
                SMARTANDJ
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {mode === 'sign-in'
                  ? isEn
                    ? 'Welcome'
                    : 'Accueillir'
                  : isEn
                  ? 'Get started'
                  : 'Inscription'}
              </h1>
              <p className="text-xs text-slate-500">
                {mode === 'sign-in'
                  ? isEn
                    ? 'Sign in to continue to Ñkyel'
                    : 'Connectez-vous pour continuer sur Ñkyel'
                  : isEn
                  ? 'Create your account to start with Ñkyel'
                  : 'Créez votre compte pour démarrer sur Ñkyel'}
              </p>
            </div>
          </div>

          {/* Form Content */}
          {children}

          {/* Switch Link */}
          <div className="text-center text-xs text-slate-600">
            {mode === 'sign-in' ? (
              <p>
                {isEn ? "Don't have an account? " : "Vous n'avez pas de compte ? "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {isEn ? 'Sign up' : 'Inscrivez-vous'}
                </Link>
              </p>
            ) : (
              <p>
                {isEn ? 'Already have an account? ' : 'Vous avez déjà un compte ? '}
                <Link
                  href="/sign-in"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {isEn ? 'Sign in' : 'Connectez-vous'}
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── Bottom Legal Footer ─────────────────────────────────── */}
      <footer className="w-full max-w-5xl mx-auto text-center shrink-0 pt-4 pb-2 text-[11px] text-white/70 space-y-1 relative z-10">
        <p>
          {isEn
            ? 'By continuing, you agree to our '
            : 'En continuant, vous acceptez nos '}
          <Link
            href="/terms"
            className="text-white hover:underline underline-offset-2 transition-colors font-medium"
          >
            {isEn ? 'Terms of Service' : "Conditions d'utilisation"}
          </Link>
          {isEn ? ' and ' : ' et notre '}
          <Link
            href="/privacy"
            className="text-white hover:underline underline-offset-2 transition-colors font-medium"
          >
            {isEn ? 'Privacy Policy' : 'Politique de confidentialité'}
          </Link>
          .
        </p>
        <p className="font-mono text-[10px] text-white/50">
          © 2026 Ñkyel AI · SmartANDJ AI Technologies (Founder: Daniel Jonathan ANDJ)
        </p>
      </footer>
    </div>
  );
}
