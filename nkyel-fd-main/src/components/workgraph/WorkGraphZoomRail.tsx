'use client';

import React from 'react';
import { Plus, Minus, LockKey, LockKeyOpen } from '@phosphor-icons/react';
import { useReactFlow } from '@xyflow/react';

interface WorkGraphZoomRailProps {
  isLocked: boolean;
  onToggleLock: () => void;
}

export default function WorkGraphZoomRail({ isLocked, onToggleLock }: WorkGraphZoomRailProps) {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
  const zoomLevel = Math.round((getViewport()?.zoom || 1) * 100);

  return (
    <div className="absolute bottom-[calc(var(--inspector-height,320px)+24px)] left-4 z-20 flex flex-col items-center p-1.5 rounded-2xl bg-[#0E121A]/80 backdrop-blur-md border border-white/[0.06] shadow-lg">
      <button
        type="button"
        onClick={() => zoomIn({ duration: 300 })}
        className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Plus size={18} />
      </button>

      <button
        type="button"
        onClick={() => fitView({ duration: 400 })}
        className="py-2 text-[10px] font-mono font-medium text-white/50 hover:text-white transition-colors"
      >
        {zoomLevel}%
      </button>

      <button
        type="button"
        onClick={() => zoomOut({ duration: 300 })}
        className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Minus size={18} />
      </button>

      <div className="w-6 h-[1px] bg-white/[0.06] my-1" />

      <button
        type="button"
        onClick={onToggleLock}
        className={`p-2.5 rounded-xl transition-colors ${
          isLocked 
            ? 'text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20' 
            : 'text-white/50 hover:text-white hover:bg-white/5'
        }`}
      >
        {isLocked ? <LockKey size={18} weight="fill" /> : <LockKeyOpen size={18} />}
      </button>
    </div>
  );
}
