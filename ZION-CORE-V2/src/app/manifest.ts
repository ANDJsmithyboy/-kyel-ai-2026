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
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
  };
}
