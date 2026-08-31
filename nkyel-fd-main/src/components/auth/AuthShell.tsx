/**
 * Ñkyel AI — Sovereign Authentication Shell
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Matches approved visual reference exactly:
 * Meadow background, white centered card, ñkyel brand + Bienvenue.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children: React.ReactNode;
}

const copy = {
  'en-US': {
    'sign-in': {
      title: 'Welcome',
      subtitle: 'Sign in to continue to Ñkyel',
      switchText: "Don't have an account?",
      switchLink: 'Sign up',
      switchHref: '/sign-up',
    },
    'sign-up': {
      title: 'Create an account',
      subtitle: 'Sign up to get started on Ñkyel',
      switchText: 'Already have an account?',
      switchLink: 'Sign in',
      switchHref: '/sign-in',
    },
  },
  'fr-FR': {
    'sign-in': {
      title: 'Bienvenue',
      subtitle: 'Connectez-vous pour continuer sur Ñkyel',
      switchText: "Vous n'avez pas de compte ?",
      switchLink: 'Créer un compte',
      switchHref: '/sign-up',
    },
    'sign-up': {
      title: 'Créer un compte',
      subtitle: 'Inscrivez-vous pour commencer sur Ñkyel',
      switchText: 'Vous avez déjà un compte ?',
      switchLink: 'Se connecter',
      switchHref: '/sign-in',
    },
  },
};

export default function AuthShell({ mode, children }: AuthShellProps) {
  // Default to English first, French second.
  const [locale, setLocale] = useState<'en-US' | 'fr-FR'>('en-US');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const c = copy[locale][mode];

  const toggleLocale = () => {
    setLocale(prev => (prev === 'en-US' ? 'fr-FR' : 'en-US'));
  };

  if (!mounted) {
    return (
      <div className="nkyel-auth-page">
        <main className="nkyel-auth-card" />
      </div>
    );
  }

  return (
    <div className="nkyel-auth-page">
      {/* ── Language Switcher (top-right) ── */}
      <div className="nkyel-auth-lang-switcher" style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <button
          onClick={toggleLocale}
          className="nkyel-auth-lang-btn"
          aria-label="Switch language"
          type="button"
          style={{
            display: 'inline-flex',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '99px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            color: '#4a4a4a'
          }}
        >
          <span style={{ color: locale === 'en-US' ? '#1a1a1a' : '#888', fontWeight: locale === 'en-US' ? 600 : 400 }}>EN</span>
          <span>|</span>
          <span style={{ color: locale === 'fr-FR' ? '#1a1a1a' : '#888', fontWeight: locale === 'fr-FR' ? 600 : 400 }}>FR</span>
        </button>
      </div>

      <main className="nkyel-auth-card">
        {/* Brand */}
        <div className="nkyel-auth-brand">
          <img
            src="/nkyel-logo.png"
            alt="Ñkyel"
            className="nkyel-auth-logo"
            width={44}
            height={44}
          />
          <h2 className="nkyel-auth-brand-name">ñkyel</h2>
        </div>

        {/* Title & Subtitle */}
        <div className="nkyel-auth-header">
          <h1 className="nkyel-auth-title">{c.title}</h1>
          <p className="nkyel-auth-subtitle">{c.subtitle}</p>
        </div>

        {/* Clerk Component */}
        <div className="nkyel-auth-form">
          {children}
        </div>

        {/* Switch Link */}
        <div className="nkyel-auth-switch">
          <p>
            {c.switchText}{' '}
            <Link href={c.switchHref} className="nkyel-auth-link">
              {c.switchLink}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
