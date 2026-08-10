/**
 * GabomaAI · SidebarRecents (Zone 4)
 * SmartANDJ AI Technologies
 * "En piste" — recent conversations list
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IconDotsVertical, IconArrowRight } from '@tabler/icons-react';
import { useChatStore } from '@/stores/chat.store';
import { RECENTS_DISPLAY_COUNT } from '@/constants/sidebar.constants';
import styles from './sidebar.module.css';

interface SidebarRecentsProps {
  isCollapsed: boolean;
}

export default function SidebarRecents({ isCollapsed }: SidebarRecentsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const conversations = useChatStore((s) => s.conversations);

  // Sort by most recent, take first N
  const recents = [...conversations]
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, RECENTS_DISPLAY_COUNT);

  if (isCollapsed) return null; // No recents in collapsed rail

  return (
    <div
      style={{
        marginTop: 20,
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '0 8px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border) transparent',
      }}
    >
      {/* Section label */}
      <div className={styles.sectionLabel}>
        En piste
      </div>

      {/* Recent items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recents.map((conv) => {
          const isActive = pathname === `/chat/${conv.id}`;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => router.push(`/chat/${conv.id}`)}
              className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.recentText}>{conv.title || 'Sans titre'}</span>
              <span className={styles.recentMenu}>
                <IconDotsVertical size={14} stroke={1.5} />
              </span>
            </button>
          );
        })}
      </div>

      {/* See all link */}
      {conversations.length > RECENTS_DISPLAY_COUNT && (
        <button
          type="button"
          className={styles.seeAll}
          onClick={() => router.push('/en-piste')}
        >
          Voir toutes les pistes
          <IconArrowRight size={14} stroke={1.5} />
        </button>
      )}
    </div>
  );
}
