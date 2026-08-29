'use client';

import React from 'react';
import {
  Play,
  ArrowUUpLeft,
  ArrowUUpRight,
  Plus,
  SquaresFour,
  DotsThree,
} from '@phosphor-icons/react';

interface WorkGraphToolbarProps {
  onExecute: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAdd: () => void;
  onToggleGrid: () => void;
  onMore: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isRunning?: boolean;
}

export default function WorkGraphToolbar({
  onExecute,
  onUndo,
  onRedo,
  onAdd,
  onToggleGrid,
  onMore,
  canUndo = false,
  canRedo = false,
  isRunning = false,
}: WorkGraphToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-[#0E121A]/80 backdrop-blur-md border border-white/[0.06] shadow-lg">
      <button
        type="button"
        onClick={onExecute}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
      >
        <Play size={16} weight={isRunning ? "fill" : "regular"} />
        <span className="text-sm font-medium">{isRunning ? 'en cours' : 'exécuter'}</span>
      </button>

      <div className="w-[1px] h-6 bg-white/[0.06] mx-1" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ArrowUUpLeft size={20} />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ArrowUUpRight size={20} />
      </button>

      <button
        type="button"
        onClick={onAdd}
        className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Plus size={20} />
      </button>

      <button
        type="button"
        onClick={onToggleGrid}
        className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <SquaresFour size={20} />
      </button>

      <div className="w-[1px] h-6 bg-white/[0.06] mx-1" />

      <button
        type="button"
        onClick={onMore}
        className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        <DotsThree size={20} weight="bold" />
      </button>
    </div>
  );
}
