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
import { RenduIcon, LoxoIcon } from '@/components/icons';
import ModelSelectorModal from '@/components/composer/ModelSelectorModal';
import type { ModelMetadata } from '@/lib/modelRegistry';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const engineId = useNkyelModel((state: any) => state.engineId);
  const setEngineId = useNkyelModel((state: any) => state.setEngineId);
  const { open: openMobileSidebar } = useSidebar();

  const [modelDropdown, setModelDropdown] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

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

  // Keyboard shortcut ⌘M / Ctrl+M for model palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsModelModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        selectedModelId={engineId}
        onSelectModel={(model: ModelMetadata) => {
          // Map to known engine if applicable or keep sovereign ID
          setEngineId(model.id);
        }}
      />

      <header className="h-12 flex items-center justify-between px-3 sm:px-4 border-b border-[var(--border-subtle)] bg-[var(--material-glass-regular)] backdrop-blur-md select-none z-30">
        {/* Leading: Iboga Navigation Trigger (Mobile) + Wordmark (Desktop) + Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Iboga Navigation Trigger Button (No logo/wordmark on mobile) */}
          <div className="md:hidden flex items-center">
            <IbogaNavigationTrigger
              open={false}
              onToggle={openMobileSidebar}
              glyphSize={24}
              variant="mobile"
              title="Ouvrir la navigation"
              label="Ouvrir la navigation"
            />
          </div>

          <div className="hidden md:block w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />

          {/* Canonical Intelligence Mode Selector — Visible on all viewports */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setModelDropdown((prev) => !prev)}
              aria-expanded={modelDropdown}
              aria-label={isFr ? "Choisir le mode d'intelligence" : "Select intelligence mode"}
              className="flex h-[28px] items-center gap-1.5 rounded-lg bg-transparent px-2 text-[14px] sm:text-[13px] font-semibold text-[var(--text-primary)] sm:text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)] active:scale-[0.98]"
            >
              <span className="truncate max-w-[120px] sm:max-w-none tracking-tight">
                {isFr ? currentEngine.labelFr : currentEngine.labelEn}
              </span>
              <CaretDown size={12} className="opacity-60" />
            </button>

            {modelDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-72 space-y-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl z-50 animate-scale-in">
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                  <span>{isFr ? "Moteurs Souverains" : "Sovereign Engines"}</span>
                  <span className="text-[9px] font-mono text-[var(--accent)] font-semibold">ÑKYEL IA</span>
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
                          ? 'bg-[var(--surface-raised)] border border-[var(--accent-muted)] text-[var(--text-primary)]'
                          : 'hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span>{modeLabel}</span>
                          {mode.badge && (
                            <span className="rounded-full bg-[var(--accent-subtle)] px-1.5 py-0.2 text-[9px] font-semibold text-[var(--accent)]">
                              {mode.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)] leading-tight truncate">
                          {modeDesc}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={14} weight="bold" className="text-[var(--accent)] shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}

                {/* 500+ Model Catalog Command Trigger */}
                <div className="pt-1 border-t border-[var(--border-subtle)] mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModelDropdown(false);
                      setIsModelModalOpen(true);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left bg-[var(--accent-subtle)]/40 hover:bg-[var(--accent-subtle)] text-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MagnifyingGlass size={14} weight="bold" />
                      <span className="text-xs font-semibold">Catalogue +500 Modèles…</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      ⌘M
                    </span>
                  </button>
                </div>
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
            <MagnifyingGlass size={14} className="text-[var(--accent)]" />
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
            <Sparkle size={14} weight="fill" className="text-[var(--accent)]" />
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

          {/* Mission Intelligence Control (Ñkyel Spark) */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            aria-label="Intelligence de Mission"
            title="Ouvrir l'Intelligence de Mission"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--accent)] bg-[var(--accent)]/10 transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]"
          >
            <RenduIcon width={16} height={16} />
          </button>
        </div>
      </header>
    </>
  );
}
