/**
 * Ñkyel AI · Service Worker (Production PWA Hardened)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Conservative production caching:
 * - App shell & offline fallback
 * - Static versioned assets (icons, fonts)
 * - NEVER caches: private APIs, auth endpoints, SSE streams, tokens
 */

const CACHE_NAME = 'nkyel-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html',
  '/favicon.png',
];

// Install — pre-cache offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — strict network-first for dynamic content, cache-first only for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER intercept or cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. NEVER cache dynamic/authenticated APIs, SSE, or auth endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/stream') ||
    url.pathname.includes('clerk') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('neon') ||
    url.hostname.includes('runpod')
  ) {
    return; // Pass through directly to network
  }

  // 3. Static assets (fonts, icons, immutable files)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
          // Only cache successful static responses (same origin)
          if (
            networkResponse.status === 200 &&
            url.origin === self.location.origin &&
            (url.pathname.startsWith('/_next/static/') ||
              url.pathname.endsWith('.png') ||
              url.pathname.endsWith('.svg') ||
              url.pathname.endsWith('.woff2'))
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for navigation
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
