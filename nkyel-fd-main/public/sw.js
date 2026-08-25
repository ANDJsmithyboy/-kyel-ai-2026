/**
 * Ñkyel AI · Service Worker (Production PWA Hardened v3)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Production Caching Rules:
 * - NEVER pre-caches or caches navigation HTML (prevents stale React chunk mismatches)
 * - Navigation requests are strictly Network-First with offline fallback
 * - NEVER caches API routes (/api/*), SSE streams (/stream*), or auth tokens
 * - Only caches immutable versioned static assets (fonts, images)
 */

const CACHE_NAME = 'nkyel-pwa-v3';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/offline.html',
  '/favicon.png',
];

// Install — pre-cache offline fallback shell only (NO HTML root pages)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — purge ALL old cache versions immediately
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

// Fetch — strict network-first for navigation, bypass for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER intercept non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. NEVER cache dynamic/authenticated APIs, SSE, or external auth
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/stream') ||
    url.pathname.includes('clerk') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('neon') ||
    url.hostname.includes('runpod') ||
    url.hostname.includes('google')
  ) {
    return;
  }

  // 3. Navigation requests (HTML pages) MUST ALWAYS BE NETWORK-FIRST
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // 4. Static assets (fonts, icons, immutable hashed next files)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
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
          return new Response('', { status: 408, statusText: 'Request timed out' });
        });
    })
  );
});
