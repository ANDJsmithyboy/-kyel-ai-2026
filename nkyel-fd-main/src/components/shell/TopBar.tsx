'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CaretDown,
  Sparkle,
  ShareNetwork,
  ChartBar,
  FileText,
  DotsThree,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';
import { ENGINES, getNkyelEngine, useNkyelModel, type NkyelEngineId } from '@/hooks/useNkyelModel';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { useLanguageStore } from '@/stores/language.store';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const engineId = useNkyelModel((state) => state.engineId);
  const setEngineId = useNkyelModel((state) => state.setEngineId);
  const [modelDropdown, setModelDropdown] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguageStore();

  const currentEngine = getNkyelEngine(engineId);

  // Close dropdown on click outside
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

  const enginesList = Object.values(ENGINES);

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      <header className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] bg-[var(--material-glass-regular)] backdrop-blur-md select-none z-30">
        {/* Leading: Logo Wordmark + Model Selector Dropdown (Near Iboga) */}
        <div className="flex items-center gap-3">
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] font-serif">
            Ñkyel
          </div>

          {/* Model Selector Dropdown Bar (Near Iboga Wordmark) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setModelDropdown((prev) => !prev)}
              aria-expanded={modelDropdown}
              aria-label="Choisir le modèle Ñkyel"
              className="flex h-8 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors hover:border-[var(--accent-muted)] hover:bg-[var(--active)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5AE57]" />
              <span>{currentEngine.name}</span>
              <CaretDown size={12} weight="bold" className="text-[var(--text-secondary)] opacity-70" />
            </button>

            {modelDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-72 space-y-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl z-50 animate-scale-in">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
                  Modèles & Moteurs Ñkyel
                </div>
                {enginesList.map((engine) => {
                  const isSelected = engine.id === engineId;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        setEngineId(engine.id as NkyelEngineId);
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
                          <span>{engine.name}</span>
                          {engine.badge && (
                            <span className="rounded-full bg-[#D5AE57]/15 px-1.5 py-0.2 text-[9px] font-semibold text-[#D5AE57]">
                              {engine.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)] leading-tight truncate">
                          {engine.desc}
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

        {/* Trailing: Upgrade Button, Search, Share, More Actions */}
        <div className="flex items-center gap-2">
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

          {/* Upgrade Button (Manus Style) */}
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="hidden sm:flex h-8 items-center gap-1.5 rounded-xl bg-[var(--hover)] hover:bg-[var(--active)] px-3 text-xs font-semibold text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
          >
            <Sparkle size={14} weight="fill" className="text-[#D5AE57]" />
            <span>Mise à niveau</span>
          </button>

          {/* Share Button */}
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

          {/* Stats & Files icons */}
          <button
            type="button"
            aria-label="Statistiques"
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <ChartBar size={17} />
          </button>

          <button
            type="button"
            aria-label="Fichiers"
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <FileText size={17} />
          </button>

          {/* More options button */}
          <button
            type="button"
            onClick={handleOpenCommands}
            aria-label="Plus d'options"
            title="Plus d'options"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <DotsThree size={20} weight="bold" />
          </button>
        </div>
      </header>
    </>
  );
}
