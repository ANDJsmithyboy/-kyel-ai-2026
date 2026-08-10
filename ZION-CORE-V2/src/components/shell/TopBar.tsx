/**
 * GabomaAI · TopBar
 * SmartANDJ AI Technologies
 * Sidebar toggle + Logo when collapsed + Nouvelle Piste + Rendu
 */

'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import { RenduIcon } from '@/components/icons/GabomaIcons';
import { IconEdit, IconMenu2 } from '@tabler/icons-react';

export default function TopBar() {
  const { isCollapsed, toggleCollapse, open } = useSidebar();
  const isMobile = useIsMobile();
  const renduPanel = useRenduPanel();
  const hasArtifacts = renduPanel.artifacts.length > 0;

  return (
    <header
      className="flex items-center justify-between px-4 h-12 flex-shrink-0 z-30"
      style={{ background: 'transparent' }}
    >
      {/* Left — toggle + logo when collapsed */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isMobile ? open : toggleCollapse}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-06)] transition-all hover:scale-105 active:scale-95"
          aria-label="Ouvrir/fermer la barre latérale"
        >
          <IconMenu2 size={18} stroke={1.5} />
        </button>

        {/* Logo visible when sidebar is collapsed (desktop only) */}
        <AnimatePresence>
          {!isMobile && isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span
                className="text-[14px] font-semibold text-[var(--text-primary)] hidden sm:inline"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Gaboma AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nouvelle Piste (pen icon) */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-06)] transition-all hover:scale-105 active:scale-95"
          aria-label="Nouvelle piste"
        >
          <IconEdit size={18} stroke={1.5} />
        </button>
      </div>

      {/* Right — Rendu + Avatar */}
      <div className="flex items-center gap-2">
        {hasArtifacts && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => renduPanel.toggle()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold cursor-pointer transition-colors"
            style={{
              background: 'rgba(31,157,107,0.10)',
              border: '1px solid rgba(31,157,107,0.25)',
              color: 'var(--color-success)',
            }}
          >
            <RenduIcon className="w-4 h-4" /> Le Rendu
            <span
              className="text-[10px] px-1 rounded-full"
              style={{ background: 'rgba(31,157,107,0.2)' }}
            >
              {renduPanel.artifacts.length}
            </span>
          </motion.button>
        )}

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold bg-[var(--accent-10)] border border-[var(--border)] text-[var(--accent)] cursor-pointer hover:bg-[var(--accent-20)] transition-colors">
          DJ
        </div>
      </div>
    </header>
  );
}
