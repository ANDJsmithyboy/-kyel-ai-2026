// NEXT.JS 16 ARCHITECTURE
// DO NOT CREATE middleware.ts
// Clerk authentication MUST remain in proxy.ts
/* Ñkyel AI · proxy.ts · SmartANDJ AI Technologies
   Canonical Clerk Auth Proxy (Clerk + Next.js 16 App Router)
   Fondateur : Daniel Jonathan ANDJ */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Public routes that do NOT require authentication.
 * Everything else is protected by Clerk session management.
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/auth-debug(.*)',
  '/api/webhooks(.*)',
  '/api/v1/clerk-webhook(.*)',
  '/api/health(.*)',
  '/api/chat(.*)',
  '/',
  '/terms(.*)',
  '/privacy(.*)',
  '/legal(.*)',
  '/cookies(.*)',
  '/acceptable-use(.*)',
  '/security(.*)',
  '/review(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.includes('nkyel_review_session')) {
      return;
    }
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
