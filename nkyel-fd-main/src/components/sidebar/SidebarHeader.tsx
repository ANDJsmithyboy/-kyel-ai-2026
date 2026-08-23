/**
 * Nkyel AI · SidebarHeader
 * SmartANDJ AI Technologies
 * Logo 7-branches + NKYEL + Search & Collapse buttons
 */

'use client';

import Image from 'next/image';
import {
  MagnifyingGlass,
  SidebarSimple,
  Sparkle,
} from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './sidebar.module.css';

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
    <div
      className="flex items-center justify-between px-3 h-14 shrink-0 border-b border-white/[0.04]"
      style={{
        background: 'transparent',
      }}
    >
      {/* Left: Logo 7-branches + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6757E8]/20 to-[#D5AE57]/20 border border-[#D5AE57]/30 flex items-center justify-center shadow-[0_0_15px_rgba(213,174,87,0.15)] shrink-0">
          <Sparkle size={18} weight="fill" className="text-[#D5AE57]" />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[15px] font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Ñkyel
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#6757E8]/20 border border-[#6757E8]/40 text-[#6757E8] uppercase tracking-wider">
                VIE
              </span>
            </div>
            <span className="text-[10px] text-[#9199A8] truncate">
              SmartANDJ AI
            </span>
          </div>
        )}
      </div>

      {/* Right: Search + Collapse Toggle */}
      {!isCollapsed && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Rechercher une mission"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <MagnifyingGlass size={16} />
          </button>
          <button
            type="button"
            onClick={isMobile ? onClose : onToggleCollapse}
            aria-label="Réduire la barre latérale"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <SidebarSimple size={16} />
          </button>
        </div>
      )}

      {/* Collapsed state expand button */}
      {isCollapsed && !isMobile && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Développer la barre latérale"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors mx-auto"
        >
          <SidebarSimple size={16} />
        </button>
      )}
    </div>
  );
}
