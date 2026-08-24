/* Module declarations for IDE type resolution */

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
  export function auth(): any;
  export function currentUser(): Promise<any>;
}

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

declare module 'next/link' {
  import React from 'react';
  const Link: React.ForwardRefExoticComponent<any>;
  export default Link;
}

declare module '@phosphor-icons/react' {
  import React from 'react';
  export interface IconProps extends React.SVGAttributes<SVGElement> {
    size?: number | string;
    color?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    mirrored?: boolean;
  }
  export type Icon = React.ComponentType<IconProps>;
  export const Sparkle: Icon;
  export const ShieldCheck: Icon;
  export const Cpu: Icon;
  export const Brain: Icon;
  export const TreeStructure: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const LockKey: Icon;
  export const Globe: Icon;
  export const CheckCircle: Icon;
  export const Lightning: Icon;
  export const Moon: Icon;
  export const Sun: Icon;
  export const Plus: Icon;
  export const Graph: Icon;
  export const Gear: Icon;
  export const Eye: Icon;
  export const CalendarCheck: Icon;
  export const SlidersHorizontal: Icon;
  export const HandPointing: Icon;
  export const MagnifyingGlass: Icon;
  export const Command: Icon;
  export const ChatCircleDots: Icon;
  export const UsersThree: Icon;
  export const PlugsConnected: Icon;
  export const PuzzlePiece: Icon;
  export const FolderSimpleStar: Icon;
  export const FloppyDisk: Icon;
  export const TerminalWindow: Icon;
  export const PaperPlaneTilt: Icon;
}
