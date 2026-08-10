/* GabomaGPT · ModeSelector.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Sélecteur de mode minimaliste intégré dans la zone d'input (style Claude)
   Migré depuis InlineModeSelector.svelte */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useModeStore, MODEL_MAP, type Mode } from '@/stores/mode';
import { CaretDown } from '@phosphor-icons/react';

const MODES: Mode[] = ['flash', 'pro', 'research', 'agent', 'superagent', 'vision'];

export default function ModeSelector() {
  const { activeMode, setMode } = useModeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = MODEL_MAP[activeMode];

  /* Fermer le dropdown au clic extérieur */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open]);

  function selectMode(mode: Mode) {
    setMode(mode);
    setOpen(false);
  }

  return (
    <div className="inline-flex items-center relative z-50" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 h-8 border border-transparent rounded-full bg-transparent hover:bg-[var(--bg-overlay)] hover:border-[var(--border)] font-[Outfit,Sora,sans-serif] text-xs font-semibold cursor-pointer transition-all whitespace-nowrap leading-none"
        style={{ color: current.colorGlow || 'var(--text-primary)' }}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          <img src={current.image} alt={current.label} className="w-4 h-4 rounded-full object-cover shadow-sm ring-1 ring-white/10" draggable={false} />
        </span>
        <span className="tracking-wide text-[var(--text-secondary)]">{current.label.split(' ')[0]}</span>
        <CaretDown size={12} weight="bold" className={`opacity-60 transition-transform text-[var(--text-tertiary)] ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-0 min-w-[240px] p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[100]"
          role="listbox"
        >
          {MODES.map((mode) => {
            const config = MODEL_MAP[mode];
            const isActive = activeMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={`flex items-center gap-3 w-full px-3 py-2.5 border-none rounded-xl bg-transparent text-[var(--text-secondary)] font-[Outfit,Sora,sans-serif] text-sm cursor-pointer transition-colors text-left hover:bg-[var(--accent-06)] ${isActive ? 'bg-[var(--accent-10)] !text-[var(--text-primary)]' : ''}`}
                role="option"
                aria-selected={isActive}
                onClick={() => selectMode(mode)}
              >
                <span className="flex items-center justify-center w-6 h-6 shrink-0">
                  <img src={config.image} alt={config.label} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" draggable={false} />
                </span>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="font-semibold text-[13px] text-[var(--text-primary)]">{config.label}</span>
                  <span className="text-[11px] opacity-60 whitespace-nowrap overflow-hidden text-ellipsis">{config.description}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
