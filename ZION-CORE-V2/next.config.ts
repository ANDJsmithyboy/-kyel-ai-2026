/* Nkyel AI - next.config.ts - SmartANDJ AI Technologies */
import type { NextConfig } from 'next';

const BACKEND_URL = process.env.OPENWEBUI_BACKEND_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.nkyel.ga' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

