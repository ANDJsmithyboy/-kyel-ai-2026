'use client';

import React from 'react';
import {
  MagnifyingGlass,
  ShareNetwork,
  DotsThree,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useLanguageStore } from '@/stores/language.store';
import { IbogaNavigationTrigger } from '@/components/brand';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const { open } = useSidebar();
  const { t } = useLanguageStore();

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

  return (
    <header className="nkyel-topbar h-12 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] bg-[var(--material-glass-regular)] backdrop-blur-md select-none">
      {/* Leading Section: Mobile Iboga Navigation Trigger & Product Wordmark */}
      <div className="nkyel-topbar-leading flex items-center gap-3">
        <div className="block md:hidden">
          <IbogaNavigationTrigger
            open={false}
            onToggle={open}
            glyphSize={20}
            variant="mobile"
            title="Ouvrir la navigation"
            label="Ouvrir la navigation"
          />
        </div>
        <div className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--text-primary)] font-serif">
          Ñkyel
        </div>
      </div>

      {/* Trailing Section: Calm, essential global controls */}
      <div className="nkyel-topbar-actions flex items-center gap-2">
        {/* Universal Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={handleOpenCommands}
          className="flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-muted)] hover:text-[var(--text-primary)]"
          title={`${t('header.search')} (⌘K / Ctrl+K)`}
          aria-label={t('header.search')}
        >
          <MagnifyingGlass size={14} className="text-[#D5AE57]" />
          <span className="hidden sm:inline text-[11px] font-medium">{t('header.search')}</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-[var(--text-tertiary)]">
            ⌘K
          </kbd>
        </button>

        {/* Share Action */}
        <button
          type="button"
          onClick={handleShare}
          className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
          title={t('header.share')}
          aria-label={t('header.share')}
        >
          <ShareNetwork size={16} />
          <span className="text-[11px] font-medium">{t('header.share')}</span>
        </button>

        {/* More Actions Menu Trigger */}
        <button
          type="button"
          onClick={handleOpenCommands}
          aria-label={t('header.more')}
          title={t('header.more')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
        >
          <DotsThree size={20} weight="bold" />
        </button>
      </div>
    </header>
  );
}
