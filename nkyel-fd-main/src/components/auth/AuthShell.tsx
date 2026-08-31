/**
 * Ñkyel AI — Sovereign Authentication Shell
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Matches approved visual reference exactly:
 * Meadow background, white centered card, ñkyel brand + Bienvenue.
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children: React.ReactNode;
}

const copy = {
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
};

export default function AuthShell({ mode, children }: AuthShellProps) {
  const c = copy[mode];

  return (
    <div className="nkyel-auth-page">
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
