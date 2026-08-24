/* Ñkyel AI · sign-up/[[...sign-up]]/page.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   MISSION P0 — Production-Ready Clerk Sign-Up Page */

'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
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
    </AuthShell>
  );
}
