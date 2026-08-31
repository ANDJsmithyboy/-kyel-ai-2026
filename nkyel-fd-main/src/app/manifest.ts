export default function manifest(): any {
  return {
    name: 'Ñkyel AI — Sovereign Global Intelligence',
    short_name: 'Ñkyel AI',
    description: "Architecture d'intelligence souveraine et multi-agents de nouvelle génération.",
    start_url: '/',
    display: 'standalone',
    background_color: '#090B0E',
    theme_color: '#D5AE57',
    orientation: 'any',
    icons: [
      {
        src: '/brand/nkyel-ai-android.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/brand/nkyel-ai-ios.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
  };
}
