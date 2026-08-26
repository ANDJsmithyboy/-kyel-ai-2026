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
          className="w-10 h-10 mx-auto rounded-xl bg-[#6757E8]/15 hover:bg-[#6757E8]/25 border border-[#6757E8]/30 text-[#D5AE57] flex items-center justify-center transition-all mb-2"
        >
          <PantherMissionGlyph size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#6757E8]/20 to-[#D5AE57]/10 hover:from-[#6757E8]/30 hover:to-[#D5AE57]/20 border border-[#D5AE57]/25 text-white font-medium text-[13px] shadow-[0_0_15px_rgba(103,87,232,0.15)] transition-all mb-2 active:scale-[0.98]"
        >
          <PantherMissionGlyph size={18} className="text-[#D5AE57] shrink-0" />
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
                  ? 'bg-white/10 text-[#D5AE57] font-semibold border border-white/10'
                  : 'text-[#9199A8] hover:text-white hover:bg-white/5'
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
                ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm font-semibold'
                : 'text-[#9199A8] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                size={18}
                weight={active ? 'fill' : 'regular'}
                className={active ? 'text-[#D5AE57]' : 'text-[#9199A8]'}
              />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#6757E8]/20 border border-[#6757E8]/30 text-[#6757E8] font-semibold uppercase">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
