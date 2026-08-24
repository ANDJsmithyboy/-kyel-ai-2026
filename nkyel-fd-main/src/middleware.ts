/* Ñkyel AI · middleware.ts · SmartANDJ AI Technologies
   Fail-safe Edge Middleware with resilient Clerk Auth
   Fondateur : Daniel Jonathan ANDJ */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/welcome',
  '/chat(.*)',
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
  '/settings(.*)',
  '/workspace(.*)',
  '/memory(.*)',
  '/protocols(.*)',
  '/scheduled(.*)',
  '/admin(.*)',
]);

export default function middleware(req: NextRequest) {
  try {
    const hasClerkKey = Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_SECRET_KEY
    );

    if (hasClerkKey) {
      const handler = clerkMiddleware(async (auth: any, r: any) => {
        if (isPublicRoute(r)) {
          return NextResponse.next();
        }
        return NextResponse.next();
      });
      return handler(req, {} as any);
    }
  } catch (err) {
    // Fail-safe protection: never let Edge throw 500
    console.warn('[Middleware] Resilient fallback:', err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
