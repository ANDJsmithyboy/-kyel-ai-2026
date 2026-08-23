'use client';

import { useState } from 'react';
import {
  CaretDown,
  Sparkle,
  SidebarSimple,
  ShareNetwork,
  ChartBar,
  FileText,
  DotsThree,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useTerrainPanel } from '@/hooks/useTerrainPanel';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getNkyelEngine, useNkyelModel } from '@/hooks/useNkyelModel';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

type EngineId = 'auto' | 'chui' | 'radi' | 'research';

const engines: Array<{ id: EngineId; name: string; desc: string; badge?: string }> = [
  { id: 'auto', name: 'Ñkyel', desc: 'Routage intelligent autonome' },
  { id: 'chui', name: 'Ñkyel Chui', desc: 'Raisonnement profond et code complexe', badge: 'Pro' },
  { id: 'radi', name: 'Ñkyel Radi', desc: 'Ultra-rapide et concis' },
  { id: 'research', name: 'Ñkyel Research', desc: 'Recherche web et veille en direct' },
];

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const { open } = useSidebar();
  const terrainOpen = useTerrainPanel((state) => state.isOpen);
  const openTerrain = useTerrainPanel((state) => state.open);
  const isMobile = useIsMobile();
  const engineId = useNkyelModel((state) => state.engineId);
  const setEngineId = useNkyelModel((state) => state.setEngineId);
  const [modelDropdown, setModelDropdown] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const activeEngine = engineId === 'auto' ? 'Ñkyel' : getNkyelEngine(engineId).label;

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <header className="nkyel-topbar">
        <div className="nkyel-topbar-leading">
          {isMobile && (
            <button type="button" onClick={open} aria-label="Barre latérale" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]">
              <SidebarSimple size={18} />
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setModelDropdown((open) => !open)}
              aria-expanded={modelDropdown}
              aria-label="Choisir le moteur Ñkyel"
              className="flex h-9 min-w-[146px] items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 text-[var(--text-md)] font-medium tracking-[-0.025em] text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--accent-muted)] hover:bg-[var(--active)]"
            >
              <span>{activeEngine}</span>
              <CaretDown size={15} weight="bold" className="text-[var(--text-secondary)]" />
            </button>
            {modelDropdown && (
              <div className="absolute left-0 top-full z-[var(--z-dropdown)] mt-2 w-72 space-y-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2 shadow-[var(--shadow-xl)] animate-scale-in">
                {engines.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => { setEngineId(engine.id); setModelDropdown(false); }}
                    className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors ${engine.id === engineId ? 'bg-[var(--selected)]' : 'hover:bg-[var(--hover)]'}`}
                  >
                    <span className="flex w-full items-center justify-between text-[13px] font-semibold text-[var(--text-primary)]">
                      {engine.name}
                      {engine.badge && <span className="rounded-full bg-[var(--accent-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">{engine.badge}</span>}
                    </span>
                    <span className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">{engine.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nkyel-topbar-actions">
          <button type="button" onClick={() => setIsUpgradeOpen(true)} className="hidden h-8 items-center gap-2 rounded-lg bg-[var(--hover)] px-3 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--active)] lg:flex">
            <Sparkle size={15} weight="regular" /> Mise à niveau
          </button>
          <button type="button" className="hidden h-8 items-center gap-2 rounded-lg px-3 text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)] lg:flex">
            <ShareNetwork size={17} /> Partager
          </button>
          <button type="button" aria-label="Statistiques" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]">
            <ChartBar size={18} />
          </button>
          <button type="button" aria-label="Rechercher dans les fichiers" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]">
            <FileText size={18} />
          </button>
          <button type="button" aria-label="Plus d'options" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]">
            <DotsThree size={21} />
          </button>
          {!terrainOpen && (
            <button type="button" onClick={openTerrain} aria-label="Afficher le Terrain" title="Afficher le Terrain" className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 text-[11px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]">
              <SidebarSimple size={15} /> Terrain
            </button>
          )}
          {onOpenCapabilities && (
            <button type="button" onClick={onOpenCapabilities} aria-label="Toutes les capacités Ñkyel" className="hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] xl:flex">
              <Sparkle size={16} weight="fill" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
