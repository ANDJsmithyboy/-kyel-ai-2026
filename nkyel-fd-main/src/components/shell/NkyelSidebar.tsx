'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Plus,
  ChatCircleDots,
  Graph,
  UsersThree,
  Cpu,
  PlugsConnected,
  PuzzlePiece,
  CalendarCheck,
  Brain,
  FolderSimpleStar,
  FloppyDisk,
  SidebarSimple,
  Monitor,
  Bell,
  MagnifyingGlass,
  CaretRight,
  DotsThree,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSettingsModal } from '@/hooks/useSettingsModal';

/* ── Navigation Config ─────────────────────────────────── */

interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; weight?: any; className?: string }>;
  badge?: string;
}

const PRIMARY_ITEMS: NavItemConfig[] = [
  { id: 'conversation', label: 'Conversation', href: '/chat', icon: ChatCircleDots },
  { id: 'agents', label: 'Agents', href: '/protocols?tab=a2a', icon: UsersThree },
  { id: 'protocols', label: 'Protocoles', href: '/protocols', icon: Cpu, badge: '8' },
  { id: 'scheduled', label: 'Missions planifiées', href: '/scheduled', icon: CalendarCheck },
  { id: 'memory', label: 'Mémoire Ñkyel', href: '/memory', icon: Brain },
];

const PROJECT_ITEMS: NavItemConfig[] = [
  { id: 'spaces', label: 'Espaces', href: '/spaces', icon: FolderSimpleStar },
];

const TASK_ITEMS: NavItemConfig[] = [
  { id: 'vie', label: 'Ñkyel VIE', href: '/workspace', icon: Graph, badge: 'Direct' },
  { id: 'mcp', label: 'Connecteurs MCP', href: '/protocols?tab=mcp', icon: PlugsConnected },
  { id: 'skills', label: 'Skills', href: '/protocols?tab=skills', icon: PuzzlePiece },
  { id: 'checkpoints', label: 'Checkpoints', href: '/workspace?view=checkpoints', icon: FloppyDisk },
];

export const NAV_SECTIONS = [
  { title: 'Principal', items: PRIMARY_ITEMS },
  { title: 'Espaces', items: PROJECT_ITEMS },
  { title: 'Tâches', items: TASK_ITEMS },
];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'N';
}

/* ── Component ─────────────────────────────────────────── */

export default function NkyelSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleCollapse, isOpen, close } = useSidebar();
  const isMobile = useIsMobile();
  const openSettings = useSettingsModal((state) => state.open);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const displayName = user?.fullName || user?.username || 'Utilisateur';
  const email = user?.primaryEmailAddress?.emailAddress || 'Compte Ñkyel';
  const initials = initialsFor(displayName);

  const compact = isCollapsed && !isMobile;

  const renderItem = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive = pathname === item.href.split('?')[0] || pathname.startsWith(`${item.href.split('?')[0]}/`);

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => isMobile && close()}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`nkyel-nav-item ${compact ? 'justify-center px-0' : ''} ${isActive ? 'nkyel-nav-item--active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        title={compact ? item.label : undefined}
        style={isActive ? {
          background: 'var(--sidebar-active)',
          color: 'var(--text-primary)',
          borderColor: 'color-mix(in srgb, var(--accent-brand) 42%, transparent)',
          boxShadow: 'inset 2px 0 0 var(--accent-brand)',
        } : undefined}
      >
        <Icon
          size={19}
          weight={isActive ? 'fill' : 'regular'}
          className={`nkyel-nav-icon shrink-0 ${isActive ? 'text-[var(--text-primary)]' : ''}`}
        />
        {!compact && (
          <span className="nkyel-nav-label flex min-w-0 flex-1 items-center justify-between gap-3">
            <span className="truncate">{item.label}</span>
            {item.badge && <span className="shrink-0 text-[10px] font-mono text-[var(--text-tertiary)]">{item.badge}</span>}
          </span>
        )}
        {compact && hoveredItem === item.id && (
          <span className="nkyel-sidebar-tooltip">{item.label}</span>
        )}
      </Link>
    );
  };

  const asideClass = isMobile
    ? `nkyel-sidebar fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `nkyel-sidebar relative h-full shrink-0`;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <button
          aria-label="Fermer la navigation"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      <aside
        className={asideClass}
        data-collapsed={isCollapsed && !isMobile ? 'true' : 'false'}
        aria-label="Navigation principale Ñkyel"
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className={`nkyel-sidebar-header relative flex h-16 shrink-0 items-center ${compact ? 'justify-between px-2' : 'justify-between'}`} data-compact={compact ? 'true' : undefined}>
          <Link
            href="/"
            className="nkyel-brand-link flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-[var(--hover)]"
            title="Ñkyel — Accueil"
          >
            <img
              src="/brand/nkyel-mark.svg"
              alt=""
              aria-hidden="true"
              className="nkyel-brand-mark h-8 w-8 shrink-0 object-contain"
            />
            {!compact && (
              <span className="truncate text-[20px] font-semibold tracking-[-0.035em] text-[var(--text-primary)]">
                Ñkyel
              </span>
            )}
          </Link>

          {!compact && !isMobile && (
            <button
              type="button"
              aria-label="Rechercher"
              className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
            >
              <MagnifyingGlass size={21} weight="regular" />
            </button>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Développer' : 'Réduire'}
              title={isCollapsed ? 'Développer' : 'Réduire'}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] shadow-sm transition-colors hover:bg-[var(--active)] hover:text-[var(--text-primary)]"
            >
              <SidebarSimple size={18} weight={isCollapsed ? 'regular' : 'fill'} />
            </button>
          )}
        </div>

        {/* ── New Mission ───────────────────────────────── */}
        <div className={compact ? 'px-3 py-3' : 'px-4 py-3'}>
          <Link
            href="/chat?new=true"
            onClick={() => isMobile && close()}
            className={`nkyel-new-mission group ${compact ? 'justify-center px-0' : 'gap-4 px-4 bg-[var(--surface-raised)]'}`}
            title="Nouvelle mission"
          >
            <Plus size={19} weight="regular" className="nkyel-nav-icon shrink-0 transition-transform duration-200 group-hover:rotate-90" />
            {!compact && <span>Nouvelle mission</span>}
          </Link>
        </div>

        {/* ── Navigation ────────────────────────────────── */}
        <div className={`nkyel-sidebar-nav flex-1 overflow-y-auto pb-3 ${compact ? 'px-3' : 'px-3'} no-scrollbar`}>
          <div className="space-y-1">{PRIMARY_ITEMS.map((item) => renderItem(item))}</div>

          <div className="my-3 border-t border-[var(--border-subtle)]" />

          {!compact && (
            <div className="nkyel-nav-section-title mb-2 px-1">Espaces</div>
          )}
          <div className="space-y-1">{PROJECT_ITEMS.map((item) => renderItem(item))}</div>

          {!compact && (
            <div className="mb-2 mt-4 flex items-center justify-between px-1">
              <span className="nkyel-nav-section-title">Tâches</span>
              <CaretRight size={15} className="rotate-90 text-[var(--text-tertiary)]" />
            </div>
          )}
          <div className="space-y-1">{TASK_ITEMS.map((item) => renderItem(item))}</div>
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        <div className={`nkyel-sidebar-footer shrink-0 ${compact ? 'px-3 py-4' : 'px-4 py-3'}`}>
          <div className={compact ? 'flex flex-col items-center gap-4' : 'flex items-center gap-2'}>
            {/* Avatar */}
            <div className={`${compact ? 'order-3' : 'order-1'} flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[12px] font-semibold text-[var(--text-primary)]`}>
              {user?.imageUrl
                ? <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                : initials
              }
            </div>

            {/* User info */}
            {!compact && (
              <div className="order-2 min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{displayName}</p>
                <p className="truncate text-[10.5px] text-[var(--text-tertiary)]">{email}</p>
              </div>
            )}

            {/* Actions */}
            <button type="button" aria-label="Ñkyel Bureau" className={`${compact ? 'order-1' : 'order-3'} text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]`}>
              <Monitor size={19} />
            </button>
            <button type="button" aria-label="Notifications" className={`${compact ? 'order-2' : 'order-4'} text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]`}>
              <Bell size={19} />
            </button>
            {!compact && (
              <button type="button" onClick={openSettings} aria-label="Ouvrir les paramètres" title="Ouvrir les paramètres" className="order-5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]">
                <DotsThree size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
