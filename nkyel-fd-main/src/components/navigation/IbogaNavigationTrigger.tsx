/**
 * SmartANDJ Ecosystem · IbogaNavigationTrigger
 * Canonical Navigation Interaction Signature (Ñkyel AI & Gaboma AI)
 *
 * Replaces generic hamburger icon (☰) across the ecosystem.
 * - Apple & Geist precision
 * - 44px touch target on mobile (Apple HIG)
 * - 34px-38px ergonomic target on desktop
 * - Keyboard accessible (Space, Enter, and shortcut tooltip)
 * - Full ARIA semantics (aria-expanded, aria-label)
 * - Subtle organic micro-motion (180ms)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { IbogaGlyph } from '@/components/brand/IbogaGlyph';

export interface IbogaNavigationTriggerProps {
  isOpen?: boolean;
  onToggle: () => void;
  variant?: 'sidebar-header' | 'topbar' | 'chat-pill' | 'standalone';
  size?: number;
  showWordmark?: boolean;
  wordmarkText?: string;
  className?: string;
  title?: string;
}

export function IbogaNavigationTrigger({
  isOpen = false,
  onToggle,
  variant = 'standalone',
  size = 20,
  showWordmark = false,
  wordmarkText = 'Ñkyel',
  className = '',
  title,
}: IbogaNavigationTriggerProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  const actionLabel = isOpen ? 'Fermer la navigation' : 'Ouvrir la navigation';
  const defaultTooltip = `${actionLabel} (${isMac ? '⌘B' : 'Ctrl+B'})`;
  const tooltipText = title || defaultTooltip;

  // Variants styling
  const variantStyles = {
    'sidebar-header': 'w-8 h-8 md:w-8 md:h-8 rounded-lg hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
    'topbar': 'min-w-[44px] min-h-[44px] md:min-w-[34px] md:min-h-[34px] md:w-8 md:h-8 rounded-lg hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    'chat-pill': 'min-w-[44px] min-h-[44px] md:w-10 md:h-10 rounded-full hover:bg-white/10 text-[var(--text-primary)]',
    'standalone': 'min-w-[44px] min-h-[44px] md:w-9 md:h-9 rounded-lg hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={actionLabel}
      aria-expanded={isOpen}
      title={tooltipText}
      className={`group relative inline-flex items-center justify-center transition-all duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-elevated)] cursor-pointer select-none ${
        variantStyles[variant] || variantStyles.standalone
      } ${className}`}
    >
      <IbogaGlyph
        size={size}
        open={isOpen}
        className="text-current transition-colors duration-150"
      />

      {showWordmark && (
        <span className="ms-2.5 font-semibold text-[16px] tracking-tight text-[var(--text-primary)] select-none">
          {wordmarkText}
        </span>
      )}
    </button>
  );
}

export default IbogaNavigationTrigger;
