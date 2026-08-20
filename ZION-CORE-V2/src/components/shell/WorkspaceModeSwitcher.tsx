/**
 * Ñkyel AI · WorkspaceModeSwitcher
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Switcher fluide inspiré Apple entre les 2 modes fondamentaux :
 * - Conversation (Mode conversationnel unifié)
 * - Mission VIE (Espace visuel interactif et spatialisé)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatCircleDots, Graph } from '@phosphor-icons/react';

export type WorkspaceViewMode = 'conversation' | 'vie';

interface WorkspaceModeSwitcherProps {
  mode: WorkspaceViewMode;
  onModeChange: (mode: WorkspaceViewMode) => void;
  isRunning?: boolean;
}

export default function WorkspaceModeSwitcher({
  mode,
  onModeChange,
  isRunning = false,
}: WorkspaceModeSwitcherProps) {
  return (
    <div
      className="inline-flex items-center p-1 rounded-full border border-white/[0.08] bg-[#0E121A]/80 backdrop-blur-md relative select-none shadow-sm"
      role="tablist"
      aria-label="Mode d'affichage de l'espace de travail"
    >
      {/* Bouton Conversation */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'conversation'}
        onClick={() => onModeChange('conversation')}
        className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 min-h-[32px] ${
          mode === 'conversation'
            ? 'text-[#F1EEE7]'
            : 'text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
      >
        <ChatCircleDots size={16} weight={mode === 'conversation' ? 'fill' : 'regular'} />
        <span>Conversation</span>
      </button>

      {/* Bouton Mission VIE */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'vie'}
        onClick={() => onModeChange('vie')}
        className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 min-h-[32px] ${
          mode === 'vie'
            ? 'text-[#F1EEE7]'
            : 'text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
      >
        <Graph size={16} weight={mode === 'vie' ? 'fill' : 'regular'} />
        <span className="flex items-center gap-1.5">
          Mission VIE
          {isRunning && (
            <span className="inline-block w-2 h-2 rounded-full bg-[#665F9E] animate-pulse" />
          )}
        </span>
      </button>

      {/* Pilule d'arrière-plan animée */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-[#151922] border border-white/[0.1] shadow-inner"
        layoutId="activeModePill"
        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        style={{
          left: mode === 'conversation' ? 4 : 'calc(50% + 2px)',
          width: 'calc(50% - 6px)',
        }}
      />
    </div>
  );
}
