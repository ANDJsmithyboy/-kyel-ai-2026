export default function manifest(): any {
  return {
    name: 'Ñkyel AI — Sovereign Global Intelligence',
    short_name: 'Ñkyel AI',
    description: "Architecture d'intelligence souveraine et multi-agents de nouvelle génération.",
    start_url: '/',
    id: '/',
    display: 'standalone',
    display_override: ['standalone'],
    background_color: '#090B0E',
    theme_color: '#D5AE57',
    orientation: 'any',
    scope: '/',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
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
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/brand/nkyel-ai-android.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
    shortcuts: [
      {
        name: 'Nouvelle mission',
        short_name: 'Mission',
        url: '/chat?new=true',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
