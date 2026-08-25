/**
 * Ñkyel AI · SidebarHeader
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * Wordmark-First Ñkyel + Iboga Navigation Signature
 */

'use client';

import React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IbogaNavigationTrigger } from '@/components/brand';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  onSearchClick?: () => void;
}

export default function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onClose,
  onSearchClick,
}: SidebarHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-white/[0.04] bg-transparent">
      {/* Left: Wordmark-first Ñkyel */}
      {!isCollapsed && (
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[16px] font-semibold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ñkyel
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#6757E8]/20 border border-[#6757E8]/40 text-[#6757E8] uppercase tracking-wider">
            VIE
          </span>
        </div>
      )}

      {/* Right: Search + Iboga Navigation Signature */}
      {!isCollapsed && (
        <div className="flex items-center gap-1">
          {onSearchClick && (
            <button
              type="button"
              onClick={onSearchClick}
              aria-label="Rechercher une mission"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <MagnifyingGlass size={16} />
            </button>
          )}
          <IbogaNavigationTrigger
            open={true}
            onToggle={isMobile ? onClose : onToggleCollapse}
            glyphSize={18}
            variant="desktop"
            title="Réduire la navigation"
            label="Réduire la navigation"
          />
        </div>
      )}

      {/* Collapsed state expand button */}
      {isCollapsed && !isMobile && (
        <div className="w-full flex justify-center">
          <IbogaNavigationTrigger
            open={false}
            onToggle={onToggleCollapse}
            glyphSize={20}
            variant="desktop"
            title="Développer la navigation"
            label="Développer la navigation"
          />
        </div>
      )}
    </div>
  );
}
