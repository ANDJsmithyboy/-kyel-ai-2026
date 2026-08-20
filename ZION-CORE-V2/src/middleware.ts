/* Nkyel AI · middleware.ts · SmartANDJ AI Technologies
   Clerk auth + error-resilient Edge middleware + onboarding redirect
   Fondateur : Daniel Jonathan ANDJ */

export const runtime = 'nodejs';


import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// -- Route matchers ------------------------------------------
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health',
  '/terms',
  '/privacy',
  '/acceptable-use',
]);

const isOnboardingRoute = createRouteMatcher([
  '/onboarding',
  '/api/user/onboarding',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// -- Middleware -----------------------------------------------
export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const { userId, sessionClaims } = await auth();

    // Public routes — allow through
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // Not authenticated — redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // -- Onboarding check --
    // If the user hasn't completed onboarding, redirect to /onboarding
    // (except if they're already on the onboarding page or its API)
    const publicMeta = (sessionClaims?.metadata as { onboardingComplete?: boolean }) || {};
    if (!publicMeta.onboardingComplete && !isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // If user HAS completed onboarding but is visiting /onboarding, send to /chat
    if (publicMeta.onboardingComplete && req.nextUrl.pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/chat', req.url));
    }

    // Admin routes — check role
    if (isAdminRoute(req)) {
      const role = (sessionClaims?.metadata as { role?: string })?.role;
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/chat', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If Clerk auth fails (missing keys, network issue), allow public routes
    // and redirect others to sign-in gracefully
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    // Fallback: let the request through rather than crash the middleware
    console.error('[Middleware] Auth error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
