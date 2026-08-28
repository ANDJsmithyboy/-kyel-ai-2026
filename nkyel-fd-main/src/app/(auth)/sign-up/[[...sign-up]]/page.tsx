/**
 * Ñkyel AI — Sign-Up Page (Clerk Authentication Engine)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <div className="w-full flex justify-center">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
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
                'w-full h-11 rounded-2xl bg-gradient-to-r from-[#E5A93C] to-[#D4952B] hover:from-[#F0B74B] hover:to-[#E5A93C] text-black font-semibold text-sm shadow-[0_4px_25px_rgba(229,169,60,0.3)] transition-all active:scale-[0.98] touch-manipulation min-h-[44px]',
              formFieldInput:
                'w-full h-11 px-4 rounded-2xl border border-white/12 bg-white/[0.04] text-white placeholder:text-neutral-500 focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C] text-sm outline-none transition-all touch-manipulation',
              formFieldLabel: 'text-xs font-semibold text-neutral-300',
              socialButtonsBlockButton:
                'w-full h-11 px-4 rounded-2xl bg-white/[0.04] border border-white/12 hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98] touch-manipulation min-h-[44px]',
              socialButtonsBlockButtonText: 'text-xs font-medium text-white',
              dividerLine: 'bg-white/10',
              dividerText: 'text-[10px] font-mono text-neutral-500 uppercase bg-[#0E121B] px-3',
              identityPreview: 'rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-white',
              formFieldSuccessText: 'text-xs text-emerald-400',
              formFieldErrorText: 'text-xs text-rose-400',
              alert: 'rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs p-3.5',
            },
          }}
        />
      </div>
    </AuthShell>
  );
}
