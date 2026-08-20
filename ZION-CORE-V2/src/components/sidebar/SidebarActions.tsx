/**
 * Nkyel AI · SidebarActions (Zone 2)
 * SmartANDJ AI Technologies
 * Nouvelle Piste + Rechercher
 */

'use client';

import { useRouter } from 'next/navigation';
import { PawNewIcon, RadarWandanaIcon, RenduIcon, ProjetsIcon, TropheeIcon } from '@/components/icons/NkyelIcons';
import SidebarItem from './SidebarItem';
import styles from './sidebar.module.css';

interface SidebarActionsProps {
  isCollapsed: boolean;
}

export default function SidebarActions({ isCollapsed }: SidebarActionsProps) {
  const router = useRouter();

  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
      {/* Nouvelle Piste */}
      {isCollapsed ? (
        <SidebarItem
          icon={<PawNewIcon size={17} style={{ color: 'var(--accent)' }} />}
          label="Nouvelle piste"
          isCollapsed
          onClick={() => router.push('/')}
        />
      ) : (
        <button
          type="button"
          onClick={() => router.push('/')}
          className={`${styles.item} ${styles.actionPrimary}`}
        >
          <span className={styles.itemIcon}>
            <PawNewIcon size={17} style={{ color: 'var(--accent)' }} />
          </span>
          <span className={styles.sidebarLabel}>Nouvelle piste</span>
        </button>
      )}

      {/* Radar Wandana */}
      <SidebarItem
        icon={<RadarWandanaIcon size={16} />}
        label="Radar Wandana"
        isCollapsed={isCollapsed}
      />

      {/* Le Rendu */}
      <SidebarItem
        icon={<RenduIcon size={16} />}
        label="Le Rendu"
        isCollapsed={isCollapsed}
      />

      {/* Projets */}
      <SidebarItem
        icon={<ProjetsIcon size={16} />}
        label="Projets"
        isCollapsed={isCollapsed}
      />

      {/* Trophées */}
      <SidebarItem
        icon={<TropheeIcon size={16} />}
        label="Trophées"
        isCollapsed={isCollapsed}
      />
    </div>
  );
}
