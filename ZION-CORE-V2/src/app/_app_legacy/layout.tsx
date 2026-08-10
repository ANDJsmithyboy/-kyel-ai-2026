/* GabomaGPT · (app)/layout.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Layout principal avec Sidebar + zone de contenu */
'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/shell/TopBar';
import { useSidebarStore } from '@/stores/sidebar';
import { useSettingsStore } from '@/stores/settings.store';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import AuroraBackground from '@/components/ui/AuroraBackground';
import RenduPanel from '@/components/rendu/RenduPanel';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const isMobile = useSidebarStore((s) => s.isMobile);
  const hydrate = useSettingsStore((s) => s.hydrate);
  
  // Use Clerk directly for user sync to Zustand
  const { user, isLoaded } = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  /* Hydrater les paramètres depuis localStorage */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /* Sync Clerk user to store */
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        setUser({
          id: user.id,
          name: user.fullName || user.username || 'Utilisateur',
          email: user.primaryEmailAddress?.emailAddress || '',
          role: 'user', // Simplified
          profile_image_url: user.imageUrl,
          token: null, // Managed by getToken()
        });
      }
      setLoading(false);
    }
  }, [user, isLoaded, setUser, setLoading]);

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden bg-[var(--zc-background)]">
      <AuroraBackground />
      <Sidebar />

      {/* Zone de contenu principale */}
      <div
        className={cn(
          'flex-1 flex flex-col h-screen max-h-[100dvh] overflow-hidden transition-[margin] duration-300 relative',
          !isMobile && isOpen && 'ml-[260px]',
          !isMobile && !isOpen && 'ml-[48px]',
        )}
      >
        <TopBar />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
        <RenduPanel />
      </div>
    </div>
  );
}
