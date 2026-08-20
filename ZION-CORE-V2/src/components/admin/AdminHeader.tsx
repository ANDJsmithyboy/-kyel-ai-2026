/* Ñkyel AI · Admin Header · SmartANDJ AI Technologies
   Apple-inspired glassmorphism top bar (Dynamic OLED Themes)
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MagnifyingGlass, Bell, List, Palette, Check } from '@phosphor-icons/react';
import { useAdminTheme, adminThemes, AdminThemeName } from '@/stores/adminTheme';
import { AnimatePresence, motion } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/pistes': 'Pistes',
  '/admin/meute': 'Meute',
  '/admin/rag': 'RAG Monitor',
  '/admin/automata': 'AUTOMATA V2.0',
  '/admin/vecteurs': 'Vecteurs',
  '/admin/flow': 'DeerFlow Canvas',
  '/admin/pactes': 'Pactes',
  '/admin/alertes': 'Alertes & Incidents',
  '/admin/noeud': 'Nœud Libreville-S-01',
  '/admin/settings': 'Settings',
};

export default function AdminHeader({ 
  isMobile, 
  toggleSidebar 
}: { 
  isMobile?: boolean; 
  toggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const title = pageTitles[pathname || ''] || 'Centre de Commandement';
  
  const { currentTheme, setTheme } = useAdminTheme();
  const theme = adminThemes[currentTheme];

  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close theme menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-14 bg-glass border-b border-[var(--divider)] flex items-center justify-between px-4 lg:px-6 transition-colors duration-500">
      {/* -- Mobile Hamburger & Title ----------------------- */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card2)] transition-colors -ml-1"
          >
            <List size={20} weight="thin" />
          </button>
        )}
        <div>
          <h2 className="text-[14px] font-display font-semibold text-[var(--text-primary)] tracking-tight antialiased">{title}</h2>
          {!isMobile && (
            <p className="text-[10px] text-[var(--text-muted)] tracking-wider mt-0.5 font-medium antialiased uppercase">SmartANDJ AI Technologies</p>
          )}
        </div>
      </div>

      {/* -- Search (Desktop only) -------------------------- */}
      {!isMobile && (
        <div className="flex-1 max-w-md mx-8">
          <div className="relative group">
            <input
              type="search"
              placeholder="Rechercher utilisateurs, logs, agents..."
              className="w-full h-8 pl-8 pr-4 rounded-full bg-[var(--bg-card)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm antialiased font-sans"
            />
            <MagnifyingGlass className="absolute left-2.5 top-2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" weight="thin" />
          </div>
        </div>
      )}

      {/* -- Actions ---------------------------------------- */}
      <div className="flex items-center gap-2 relative">
        {/* System status (Desktop only) */}
        {!isMobile && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse shadow-[0_0_8px_var(--emerald)]" />
            <span className="text-[10px] text-[var(--text-primary)] font-mono tracking-widest uppercase antialiased">Opérationnel</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] transition-colors">
          <Bell size={18} weight="thin" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--destructive)] border-[1.5px] border-[var(--bg-base)]" />
        </button>

        {/* Theme Switcher */}
        <div ref={menuRef} className="relative">
          <button 
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${themeMenuOpen ? 'text-[var(--text-primary)] bg-[var(--glass)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)]'}`}
          >
            <Palette size={18} weight="thin" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {themeMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-2xl py-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-1.5 border-b border-[var(--divider)] mb-1">
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest antialiased">Thèmes Gaboma</p>
                </div>
                <div className="p-1 flex flex-col gap-0.5">
                  {(Object.keys(adminThemes) as AdminThemeName[]).map((key) => {
                    const t = adminThemes[key];
                    const isActive = currentTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setTheme(key);
                          setThemeMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium antialiased transition-colors ${isActive ? 'bg-[var(--glass)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)]'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3 h-3 rounded-full ${t.bg} border ${t.border} flex items-center justify-center overflow-hidden`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${t.accentBg}`} />
                          </div>
                          {t.label}
                        </div>
                        {isActive && <Check size={14} weight="bold" className="text-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
