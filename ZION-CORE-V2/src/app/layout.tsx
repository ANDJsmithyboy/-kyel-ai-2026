/* Ñkyel AI · layout.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   Root layout Next.js — Clerk + PostHog + Geist Typography */

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { Geist, Geist_Mono } from 'next/font/google';
import SplashScreen from '@/components/SplashScreen';
import { PostHogProvider } from '@/lib/posthog';
import GlobalShortcuts from '@/components/shortcuts/GlobalShortcuts';
import CommandPalette from '@/components/palette/CommandPalette';
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
  icons: { icon: '/favicon.png' },
  robots: 'noindex,nofollow',
};

export const viewport: Viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

const enableSplash = process.env.NEXT_PUBLIC_ENABLE_SPLASH === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={frFR} appearance={{
      variables: {
        colorPrimary: '#B8922A',
        colorBackground: 'hsl(0 0% 100%)',
        colorDanger: '#DC2626',
        borderRadius: '12px',
      },
      elements: {
        card: 'bg-[var(--bg)] border border-[var(--border)] shadow-lg',
        headerTitle: 'hidden',
        headerSubtitle: 'hidden',
        formButtonPrimary: 'bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] font-bold border-0 transition-opacity',
        footerActionLink: 'text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors font-semibold',
        formFieldInput: 'bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] text-[var(--text-primary)]',
        dividerLine: 'bg-[var(--border)]',
        dividerText: 'text-[var(--text-secondary)]',
        socialButtonsBlockButton: 'bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors',
        socialButtonsBlockButtonText: 'text-[var(--text-primary)] font-medium',
        socialButtonsBlockButtonArrow: 'text-[var(--text-primary)]',
        watermark: 'hidden',
      },
    }}>
      <html lang="fr" className="light" data-theme="neo-blanc" data-accent="gold" suppressHydrationWarning>
        <head>
          {/* FOUC prevention — apply theme + accent before first paint */}
          <Script
            id="fouc-prevention"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('Nkyel AI_theme')||'neo-blanc';var a=localStorage.getItem('Nkyel AI_accent')||'gold';var tm=localStorage.getItem('Nkyel AI_themeMode')||'light';var theme=tm==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'black-panther':'neo-blanc'):t;var ok=['black-panther','nuit-lope','aurore-ogoue','bleu-nuit','violette-mandrille','neo-blanc'];if(ok.indexOf(theme)===-1)theme='neo-blanc';var lt=theme==='aurore-ogoue'||theme==='neo-blanc';document.documentElement.className=lt?'light':'dark';document.documentElement.setAttribute('data-theme',theme);document.documentElement.setAttribute('data-accent',a);var mc={'black-panther':'#0F0F0F','nuit-lope':'#050507','aurore-ogoue':'#F8F8F4','bleu-nuit':'#060A14','violette-mandrille':'#08060F','neo-blanc':'#FAFAF8'};var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',mc[theme]||'#FAFAF8');var fs=localStorage.getItem('Nkyel AI_fontSize')||'normal';document.documentElement.setAttribute('data-font-size',fs);var den=localStorage.getItem('Nkyel AI_density')||'comfortable';document.documentElement.setAttribute('data-density',den)}catch(e){}})();`,
            }}
          />
        </head>
        <body className={`antialiased overflow-hidden ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
          <PostHogProvider>
            {enableSplash && <SplashScreen />}
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
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
