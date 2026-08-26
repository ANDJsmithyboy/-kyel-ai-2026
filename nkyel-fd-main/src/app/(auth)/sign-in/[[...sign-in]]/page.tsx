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
                'w-full h-11 rounded-xl bg-black hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] touch-manipulation min-h-[44px]',
              formFieldInput:
                'w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-black focus:ring-1 focus:ring-black text-sm outline-none transition-all touch-manipulation',
              formFieldLabel: 'text-xs font-semibold text-slate-700',
              socialButtonsBlockButton:
                'w-full h-11 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] touch-manipulation min-h-[44px]',
              socialButtonsBlockButtonText: 'text-xs font-medium text-slate-700',
              dividerLine: 'bg-slate-200',
              dividerText: 'text-[11px] font-mono text-slate-400 uppercase bg-white px-2',
              identityPreview: 'rounded-xl border border-slate-200 bg-slate-50 p-3',
              formFieldSuccessText: 'text-xs text-emerald-600',
              formFieldErrorText: 'text-xs text-red-600',
              alert: 'rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs p-3',
            },
          }}
        />
      </div>
    </AuthShell>
  );
}
