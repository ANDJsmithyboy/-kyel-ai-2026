'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CaretDown,
  Sparkle,
  ShareNetwork,
  ChartBar,
  FileText,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';
import { INTELLIGENCE_MODES, getIntelligenceMode, useNkyelModel, type IntelligenceModeId } from '@/hooks/useNkyelModel';
import { useSidebar } from '@/hooks/useSidebar';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { useLanguageStore } from '@/stores/language.store';
import { IbogaNavigationTrigger } from '@/components/brand';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const engineId = useNkyelModel((state) => state.engineId);
  const setEngineId = useNkyelModel((state) => state.setEngineId);
  const { open: openMobileSidebar } = useSidebar();

  const [modelDropdown, setModelDropdown] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const currentEngine = getIntelligenceMode(engineId);

  // Close model dropdown on click outside
  useEffect(() => {
    if (!modelDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [modelDropdown]);

  const handleOpenCommands = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Ñkyel AI',
        text: 'Ñkyel AI — Global Sovereign Intelligence',
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const modesList = Object.values(INTELLIGENCE_MODES);

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      <header className="h-12 flex items-center justify-between px-3 sm:px-4 border-b border-[var(--border-subtle)] bg-[var(--material-glass-regular)] backdrop-blur-md select-none z-30">
        {/* Leading: Iboga Navigation Trigger (Mobile) + Wordmark + Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Iboga Navigation Trigger Button */}
          <div className="md:hidden">
            <IbogaNavigationTrigger
              open={false}
              onToggle={openMobileSidebar}
              glyphSize={18}
              variant="mobile"
              title="Ouvrir la navigation"
              label="Ouvrir la navigation"
            />
          </div>

          {/* Product Wordmark */}
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] font-serif">
            Ñkyel
          </div>

          {/* Canonical Intelligence Mode Selector — Desktop Only (Header) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setModelDropdown((prev) => !prev)}
              aria-expanded={modelDropdown}
              aria-label={isFr ? "Choisir le mode d'intelligence" : "Select intelligence mode"}
              className="flex h-8 items-center gap-1.5 sm:gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-2 sm:px-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors hover:border-[var(--accent-muted)] hover:bg-[var(--active)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5AE57]" />
              <span className="truncate max-w-[90px] sm:max-w-none">
                {isFr ? currentEngine.labelFr : currentEngine.labelEn}
              </span>
              <CaretDown size={12} weight="bold" className="text-[var(--text-secondary)] opacity-70" />
            </button>

            {modelDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-72 space-y-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl z-50 animate-scale-in">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
                  {isFr ? "Mode d'intelligence" : "Intelligence Mode"}
                </div>
                {modesList.map((mode) => {
                  const isSelected = mode.id === engineId;
                  const modeLabel = isFr ? mode.labelFr : mode.labelEn;
                  const modeDesc = isFr ? mode.descFr : mode.descEn;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setEngineId(mode.id);
                        setModelDropdown(false);
                      }}
                      className={`flex w-full items-start justify-between rounded-xl px-2.5 py-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-[var(--surface-raised)] border border-[#D5AE57]/30 text-[var(--text-primary)]'
                          : 'hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span>{modeLabel}</span>
                          {mode.badge && (
                            <span className="rounded-full bg-[#D5AE57]/15 px-1.5 py-0.2 text-[9px] font-semibold text-[#D5AE57]">
                              {mode.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)] leading-tight truncate">
                          {modeDesc}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={14} weight="bold" className="text-[#D5AE57] shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trailing: Clean Actions (Commandes, Mise à niveau, Partager, Fichiers, DAG) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Universal Search / Command Palette Trigger */}
          <button
            type="button"
            onClick={handleOpenCommands}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-muted)] hover:text-[var(--text-primary)]"
            title="Commandes (⌘K / Ctrl+K)"
            aria-label="Recherche"
          >
            <MagnifyingGlass size={14} className="text-[#D5AE57]" />
            <span className="hidden sm:inline text-[11px] font-medium">Commandes</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-[var(--text-tertiary)]">
              ⌘K
            </kbd>
          </button>

          {/* Upgrade Button (Manus Style Desktop) */}
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="hidden sm:flex h-8 items-center gap-1.5 rounded-xl bg-[var(--hover)] hover:bg-[var(--active)] px-3 text-xs font-semibold text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
          >
            <Sparkle size={14} weight="fill" className="text-[#D5AE57]" />
            <span>Mise à niveau</span>
          </button>

          {/* Share Button (Desktop) */}
          <button
            type="button"
            onClick={handleShare}
            className="hidden md:flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
            title="Partager"
            aria-label="Partager"
          >
            <ShareNetwork size={16} />
            <span className="text-[11px] font-medium">Partager</span>
          </button>

          {/* Documents & Artifacts Icon */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            aria-label="Documents et Artefacts"
            title="Documents et Artefacts"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <FileText size={17} />
          </button>

          {/* WorkGraph / DAG Icon */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            aria-label="WorkGraph DAG"
            title="WorkGraph DAG"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <ChartBar size={17} />
          </button>
        </div>
      </header>
    </>
  );
}
