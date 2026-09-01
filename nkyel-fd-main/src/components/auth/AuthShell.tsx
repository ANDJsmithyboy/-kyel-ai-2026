/**
 * Ñkyel AI — Sovereign Authentication Shell
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Matches approved visual reference exactly:
 * Meadow background with panther artwork, white centered card,
 * ñkyel brand, EN/FR selector, and visible minimal authentication form.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthForm from './AuthForm';

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up';
  children?: React.ReactNode;
}

const copy = {
  'en-US': {
    signature: 'by SmartANDJ AI Technologies',
    'sign-in': {
      title: 'Welcome back',
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
    signature: 'par SmartANDJ AI Technologies',
    'sign-in': {
      title: 'Bon retour',
      subtitle: 'Connectez-vous pour continuer sur Ñkyel',
      switchText: "Vous n'avez pas de compte ?",
      switchLink: 'Créer un compte',
      switchHref: '/sign-up',
    },
    'sign-up': {
      title: 'Créer un compte',
      subtitle: 'Inscrivez-vous pour commencer avec Ñkyel',
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
  const [currentStep, setCurrentStep] = useState<'initial' | 'verify_email_code' | 'password'>('initial');

  useEffect(() => {
    setMounted(true);
  }, []);

  const c = copy[locale][mode];

  const toggleLocale = () => {
    setLocale(prev => (prev === 'en-US' ? 'fr-FR' : 'en-US'));
  };

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
          <span className={locale === 'en-US' ? 'active' : ''}>EN</span>
          <span className="sep">|</span>
          <span className={locale === 'fr-FR' ? 'active' : ''}>FR</span>
        </button>
      </div>

      <main className="nkyel-auth-card">
        {/* Brand + Signature */}
        <div className="nkyel-auth-brand">
          <div className="nkyel-auth-brand-row">
            <img
              src="/nkyel-logo.png"
              alt="Ñkyel"
              className="nkyel-auth-logo"
              width={44}
              height={44}
            />
            <h2 className="nkyel-auth-brand-name">ñkyel</h2>
          </div>
          <span className="nkyel-auth-signature">{copy[locale].signature}</span>
        </div>

        {/* Title & Subtitle */}
        <div className="nkyel-auth-header">
          <h1 className="nkyel-auth-title">
            {currentStep === 'verify_email_code'
              ? (locale === 'fr-FR' ? 'Vérification' : 'Verification')
              : currentStep === 'password'
              ? (locale === 'fr-FR' ? 'Mot de passe' : 'Enter Password')
              : c.title}
          </h1>
          <p className="nkyel-auth-subtitle">
            {currentStep === 'initial' && c.subtitle}
          </p>
        </div>

        {/* Authentication Form */}
        <div className="nkyel-auth-form">
          {children || (
            <AuthForm
              mode={mode}
              locale={locale}
              onStepChange={setCurrentStep}
            />
          )}
        </div>

        {/* Switch Link */}
        {currentStep === 'initial' && (
          <div className="nkyel-auth-switch">
            <p>
              {c.switchText}{' '}
              <Link href={c.switchHref} className="nkyel-auth-link">
                {c.switchLink}
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
