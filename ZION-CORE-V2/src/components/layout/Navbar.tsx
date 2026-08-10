/* GabomaGPT · Navbar.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Barre de navigation supérieure
   Migré depuis Navbar.svelte */
'use client';

import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import { useModeStore, MODEL_MAP } from '@/stores/mode';

export default function Navbar() {
  const { isOpen: sidebarOpen, isMobile, toggle } = useSidebarStore();
  const activeMode = useModeStore((s) => s.activeMode);
  const config = MODEL_MAP[activeMode];

  return (
    <nav className="navbar-glass sticky top-0 z-30 flex items-center justify-between px-4 h-12 border-b border-[var(--border)]">
      {/* Gauche : toggle sidebar (mobile seulement quand fermé) */}
      <div className="flex items-center gap-2">
        {isMobile && !sidebarOpen && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} className="text-[var(--text-secondary)]" />
          </button>
        )}
        {isMobile && !sidebarOpen && (
          <img
            src="/gabomagpt-logo.jpeg"
            alt="GabomaGPT"
            className="w-7 h-7 rounded-lg object-cover"
          />
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
