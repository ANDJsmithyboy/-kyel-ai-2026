/**
 * Ñkyel AI — Sign-In Page (Clerk Authentication Engine)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <div className="w-full flex justify-center">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/chat"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'w-full shadow-none border-0 bg-transparent',
              card: 'w-full shadow-none p-0 border-0 bg-transparent',
              header: 'hidden',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              footer: 'hidden',
              footerAction: 'hidden',
              formButtonPrimary:
                'w-full h-11 rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 font-semibold text-sm shadow-sm transition-all active:scale-[0.98] touch-manipulation min-h-[44px]',
              formFieldInput:
                'w-full h-11 px-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-sm outline-none transition-all touch-manipulation',
              formFieldLabel: 'text-xs font-semibold text-[var(--text-secondary)]',
              socialButtonsBlockButton:
                'w-full h-11 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98] touch-manipulation min-h-[44px]',
              socialButtonsBlockButtonText: 'text-xs font-medium text-[var(--text-primary)]',
              dividerLine: 'bg-[var(--border)]',
              dividerText: 'text-[10px] font-mono text-[var(--text-tertiary)] uppercase bg-transparent px-3',
              identityPreview: 'rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-3 text-[var(--text-primary)]',
              formFieldSuccessText: 'text-xs text-[var(--success)]',
              formFieldErrorText: 'text-xs text-[var(--danger)]',
              alert: 'rounded-2xl border border-[var(--danger)] bg-red-500/10 text-[var(--danger)] text-xs p-3.5',
            },
          }}
        />
      </div>
    </AuthShell>
  );
}
