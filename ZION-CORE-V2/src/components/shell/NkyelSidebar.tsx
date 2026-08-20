/**
 * Ñkyel AI · NkyelSidebar
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Navigation Souveraine Ñkyel — 11 sections obligatoires :
 * - Nouvelle mission
 * - Conversation
 * - Ñkyel VIE
 * - Agents
 * - Protocoles
 * - Connecteurs MCP
 * - Skills
 * - Missions planifiées
 * - Mémoire Ñkyel
 * - Espaces
 * - Checkpoints
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  SlidersHorizontal,
  ShieldCheck,
  CaretRight,
} from '@phosphor-icons/react';
import NkyelSeptBranchLogo from '@/components/icons/NkyelSeptBranchLogo';
import { useSidebar } from '@/hooks/useSidebar';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isAction?: boolean;
}

export const NAV_SECTIONS: NavItemConfig[] = [
  { id: 'new-mission', label: 'Nouvelle mission', href: '/chat?new=true', icon: Plus, isAction: true },
  { id: 'conversation', label: 'Conversation', href: '/chat', icon: ChatCircleDots },
  { id: 'vie', label: 'Ñkyel VIE', href: '/workspace', icon: Graph, badge: 'Direct' },
  { id: 'agents', label: 'Agents', href: '/protocols?tab=a2a', icon: UsersThree },
  { id: 'protocols', label: 'Protocoles', href: '/protocols', icon: Cpu, badge: '8' },
  { id: 'mcp', label: 'Connecteurs MCP', href: '/protocols?tab=mcp', icon: PlugsConnected },
  { id: 'skills', label: 'Skills', href: '/protocols?tab=skills', icon: PuzzlePiece },
  { id: 'scheduled', label: 'Missions planifiées', href: '/scheduled', icon: CalendarCheck },
  { id: 'memory', label: 'Mémoire Ñkyel', href: '/memory', icon: Brain },
  { id: 'spaces', label: 'Espaces', href: '/spaces', icon: FolderSimpleStar },
  { id: 'checkpoints', label: 'Checkpoints', href: '/workspace?view=checkpoints', icon: FloppyDisk },
];

export default function NkyelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar, isMobile, isOpen, closeMobileSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // État étendu ou compact
  const sidebarWidth = isCollapsed ? 'w-[68px]' : 'w-[272px]';

  return (
    <aside
      className={`relative h-full flex flex-col shrink-0 z-30 border-r border-white/[0.06] bg-[#08090D] transition-all duration-200 ease-out select-none ${sidebarWidth}`}
      aria-label="Navigation principale Ñkyel"
    >
      {/* 1. Header & Logo Souverain */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-white/[0.04]">
        <Link
          href="/"
          className="flex items-center gap-3 overflow-hidden rounded-xl p-1.5 hover:bg-white/[0.03] transition-colors"
          title="Ñkyel AI — Accueil"
        >
          <NkyelSeptBranchLogo size={28} />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[#F1EEE7] tracking-tight truncate flex items-center gap-1.5">
                Ñkyel AI
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#665F9E]/20 text-[#AAA2C8] border border-[#665F9E]/30 font-mono">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-[#7E8795] truncate font-mono">
                SmartANDJ AI
              </span>
            </div>
          )}
        </Link>

        {/* Toggle Expand/Collapse */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? 'Développer la navigation' : 'Réduire la navigation'}
            aria-label={isCollapsed ? 'Développer' : 'Réduire'}
          >
            <SidebarSimple size={18} weight={isCollapsed ? 'regular' : 'fill'} />
          </button>
        )}
      </div>

      {/* 2. Bouton Principal : Nouvelle Mission */}
      <div className="p-2.5">
        <Link
          href="/chat?new=true"
          className={`group flex items-center gap-2.5 w-full rounded-xl p-2.5 transition-all text-[13px] font-medium ${
            isCollapsed
              ? 'justify-center bg-gradient-to-br from-[#665F9E]/20 to-[#315A70]/20 border border-[#665F9E]/40 text-[#F1EEE7] hover:border-[#665F9E]'
              : 'bg-gradient-to-r from-[#665F9E] to-[#315A70] text-[#F1EEE7] hover:brightness-110 shadow-sm'
          }`}
          title="Lancer une nouvelle mission"
        >
          <Plus size={18} weight="bold" className="shrink-0 group-hover:rotate-90 transition-transform duration-200" />
          {!isCollapsed && <span className="truncate">Nouvelle mission</span>}
        </Link>
      </div>

      {/* 3. Liste des 10 Autres Sections */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1 scrollbar-thin scrollbar-thumb-white/10">
        {NAV_SECTIONS.slice(1).map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href.split('?')[0]);

          return (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 min-h-[44px] ${
                isActive
                  ? 'bg-[#151922] text-[#F1EEE7] border border-white/[0.08]'
                  : 'text-[#B8C0CC] hover:text-[#F1EEE7] hover:bg-white/[0.04]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                weight={isActive ? 'fill' : 'regular'}
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-[#C39A52]' : 'text-[#7E8795] group-hover:text-[#B8C0CC]'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#315A70]/20 text-[#6F9485] border border-[#6F9485]/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip pour mode compact */}
              {isCollapsed && hoveredItem === item.id && (
                <div className="absolute left-[74px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-lg bg-[#151922] border border-white/[0.1] text-[#F1EEE7] text-[12px] whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* 4. Footer & Statut Souverain */}
      <div className="p-2.5 border-t border-white/[0.04] flex flex-col gap-1.5">
        <Link
          href="/protocols"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-[#7E8795] hover:text-[#B8C0CC] hover:bg-white/[0.03] transition-colors min-h-[44px]"
          title="Observatoire des Protocoles"
        >
          <Cpu size={16} className="text-[#6F9485] shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate font-mono text-[11px]">8 Protocoles OK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F9485] animate-pulse" />
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
