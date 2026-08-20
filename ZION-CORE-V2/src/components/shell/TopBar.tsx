/**
 * Nkyel AI · TopBar
 * SmartANDJ AI Technologies
 * Engine Selector (Ñkyel Auto), Pro Badge with Upgrade modal trigger, Mode Switcher, Sparkles
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  CaretDown,
  Gift,
  Sparkle,
  Infinity as InfinityIcon,
  SidebarSimple,
  ChatCircleText,
  Graph,
} from '@phosphor-icons/react';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface TopBarProps {
  onOpenCapabilities?: () => void;
}

export default function TopBar({ onOpenCapabilities }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, open } = useSidebar();
  const isMobile = useIsMobile();
  const [modelDropdown, setModelDropdown] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Ñkyel Auto');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const engines = [
    { id: 'auto', name: 'Ñkyel Auto', desc: 'Routage intelligent autonome', badge: 'Recommandé' },
    { id: 'chui', name: 'Ñkyel Chui (120B)', desc: 'Raisonnement profond & code complexe', badge: 'Pro' },
    { id: 'radi', name: 'Ñkyel Radi (Mini)', desc: 'Ultra-rapide & concis (30ms)' },
    { id: 'wandana', name: 'Ñkyel Research (Tavily/RAG)', desc: 'Recherche web & veille en direct' },
  ];

  const isVieMode = pathname === '/agent' || pathname.startsWith('/workspace');

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      <header className="flex items-center justify-between px-2 sm:px-4 h-13 flex-shrink-0 z-30 border-b border-white/[0.04] bg-[#07090F]/80 backdrop-blur-md">
        {/* Left: Sidebar Toggle + Engine Selector + Pro Banner */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Toggle on mobile/tablet or when collapsed */}
          <button
            type="button"
            onClick={isMobile ? open : toggleCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Barre latérale"
          >
            <SidebarSimple size={18} />
          </button>

          {/* Engine Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-xs sm:text-[13px] transition-all"
            >
              <span className="font-semibold truncate">{activeEngine}</span>
              <CaretDown size={12} weight="bold" className="text-[#9199A8] shrink-0" />
            </button>

            {modelDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 p-2 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-[13px] space-y-1">
                <div className="px-3 py-2 text-[11px] font-semibold text-[#9199A8] uppercase tracking-wider">
                  Moteur d'intelligence
                </div>
                {engines.map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => {
                      setActiveEngine(eng.name);
                      setModelDropdown(false);
                    }}
                    className={`w-full flex flex-col items-start px-3 py-2 rounded-xl text-left transition-colors ${
                      activeEngine === eng.name
                        ? 'bg-white/[0.08] text-white'
                        : 'text-[#9199A8] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-white text-[13px]">{eng.name}</span>
                      {eng.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D5AE57]/20 text-[#D5AE57] font-semibold">
                          {eng.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9199A8] mt-0.5">{eng.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pro / Sovereign Banner matching Manus gift badge */}
          <button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6757E8]/10 hover:bg-[#6757E8]/20 border border-[#6757E8]/25 text-[#6757E8] text-[12px] font-medium transition-colors"
          >
            <Gift size={14} weight="bold" />
            <span>Ñkyel Pro — Souverain & Accès Illimité</span>
          </button>
        </div>

        {/* Right: Mode Switcher + Unlimited Badge + Capabilities */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mode Switcher: Conversation / Mission VIE */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => router.push('/')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                !isVieMode
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-[#9199A8] hover:text-white'
              }`}
            >
              <ChatCircleText size={14} />
              <span className="hidden sm:inline">Conversation</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/agent')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isVieMode
                  ? 'bg-gradient-to-r from-[#6757E8] to-[#D5AE57] text-white font-semibold shadow-[0_0_12px_rgba(103,87,232,0.3)]'
                  : 'text-[#9199A8] hover:text-white'
              }`}
            >
              <Graph size={14} />
              <span className="hidden sm:inline">Mission VIE</span>
            </button>
          </div>

          {/* Capabilities Sparkle Button */}
          <button
            type="button"
            onClick={onOpenCapabilities}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white text-xs font-medium transition-colors"
            title="Toutes les capacités Ñkyel"
          >
            <Sparkle size={15} weight="fill" className="text-[#D5AE57]" />
            <InfinityIcon size={16} className="text-[#9199A8]" />
          </button>
        </div>
      </header>
    </>
  );
}
