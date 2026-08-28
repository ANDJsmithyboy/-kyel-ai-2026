/* Ñkyel AI · layout.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   Root layout Next.js — Unified Global Intelligence Layout */

import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import SplashScreen from '@/components/SplashScreen';
import GlobalShortcuts from '@/components/shortcuts/GlobalShortcuts';
import CommandPalette from '@/components/palette/CommandPalette';
import LocaleFontLoader from '@/components/LocaleFontLoader';
import './globals.css';

/* ── Typography: Geist Sans + Geist Mono only ──────── */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ñkyel AI — Sovereign Global Intelligence',
  description: 'Ñkyel AI by SmartANDJ AI Technologies — Next-Generation Global Intelligence Architecture',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ñkyel',
    startupImage: [
      {
        url: '/apple-touch-icon-180x180.png',
      },
    ],
  },
  robots: 'noindex,nofollow',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#090B0E' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

const enableSplash = process.env.NEXT_PUBLIC_ENABLE_SPLASH === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in'}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/chat'}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/chat'}
    >
      <html lang="fr" className="light" data-theme="neo-blanc" data-accent="gold" suppressHydrationWarning>
        <head>
          {/* FOUC prevention — apply theme + accent before first paint */}
          <script
            id="fouc-prevention"
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('Nkyel AI_theme')||'neo-blanc';var a=localStorage.getItem('Nkyel AI_accent')||'gold';var tm=localStorage.getItem('Nkyel AI_themeMode')||'light';var theme=tm==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'black-panther':'neo-blanc'):t;var ok=['black-panther','nuit-lope','aurore-ogoue','bleu-nuit','violette-mandrille','neo-blanc'];if(ok.indexOf(theme)===-1)theme='neo-blanc';var lt=theme==='aurore-ogoue'||theme==='neo-blanc';document.documentElement.className=lt?'light':'dark';document.documentElement.setAttribute('data-theme',theme);document.documentElement.setAttribute('data-accent',a);var mc={'black-panther':'#0F0F0F','nuit-lope':'#050507','aurore-ogoue':'#F8F8F4','bleu-nuit':'#060A14','violette-mandrille':'#08060F','neo-blanc':'#FAFAF8'};var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',mc[theme]||'#FAFAF8');var fs=localStorage.getItem('Nkyel AI_fontSize')||'normal';document.documentElement.setAttribute('data-font-size',fs);var den=localStorage.getItem('Nkyel AI_density')||'comfortable';document.documentElement.setAttribute('data-density',den)}catch(e){}})();`,
            }}
          />
        </head>
        <body className={`antialiased overflow-hidden ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
          {enableSplash && <SplashScreen />}
          <LocaleFontLoader />
          <GlobalShortcuts />
          <CommandPalette />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

