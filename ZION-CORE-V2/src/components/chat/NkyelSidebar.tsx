'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Lightning, DiamondsFour, Gear, ArrowSquareOut } from '@phosphor-icons/react';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { PawNewIcon, RadarWandanaIcon, RenduIcon, ProjetsIcon, TropheeIcon } from '@/components/icons/NkyelIcons';
import { SmartAndJTechIcon } from '@/components/icons/SmartAndJTechIcon';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NkyelSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NkyelSidebar({ isOpen, onClose }: NkyelSidebarProps) {
  // Mobile uses AnimatePresence for fullscreen drawer
  return (
    <>
      {/* MOBILE FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-[85vw] h-full bg-[#050608]/95 border-r border-white/8 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent onClose={onClose} isMobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PC FIXED SIDEBAR */}
      <div className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-[#020304] border-r border-[var(--border)] z-40">
        <SidebarContent onClose={onClose} isMobile={false} />
      </div>
    </>
  );
}

function SidebarContent({ onClose, isMobile }: { onClose: () => void; isMobile: boolean }) {
  const recentTracks = [
    "Plan de développement Nkyel",
    "Analyse de l'API Stripe",
    "Synthèse de la réunion Q3",
  ];

  return (
    <div className="flex flex-col h-full w-full font-sans antialiased text-[var(--text-primary)]">
      {/* HEADER */}
      <div className="h-14 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <SmartAndJTechIcon className="w-6 h-6 text-[var(--text-primary)]" />
          )}
          <span className="font-display font-semibold text-base tracking-tight text-[var(--text-primary)]">
            Nkyel AI
          </span>
        </div>
        {isMobile && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          >
            <IbogaAiIcon className="w-[15px] h-[15px] text-current" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* STATUS */}
      <div className="px-5 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-tight">
          La forêt s'éveille…
        </span>
      </div>

      {/* NEW PISTE ACTION */}
      <div className="px-3 mb-6">
        <button 
          onClick={() => { /* Nouvelle Piste logic */ if (isMobile) onClose(); }}
          className="w-full h-12 px-4 flex items-center gap-3 rounded-e-full bg-[var(--accent)]/12 hover:bg-[var(--accent)]/18 border-l-2 border-[var(--accent)] transition-all active:scale-[0.98]"
        >
          <PawNewIcon width={18} height={18} className="text-[var(--accent)]" />
          <span className="text-[13px] font-semibold text-[var(--accent)] tracking-tight">
            Nouvelle Piste
          </span>
        </button>

        <div className="mt-2 space-y-1">
          <button className="w-full h-10 px-4 flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <RadarWandanaIcon width={16} height={16} />
            <span className="text-[13px] font-medium tracking-tight">Radar Wandana</span>
          </button>
          <button className="w-full h-10 px-4 flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <RenduIcon width={16} height={16} />
            <span className="text-[13px] font-medium tracking-tight">Le Rendu</span>
          </button>
          <button className="w-full h-10 px-4 flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ProjetsIcon width={16} height={16} />
            <span className="text-[13px] font-medium tracking-tight">Projets</span>
          </button>
          <button className="w-full h-10 px-4 flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <TropheeIcon width={16} height={16} />
            <span className="text-[13px] font-medium tracking-tight">Trophées</span>
          </button>
        </div>
      </div>

      {/* HISTORY */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-3 pl-1">
          En Piste
        </h3>
        <div className="flex flex-col space-y-0.5">
          {recentTracks.map((track, i) => (
            <button
              key={i}
              className="h-11 px-3 w-full text-left rounded-lg hover:bg-[var(--glass)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate tracking-tight"
            >
              {track}
            </button>
          ))}
        </div>

        {/* GAUGE */}
        <div className="mt-8 mb-6 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightning size={15} weight="thin" className="text-[var(--text-primary)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">Énergie Quotidienne</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--accent)]/70 to-[var(--accent)] w-[35%]" />
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">35%</span>
          </div>
          <button className="w-full py-2.5 rounded-full bg-[var(--accent)] text-black text-xs font-bold tracking-tight uppercase shadow-[0_0_24px_rgba(197,160,89,0.35)] hover:shadow-[0_0_32px_rgba(197,160,89,0.5)] transition-shadow">
            Alimenter la Meute
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-3 pb-4 shrink-0">
        <div className="w-full h-px bg-[var(--glass-border)] mb-2" />

        <Link href="/admin/settings" onClick={isMobile ? onClose : undefined} className="w-full h-10 px-3 flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Gear size={15} weight="thin" />
          <span className="text-xs font-semibold tracking-tight">L'Antre</span>
        </Link>

        <div className="mt-2 p-2 flex items-center justify-between rounded-xl hover:bg-[var(--glass)] cursor-pointer transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center text-[11px] font-bold text-[var(--accent)]">
              D
            </div>
            <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              Daniel
            </span>
          </div>
          <Gear size={14} weight="thin" className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" />
        </div>
      </div>
    </div>
  );
}
