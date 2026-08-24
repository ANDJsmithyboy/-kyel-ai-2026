/* Ñkyel AI · middleware.ts · SmartANDJ AI Technologies
   Direct pass-through middleware (Clerk temporairement désactivé pour accès direct)
   Fondateur : Daniel Jonathan ANDJ */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
