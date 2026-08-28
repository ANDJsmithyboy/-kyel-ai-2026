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

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Sliders,
  Archive,
  Trash,
  Copy,
  Desktop,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { useSafeUser as useUser, useSafeClerk as useClerk } from '@/lib/auth-client';
import { useLanguageStore } from '@/stores/language.store';
import { useConversations, type NeonConversation } from '@/hooks/useConversations';
import { IbogaNavigationTrigger, GabonOriginMark } from '@/components/brand';
import { PantherMissionGlyph, NkyelAgentIcon } from '@/components/icons';

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

/* ═══════════════════════════════════════════════════════
   CONVERSATION GROUPING
   ═══════════════════════════════════════════════════════ */

function groupConversationsByTime(conversations: any[], t: (k: string) => string) {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;
  const weekAgo = todayStart - 7 * 86400000;

  const groups: { label: string; items: any[] }[] = [
    { label: t('time.today'), items: [] },
    { label: t('time.yesterday'), items: [] },
    { label: t('time.previous7Days'), items: [] },
    { label: t('time.older'), items: [] },
  ];

  (conversations || []).forEach((c) => {
    const time = c.updatedAt || c.createdAt || now;
    if (time >= todayStart) groups[0].items.push(c);
    else if (time >= yesterdayStart) groups[1].items.push(c);
    else if (time >= weekAgo) groups[2].items.push(c);
    else groups[3].items.push(c);
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
  const { signOut } = useClerk();
  const { isCollapsed, toggleSidebar, isMobile, isOpen, closeMobileSidebar } = useSidebar();
  const { t } = useLanguageStore();
  const openDesktopSettings = useSettingsModal((s: any) => s.open);

  const {
    conversations,
    currentConversationId: activeConversationId,
    setCurrentConversationId: setActiveConversation,
    deleteConversation: removeConversation,
    updateTitle: updateConversationTitle,
    fetchConversations
  } = useConversations();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.firstName || t('profile.defaultName') || 'Utilisateur';
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userInitials = (displayName.slice(0, 2) || 'NK').toUpperCase();
  const isSuperAdmin = user?.publicMetadata?.role === 'SUPER_ADMIN';

  const navItems: NavItem[] = [
    { id: 'agent',        label: t('nav.agent'),        href: '/agent',      icon: Robot },
    { id: 'connections',  label: t('nav.connections'),  href: '/connectors', icon: PlugsConnected },
    { id: 'automations',  label: t('nav.automations'),  href: '/scheduled',  icon: CalendarCheck },
    { id: 'creations',    label: t('nav.creations'),    href: '/library',    icon: Books },
  ];

  const hydrateFromStorage = useSidebar((s: any) => s.hydrateFromStorage);

  const recentGroups = useMemo(() => {
    if (!conversations || conversations.length === 0) return [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    const today: NeonConversation[] = [];
    const previous7Days: NeonConversation[] = [];
    const previous30Days: NeonConversation[] = [];

    conversations.forEach((conv: NeonConversation) => {
      const time = new Date(conv.updated_at || conv.created_at).getTime() || now;
      const diff = now - time;
      if (diff < oneDay) {
        today.push(conv);
      } else if (diff < sevenDays) {
        previous7Days.push(conv);
      } else {
        previous30Days.push(conv);
      }
    });

    const groups: { label: string; items: NeonConversation[] }[] = [];
    if (today.length > 0) groups.push({ label: t('time.today') || "Aujourd'hui", items: today });
    if (previous7Days.length > 0) groups.push({ label: t('time.last7Days') || '7 derniers jours', items: previous7Days });
    if (previous30Days.length > 0) groups.push({ label: t('time.last30Days') || '30 derniers jours', items: previous30Days });

    return groups;
  }, [conversations, t]);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

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

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX.current - currentX;
    if (diffX > 50) {
      // Swiped left by > 50px -> slide-close drawer
      closeMobileSidebar();
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`nkyel-sidebar-container h-full flex flex-col shrink-0 select-none ${isOpen ? 'is-open' : ''}`}
        style={{
          width: isCollapsed && !isMobile ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 'var(--z-sidebar)',
          transition: `width var(--motion-standard) var(--ease-apple)`,
        }}
        aria-label="Navigation principale Ñkyel"
      >
        {/* ═══════════════════════════════════════════════════
           ZONE 1: Header — Wordmark + Iboga Navigation Signature
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
            <div className="hidden md:block">
              <IbogaNavigationTrigger
                open={false}
                onToggle={toggleSidebar}
                glyphSize={20}
                variant="desktop"
                title="Expand navigation"
                label="Expand navigation"
              />
            </div>
          ) : isMobile ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold tracking-tight text-[19px] select-none text-[var(--text-primary)]">
                nkyel
              </span>
              <div className="flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileSidebar();
                    setTimeout(() => {
                      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
                    }, 100);
                  }}
                  className="flex items-center justify-center p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
                  title="Recherche (⌘K)"
                  aria-label="Recherche"
                >
                  <MagnifyingGlass size={20} />
                </button>
                <IbogaNavigationTrigger
                  open={true}
                  onToggle={closeMobileSidebar}
                  glyphSize={24}
                  variant="mobile"
                  title="Close navigation"
                  label="Close navigation"
                />
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                title="Ñkyel — Home"
                onClick={handleNavClick}
              >
                <span
                  className="font-semibold truncate tracking-tight text-[17px] select-none text-[var(--text-primary)]"
                  style={{
                    letterSpacing: '-0.025em',
                  }}
                >
                  nkyel
                </span>
              </Link>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
                  className="flex items-center justify-center p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
                  title="Commandes (⌘K)"
                  aria-label="Recherche"
                >
                  <MagnifyingGlass size={18} />
                </button>
                <IbogaNavigationTrigger
                  open={true}
                  onToggle={toggleSidebar}
                  glyphSize={19}
                  variant="desktop"
                  title="Collapse navigation"
                  label="Collapse navigation"
                />
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 2: Nouvelle Mission Button (Canonical Ñkyel IA)
           ═══════════════════════════════════════════════════ */}
        <div style={{ padding: `var(--space-3) var(--space-3) var(--space-2)` }}>
          <Link
            href="/chat?new=true"
            className="group flex items-center gap-2.5 w-full font-medium min-h-[40px] touch-manipulation shadow-sm"
            style={{
              borderRadius: 'var(--radius-control)',
              padding: isCollapsed ? '10px' : '10px var(--space-3)',
              fontSize: 'var(--text-sm)',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              transition: `all var(--transition-fast)`,
            }}
            title={t('nav.newMission')}
            onClick={handleNavClick}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.background = 'var(--accent)';
            }}
          >
            <PantherMissionGlyph size={26} className="shrink-0 drop-shadow-sm" />
            {!isCollapsed && <span className="truncate font-semibold tracking-wide" style={{ fontSize: '15px' }}>{t('nav.newMission')}</span>}
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleNavClick}
                  className="group relative flex items-center font-medium min-h-[38px] touch-manipulation"
                  style={{
                    gap: 'var(--space-3)',
                    paddingInline: 'var(--space-3)',
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

        {/* ═══════════════════════════════════════════════════
           ZONE 4: Projects
           ═══════════════════════════════════════════════════ */}
        {!isCollapsed && (
          <div style={{ padding: `var(--space-2) var(--space-2) 0` }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setProjectsExpanded(!projectsExpanded);
                }
              }}
              className="w-full flex items-center justify-between rounded-lg min-h-[32px] touch-manipulation cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
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
              <span>{t('nav.projects')}</span>
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
                  title={t('nav.newProject')}
                >
                  <Plus size={12} weight="bold" />
                </button>
                {projectsExpanded ? <CaretDown size={11} /> : <CaretRight size={11} />}
              </div>
            </div>

            {projectsExpanded && (
              <div style={{ marginTop: 2 }}>
                <Link
                  href="/projects"
                  onClick={handleNavClick}
                  className="flex items-center gap-2.5 rounded-lg min-h-[32px] touch-manipulation"
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
                  <span className="truncate text-[13px]">{t('nav.newProject')}</span>
                </Link>
              </div>
            )}
          </div>
        )}

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
              {recentGroups.length === 0 ? (
                <div className="px-3 py-6 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-white/40">
                    <ChatCircleDots size={16} />
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {t('nav.tasks')}
                  </div>
                  <Link
                    href="/chat?new=true"
                    onClick={handleNavClick}
                    className="inline-block text-[11px] font-medium text-[var(--accent)] hover:underline"
                  >
                    + {t('nav.newTask')}
                  </Link>
                </div>
              ) : (
                recentGroups.map((group: { label: string; items: any[] }) => (
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
                      {group.items.map((mission: any) => {
                        const missionActive = activeConversationId === mission.id || pathname === `/chat/${mission.id}`;

                        return (
                          <div key={mission.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveConversation(mission.id);
                                router.push('/chat');
                                handleNavClick();
                              }}
                              className="w-full flex items-center justify-between rounded-lg text-left select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                              style={{
                                padding: `6px var(--space-2)`,
                                paddingRight: '28px', /* Leave room for context button */
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
                              <div className="flex items-center gap-2 min-w-0 w-full">
                                <ChatCircleDots size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
                                <span className="truncate">{mission.title || 'Untitled task'}</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setContextMenuId(contextMenuId === mission.id ? null : mission.id);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shrink-0 flex items-center justify-center rounded"
                              style={{
                                width: 20,
                                height: 20,
                                color: 'var(--text-tertiary)',
                                transition: `opacity var(--transition-fast)`,
                                zIndex: 10,
                              }}
                            >
                              <DotsThreeVertical size={13} weight="bold" />
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
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContextMenuId(null);
                                    const newTitle = window.prompt('Rename task:', mission.title);
                                    if (newTitle && newTitle.trim()) {
                                      updateConversationTitle(mission.id, newTitle.trim());
                                    }
                                  }}
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
                                  <PencilSimple size={13} />
                                  <span>Rename</span>
                                </button>
                                
                                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContextMenuId(null);
                                    removeConversation(mission.id);
                                  }}
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
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
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
           ZONE 6: Profile Footer (bottom-anchored · Manus × Apple Spirit)
           ═══════════════════════════════════════════════════ */}
        <div
          ref={profileRef}
          className="shrink-0 relative"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Manus Profile Menu Popover (Screenshot 3) */}
          {profileMenuOpen && (
            <div
              className="absolute bottom-full left-2 right-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
              style={{
                width: isCollapsed ? 260 : 'calc(100% - 16px)',
                maxWidth: 360,
                minWidth: 250,
                padding: '10px',
                borderRadius: '16px',
                background: 'var(--glass-floating)',
                backdropFilter: 'blur(30px) saturate(190%)',
                WebkitBackdropFilter: 'blur(30px) saturate(190%)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 'var(--z-dropdown, 100)',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              {/* Top Row: Google Avatar + Name + "Personnel" + Caret */}
              <div
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--hover)] transition-colors cursor-pointer"
                onClick={() => { setProfileMenuOpen(false); router.push('/settings'); }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[var(--border)]"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[var(--border)]"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-active) 100%)',
                        color: 'var(--accent-fg)',
                      }}
                    >
                      {userInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-[13px] text-[var(--text-primary)]">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                      {t('profile.personal')}
                    </div>
                  </div>
                </div>
                <CaretDown size={14} className="text-[var(--text-tertiary)] shrink-0" />
              </div>

              {/* Account Metadata Row */}
              <div className="flex items-center justify-between px-2.5 py-2.5 my-1 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)]">
                {isSuperAdmin ? (
                  <>
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--accent)]">
                      <span className="text-[14px]">∞</span>
                      <span>Mode God</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                      Créateur de Ñkyel
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Free <span className="text-[var(--text-tertiary)] font-normal px-1">·</span> Accès bêta
                    </span>
                  </>
                )}
              </div>

              {/* Credits Row */}
              <Link
                href="/settings?tab=usage"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-[var(--accent)]" weight="fill" />
                  <span>{t('profile.credits')}</span>
                  <span className="text-[10px] text-[var(--text-disabled)] font-mono">ⓘ</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[var(--text-primary)] font-medium">
                  <span>—</span>
                  <CaretRight size={12} className="text-[var(--text-tertiary)]" />
                </div>
              </Link>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              {/* Main Nav Items */}
              <div className="flex flex-col gap-0.5">
                {[
                  { icon: User, label: t('profile.account'), href: '/settings' },
                  { icon: Sliders, label: t('profile.customization'), href: '/settings' },
                  { icon: Gear, label: t('profile.settings'), href: '/settings' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setProfileMenuOpen(false); handleNavClick(); }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors touch-manipulation min-h-[34px]"
                  >
                    <item.icon size={15} className="text-[var(--text-tertiary)]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              {/* External Links */}
              <div className="flex flex-col gap-0.5">
                {[
                  { icon: Browsers, label: t('profile.home'), href: '/' },
                  { icon: Question, label: t('profile.help'), href: '/docs' },
                  { icon: FileText, label: t('profile.docs'), href: '/docs' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors touch-manipulation min-h-[34px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={15} className="text-[var(--text-tertiary)]" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] text-[var(--text-disabled)] font-mono">↗</span>
                  </Link>
                ))}
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              <div className="flex justify-center py-1.5">
                <GabonOriginMark />
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              {/* Sign out */}
              <button
                type="button"
                onClick={async () => {
                  setProfileMenuOpen(false);
                  try {
                    await signOut();
                  } catch {}
                  router.push('/sign-in');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation min-h-[34px]"
              >
                <SignOut size={15} />
                <span>{t('profile.logout')}</span>
              </button>
            </div>
          )}

          {/* Profile Trigger in Sidebar Footer */}
          <div
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} rounded-xl transition-colors p-1.5 hover:bg-[var(--hover)] min-h-[44px] touch-manipulation`}
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
              aria-label="Menu du compte"
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[var(--border)]"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[var(--border)]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-active) 100%)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  {userInitials}
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate text-[var(--text-primary)]">
                    {displayName}
                  </div>
                </div>
              )}
            </button>
            {!isCollapsed && (
              <div className="flex items-center gap-1 text-[var(--text-tertiary)] shrink-0">
                <button
                  type="button"
                  onClick={openDesktopSettings}
                  aria-label="Bureau"
                  className="p-1 rounded-md hover:bg-[var(--active)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Desktop size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="p-1 rounded-md hover:bg-[var(--active)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Bell size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
