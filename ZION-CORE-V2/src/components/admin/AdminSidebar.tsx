/* Ñkyel AI · Admin Sidebar · SmartANDJ AI Technologies
   Apple/Vercel-inspired ultra-minimal glassmorphism sidebar
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBar, Users, ChatCircle, Lightning, 
  Robot, Database, CreditCard, HardDrives, 
  Bell, Gear, CaretLeft, CaretRight
} from '@phosphor-icons/react';
import { useAdminTheme, adminThemes } from '@/stores/adminTheme';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { AndjSovereignIcon } from '@/components/icons/AndjSovereignIcon';

// ── Nav items ───────────────────────────────────────────────
const navGroups = [
  {
    label: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/admin', icon: ChartBar },
      { name: 'Meute', href: '/admin/meute', icon: Users },
      { name: 'Pistes', href: '/admin/pistes', icon: ChatCircle },
      { name: 'Vecteurs', href: '/admin/vecteurs', icon: Lightning },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { name: 'AUTOMATA V2.0', href: '/admin/automata', icon: Robot },
      { name: 'RAG Monitor', href: '/admin/rag', icon: Database },
    ],
  },
  {
    label: 'OPÉRATIONS',
    items: [
      { name: 'Pactes', href: '/admin/pactes', icon: CreditCard },
      { name: 'Nœud', href: '/admin/noeud', icon: HardDrives },
      { name: 'DeerFlow Canvas', href: '/admin/flow', icon: Robot },
      { name: 'Alertes', href: '/admin/alertes', icon: Bell },
      { name: 'Settings', href: '/admin/settings', icon: Gear },
    ],
  },
];

export default function AdminSidebar({ 
  isMobile, 
  mobileOpen, 
  setMobileOpen 
}: { 
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const { currentTheme, sidebarCollapsed, toggleSidebar: storeToggleSidebar } = useAdminTheme();
  const theme = adminThemes[currentTheme];

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrentlyCollapsed = isMobile ? false : sidebarCollapsed;
  
  // framer-motion variants
  const sidebarVariants = {
    expanded: { width: 220, x: 0 },
    collapsed: { width: 64, x: 0 },
    mobileOpen: { x: 0, width: 260 },
    mobileClosed: { x: '-100%', width: 260 }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={isMobile ? 'mobileClosed' : 'expanded'}
        animate={isMobile ? (mobileOpen ? 'mobileOpen' : 'mobileClosed') : (isCurrentlyCollapsed ? 'collapsed' : 'expanded')}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className={`
          fixed left-0 top-0 z-50 h-[100dvh]
          bg-glass border-r border-[var(--glass-border)]
          flex flex-col shadow-2xl overflow-hidden
        `}
      >
        {/* ── Header / Logo ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--divider)] h-14 shrink-0">
          <div className="relative flex items-center justify-center text-[var(--text-primary)] w-6 h-6 flex-shrink-0">
            <img src="/Ñkyel AI-logo.jpeg" alt="Ñkyel AI" className="w-full h-full rounded" />
          </div>
          
          <AnimatePresence mode="wait">
            {!isCurrentlyCollapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.1 }}
                className="flex-1 min-w-0"
              >
                <span className="text-[var(--text-muted)] font-display font-medium text-[10px] tracking-widest uppercase truncate whitespace-nowrap">
                  Ñkyel AI
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && (
            <button
              onClick={() => storeToggleSidebar()}
              className="w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-md transition-colors"
              title={sidebarCollapsed ? 'Ouvrir' : 'Fermer'}
            >
              <IbogaAiIcon className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-none px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCurrentlyCollapsed && (
                <p className="px-3 text-[9px] font-semibold text-[var(--text-muted)] tracking-widest uppercase mb-2 antialiased">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { if (isMobile) setMobileOpen(false); }}
                        className={`
                          flex items-center gap-3 px-3 py-2 text-[13px] font-medium tracking-tight antialiased
                          transition-all duration-200 group relative
                          ${isActive
                            ? `text-[var(--text-primary)] bg-[var(--glass)] rounded-lg`
                            : `text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-lg`
                          }
                        `}
                      >
                        {/* Active indicator line */}
                        {isActive && (
                          <motion.div 
                            layoutId="active-nav"
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-[var(--accent)]" 
                          />
                        )}
                        
                        <div className={`flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'opacity-70 group-hover:opacity-100'}`}>
                          <Icon size={18} weight="thin" />
                        </div>
                        
                        <AnimatePresence mode="wait">
                          {!isCurrentlyCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="truncate whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="border-t border-[var(--glass-border)] px-4 py-4 shrink-0 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[var(--bg-card2)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] shadow-inner">
              <AndjSovereignIcon className="w-[12px] h-[12px]" />
            </div>
            
            <AnimatePresence mode="wait">
              {!isCurrentlyCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[10px] text-[var(--text-muted)] tracking-wide truncate whitespace-nowrap">
                    Ñkyel AI peut faire des erreurs. Votre discernement reste souverain.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
