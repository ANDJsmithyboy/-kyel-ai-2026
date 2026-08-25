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
  Gear,
  SignOut,
  User,
  ShieldCheck,
} from '@phosphor-icons/react';
import { ENGINES, getNkyelEngine, useNkyelModel, type NkyelEngineId } from '@/hooks/useNkyelModel';
import { useSidebar } from '@/hooks/useSidebar';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { useSafeUser as useUser, useSafeClerk as useClerk } from '@/lib/auth-client';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { useLanguageStore } from '@/stores/language.store';
import { IbogaNavigationTrigger } from '@/components/brand';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C'
  );
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const engineId = useNkyelModel((state) => state.engineId);
  const setEngineId = useNkyelModel((state) => state.setEngineId);
  const { open: openMobileSidebar } = useSidebar();
  const openSettings = useSettingsModal((state: any) => state.open);

  const [modelDropdown, setModelDropdown] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguageStore();

  const currentEngine = getNkyelEngine(engineId);

  const displayName = user?.fullName || user?.username || 'Christ pour la VOP';
  const email = user?.primaryEmailAddress?.emailAddress || 'fondateur@nkyel.ai';
  const initials = initialsFor(displayName);

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

  // Close profile menu on click outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen]);

  const handleOpenCommands = () => {
    setProfileMenuOpen(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  const handleShare = () => {
    setProfileMenuOpen(false);
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

          {/* Model Selector Dropdown Bar (Near Iboga Wordmark) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setModelDropdown((prev) => !prev)}
              aria-expanded={modelDropdown}
              aria-label="Choisir le modèle Ñkyel"
              className="flex h-8 items-center gap-1.5 sm:gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-2 sm:px-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors hover:border-[var(--accent-muted)] hover:bg-[var(--active)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5AE57]" />
              <span className="truncate max-w-[90px] sm:max-w-none">{currentEngine.name}</span>
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

        {/* Trailing: Manus-Style Action Trio [ 📄 ] [ 🔀 ] [ 👤 ] */}
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

          {/* Manus Icon 1: Documents & Artifacts */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            aria-label="Documents et Artefacts"
            title="Documents et Artefacts"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <FileText size={17} />
          </button>

          {/* Manus Icon 2: WorkGraph / DAG */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            aria-label="WorkGraph DAG"
            title="WorkGraph DAG"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          >
            <ChartBar size={17} />
          </button>

          {/* Manus Icon 3: Miniature Profile Button (PC & Mobile) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              aria-expanded={profileMenuOpen}
              aria-label="Menu du profil utilisateur"
              title={displayName}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer"
            >
              {/* Miniature Avatar Circle */}
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-[var(--border-strong)] bg-[var(--surface-raised)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shadow-xs">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold">{initials}</span>
                )}
              </div>
            </button>

            {/* Profile & Settings Dropdown Popover (Manus Style) */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 space-y-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2 shadow-2xl z-50 animate-scale-in text-xs">
                {/* User Identity Header */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--surface-raised)]/60 border border-[var(--border-subtle)] mb-1.5">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)] shrink-0">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--text-primary)] text-xs">{displayName}</p>
                    <p className="truncate text-[10px] text-[var(--text-tertiary)]">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--hover)] text-[var(--text-primary)] transition-colors"
                >
                  <Gear size={16} />
                  <span>Paramètres</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setIsUpgradeOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--hover)] text-[var(--text-primary)] transition-colors"
                >
                  <Sparkle size={16} className="text-[#D5AE57]" weight="fill" />
                  <span className="font-semibold">Mise à niveau</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--hover)] text-[var(--text-primary)] transition-colors"
                >
                  <ShareNetwork size={16} />
                  <span>Partager</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCommands}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MagnifyingGlass size={16} className="text-[#D5AE57]" />
                    <span>Commandes</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono">⌘K</kbd>
                </button>

                <div className="h-px bg-[var(--border-subtle)] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <SignOut size={16} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
