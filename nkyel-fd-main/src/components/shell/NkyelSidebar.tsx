/**
 * Ñkyel AI · NkyelSidebar
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Sovereign Navigation — 11 sections:
 * Nouvelle mission · Conversation · Ñkyel VIE · Agents · Protocoles
 * Connecteurs MCP · Skills · Missions planifiées · Mémoire · Espaces · Checkpoints
 *
 * Apple × Geist precision:
 * — Strict 4/8px vertical rhythm
 * — 44px minimum touch targets
 * — Pixel-perfect icon alignment (18px optical)
 * — Collapsed mode with tooltips
 * — Mobile drawer with backdrop
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sparkle,
  ShieldCheck,
  DotsThreeVertical,
  User,
  Gear,
  CreditCard,
  Question,
  SignOut,
  Command,
  Crown,
} from '@phosphor-icons/react';
import { useUser, SignOutButton } from '@clerk/nextjs';
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
  { id: 'welcome', label: 'Accueil & Fabric', href: '/welcome', icon: Sparkle, badge: '38 IA' },
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
  { id: 'admin', label: 'Command Center', href: '/admin', icon: ShieldCheck, badge: 'ADMIN' },
];

export default function NkyelSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleSidebar, isMobile, isOpen, closeMobileSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const displayName = user?.fullName || user?.firstName || 'Daniel Jonathan ANDJ';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'daniel@nkyel.ai';
  const userInitials = (displayName.slice(0, 2) || 'DJ').toUpperCase();

  const isSuperAdmin = Boolean(
    userEmail.includes('jonathanakarentoutoume') ||
    userEmail.includes('smartandjia') ||
    userEmail.includes('nkyel.ai')
  );

  const handleNavClick = useCallback(() => {
    if (isMobile) closeMobileSidebar();
  }, [isMobile, closeMobileSidebar]);

  const sidebarW = isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-overlay)' }}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className="h-full flex flex-col shrink-0 select-none"
        style={{
          width: sidebarW,
          background: 'var(--bg)',
          borderRight: '1px solid var(--border-subtle)',
          zIndex: 'var(--z-sidebar)',
          transition: `width var(--duration-slow) var(--ease-out)`,
          ...(isMobile ? {
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            width: 'var(--sidebar-width)',
            boxShadow: isOpen ? 'var(--shadow-2xl)' : 'none',
          } : {}),
        }}
        aria-label="Navigation principale Ñkyel"
      >
        {/* ─── Header: Logo + Collapse Toggle ─── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            height: 'var(--header-height)',
            paddingInline: 'var(--space-3)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden rounded-lg"
            style={{ padding: 'var(--space-1)' }}
            title="Ñkyel AI — Accueil"
            onClick={handleNavClick}
          >
            <img src="/nkyel-ai.svg" alt="Ñkyel AI" className="w-7 h-7 object-contain shrink-0 rounded-lg shadow-sm" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span
                  className="font-semibold truncate flex items-center gap-2"
                  style={{ fontSize: 'var(--text-base)', color: 'var(--fg)', letterSpacing: '-0.01em' }}
                >
                  Ñkyel AI
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-muted)',
                      letterSpacing: 'var(--tracking-wider)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    PRO
                  </span>
                </span>
                <span
                  className="truncate"
                  style={{ fontSize: '10px', color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}
                >
                  SmartANDJ AI
                </span>
              </div>
            )}
          </Link>

          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32,
                height: 32,
                color: 'var(--fg-subtle)',
                transition: `all var(--transition-fast)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fg)';
                e.currentTarget.style.background = 'var(--accent-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fg-subtle)';
                e.currentTarget.style.background = 'transparent';
              }}
              title={isCollapsed ? 'Développer la navigation' : 'Réduire la navigation'}
              aria-label={isCollapsed ? 'Développer' : 'Réduire'}
            >
              <SidebarSimple size={18} weight={isCollapsed ? 'regular' : 'fill'} />
            </button>
          )}
        </div>

        {/* ─── New Mission Button ─── */}
        <div style={{ padding: 'var(--space-3)' }}>
          <Link
            href="/chat?new=true"
            className="group flex items-center gap-2 w-full font-medium"
            style={{
              borderRadius: 'var(--radius-md)',
              padding: isCollapsed ? 'var(--space-3)' : '10px var(--space-3)',
              fontSize: 'var(--text-sm)',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              transition: `all var(--transition-fast)`,
            }}
            title="Lancer une nouvelle mission"
            onClick={handleNavClick}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <Plus size={16} weight="bold" className="shrink-0" />
            {!isCollapsed && <span className="truncate">Nouvelle mission</span>}
          </Link>
        </div>

        {/* ─── Navigation Items ─── */}
        <nav
          className="flex-1 overflow-y-auto scrollbar-thin"
          style={{ paddingInline: 'var(--space-2)', paddingBlock: 'var(--space-1)' }}
        >
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {NAV_SECTIONS.slice(1).map((item) => {
              const Icon = item.icon;
              const basePath = item.href.split('?')[0];
              const isActive = pathname === basePath || (basePath !== '/' && pathname.startsWith(basePath));

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={handleNavClick}
                  className="group relative flex items-center font-medium"
                  style={{
                    gap: 'var(--space-3)',
                    paddingInline: 'var(--space-3)',
                    minHeight: 40,
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    color: isActive ? 'var(--fg)' : 'var(--fg-muted)',
                    background: isActive ? 'var(--surface-raised)' : 'transparent',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--accent-subtle)';
                      e.currentTarget.style.color = 'var(--fg)';
                    }
                    setHoveredItem(item.id);
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--fg-muted)';
                    }
                    setHoveredItem(null);
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    weight={isActive ? 'fill' : 'regular'}
                    className="shrink-0"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--fg-subtle)',
                      transition: `color var(--transition-fast)`,
                    }}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--accent-subtle)',
                            color: 'var(--fg-muted)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 500,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && hoveredItem === item.id && (
                    <div
                      className="absolute whitespace-nowrap"
                      style={{
                        left: 'calc(var(--sidebar-collapsed) + 8px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 'var(--z-dropdown)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--fg)',
                        fontSize: 'var(--text-xs)',
                        boxShadow: 'var(--shadow-md)',
                        pointerEvents: 'none',
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ─── Bottom Footer: Luma-Style User Profile Anchor ─── */}
        <div
          className="shrink-0 relative"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Profile Menu Popover */}
          {profileMenuOpen && (
            <div
              className="absolute left-3 right-3 bottom-full mb-2 p-2 rounded-2xl bg-[#0D0F17] border border-white/10 shadow-2xl z-50 text-xs space-y-1"
              style={{ minWidth: 220 }}
            >
              {/* User Header */}
              <div className="p-2 border-b border-white/[0.08] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-bold text-xs shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate text-xs">{displayName}</div>
                  <div className="text-[10px] text-white/40 truncate font-mono">{userEmail}</div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="py-1 space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                >
                  <User size={14} className="text-[#D5AE57]" />
                  <span>Mon Profil</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                >
                  <Gear size={14} className="text-white/60" />
                  <span>Paramètres</span>
                </Link>

                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] text-white/70">
                  <span className="flex items-center gap-2 text-[11px]">
                    <Crown size={14} className="text-[#D5AE57]" />
                    <span>Crédits Inférence</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#D5AE57]">Illimités</span>
                </div>
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-white/[0.06]">
                <SignOutButton>
                  <button
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 text-red-400 text-left transition-colors"
                  >
                    <SignOut size={14} />
                    <span>Déconnexion</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}

          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white truncate">{displayName}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#D5AE57]/15 border border-[#D5AE57]/30 text-[#D5AE57] font-bold">
                      {isSuperAdmin ? 'SUPER ADMIN' : 'PRO'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <DotsThreeVertical size={16} className="text-white/40 shrink-0" />
            )}
          </button>
        </div>

        {/* ─── Footer: Protocol Status ─── */}
        <div
          className="shrink-0"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href="/protocols"
            className="flex items-center gap-2 rounded-lg"
            style={{
              padding: '6px var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-subtle)',
              transition: `all var(--transition-fast)`,
              minHeight: 32,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-subtle)';
              e.currentTarget.style.color = 'var(--fg-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--fg-subtle)';
            }}
            title="Observatoire des Protocoles"
          >
            <Cpu size={15} className="shrink-0" style={{ color: 'var(--hue-success)' }} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  8 Protocoles OK
                </span>
                <span
                  className="animate-breathe"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--hue-success)',
                    flexShrink: 0,
                  }}
                />
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
