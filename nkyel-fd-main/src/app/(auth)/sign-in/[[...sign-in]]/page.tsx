/* Ñkyel AI · Sign-In Page · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ */

import { SignIn } from '@clerk/nextjs';
import AuthShell from '@/components/auth/AuthShell';

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
        <SignIn
          appearance={{
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            },
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none border-none w-full p-0 gap-4',
              header: 'hidden',
              footer: 'hidden',
              footerAction: 'hidden',
              
              /* Google Button */
              socialButtonsBlockButton: 'w-full flex items-center justify-center gap-2 border border-gray-200 rounded-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-none h-auto',
              socialButtonsBlockButtonText: 'font-medium text-gray-700 text-sm',
              socialButtonsProviderIcon: 'w-5 h-5',
              
              /* Divider */
              dividerRow: 'my-2 flex items-center gap-3',
              dividerLine: 'flex-1 h-px bg-gray-200',
              dividerText: 'text-sm text-gray-400 font-normal normal-case',
              
              /* Form */
              form: 'flex flex-col gap-3',
              formFieldRow: 'w-full',
              formFieldLabel: 'hidden', /* Cache le label pour correspondre à l'image */
              
              /* Input avec icone email en background */
              formFieldInput: 'w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors shadow-none text-gray-800 placeholder-gray-400 h-auto bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[position:1rem_center] bg-[length:1.25rem_1.25rem]',
              
              /* Bouton Continuer */
              formButtonPrimary: 'w-full bg-[#1c1c1c] hover:bg-black text-white rounded-full py-3 text-sm font-medium transition-colors shadow-none mt-1 h-auto',
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
