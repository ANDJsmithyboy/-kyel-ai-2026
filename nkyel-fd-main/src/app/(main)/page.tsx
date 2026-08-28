/**
 * Ñkyel AI · Workspace Principal Direct
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : "/"
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeUser } from '@/lib/auth-client';
import NkyelLiteShell from '@/components/nkyel/NkyelLiteShell';
export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[var(--material-canvas)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <NkyelLiteShell />;
}
