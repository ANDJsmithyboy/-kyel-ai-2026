/**
 * Ñkyel AI · SidebarNav (Zone 3)
 * SmartANDJ AI Technologies
 * Projet, Le Rendu, En Piste, Trophées
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/constants/sidebar.constants';
import SidebarItem from './SidebarItem';

interface SidebarNavProps {
  isCollapsed: boolean;
}

export default function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href) ?? false;

        return (
          <SidebarItem
            key={item.id}
            icon={<Icon size={16} />}
            label={item.label}
            isActive={isActive}
            isCollapsed={isCollapsed}
            onClick={() => router.push(item.href)}
          />
        );
      })}
    </nav>
  );
}
