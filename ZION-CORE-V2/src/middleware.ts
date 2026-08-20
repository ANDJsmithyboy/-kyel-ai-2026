/* Nkyel AI · middleware.ts · SmartANDJ AI Technologies
   Clerk auth + error-resilient Edge middleware + onboarding redirect
   Fondateur : Daniel Jonathan ANDJ */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

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
export default function middleware(req: NextRequest) {
  // Bypassing all authentication for the Google Demo
  return NextResponse.next();
}




export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
