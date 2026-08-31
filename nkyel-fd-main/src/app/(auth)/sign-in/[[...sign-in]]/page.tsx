/* Ñkyel AI · Sign-In Page · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ */

import { SignIn } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn
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
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/chat"
      />
    </AuthShell>
  );
}
