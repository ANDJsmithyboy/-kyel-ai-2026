/* Nkyel AI · layout.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Root layout Next.js 15 — Clerk + PostHog + Sentry + Splash screen + thème Zion Core V3 */

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { Sora, Outfit, JetBrains_Mono } from 'next/font/google';
import SplashScreen from '@/components/SplashScreen';
import { PostHogProvider } from '@/lib/posthog';
import GlobalShortcuts from '@/components/shortcuts/GlobalShortcuts';
import './globals.css';

/* -- V3 TYPOGRAPHIE -- */
const sora = Sora({ 
  subsets: ['latin'], 
  variable: '--font-sora',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nkyel AI — IA Souveraine du Gabon',
  description: 'Nkyel AI par SmartANDJ AI Technologies — IA souveraine du Gabon',
  icons: { icon: '/favicon.png' },
  robots: 'noindex,nofollow',
};

export const viewport: Viewport = {
  themeColor: '#020304', /* V3 default black-panther */
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={frFR} appearance={{
      variables: {
        colorPrimary: '#C5A059',
        colorBackground: '#14130F',
        colorDanger: '#E0584B',
        borderRadius: '14px',
      },
      elements: {
        card: 'bg-[var(--bg)] border border-[var(--border)] shadow-lg',
        headerTitle: 'hidden',
        headerSubtitle: 'hidden',
        formButtonPrimary: 'bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] font-bold border-0 transition-opacity',
        footerActionLink: 'text-[var(--accent)] hover:text-white transition-colors font-semibold',
        formFieldInput: 'bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-20)] text-[var(--text-primary)]',
        dividerLine: 'bg-[var(--border)]',
        dividerText: 'text-[var(--text-secondary)]',
        socialButtonsBlockButton: 'bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors',
        socialButtonsBlockButtonText: 'text-[var(--text-primary)] font-medium',
        socialButtonsBlockButtonArrow: 'text-[var(--text-primary)]',
        watermark: 'hidden',
      },
    }}>
      {/* V3: theme par défaut est black-panther */}
      <html lang="fr" className="dark" data-theme="black-panther" data-accent="foret" suppressHydrationWarning>
        <head>
          {/* FOUC prevention — applique thème + accent avant le premier paint */}
          <Script
            id="fouc-prevention"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('Nkyel AI_theme')||'black-panther';var a=localStorage.getItem('Nkyel AI_accent')||'foret';var bp=localStorage.getItem('Nkyel AI_bp')==='true';var theme=bp?'black-panther':t;var ok=['black-panther','nuit-lope','aurore-ogoue','bleu-nuit','violette-mandrille','neo-blanc'];if(ok.indexOf(theme)===-1)theme='black-panther';var lt=theme==='aurore-ogoue'||theme==='neo-blanc';document.documentElement.className=lt?'light':'dark';document.documentElement.setAttribute('data-theme',theme);document.documentElement.setAttribute('data-accent',a);var mc={'black-panther':'#020304','nuit-lope':'#050507','aurore-ogoue':'#F8F8F4','bleu-nuit':'#060A14','violette-mandrille':'#08060F','neo-blanc':'#FAFAF8'};var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',mc[theme]||'#020304');var fs=localStorage.getItem('Nkyel AI_fontSize');if(fs){var sc=fs==='small'?0.9:fs==='large'?1.1:1;document.documentElement.style.setProperty('--app-text-scale',String(sc))}}catch(e){}})();`,
            }}
          />
        </head>
        <body className={`antialiased overflow-hidden ${sora.variable} ${outfit.variable} ${jetbrainsMono.variable} font-body`} suppressHydrationWarning>
          <PostHogProvider>
            <SplashScreen />
            <GlobalShortcuts />
            {children}
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                },
              }}
            />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
