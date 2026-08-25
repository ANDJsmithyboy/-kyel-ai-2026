/**
 * Ñkyel AI — Next.js Route Protection & Clerk Middleware · SmartANDJ AI Technologies
 * Protège les routes souveraines du workspace (/chat, /workspace, /settings, /admin)
 * tout en maintenant accessibles les routes publiques d'accueil, d'authentification et de partage.
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/legal(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/cookies(.*)',
  '/security(.*)',
  '/acceptable-use(.*)',
  '/share(.*)',
  '/api/health',
  '/api/readiness',
  '/api/public(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
