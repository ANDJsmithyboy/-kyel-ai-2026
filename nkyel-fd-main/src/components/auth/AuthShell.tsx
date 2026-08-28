/**
 * Ñkyel AI — Sovereign Authentication Shell (Apple Luxury $100M Standard)
 * SmartANDJ AI Technologies · Founder & Lead Architect: Daniel Jonathan ANDJ
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/stores/language.store';
import { Globe, ShieldCheck, Sparkle } from '@phosphor-icons/react';
import PantherMissionGlyph from '@/components/icons/PantherMissionGlyph';

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

  const isEn = !uiLocale || uiLocale.startsWith('en');

  const toggleLanguage = () => {
    setUiLocale(isEn ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between items-center px-4 py-6 sm:py-10 font-sans select-none overflow-x-hidden bg-[#07090E] text-white">
      
      {/* ── Ambient Specular Lighting Mesh (Apple Studio Atmosphere) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#E5A93C]/12 via-[#4F46E5]/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[500px] bg-gradient-to-t from-[#10B981]/8 via-transparent to-transparent rounded-full blur-[120px]" />
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />
      </div>

      {/* ── Top Header Controls ──────────────────────────────────── */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between shrink-0 relative z-10">
        {/* Brand Mark (Left) */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group transition-all rounded-full px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/10 text-white shadow-lg active:scale-95"
          aria-label="Ñkyel Home"
        >
          <div className="w-5 h-5 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-black text-[11px] shadow-sm">
            Ñ
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white font-serif">
            nkyel
          </span>
        </Link>

        {/* Language Pill (Right) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-8 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/10 hover:border-white/20 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
          title={isEn ? 'Basculer en Français' : 'Switch to English'}
        >
          <Globe size={13} className="text-[var(--accent)]" />
          <span className="font-semibold">{isEn ? 'EN' : 'FR'}</span>
        </button>
      </header>

      {/* ── Center Floating Luxury Glass Card ─────────────────────── */}
      <main className="w-full max-w-[440px] mx-auto my-auto py-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full rounded-[32px] bg-[#0E121B]/90 backdrop-blur-3xl text-white shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-white/12 p-8 sm:p-9 space-y-6 relative overflow-hidden">
          
          {/* Subtle Top Specular Inset Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Card Brand Header */}
          <div className="flex flex-col items-center justify-center space-y-3.5">
            {/* Apple Frosted Squircle Emblem with Panther Paws */}
            <div className="w-13 h-13 p-3 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-[var(--accent)] shadow-xl backdrop-blur-xl ring-1 ring-white/5">
              <PantherMissionGlyph size={26} />
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                {mode === 'sign-in'
                  ? isEn
                    ? 'Welcome back'
                    : 'Bon retour'
                  : isEn
                  ? 'Create account'
                  : 'Créer un compte'}
              </h1>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                {mode === 'sign-in'
                  ? isEn
                    ? 'Sign in to access your sovereign intelligence'
                    : 'Connectez-vous pour accéder à votre espace souverain'
                  : isEn
                  ? 'Experience Visual Symbiotic Intelligence'
                  : 'Découvrez l’Intelligence Symbiotique Visuelle'}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full">
            {children}
          </div>

          {/* Switch Link */}
          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-white/10">
            {mode === 'sign-in' ? (
              <p>
                {isEn ? "Don't have an account? " : "Vous n'avez pas de compte ? "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-[var(--accent)] hover:underline transition-colors ml-1"
                >
                  {isEn ? 'Sign up' : 'Inscrivez-vous'}
                </Link>
              </p>
            ) : (
              <p>
                {isEn ? 'Already have an account? ' : 'Vous avez déjà un compte ? '}
                <Link
                  href="/sign-in"
                  className="font-semibold text-[var(--accent)] hover:underline transition-colors ml-1"
                >
                  {isEn ? 'Sign in' : 'Connectez-vous'}
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer Sovereignty Tag ────────────────────────────────── */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 font-mono shrink-0 relative z-10 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[var(--accent)]" />
          <span>Sovereign Global Intelligence · Built in Gabon 🇬🇦</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <Link href="/terms" className="hover:text-white transition-colors">
            {isEn ? 'Terms' : 'Conditions'}
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            {isEn ? 'Privacy' : 'Confidentialité'}
          </Link>
          <span>·</span>
          <Link href="/security" className="hover:text-white transition-colors">
            {isEn ? 'Security' : 'Sécurité'}
          </Link>
        </div>
      </footer>
    </div>
  );
}
