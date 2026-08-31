/* Ñkyel AI · Sign-Up Page · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ */

import { SignUp } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-transparent shadow-none border-none w-full',
            headerTitle: 'text-[var(--text-primary)] font-semibold',
            headerSubtitle: 'text-[var(--text-secondary)]',
            formButtonPrimary:
              'bg-[#18181b] hover:bg-[#27272a] text-white rounded-[24px] h-[48px] font-medium transition-all',
            formFieldInput:
              'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] rounded-xl',
            footerActionLink: 'text-[var(--accent)] hover:text-[var(--accent-hover)]',
            socialButtonsBlockButton:
              'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)]',
            dividerLine: 'bg-[var(--border)]',
            dividerText: 'text-[var(--text-tertiary)]',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/chat"
      />
    </AuthShell>
  );
}
