/* Nkyel AI · Navbar.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Barre de navigation supérieure
   Migré depuis Navbar.svelte */
'use client';

import { useSidebarStore } from '@/stores/sidebar';
import { useModeStore, MODEL_MAP } from '@/stores/mode';
import { IbogaNavigationTrigger } from '@/components/brand';

export default function Navbar() {
  const { isOpen: sidebarOpen, isMobile, toggle } = useSidebarStore();
  const activeMode = useModeStore((s) => s.activeMode);
  const config = MODEL_MAP[activeMode];

  return (
    <nav className="navbar-glass sticky top-0 z-30 flex items-center justify-between px-4 h-12 border-b border-[var(--border)]">
      {/* Gauche : toggle sidebar (mobile seulement quand fermé) */}
      <div className="flex items-center gap-2">
        {isMobile && !sidebarOpen && (
          <div className="flex items-center gap-2">
            <IbogaNavigationTrigger
              open={false}
              onToggle={toggle}
              glyphSize={20}
              variant="mobile"
              title="Ouvrir la navigation"
              label="Ouvrir la navigation"
            />
            <span
              className="select-none text-[14px] font-semibold tracking-tight text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.025em' }}
            >
              Ñkyel
            </span>
          </div>
        )}
      </div>

      {/* Centre : mode actif */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-medium text-[var(--text-secondary)] font-[var(--font-display)]">
          {config.label}
        </span>
      </div>

      {/* Droite : placeholder actions */}
      <div className="w-8" />
    </nav>
  );
}
