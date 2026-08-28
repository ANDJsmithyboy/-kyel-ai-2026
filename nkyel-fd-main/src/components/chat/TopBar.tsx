import { useState } from 'react';
import Image from 'next/image';
import { OmbreIcon, RenduIcon, TropheeIcon } from '@/components/icons/NkyelIcons';
import { ForetEveilleIcon } from '@/components/icons/ForetEveilleIcon';

export default function TopBar({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void, sidebarOpen: boolean }) {
  const [ephemeral, setEphemeral] = useState(false);
  const [hoveredSidebar, setHoveredSidebar] = useState(false);

  return (
    <header className="flex h-[56px] flex-shrink-0 items-center justify-between px-4" style={{ borderBottom: ephemeral ? '1px solid rgba(255,59,48,0.2)' : 'none' }}>
      {/* -- Gauche: Sidebar toggle (ibogAIicone) -------------------- */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          onMouseEnter={() => setHoveredSidebar(true)}
          onMouseLeave={() => setHoveredSidebar(false)}
          onFocus={() => setHoveredSidebar(true)}
          onBlur={() => setHoveredSidebar(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ color: 'var(--text-secondary)' }}
          title={sidebarOpen ? 'Fermer la barre latérale' : 'Ouvrir la barre latérale'}
        >
          {hoveredSidebar || sidebarOpen ? (
            <Image src="/nkyel-logo.png" alt="Iboga AI" width={28} height={28} className="rounded-lg" />
          ) : (
            <Image src="/nkyel-icon.png" alt="Nkyel AI" width={28} height={28} className="rounded-lg" />
          )}
        </button>
        {ephemeral && (
          <div className="hidden lg:flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            PISTE FANTÔME — NON SAUVEGARDÉE
          </div>
        )}
      </div>

      {/* -- Droite: Header Cluster ------------------------- */}
      <div className="flex items-center gap-1.5 lg:gap-3">
        {/* 👻 Ombre (Ghost Mode) */}
        <button
          onClick={() => setEphemeral(!ephemeral)}
          className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors ${ephemeral ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
          title="Mode Ombre"
        >
          <OmbreIcon width={18} height={18} />
        </button>

        {/* 🌳 L'Okoumé */}
        <button className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5 text-white/60 hover:text-white" title="L'Okoumé">
          <ForetEveilleIcon width={18} height={18} />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        {/* Avatar */}
        <button className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-400 p-[2px] ms-1">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
            <span className="text-[10px] font-bold text-white">DJ</span>
          </div>
        </button>
      </div>
    </header>
  );
}
