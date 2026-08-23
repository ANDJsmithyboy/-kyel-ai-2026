'use client';

import { StopCircle, PaperPlaneTilt, Microphone } from '@phosphor-icons/react';
import { useSettingsStore } from '@/stores/settings.store';

interface LiveToggleButtonProps {
  isStreaming: boolean;
  hasText: boolean;
  onSend: () => void;
  onStop: () => void;
}

export default function LiveToggleButton({ isStreaming, hasText, onSend, onStop }: LiveToggleButtonProps) {
  const isBlackPanther = useSettingsStore(s => s.blackPantherMode);

  if (isStreaming) {
    return (
      <button
        onClick={onStop}
        className="w-10 h-10 mb-1 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all shrink-0"
        title="Arrêter"
      >
        <StopCircle size={20} weight="fill" />
      </button>
    );
  }

  if (hasText) {
    return (
      <button
        onClick={onSend}
        className="w-10 h-10 mb-1 flex items-center justify-center rounded-full bg-[var(--text-primary)] text-black hover:scale-105 transition-transform shrink-0"
        title="Envoyer la directive"
      >
        <PaperPlaneTilt size={18} weight="fill" className="ml-0.5" />
      </button>
    );
  }

  // LIVE mode standby
  return (
    <button
      className={`h-10 px-4 mb-1 flex items-center gap-2 rounded-full border bg-transparent transition-all shrink-0 group shadow-sm hover:shadow-md ${
        isBlackPanther 
          ? "border-[rgba(212,164,23,0.3)] hover:bg-[rgba(212,164,23,0.08)] text-[var(--gold)]" 
          : "border-[rgba(46,204,138,0.3)] hover:bg-[rgba(46,204,138,0.08)] text-[var(--green-emerald)]"
      }`}
      title="Démarrer le mode LIVE"
    >
      <div className="relative flex items-center justify-center">
        <Microphone size={16} weight="fill" className="transition-colors z-10" />
        <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity ${isBlackPanther ? 'bg-[var(--gold)]' : 'bg-[var(--green-emerald)]'}`} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block">LIVE</span>
    </button>
  );
}
