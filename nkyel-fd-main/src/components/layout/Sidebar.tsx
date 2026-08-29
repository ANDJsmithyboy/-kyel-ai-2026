'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  MagnifyingGlass as Search,
  Link as LinkIcon,
  SquaresFour,
  Bank,
  Plus,
  UserCircle,
  PaintBrush,
  Gear,
  House,
  Question,
  FileText,
  SignOut,
  Coins,
  CaretRight,
  Robot
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useSafeClerk as useClerk } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { IbogaNavigationTrigger } from '@/components/brand';
import { PantherMissionGlyph } from '@/components/icons/PantherMissionGlyph';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  
  const { isOpen, isMobile, close, toggle, setMobile } = useSidebarStore();
  const user = useAuthStore((s: any) => s.user);
  const logout = useAuthStore((s: any) => s.logout);
  
  // Workspace & Projects State
  const workspace = useWorkspaceStore((s: any) => s.workspace);
  const isWorkspaceLoading = useWorkspaceStore((s: any) => s.isWorkspaceLoading);
  const fetchWorkspace = useWorkspaceStore((s: any) => s.fetchWorkspace);
  
  const projects = useWorkspaceStore((s: any) => s.projects);
  const isProjectsLoading = useWorkspaceStore((s: any) => s.isProjectsLoading);
  const fetchProjects = useWorkspaceStore((s: any) => s.fetchProjects);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchWorkspace();
    fetchProjects();
  }, [fetchWorkspace, fetchProjects]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setMobile]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggle(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { 
        e.preventDefault(); 
        // Trigger global search here
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const handleSignOut = async () => {
    logout();
    await signOut();
    router.push('/sign-in');
  };

  const navItemClass = (active: boolean) => cn(
    'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[14px] transition-all group outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
    active 
      ? 'bg-[var(--accent-10)] text-[var(--accent)]' 
      : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
  );

  const isActive = (path: string) => pathname?.startsWith(path);

  if (!isOpen && !isMobile) return null; // Or render mini rail if approved

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 start-0 z-50 h-screen flex flex-col select-none overflow-hidden',
          'bg-[var(--zc-surface)] text-[var(--text-primary)]',
          'border-e border-[var(--border)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isMobile ? 'w-[85vw] max-w-[340px] shadow-2xl' : 'w-[280px]',
          (!isOpen && isMobile) ? '-translate-x-full' : 'translate-x-0'
        )}
        suppressHydrationWarning
      >
        {/* -- Header: Wordmark + Search + Iboga -- */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <a href="/" className="outline-none focus-visible:ring-2 rounded">
            <span className="text-[20px] font-medium tracking-tight text-[var(--text-primary)]" style={{ letterSpacing: '-0.03em' }}>
              ñkyel
            </span>
          </a>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <Search size={18} weight="bold" />
            </button>
            <IbogaNavigationTrigger
              open={isOpen}
              onToggle={toggle}
              glyphSize={18}
              variant="desktop"
              title="Fermer la navigation"
              label="Fermer la navigation"
            />
          </div>
        </div>

        {/* -- Scrollable Area -- */}
        <div className="flex-1 overflow-y-auto scroll-fade scrollbar-hidden px-3">
          
          {/* Primary Nav */}
          <nav className="flex flex-col gap-0.5 mt-2">
            <button 
              onClick={() => { router.push('/chat'); if (isMobile) close(); }}
              className={navItemClass(isActive('/chat') || pathname === '/')}
            >
              <PantherMissionGlyph width={18} height={18} className="shrink-0 opacity-90" />
              <span className="font-medium">nouvelle mission</span>
            </button>
            
            <button onClick={() => router.push('/agents')} className={navItemClass(isActive('/agents'))}>
              <Robot size={18} weight="regular" className="shrink-0" />
              <span className="font-medium">agent</span>
            </button>

            <button onClick={() => router.push('/connectors')} className={navItemClass(isActive('/connectors'))}>
              <LinkIcon size={18} weight="regular" className="shrink-0" />
              <span className="font-medium">connecteurs</span>
            </button>

            <button onClick={() => router.push('/programs')} className={navItemClass(isActive('/programs'))}>
              <SquaresFour size={18} weight="regular" className="shrink-0" />
              <span className="font-medium">programmes</span>
            </button>

            <button onClick={() => router.push('/sanctuary')} className={navItemClass(isActive('/sanctuary'))}>
              <Bank size={18} weight="regular" className="shrink-0" />
              <span className="font-medium">sanctuaire</span>
            </button>
          </nav>

          <hr className="my-4 border-t border-[var(--border)] opacity-50" />

          {/* Projects Section */}
          <div className="flex flex-col mb-4">
            <span className="px-3 mb-1 text-[11px] font-medium text-[var(--text-tertiary)] tracking-wide">
              projets
            </span>
            <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group w-fit">
              <div className="w-5 h-5 flex items-center justify-center rounded bg-[var(--surface-raised)] border border-[var(--border)] group-hover:border-[var(--text-tertiary)] transition-colors">
                <Plus size={12} />
              </div>
              nouveau projet
            </button>

            {/* Project List */}
            <div className="mt-1 flex flex-col gap-0.5">
              {isProjectsLoading ? (
                <div className="px-3 py-2">
                  <div className="h-5 w-2/3 bg-[var(--surface-raised)] rounded animate-pulse" />
                </div>
              ) : projects.length === 0 ? (
                // L'utilisateur ne voit rien de fake. S'il n'y a pas de projet, on n'invente rien.
                null
              ) : (
                projects.map((p: any) => (
                  <button key={p.id} className="text-start px-3 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] rounded-lg truncate transition-colors">
                    {p.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Workspace Card */}
          <div className="mt-4 mb-4">
            {isWorkspaceLoading ? (
              <div className="w-full h-[100px] bg-[var(--surface-raised)] rounded-2xl animate-pulse" />
            ) : workspace ? (
              <div className="flex flex-col p-1.5 rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.015)] shadow-sm group hover:border-[rgba(255,255,255,0.08)] transition-colors">
                
                {/* Top: Identity */}
                <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--hover)] transition-colors text-start">
                  <div className="relative shrink-0">
                    {workspace.avatarUrl ? (
                      <img src={workspace.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Fake indicator for visual depth matching screenshot */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--zc-surface)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {workspace.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1 truncate">
                      <span>{workspace.plan}</span>
                      <span>&bull;</span>
                      <span>{workspace.memberCount} {workspace.memberCount > 1 ? 'membres' : 'membre'}</span>
                    </div>
                  </div>
                  <CaretRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Bottom: Credits/Usage */}
                <button className="mt-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-raised)] border border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Coins size={14} weight="regular" className="text-[var(--accent)]" />
                    <span className="text-[12px] font-medium">crédits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      {workspace.credits !== null ? workspace.credits.toLocaleString() : '—'}
                    </span>
                    <CaretRight size={12} className="text-[var(--text-tertiary)]" />
                  </div>
                </button>
              </div>
            ) : null}
          </div>

          <hr className="my-2 border-t border-[var(--border)] opacity-50" />

          {/* Secondary Nav (Account / Settings) */}
          <nav className="flex flex-col gap-0.5 mt-2 mb-6">
            <button onClick={() => router.push('/account')} className={navItemClass(isActive('/account'))}>
              <UserCircle size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">compte</span>
            </button>
            <button onClick={() => router.push('/personalization')} className={navItemClass(isActive('/personalization'))}>
              <PaintBrush size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">personnalisation</span>
            </button>
            <button onClick={() => router.push('/settings')} className={navItemClass(isActive('/settings'))}>
              <Gear size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">paramètres</span>
            </button>
            <button onClick={() => router.push('/home')} className={navItemClass(isActive('/home'))}>
              <House size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">accueil</span>
            </button>
            <button onClick={() => router.push('/help')} className={navItemClass(isActive('/help'))}>
              <Question size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">aide</span>
            </button>
            <button onClick={() => router.push('/docs')} className={navItemClass(isActive('/docs'))}>
              <FileText size={18} weight="regular" className="shrink-0" />
              <span className="text-[13px]">docs</span>
            </button>

            {/* Logout is separated slightly visually in the screenshot */}
            <div className="mt-3">
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] transition-colors outline-none hover:bg-red-500/10 text-red-400 group"
              >
                <SignOut size={18} weight="regular" className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                <span>se déconnecter</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
