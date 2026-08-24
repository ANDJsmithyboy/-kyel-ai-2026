/* Module declarations for IDE type resolution */

declare const process: {
  env: Record<string, string | undefined>;
};

declare module '@clerk/nextjs' {
  import React from 'react';
  export const SignIn: React.ComponentType<any>;
  export const SignUp: React.ComponentType<any>;
  export const SignInButton: React.ComponentType<any>;
  export const SignUpButton: React.ComponentType<any>;
  export const UserButton: React.ComponentType<any>;
  export const ClerkProvider: React.ComponentType<any>;
  export function useUser(): {
    isSignedIn?: boolean;
    isLoaded?: boolean;
    user?: any;
  };
  export function useAuth(): {
    userId?: string | null;
    sessionId?: string | null;
    getToken: (options?: any) => Promise<string | null>;
    isSignedIn?: boolean;
  };
  export function useClerk(): any;
}

declare module '@clerk/nextjs/server' {
  export function clerkMiddleware(handler?: any): any;
  export function createRouteMatcher(routes: (string | RegExp)[]): (req: any) => boolean;
  export function auth(): Promise<any>;
  export function currentUser(): Promise<any>;
  export function clerkClient(): Promise<any>;
}

declare module 'drizzle-orm';
declare module 'drizzle-orm/neon-http';
declare module 'drizzle-orm/pg-core';

declare module '@clerk/localizations' {
  export const frFR: any;
  export const enUS: any;
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static next(init?: any): NextResponse;
    static redirect(url: string | URL, init?: any): NextResponse;
    static json(data: any, init?: any): NextResponse;
    static rewrite(destination: string | URL, init?: any): NextResponse;
  }
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: any;
  }
  export type NextFetchEvent = any;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next' {
  export type Metadata = any;
  export type Viewport = any;
}

declare module 'next/script' {
  import React from 'react';
  const Script: React.ComponentType<any>;
  export default Script;
}

declare module 'next/font/google' {
  export function Geist(options?: any): { variable: string; className: string };
  export function Geist_Mono(options?: any): { variable: string; className: string };
  export function Inter(options?: any): { variable: string; className: string };
}

declare module 'next/image' {
  import React from 'react';
  const Image: React.ComponentType<any>;
  export default Image;
}

declare module 'sonner' {
  import React from 'react';
  export const Toaster: React.ComponentType<any>;
  export const toast: any;
}

declare module 'next/link' {
  import React from 'react';
  const Link: React.ForwardRefExoticComponent<any>;
  export default Link;
}

declare module 'framer-motion' {
  import React from 'react';
  export const motion: any;
  export const AnimatePresence: React.ComponentType<any>;
}

declare module '@phosphor-icons/react';
declare module '@tabler/icons-react';
declare module 'lucide-react';

