import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ñkyel AI — Sovereign Global Intelligence',
    short_name: 'Ñkyel',
    description: "Architecture d'intelligence souveraine et multi-agents de nouvelle génération.",
    start_url: '/',
    display: 'standalone',
    background_color: '#090B0E',
    theme_color: '#D5AE57',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/nkyel-ai-android.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/nkyel-ai-ios.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
  };
}
