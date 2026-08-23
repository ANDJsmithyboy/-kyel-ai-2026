/**
 * Ñkyel AI · TopBar
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Engine Selector (Ñkyel Auto), Pro Badge, Mode Switcher (Conversation ↔ Mission VIE),
 * Capabilities sparkle button. Geist + Apple precision.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  CaretDown,
  Sparkle,
  SidebarSimple,
  ChatCircleText,
  Graph,
  Check,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

const ENGINES = [
  { id: 'auto', name: 'Ñkyel Auto', desc: 'Routage intelligent autonome', badge: 'Recommandé' },
  { id: 'chui', name: 'Ñkyel Chui', desc: 'Raisonnement profond & code complexe', badge: 'Pro' },
  { id: 'radi', name: 'Ñkyel Radi', desc: 'Ultra-rapide & concis' },
  { id: 'wandana', name: 'Ñkyel Research', desc: 'Recherche web & veille en direct' },
] as const;

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, open } = useSidebar();
  const isMobile = useIsMobile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Ñkyel Auto');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isVieMode = pathname === '/agent' || pathname.startsWith('/workspace');

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
        {/* ── Sidebar Toggle ── */}
        <button
          type="button"
          onClick={isMobile ? open : toggleCollapse}
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
          aria-label="Barre latérale"
        >
          <SidebarSimple size={18} />
        </button>

        {/* ── Engine Selector ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 font-medium"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--fg)',
              fontSize: 'var(--text-sm)',
              transition: `all var(--transition-fast)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-muted)';
              e.currentTarget.style.borderColor = 'var(--border-default)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-subtle)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <span className="font-semibold truncate">{activeEngine}</span>
            <CaretDown
              size={12}
              weight="bold"
              style={{
                color: 'var(--fg-subtle)',
                transition: `transform var(--transition-fast)`,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute animate-scale-in"
              style={{
                top: 'calc(100% + 6px)',
                left: 0,
                width: 280,
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div
                className="font-semibold uppercase"
                style={{
                  padding: '8px 12px 4px',
                  fontSize: '10px',
                  color: 'var(--fg-subtle)',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                Moteur d'intelligence
              </div>
              {ENGINES.map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => {
                    setActiveEngine(eng.name);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex flex-col items-start text-left"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: activeEngine === eng.name ? 'var(--accent-subtle)' : 'transparent',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e) => {
                    if (activeEngine !== eng.name) {
                      e.currentTarget.style.background = 'var(--accent-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeEngine !== eng.name) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="font-semibold"
                      style={{ fontSize: 'var(--text-sm)', color: 'var(--fg)' }}
                    >
                      {eng.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {eng.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--accent-subtle)',
                            color: 'var(--accent)',
                            fontWeight: 600,
                          }}
                        >
                          {eng.badge}
                        </span>
                      )}
                      {activeEngine === eng.name && (
                        <Check size={14} weight="bold" style={{ color: 'var(--accent)' }} />
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)', marginTop: 2 }}>
                    {eng.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Side: Mode Switcher + Capabilities ── */}
      <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
        {/* Mode Switcher: Conversation ↔ Mission VIE */}
        <div
          className="flex items-center"
          style={{
            padding: 2,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 font-medium"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              background: !isVieMode ? 'var(--surface-raised)' : 'transparent',
              color: !isVieMode ? 'var(--fg)' : 'var(--fg-subtle)',
              fontWeight: !isVieMode ? 600 : 500,
              boxShadow: !isVieMode ? 'var(--shadow-xs)' : 'none',
              transition: `all var(--transition-fast)`,
            }}
          >
            <ChatCircleText size={14} />
            <span className="hidden sm:inline">Conversation</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/agent')}
            className="flex items-center gap-1.5 font-medium"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              background: isVieMode ? 'var(--surface-raised)' : 'transparent',
              color: isVieMode ? 'var(--fg)' : 'var(--fg-subtle)',
              fontWeight: isVieMode ? 600 : 500,
              boxShadow: isVieMode ? 'var(--shadow-xs)' : 'none',
              transition: `all var(--transition-fast)`,
            }}
          >
            <Graph size={14} />
            <span className="hidden sm:inline">Mission VIE</span>
          </button>
        </div>

        {/* Capabilities Button */}
        <button
          type="button"
          onClick={onOpenCapabilities}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32,
            height: 32,
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent)',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-muted)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
          title="Toutes les capacités Ñkyel"
          aria-label="Capacités"
        >
          <Sparkle size={16} weight="fill" />
        </button>
      </div>
    </>
  );
}
