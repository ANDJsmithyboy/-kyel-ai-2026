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
            card: 'bg-transparent shadow-none border-none w-full p-0',
            header: 'hidden',
            footer: 'hidden',
            footerAction: 'hidden',
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
