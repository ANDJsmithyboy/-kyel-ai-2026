/**
 * Nkyel AI · SidebarClient
 * SmartANDJ AI Technologies
 * Main 'use client' orchestrator — all 5 zones, collapse/mobile
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import SidebarHeader from './SidebarHeader';
import SidebarActions from './SidebarActions';
import SidebarRecents from './SidebarRecents';
import SidebarFooter from './SidebarFooter';
import SidebarBackdrop from './SidebarBackdrop';
import styles from './sidebar.module.css';

export default function SidebarClient() {
  const { isCollapsed, isOpen, toggleCollapse, close } = useSidebar();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobile) close();
  }, [pathname, isMobile, close]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isOpen) close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isMobile, isOpen, close]);

  return (
    <>
      {/* Mobile backdrop */}
      <SidebarBackdrop isVisible={isMobile && isOpen} onClose={close} />

      {/* Sidebar panel */}
      <aside
        className={styles.sidebar}
        data-collapsed={isMobile ? 'false' : String(isCollapsed)}
        data-open={isMobile ? String(isOpen) : undefined}
        role="navigation"
        aria-label="Barre latérale Nkyel AI"
      >
        {/* Zone 1 — Header */}
        <SidebarHeader
          isCollapsed={!isMobile && isCollapsed}
          onToggleCollapse={toggleCollapse}
          onClose={close}
        />
        {/* Pulsing dot system */}
        {!(isMobile || isCollapsed) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 12px' }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary, #b79860)',
                boxShadow: '0 0 6px var(--accent-primary, #b79860)',
                animation: 'pulse 2s infinite'
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Système opérationnel</span>
          </div>
        )}

        {/* Zone 2 — Primary Actions */}
        <SidebarActions isCollapsed={!isMobile && isCollapsed} />

        {/* Zone 4 — Recents */}
        <SidebarRecents isCollapsed={!isMobile && isCollapsed} />

        {/* Zone 5 — Footer */}
        <SidebarFooter isCollapsed={!isMobile && isCollapsed} />
      </aside>
    </>
  );
}
