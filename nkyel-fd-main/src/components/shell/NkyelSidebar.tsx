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
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus,
  Robot,
  PlugsConnected,
  CalendarCheck,
  Vault,
  Bank,
  FolderSimplePlus,
  FolderSimple,
  Folder,
  FolderPlus,
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
  PawPrint,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import useSWR from 'swr';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { getUserTier } from '@/lib/userTiers';
import { useSafeUser as useUser, useSafeClerk as useClerk } from '@/lib/auth-client';
import { useLanguageStore } from '@/stores/language.store';
import { useConversations, type NeonConversation } from '@/hooks/useConversations';
import { IbogaNavigationTrigger, GabonOriginMark } from '@/components/brand';
import { PantherMissionGlyph } from '@/components/icons';
import MissionContextMenu from '@/components/sidebar/MissionContextMenu';
import ProjectDialog from '@/components/sidebar/ProjectDialog';
import MissionSearchOverlay from '@/components/sidebar/MissionSearchOverlay';

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
  const { isCollapsed, toggleSidebar, isMobile: isSidebarMobile, isOpen, closeMobileSidebar } = useSidebar();
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');
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

  const { data: quotaData } = useSWR('/api/user/quotas', (url) => fetch(url).then(res => res.json()));
  const credits = quotaData?.credits ?? 300;

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Measure if we're on mobile for context menu layout and sync with global store
  const setGlobalIsMobile = useSidebar((s: any) => s.setIsMobile);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setGlobalIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setGlobalIsMobile]);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.firstName || t('profile.defaultName') || 'Utilisateur';
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userInitials = (displayName.slice(0, 2) || 'NK').toUpperCase();
  const userTier = getUserTier(userEmail, (user?.publicMetadata?.role as string) || null);
  const displayTier = userTier.tierId === 'CREATOR' ? 'Mode God' : userTier.tierId === 'VIP_CONTRIBUTOR' ? 'VIP' : quotaData?.tier ?? (isFr ? 'Gratuit' : 'Free');
  // showIconsOnly is evaluated inside renderSidebarContent based on desktop collapse or drawer


  const navItems: NavItem[] = [
    { id: 'agent',        label: t('nav.agent') || 'Agent',                  href: '/agent',      icon: Robot },
    { id: 'connections',  label: t('nav.connectors') || 'Connectors',       href: '/connectors', icon: PlugsConnected },
    { id: 'automations',  label: t('nav.programs') || 'Programs',          href: '/programs',   icon: CalendarCheck },
    { id: 'creations',    label: t('nav.sanctuary') || 'Sanctuary',         href: '/library',    icon: Bank },
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
    closeMobileSidebar();
    setProfileMenuOpen(false);
  }, [closeMobileSidebar]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMobileSidebar]);

  // Handle browser / Android back button to close mobile drawer
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ nkyelDrawerOpen: true }, '');
    const handlePopState = () => {
      closeMobileSidebar();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, closeMobileSidebar]);

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

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

  const renderSidebarContent = (isDrawer: boolean) => {
    const showIconsOnly = !isDrawer && isCollapsed;

    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* ═══════════════════════════════════════════════════
           ZONE 1: Header — Wordmark + Iboga Navigation Signature
           ═══════════════════════════════════════════════════ */}
        <div
          className={`flex items-center ${showIconsOnly ? 'justify-center' : 'justify-between'} shrink-0`}
          style={{
            height: 'var(--header-height)',
            paddingInline: showIconsOnly ? '0' : 'var(--space-3)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {showIconsOnly ? (
            <div className="hidden md:flex items-center justify-center w-full">
              <IbogaNavigationTrigger
                open={false}
                onToggle={toggleSidebar}
                glyphSize={18}
                variant="desktop"
                title="Expand navigation"
                label="Expand navigation"
              />
            </div>
          ) : (
            <>
              {/* Wordmark (Mobile & Desktop — Section 2) */}
              <Link
                href="/"
                className="flex items-center gap-2 overflow-hidden rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                title="ñkyel — Home"
                onClick={handleNavClick}
              >
                <img src="/brand/nkyel-logo-black.png" alt="Ñkyel Logo" className="h-[24px] w-auto object-contain nkyel-logo-light shrink-0" />
                <img src="/brand/nkyel-logo-white.png" alt="Ñkyel Logo" className="h-[24px] w-auto object-contain nkyel-logo-dark shrink-0" />
                <span
                  className="font-medium truncate tracking-tight text-[26px] select-none text-[var(--text-primary)] leading-none"
                  style={{ letterSpacing: '-0.035em' }}
                >
                  ñkyel
                </span>
              </Link>

              {/* Utility Controls: Search + Iboga (Section 3 & 18) */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setIsSearchOverlayOpen(true)}
                  className="flex items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors md:h-9 md:w-9 h-11 w-11"
                  title="Search (⌘K)"
                  aria-label="Search"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                </button>
                <IbogaNavigationTrigger
                  open={true}
                  onToggle={isDrawer ? closeMobileSidebar : toggleSidebar}
                  glyphSize={isDrawer ? 20 : 18}
                  variant={isDrawer ? 'mobile' : 'desktop'}
                  title={isDrawer ? (isFr ? "Fermer la navigation" : "Close navigation") : (isFr ? "Réduire la navigation" : "Collapse navigation")}
                  label={isDrawer ? (isFr ? "Fermer la navigation" : "Close navigation") : (isFr ? "Réduire la navigation" : "Collapse navigation")}
                />
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 2: Nouvelle Mission Button (Section 4 & 5)
           ═══════════════════════════════════════════════════ */}
        <div style={{ padding: `16px 16px 8px` }}>
          <Link
            href="/chat?new=true"
            className="group flex flex-col items-center justify-center w-full focus-visible:outline-none"
            title={t('nav.newMission')}
            onClick={handleNavClick}
          >
            {/* Light Theme: Subtle border & accent text. Dark theme: subtle glow */}
            <div 
              className="flex items-center w-full min-h-[44px] rounded-[12px] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-xs transition-all"
              style={{ paddingInline: '16px', gap: '12px', justifyContent: showIconsOnly ? 'center' : 'flex-start' }}
            >
              <div className="w-[24px] flex justify-center shrink-0">
                <PantherMissionGlyph size={20} />
              </div>
              {!showIconsOnly && <span className="font-semibold text-[15.5px] tracking-tight">{t('nav.newMission')}</span>}
            </div>
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════
           ZONE 3: Primary Navigation
           ═══════════════════════════════════════════════════ */}
        <nav
          className="shrink-0"
          style={{ paddingInline: '12px', paddingBottom: '12px' }}
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
                  className="group relative flex items-center font-medium min-h-[44px] touch-manipulation"
                  style={{
                    gap: '12px',
                    paddingInline: '12px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '15.5px',
                    justifyContent: showIconsOnly ? 'center' : 'flex-start',
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
                  title={showIconsOnly ? item.label : undefined}
                >
                  <div className="w-[24px] flex justify-center shrink-0">
                    <Icon
                      size={20}
                      weight="bold"
                      style={{
                        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                        transition: `color var(--transition-fast)`,
                      }}
                    />
                  </div>

                  {!showIconsOnly && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate font-semibold tracking-tight text-[15.5px]">{item.label}</span>
                      {item.badge && (
                        <span
                          className="font-mono font-bold"
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--accent-subtle)',
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collapsed tooltip */}
                  {showIconsOnly && hoveredItem === item.id && (
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
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
      
      {/* Project Creation Dialog */}
      <ProjectDialog 
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onCreate={(name) => {
          console.log(`Created project: ${name}`);
          alert(`Project "${name}" created successfully.`);
          setIsProjectDialogOpen(false);
        }}
      />
      
      {/* Mission Search Overlay */}
      <MissionSearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
      />
    </nav>

        {/* ═══════════════════════════════════════════════════
           ZONE 4: Projects
           ═══════════════════════════════════════════════════ */}
        {!showIconsOnly && (
          <div style={{ padding: `12px 12px 0` }}>
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
                padding: `4px 12px`,
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
                    setIsProjectDialogOpen(true);
                  }}
                  className="flex items-center justify-center rounded gap-1 px-1.5 py-0.5"
                  style={{
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
                  <FolderPlus weight="bold" size={16} />
                  <span>Nouveau projet</span>
                </button>
                {projectsExpanded ? <CaretDown size={11} /> : <CaretRight size={11} />}
              </div>
            </div>

            {projectsExpanded && (
              <div style={{ marginTop: 2 }}>
                <Link
                  href="/projects"
                  onClick={handleNavClick}
                  className="flex items-center rounded-lg min-h-[44px] touch-manipulation"
                  style={{
                    gap: '12px',
                    paddingInline: '12px',
                    fontSize: '15px',
                    fontWeight: 500,
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
                  <div className="w-[24px] flex justify-center shrink-0">
                    <FolderSimple size={20} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <span className="truncate">{t('nav.newProject')}</span>
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
            paddingInline: '12px',
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
        >
          {!showIconsOnly && (
            <div className="flex flex-col" style={{ gap: '12px' }}>
              {recentGroups.length === 0 ? (
                <div className="px-3 py-6 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-white/40">
                    <ChatCircleDots size={16} />
                    <PantherMissionGlyph size={16} />
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {t('nav.tasks')}
                  </div>
                  <Link
                    href="/chat?new=true"
                    onClick={handleNavClick}
                    className="flex items-center justify-center gap-[12px] px-[12px] py-2 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-all"
                  >
                    <PantherMissionGlyph size={18} className="shrink-0" />
                    {t('nav.newTask')}
                  </Link>
                </div>
              ) : (
                recentGroups.map((group: { label: string; items: any[] }) => (
                  <div key={group.label}>
                    <div
                      style={{
                        padding: `4px 12px`,
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
                              className="w-full flex items-center justify-between rounded-lg text-start select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] min-h-[44px]"
                              style={{
                                padding: `0 12px`,
                                paddingRight: '28px',
                                fontSize: '15px',
                                fontWeight: 500,
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
                              <div className="flex items-center gap-[12px] min-w-0 w-full">
                                <ChatCircleDots size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />
                                <span className="truncate">{mission.title || 'Untitled mission'}</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setContextMenuId(contextMenuId === mission.id ? null : mission.id);
                              }}
                              className="absolute end-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shrink-0 flex items-center justify-center rounded"
                              style={{
                                width: 20,
                                height: 20,
                                color: 'var(--text-tertiary)',
                                transition: `opacity var(--transition-fast)`,
                                zIndex: 10,
                              }}
                            >
                            </button>
                            {/* Context menu */}
                            {contextMenuId === mission.id && (
                              <MissionContextMenu
                                missionId={mission.id}
                                isMobile={isMobile}
                                onClose={() => setContextMenuId(null)}
                                onRename={() => {
                                  const newTitle = window.prompt('Rename mission:', mission.title);
                                  if (newTitle && newTitle.trim()) {
                                    updateConversationTitle(mission.id, newTitle.trim());
                                  }
                                }}
                                onMoveToProject={() => {
                                  setContextMenuId(null);
                                  setIsProjectDialogOpen(true);
                                }}
                              />
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
          {showIconsOnly && (
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
              className="absolute bottom-full start-2 end-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
              style={{
                width: showIconsOnly ? 260 : 'calc(100% - 16px)',
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

              {/* Plan Row: Gratuit + Mise à niveau (Screenshot 3) */}
              <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {displayTier}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openDesktopSettings('usage');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-[var(--text-primary)] border border-[var(--border)] transition-all shadow-xs"
                >
                  {t('profile.upgrade')}
                </button>
              </div>

              {/* Credits Row (Screenshot 3) */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  openDesktopSettings('usage');
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors touch-manipulation text-start"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-[var(--accent)]" weight="fill" />
                  <span>{t('profile.credits')}</span>
                  <span className="text-[10px] text-[var(--text-disabled)] font-mono">ⓘ</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[var(--text-primary)] font-semibold text-xs">
                  <span>{credits}</span>
                  <CaretRight size={12} className="text-[var(--text-tertiary)]" />
                </div>
              </button>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              {/* Main Nav Items (Screenshot 3) */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openDesktopSettings('account');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors touch-manipulation min-h-[34px] text-start"
                >
                  <User size={15} className="text-[var(--text-tertiary)]" />
                  <span>{t('profile.account')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openDesktopSettings('personalization');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors touch-manipulation min-h-[34px] text-start"
                >
                  <Sliders size={15} className="text-[var(--text-tertiary)]" />
                  <span>{t('profile.customization')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    openDesktopSettings('general');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors touch-manipulation min-h-[34px] text-start"
                >
                  <Gear size={15} className="text-[var(--text-tertiary)]" />
                  <span>{t('profile.settings')}</span>
                </button>
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              {/* External Links (Screenshot 3) */}
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

              <div className="flex justify-center py-1">
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
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors touch-manipulation min-h-[34px]"
              >
                <SignOut size={15} />
                <span>{t('profile.logout')}</span>
              </button>
            </div>
          )}

          {/* Profile Trigger in Sidebar Footer */}
          <div
            className={`w-full flex items-center ${showIconsOnly ? 'justify-center' : 'justify-between'} rounded-xl transition-colors p-1.5 hover:bg-[var(--hover)] min-h-[44px] touch-manipulation`}
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-start"
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
              {!showIconsOnly && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate text-[var(--text-primary)]">
                    {displayName}
                  </div>
                </div>
              )}
            </button>
            {!showIconsOnly && (
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
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <>
      {/* ─── 1. DESKTOP PERMANENT SIDEBAR (>= 768px ONLY) ─── */}
      <aside
        className="nkyel-sidebar-container hidden md:flex flex-col shrink-0 select-none relative h-full transition-[width] duration-300 ease-[var(--ease-apple)] z-30"
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
        aria-label="Navigation principale Ñkyel"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ─── 2. MOBILE OVERLAY DRAWER (< 768px ONLY, triggered by Iboga) ─── */}
      {isOpen && mounted && typeof document !== 'undefined'
        ? createPortal(
            <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile Ñkyel">
              {/* Backdrop Scrim */}
              <div
                className="fixed inset-0 z-[9998] transition-opacity duration-300 pointer-events-auto"
                style={{
                  background: 'rgba(0, 0, 0, 0.70)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
                onClick={closeMobileSidebar}
                aria-hidden="true"
              />

              {/* Mobile Drawer Panel */}
              <aside
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="fixed inset-y-0 start-0 z-[9999] h-[100dvh] w-[min(85vw,340px)] max-w-[calc(100vw-36px)] flex flex-col select-none shadow-2xl transition-transform duration-300 ease-out pointer-events-auto"
                style={{
                  background: 'var(--sidebar-bg, #0D0E12)',
                  borderRight: '1px solid var(--sidebar-border, rgba(255, 255, 255, 0.08))',
                }}
              >
                {renderSidebarContent(true)}
              </aside>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
