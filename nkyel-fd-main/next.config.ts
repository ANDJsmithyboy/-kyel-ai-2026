/* Nkyel AI - next.config.ts - SmartANDJ AI Technologies */
const nextConfig = {
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.nkyel.ga' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '3000-ipfp8wql86od0exl6xn0o-8352c145.us5.manus.computer',
  ],
};

export default nextConfig;
