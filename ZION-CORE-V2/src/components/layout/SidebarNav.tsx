/**
 * Gaboma AI · SidebarNav.tsx · Client Component (usePathname)
 * SmartANDJ AI Technologies
 * Navigation principale — Nouvelle Piste + 3 nav items.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IconEnPiste, ProjetIcon, RenduIcon, IconWandana } from '@/components/icons';

const NAV_ITEMS = [
  {
    href: '/(chat)/search',
    label: 'Recherche',
    icon: <IconWandana width={22} height={22} />,
  },
  {
    href: '/(chat)/projects',
    label: 'Projets',
    icon: <ProjetIcon width={22} height={22} />,
  },
  {
    href: '/(chat)/rendu',
    label: 'Le Rendu',
    icon: <RenduIcon width={22} height={22} />,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {/* + Nouvelle Piste */}
      <Link
        href="/chat"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)]"
        style={{
          background: 'var(--accent-10)',
          border: '1px solid var(--accent-35)',
          transition: 'var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-20)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-10)';
        }}
      >
        <IconEnPiste width={24} height={24} style={{ color: 'var(--accent)' }} />
        <span
          className="text-[14px] font-semibold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--accent)',
          }}
        >
          Nouvelle Piste
        </span>
      </Link>

      {/* Separator */}
      <div className="my-2" />

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex h-10 items-center gap-3 rounded-[var(--radius-sm)] px-3',
              'transition-colors',
            )}
            style={{
              background: isActive ? 'var(--accent-10)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'var(--accent-06)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ color: isActive ? 'var(--accent)' : '#CBD5E1' }}>
              {item.icon}
            </span>
            <span
              className="text-[14px] font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                color: isActive ? 'var(--accent)' : '#FFFFFF',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
