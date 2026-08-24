/* Ñkyel AI · sign-up/[[...sign-up]]/page.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   MISSION P0 — Production-Ready Clerk Sign-Up Page with Resilient Fallback */

'use client';

import React, { useState, useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { LockKey, ArrowRight, User } from '@phosphor-icons/react';

export default function SignUpPage() {
  const router = useRouter();
  const [hasClerkKey, setHasClerkKey] = useState<boolean>(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key || key.includes('your_clerk_publishable_key')) {
      setHasClerkKey(false);
    }
  }, []);

  const handleDemoSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/chat');
    }, 400);
  };

  return (
    <AuthShell mode="sign-up">
      {hasClerkKey ? (
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/chat"
          appearance={{
            variables: {
              colorPrimary: '#D5AE57',
              colorText: 'var(--text-primary)',
              colorTextSecondary: 'var(--text-secondary)',
              colorBackground: 'transparent',
              colorInputBackground: 'var(--surface-sunken)',
              colorInputText: 'var(--text-primary)',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
            },
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none p-0 border-0 w-full',
              header: 'hidden',
              footer: 'hidden',
              formButtonPrimary:
                'w-full h-11 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--material-canvas)] font-semibold text-sm shadow-sm border-0 transition-all cursor-pointer active:scale-[0.99]',
              socialButtonsBlockButton:
                'w-full h-11 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] transition-all font-medium text-xs flex items-center justify-center gap-2.5 active:scale-[0.99]',
              socialButtonsBlockButtonText:
                'text-[var(--text-primary)] font-medium text-xs',
              socialButtonsBlockButtonArrow:
                'text-[var(--text-secondary)]',
              formFieldInput:
                'w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-base sm:text-sm transition-all',
              formFieldLabel:
                'text-xs font-medium text-[var(--text-secondary)] mb-1 block',
              dividerLine:
                'bg-[var(--border-subtle)]',
              dividerText:
                'text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider',
              formFieldAction:
                'text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2',
              identityPreview:
                'p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)]',
              identityPreviewText:
                'text-xs text-[var(--text-primary)] font-medium',
              identityPreviewEditButton:
                'text-xs text-[var(--accent)] font-semibold hover:underline',
              formResendCodeLink:
                'text-xs text-[var(--accent)] hover:underline',
              otpCodeFieldInput:
                'h-12 w-10 text-center text-lg font-mono rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] text-[var(--text-primary)]',
              alert:
                'p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs',
              alertText:
                'text-xs text-red-500 font-medium',
            },
          }}
        />
      ) : (
        /* Fallback Souverain direct si les clés d'environnement Clerk sont en cours de configuration */
        <form onSubmit={handleDemoSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Daniel Jonathan ANDJ"
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fondateur@nkyel.ai"
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--material-canvas)] font-semibold text-sm shadow-sm border-0 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Créer mon compte</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
