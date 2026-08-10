/* GabomaGPT · sign-up/page.tsx · SmartANDJ AI Technologies */
import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--zc-background)] py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Gaboma AI Custom Header */}
      <div className="mb-6 flex flex-col items-center animate-fade-in-up">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl overflow-hidden mb-4 border border-[var(--accent)]/30">
          <Image
            src="/gabomagpt-logo.jpeg"
            alt="Gaboma AI"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight text-center">
          Rejoindre <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[#ECFDF5]">Gaboma AI</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1 font-medium">Créer une identité souveraine</p>
      </div>

      <div className="w-full max-w-md animate-fade-in-up delay-75 flex justify-center">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>

      {/* Powered By Footer */}
      <div className="mt-12 text-center animate-fade-in-up delay-150">
        <p className="text-[11px] text-[var(--text-tertiary)] font-medium tracking-[0.2em] uppercase">
          Powered by <span className="text-[var(--accent)] font-bold">SmartANDJ AI Tech</span>
        </p>
      </div>
    </div>
  );
}
