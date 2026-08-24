/* Ñkyel AI · sign-in/[[...sign-in]]/page.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   Page de Connexion Séparée Ñkyel AI × Clerk Pro */

'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import NkyelAuthShell from '@/components/auth/NkyelAuthShell';

export default function SignInPage() {
  return (
    <NkyelAuthShell
      mode="sign-in"
      title="Bon retour sur Ñkyel AI"
      subtitle="Connectez-vous pour reprendre vos missions agentiques et accéder à vos souvenirs DeerMem."
    >
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/chat"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-transparent shadow-none p-0 border-0 w-full',
            header: 'hidden',
            footer: 'hidden',
            formButtonPrimary:
              'w-full h-11 rounded-xl bg-gradient-to-r from-[#B8922A] via-[#D5AE57] to-[#B8922A] hover:opacity-95 text-[#090A0E] font-bold text-sm shadow-md shadow-[#D5AE57]/20 border-0 transition-all cursor-pointer',
            socialButtonsBlockButton:
              'w-full h-11 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] transition-all font-medium text-xs flex items-center justify-center gap-2',
            socialButtonsBlockButtonText: 'text-[var(--text-primary)] font-medium text-xs',
            formFieldInput:
              'w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all',
            formFieldLabel: 'text-xs font-semibold text-[var(--text-secondary)] mb-1 block',
            dividerLine: 'bg-[var(--border-subtle)]',
            dividerText: 'text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider',
            formFieldAction: 'text-xs text-[#D5AE57] hover:underline',
            identityPreview: 'p-3 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)]',
            identityPreviewText: 'text-xs text-[var(--text-primary)] font-medium',
            identityPreviewEditButton: 'text-xs text-[#D5AE57] font-semibold hover:underline',
            formResendCodeLink: 'text-xs text-[#D5AE57] hover:underline',
          },
        }}
      />
    </NkyelAuthShell>
  );
}
