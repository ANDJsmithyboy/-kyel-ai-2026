/**
 * Nkyel AI · SidebarHeader (Zone 1)
 * SmartANDJ AI Technologies
 * Logo + collapse toggle — ALWAYS on the same row
 */

'use client';

import Image from 'next/image';
import {
  SidebarSimple,
  List,
  X,
} from '@phosphor-icons/react';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './sidebar.module.css';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export default function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onClose,
}: SidebarHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={styles.sidebarHeader}
      style={{
        height: 56,
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Left: Logo + Name */}
      {!isCollapsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className={styles.sidebarLabel}
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
            }}
          >
            NKYEL
          </span>
        </div>
      )}

      {/* Collapsed: Logo sur PC, lettre "G" sur mobile si applicable */}
      {isCollapsed && !isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Image
            src="/vrai-içone-pro-gaboma-ai2026.png"
            alt="Nkyel AI"
            width={22}
            height={22}
          />
        </div>
      )}

      {/* Right: Toggle / Close */}
      {!isCollapsed && (
        <button
          type="button"
          onClick={isMobile ? onClose : onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isMobile ? 'Fermer la barre latérale' : 'Réduire la barre latérale'}
          style={{
            padding: 4,
            borderRadius: 6,
            border: 'none',
            background: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-06)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <IbogaAiIcon width={22} height={22} className="text-[var(--text-secondary)]" />
        </button>
      )}

      {/* Collapsed: expand button below logo */}
      {isCollapsed && !isMobile && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={false}
          aria-label="Ouvrir la barre latérale"
          style={{
            position: 'absolute',
            top: 56 + 4,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: 4,
            borderRadius: 6,
            border: 'none',
            background: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            transition: 'color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-06)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <List size={18} />
        </button>
      )}
    </div>
  );
}
