/**
 * Ñkyel AI · NkyelSidebar — P0 Professional Workspace Navigation
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical P0 Navigation Order:
 *   + Nouvelle mission
 *   ─────────────
 *   Agent Ñkyel
 *   Connecteurs
 *   Programmé
 *   Bibliothèque
 *   ─────────────
 *   Projets (+ Nouveau projet)
 *   ─────────────
 *   Missions récentes (grouped by time)
 *   ─────────────
 *   Profil utilisateur (bottom)
 *
 * Apple × Geist precision:
 *   — 260px expanded, 64px collapsed
 *   — 44px minimum touch targets
 *   — Pixel-perfect 18px icon alignment
 *   — Collapsed mode with positioned tooltips
 *   — Mobile drawer with backdrop
 *   — Semantic design tokens throughout
 *   — No layout shift on center workspace
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus,
  Robot,
  PlugsConnected,
  CalendarCheck,
  Books,
  FolderSimplePlus,
  FolderSimple,
  SidebarSimple,
  DotsThreeVertical,
  User,
  Gear,
  SignOut,
  Crown,
  Sparkle,
  ChatCircleDots,
  Presentation,
  FileText,
  Browsers,
  Globe,
  Image as ImageIcon,
  Code,
  CaretRight,
  CaretDown,
  Question,
  Bell,
  PencilSimple,
  Archive,
  Trash,
  Copy,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useSafeUser as useUser } from '@/lib/auth-client';

/* ═══════════════════════════════════════════════════════
   NAV CONFIGURATION — P0 Canonical Order
   ═══════════════════════════════════════════════════════ */

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'agent',      label: 'Agent Ñkyel',   href: '/agent',      icon: Robot },
  { id: 'connectors', label: 'Connecteurs',   href: '/connectors', icon: PlugsConnected },
  { id: 'scheduled',  label: 'Programmé',     href: '/scheduled',  icon: CalendarCheck },
  { id: 'library',    label: 'Bibliothèque',  href: '/library',    icon: Books },
];

/* ═══════════════════════════════════════════════════════
   DEMO RECENT MISSIONS (replace with real store data)
   ═══════════════════════════════════════════════════════ */

interface RecentMission {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  updatedAt: number;
}

const DEMO_MISSIONS: RecentMission[] = [
  { id: 'm-1', title: 'Analyse Économique & Transition Énergétique',   icon: Presentation, updatedAt: Date.now() },
  { id: 'm-2', title: 'Synthèse Rapports de Veille Stratégique',       icon: FileText,     updatedAt: Date.now() - 3600000 },
  { id: 'm-3', title: 'Recherche Web Multilingue (Fang/FR)',           icon: Globe,        updatedAt: Date.now() - 86400000 },
  { id: 'm-4', title: 'Génération Multimédia FLUX & Wan2.1',          icon: ImageIcon,    updatedAt: Date.now() - 86400000 * 3 },
  { id: 'm-5', title: 'Développement Landing Page Tourisme',          icon: Code,         updatedAt: Date.now() - 86400000 * 5 },
];

function groupByTime(missions: RecentMission[]) {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;
  const weekAgo = todayStart - 7 * 86400000;

  const groups: { label: string; items: RecentMission[] }[] = [
    { label: "Aujourd'hui", items: [] },
    { label: 'Hier', items: [] },
    { label: '7 derniers jours', items: [] },
    { label: 'Plus ancien', items: [] },
  ];

  missions.forEach((m) => {
    if (m.updatedAt >= todayStart) groups[0].items.push(m);
    else if (m.updatedAt >= yesterdayStart) groups[1].items.push(m);
    else if (m.updatedAt >= weekAgo) groups[2].items.push(m);
    else groups[3].items.push(m);
  });

  return groups.filter((g) => g.items.length > 0);
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function NkyelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { isCollapsed, toggleSidebar, isMobile, isOpen, closeMobileSidebar } = useSidebar();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.firstName || 'Daniel Jonathan ANDJ';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'daniel@nkyel.ai';
  const userInitials = (displayName.slice(0, 2) || 'DJ').toUpperCase();

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen]);

  const handleNavClick = useCallback(() => {
    if (isMobile) closeMobileSidebar();
    setProfileMenuOpen(false);
  }, [isMobile, closeMobileSidebar]);

  const isActive = (href: string) => {
    const base = href.split('?')[0];
    if (base === '/') return pathname === '/';
    return pathname === base || pathname.startsWith(base + '/');
  };

  const recentGroups = groupByTime(DEMO_MISSIONS);

  /* ─── Render ─── */

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0"
          style={{
            background: 'var(--material-scrim)',
            zIndex: 'var(--z-overlay)',
            transition: `opacity var(--transition-standard)`,
          }}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className="h-full flex flex-col shrink-0 select-none"
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 'var(--z-sidebar)',
          transition: `width var(--motion-standard) var(--ease-apple)`,
          ...(isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                width: 'var(--sidebar-width)',
                boxShadow: isOpen ? 'var(--shadow-modal)' : 'none',
                transition: `transform var(--motion-context) var(--ease-apple)`,
              }
            : {}),
        }}
        aria-label="Navigation principale Ñkyel"
      >
        {/* ═══════════════════════════════════════════════════
           ZONE 1: Header — Logo + Collapse Toggle
           ═══════════════════════════════════════════════════ */}
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}
          style={{
            height: 'var(--header-height)',
            paddingInline: isCollapsed ? '0' : 'var(--space-3)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-lg hover:bg-[var(--hover)] transition-colors p-1"
              title="Développer la barre latérale"
              aria-label="Développer la barre latérale"
            >
              <img
                src="/nkyel-ai.svg"
                alt="Ñkyel AI"
                className="w-7 h-7 object-contain shrink-0 rounded-lg"
              />
            </button>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-2.5 overflow-hidden rounded-lg"
                style={{ padding: 'var(--space-1)' }}
                title="Ñkyel AI — Accueil"
                onClick={handleNavClick}
              >
                <img
                  src="/nkyel-ai.svg"
                  alt="Ñkyel AI"
                  className="w-7 h-7 object-contain shrink-0 rounded-lg"
                />
                <span
                  className="font-semibold truncate"
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--fg, var(--text-primary))',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Ñkyel
                </span>
              </Link>

              {!isMobile && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  title="Réduire la navigation"
                  aria-label="Réduire"
                >
                  <SidebarSimple size={18} weight="fill" />
                </button>
              )}
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 2: New Mission Button
           ═══════════════════════════════════════════════════ */}
        <div style={{ padding: `var(--space-3) var(--space-3) var(--space-2)` }}>
          <Link
            href="/chat?new=true"
            className="group flex items-center gap-2.5 w-full font-medium"
            style={{
              borderRadius: 'var(--radius-control)',
              padding: isCollapsed ? '10px' : '10px var(--space-3)',
              fontSize: 'var(--text-sm)',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              transition: `all var(--transition-fast)`,
            }}
            title="Lancer une nouvelle mission"
            onClick={handleNavClick}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.background = 'var(--accent)';
            }}
          >
            <Plus size={16} weight="bold" className="shrink-0" />
            {!isCollapsed && <span className="truncate">Nouvelle mission</span>}
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 3: Primary Navigation
           ═══════════════════════════════════════════════════ */}
        <nav
          className="shrink-0"
          style={{ paddingInline: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}
        >
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleNavClick}
                  className="group relative flex items-center font-medium"
                  style={{
                    gap: 'var(--space-3)',
                    paddingInline: 'var(--space-3)',
                    minHeight: 38,
                    borderRadius: 'var(--radius-control)',
                    fontSize: 'var(--text-sm)',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--surface-raised)' : 'transparent',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e: any) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                    setHoveredItem(item.id);
                  }}
                  onMouseLeave={(e: any) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                    setHoveredItem(null);
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    weight={active ? 'fill' : 'regular'}
                    className="shrink-0"
                    style={{
                      color: active ? 'var(--accent)' : 'var(--text-tertiary)',
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
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            fontWeight: 500,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collapsed tooltip */}
                  {isCollapsed && hoveredItem === item.id && (
                    <div
                      className="absolute whitespace-nowrap pointer-events-none"
                      style={{
                        left: 'calc(var(--sidebar-collapsed) + 8px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 'var(--z-dropdown)',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-control-sm)',
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-xs, 12px)',
                        boxShadow: 'var(--shadow-key)',
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

        {/* Separator */}
        <div style={{ marginInline: 'var(--space-4)', height: 1, background: 'var(--border-subtle)' }} />

        {/* ═══════════════════════════════════════════════════
           ZONE 4: Projects
           ═══════════════════════════════════════════════════ */}
        {!isCollapsed && (
          <div style={{ padding: `var(--space-2) var(--space-2) 0` }}>
            <button
              type="button"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="w-full flex items-center justify-between rounded-lg"
              style={{
                padding: `var(--space-1) var(--space-2)`,
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-tertiary)',
                transition: `all var(--transition-fast)`,
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <span>Projets</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/projects');
                  }}
                  className="flex items-center justify-center rounded"
                  style={{
                    width: 20,
                    height: 20,
                    color: 'var(--text-tertiary)',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--hover)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Nouveau projet"
                >
                  <Plus size={12} weight="bold" />
                </button>
                {projectsExpanded ? <CaretDown size={11} /> : <CaretRight size={11} />}
              </div>
            </button>

            {projectsExpanded && (
              <div style={{ marginTop: 2 }}>
                <Link
                  href="/projects"
                  onClick={handleNavClick}
                  className="flex items-center gap-2.5 rounded-lg"
                  style={{
                    padding: `6px var(--space-3)`,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.background = 'var(--hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FolderSimple size={15} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="truncate text-[13px]">Nouveau projet</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        <div style={{ marginInline: 'var(--space-4)', marginTop: 'var(--space-2)', height: 1, background: 'var(--border-subtle)' }} />

        {/* ═══════════════════════════════════════════════════
           ZONE 5: Recent Missions (scrollable)
           ═══════════════════════════════════════════════════ */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingInline: 'var(--space-2)',
            paddingTop: 'var(--space-2)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          {!isCollapsed && (
            <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
              {recentGroups.map((group) => (
                <div key={group.label}>
                  <div
                    style={{
                      padding: `var(--space-1) var(--space-2)`,
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {group.label}
                  </div>
                  <div className="flex flex-col" style={{ gap: '1px', marginTop: 2 }}>
                    {group.items.map((mission) => {
                      const Icon = mission.icon;
                      const missionActive = pathname === `/chat/${mission.id}`;

                      return (
                        <div key={mission.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="w-full flex items-center justify-between rounded-lg text-left"
                            style={{
                              padding: `6px var(--space-2)`,
                              fontSize: '13px',
                              color: missionActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              background: missionActive ? 'var(--surface-raised)' : 'transparent',
                              transition: `all var(--transition-fast)`,
                            }}
                            onMouseEnter={(e: any) => {
                              if (!missionActive) {
                                e.currentTarget.style.background = 'var(--hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }
                            }}
                            onMouseLeave={(e: any) => {
                              if (!missionActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
                              <span className="truncate">{mission.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setContextMenuId(contextMenuId === mission.id ? null : mission.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 shrink-0 flex items-center justify-center rounded"
                              style={{
                                width: 20,
                                height: 20,
                                color: 'var(--text-tertiary)',
                                transition: `opacity var(--transition-fast)`,
                              }}
                            >
                              <DotsThreeVertical size={13} weight="bold" />
                            </button>
                          </button>

                          {/* Context menu */}
                          {contextMenuId === mission.id && (
                            <div
                              className="absolute right-2 top-8 z-50"
                              style={{
                                width: 160,
                                padding: 'var(--space-1)',
                                borderRadius: 'var(--radius-panel)',
                                background: 'var(--surface-raised)',
                                border: '1px solid var(--border-default)',
                                boxShadow: 'var(--shadow-floating)',
                                fontSize: '12px',
                              }}
                              onMouseLeave={() => setContextMenuId(null)}
                            >
                              {[
                                { icon: PencilSimple, label: 'Renommer' },
                                { icon: Copy, label: 'Dupliquer' },
                                { icon: Archive, label: 'Archiver' },
                              ].map((action) => (
                                <button
                                  key={action.label}
                                  type="button"
                                  onClick={() => setContextMenuId(null)}
                                  className="w-full flex items-center gap-2 rounded-lg text-left"
                                  style={{
                                    padding: '6px var(--space-2)',
                                    color: 'var(--text-secondary)',
                                    transition: `all var(--transition-fast)`,
                                  }}
                                  onMouseEnter={(e: any) => {
                                    e.currentTarget.style.background = 'var(--hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                  }}
                                  onMouseLeave={(e: any) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
                                >
                                  <action.icon size={13} />
                                  <span>{action.label}</span>
                                </button>
                              ))}
                              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                              <button
                                type="button"
                                onClick={() => setContextMenuId(null)}
                                className="w-full flex items-center gap-2 rounded-lg text-left"
                                style={{
                                  padding: '6px var(--space-2)',
                                  color: 'var(--error)',
                                  fontWeight: 500,
                                  transition: `all var(--transition-fast)`,
                                }}
                                onMouseEnter={(e: any) => {
                                  e.currentTarget.style.background = 'var(--hover)';
                                }}
                                onMouseLeave={(e: any) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <Trash size={13} />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Collapsed: show chat icon */}
          {isCollapsed && (
            <div className="flex flex-col items-center" style={{ gap: 4 }}>
              <Link
                href="/"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 38,
                  height: 38,
                  color: 'var(--text-tertiary)',
                  transition: `all var(--transition-fast)`,
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = 'var(--hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
                title="Missions récentes"
              >
                <ChatCircleDots size={18} />
              </Link>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 6: Profile Footer (bottom-anchored)
           ═══════════════════════════════════════════════════ */}
        <div
          ref={profileRef}
          className="shrink-0 relative"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Profile Menu Popover */}
          {profileMenuOpen && !isCollapsed && (
            <div
              className="absolute bottom-full left-2 right-2 mb-2"
              style={{
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-floating)',
                background: 'var(--material-glass-elevated)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 'var(--z-dropdown)',
                fontSize: '13px',
              }}
            >
              {/* User header */}
              <div
                className="flex items-center gap-2.5"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate" style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                    {displayName}
                  </div>
                  <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {userEmail}
                  </div>
                </div>
              </div>

              {/* Menu actions */}
              <div className="flex flex-col" style={{ gap: '1px' }}>
                {[
                  { icon: User, label: 'Compte', href: '/settings' },
                  { icon: Sparkle, label: 'Utilisation', href: '/settings' },
                  { icon: Gear, label: 'Paramètres', href: '/settings' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setProfileMenuOpen(false); handleNavClick(); }}
                    className="flex items-center gap-2.5 rounded-lg"
                    style={{
                      padding: '8px var(--space-3)',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                      transition: `all var(--transition-fast)`,
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = 'var(--hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <item.icon size={15} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Separator + Help */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: `var(--space-1) 0` }} />
              <Link
                href="/docs"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg"
                style={{
                  padding: '8px var(--space-3)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  transition: `all var(--transition-fast)`,
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = 'var(--hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Question size={15} style={{ color: 'var(--text-tertiary)' }} />
                <span>Aide & Documentation</span>
              </Link>

              {/* Sign out */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: `var(--space-1) 0` }} />
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (typeof window !== 'undefined') window.location.href = '/';
                }}
                className="w-full flex items-center gap-2.5 rounded-lg text-left"
                style={{
                  padding: '8px var(--space-3)',
                  color: 'var(--error)',
                  fontWeight: 500,
                  transition: `all var(--transition-fast)`,
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = 'var(--hover)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <SignOut size={15} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}

          {/* Profile Trigger */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between rounded-xl text-left"
            style={{
              padding: 'var(--space-2)',
              transition: `all var(--transition-fast)`,
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {displayName}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent-muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      PRO
                    </span>
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <DotsThreeVertical size={16} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
