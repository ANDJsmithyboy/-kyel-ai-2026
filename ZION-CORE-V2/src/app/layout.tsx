/* Ñkyel AI · layout.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Root layout Next.js — Clerk + PostHog + Sentry + Geist Sans/Mono + Ñkyel Design System V4 */

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { Geist, Geist_Mono } from 'next/font/google';
import SplashScreen from '@/components/SplashScreen';
import { PostHogProvider } from '@/lib/posthog';
import GlobalShortcuts from '@/components/shortcuts/GlobalShortcuts';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ñkyel AI — Intelligence Souveraine',
  description: 'Ñkyel AI par SmartANDJ AI Technologies — Intelligence souveraine, internationale, vérifiable.',
  icons: { icon: '/favicon.png' },
  robots: 'noindex,nofollow',
};

export const viewport: Viewport = {
  themeColor: '#08090D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={frFR} appearance={{
      variables: {
        colorPrimary: '#C5A059',
        colorBackground: '#0E1117',
        colorDanger: '#BE6254',
        borderRadius: '14px',
      },
      elements: {
        card: 'bg-[var(--bg)] border border-[var(--border-default)] shadow-lg',
        headerTitle: 'hidden',
        headerSubtitle: 'hidden',
        formButtonPrimary: 'bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] font-semibold border-0 transition-opacity',
        footerActionLink: 'text-[var(--accent)] hover:text-[var(--fg)] transition-colors font-medium',
        formFieldInput: 'bg-[var(--surface)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)] text-[var(--fg)]',
        dividerLine: 'bg-[var(--border-default)]',
        dividerText: 'text-[var(--fg-muted)]',
        socialButtonsBlockButton: 'bg-[var(--surface)] border border-[var(--border-default)] hover:bg-[var(--surface-raised)] text-[var(--fg)] transition-colors',
        socialButtonsBlockButtonText: 'text-[var(--fg)] font-medium',
        socialButtonsBlockButtonArrow: 'text-[var(--fg)]',
        watermark: 'hidden',
      },
    }}>
      <html lang="fr" className="dark" data-theme="black-panther" suppressHydrationWarning>
        <head>
          {/* FOUC prevention — apply theme + accent + direction before first paint */}
          <Script
            id="fouc-prevention"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('Nkyel AI_theme')||'black-panther';var a=localStorage.getItem('Nkyel AI_accent')||'foret';var ok=['black-panther','nuit-lope','aurore-ogoue','bleu-nuit','violette-mandrille','neo-blanc'];if(ok.indexOf(t)===-1)t='black-panther';var lt=t==='aurore-ogoue'||t==='neo-blanc';document.documentElement.className=lt?'light':'dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-accent',a);var mc={'black-panther':'#08090D','nuit-lope':'#030305','aurore-ogoue':'#F8F8F5','bleu-nuit':'#060A14','violette-mandrille':'#08060F','neo-blanc':'#FAFAF8'};var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',mc[t]||'#08090D');var dir=localStorage.getItem('nkyel-language-preferences');if(dir){try{var lp=JSON.parse(dir);var d=lp&&lp.state&&lp.state.uiLanguage;if(d==='ar'||d==='he'||d==='fa'||d==='ur')document.documentElement.dir='rtl';else document.documentElement.dir='ltr'}catch(e){}}var fs=localStorage.getItem('Nkyel AI_fontSize');if(fs){var sc=fs==='small'?0.9:fs==='large'?1.1:1;document.documentElement.style.setProperty('--app-text-scale',String(sc))}}catch(e){}})();`,
            }}
          />
        </head>
        <body
          className={`antialiased overflow-hidden ${geistSans.variable} ${geistMono.variable}`}
          style={{ fontFamily: 'var(--font-sans)' }}
          suppressHydrationWarning
        >
          <PostHogProvider>
            <SplashScreen />
            <GlobalShortcuts />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                },
              }}
            />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
