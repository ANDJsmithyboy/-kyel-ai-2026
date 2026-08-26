/**
 * Nkyel AI · SidebarActions
 * SmartANDJ AI Technologies
 * Official Nomenclature: Nouvelle mission, Conversation, Mission VIE, Connecteurs MCP, Missions planifiées, Mémoire Ñkyel
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  ChatCircleDots,
  Graph,
  SquaresFour,
  Clock,
  Books,
  Robot,
} from '@phosphor-icons/react';
import { PantherMissionGlyph } from '@/components/icons';
import styles from './sidebar.module.css';

interface SidebarActionsProps {
  isCollapsed: boolean;
}

export default function SidebarActions({ isCollapsed }: SidebarActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isRouteActive = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  const navItems = [
    {
      id: 'chat',
      label: 'Conversation',
      icon: ChatCircleDots,
      route: '/',
      active: pathname === '/' || pathname.startsWith('/chat'),
    },
    {
      id: 'agent',
      label: 'Mission VIE',
      icon: Graph,
      route: '/workspace',
      active: pathname === '/agent' || pathname.startsWith('/workspace'),
      badge: 'Agent',
    },
    {
      id: 'protocols',
      label: 'Protocoles',
      icon: SquaresFour,
      route: '/protocols',
      active: pathname.startsWith('/protocols'),
      badge: '8 Couches',
    },
    {
      id: 'capabilities',
      label: 'Agents & Capacités',
      icon: Robot,
      route: '/capabilities',
      active: pathname.startsWith('/capabilities'),
    },
    {
      id: 'scheduled',
      label: 'Missions planifiées',
      icon: Clock,
      route: '/scheduled',
      active: pathname.startsWith('/scheduled'),
    },
    {
      id: 'memory',
      label: 'Mémoire Ñkyel',
      icon: Books,
      route: '/memory',
      active: pathname.startsWith('/memory'),
    },
  ];

  return (
    <div className="flex flex-col gap-1 px-2 pt-3">
      {/* 1. Nouvelle mission Button */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => router.push('/')}
          title="Nouvelle mission"
          className="w-10 h-10 mx-auto rounded-xl bg-[var(--accent-subtle)] hover:bg-[var(--accent-muted)] border border-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center transition-all mb-2"
        >
          <PantherMissionGlyph size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] border border-[var(--accent-muted)] text-[var(--accent-fg)] font-medium text-[13px] shadow-sm transition-all mb-2 active:scale-[0.98]"
        >
          <PantherMissionGlyph size={18} className="shrink-0" />
          <span className="font-semibold tracking-wide">Nouvelle mission</span>
        </button>
      )}

      {/* 2. Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.active;

        if (isCollapsed) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.route)}
              title={item.label}
              className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                active
                  ? 'bg-[var(--active)] text-[var(--accent)] font-semibold border border-[var(--border)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
              }`}
            >
              <Icon size={18} weight={active ? 'fill' : 'regular'} />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(item.route)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
              active
                ? 'bg-[var(--active)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                size={18}
                weight={active ? 'fill' : 'regular'}
                className={active ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}
              />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--info-subtle)] border border-[var(--info)]/30 text-[var(--info)] font-semibold uppercase">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
