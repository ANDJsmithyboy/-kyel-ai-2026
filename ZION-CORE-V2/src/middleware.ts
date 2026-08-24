/* Ñkyel AI · middleware.ts · SmartANDJ AI Technologies
   Clerk auth + error-resilient Edge middleware
   Fondateur : Daniel Jonathan ANDJ */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/welcome',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health',
  '/terms',
  '/privacy',
  '/acceptable-use',
  '/cookies',
  '/security',
  '/legal',
]);

export default clerkMiddleware(async (auth: any, req: any) => {
  // Public routes pass through freely
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Non-public routes pass through to app shell
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
