/* Ñkyel AI · layout.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   Root layout Next.js — Unified Global Intelligence Layout */

import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';

import SplashScreen from '@/components/SplashScreen';
import GlobalShortcuts from '@/components/shortcuts/GlobalShortcuts';
import CommandPalette from '@/components/palette/CommandPalette';
import LocaleFontLoader from '@/components/LocaleFontLoader';
import { AppProviders } from '@/providers/AppProviders';
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
      { url: '/brand/nkyel-ai-android.png', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/nkyel-ai-ios.png', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ñkyel AI',
    startupImage: [
      {
        url: '/brand/nkyel-ai-ios.png',
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
    <html lang="fr" className="dark" data-theme="dark" data-accent="gold" suppressHydrationWarning>
      <head>
        {/* FOUC prevention — apply theme + accent before first paint */}
        <script
          id="fouc-prevention"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('Nkyel_Settings_Storage_V2');if(!raw)return;var state=JSON.parse(raw).state||{};var theme=state.themeMode||'auto';if(theme==='system'||theme==='auto'){theme=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}else if(theme!=='dark'&&theme!=='light'){theme='dark'}var lt=theme==='light';document.documentElement.className=lt?'light':'dark';document.documentElement.setAttribute('data-theme',theme);document.documentElement.setAttribute('data-accent',state.accent||'neutral');var mc={'dark':'#070B12','light':'#FDF9F9'};var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',mc[theme]||'#070B12');document.documentElement.setAttribute('data-text-size',state.fontSize||'default');document.documentElement.setAttribute('data-text-style',state.textStyle||'balanced');document.documentElement.setAttribute('data-density',state.density||'comfortable');document.documentElement.setAttribute('data-motion',state.reducedMotion?'reduced':'normal');document.documentElement.setAttribute('data-contrast',state.highContrast?'high':'normal')}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`antialiased overflow-hidden ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AppProviders>
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
        </AppProviders>
      </body>
    </html>
  );
}

