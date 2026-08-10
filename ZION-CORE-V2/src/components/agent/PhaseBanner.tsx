/**
 * GabomaAI · PhaseBanner
 * SmartANDJ AI Technologies
 * Task 8 — Bandeau 3 phases : Compréhension | Planification | Exécution
 */

'use client';

import { motion } from 'framer-motion';
import type { AgentPhase } from '@/lib/models';

interface PhaseBannerProps {
  phase: AgentPhase;
}

const PHASES = [
  { key: 'planning', label: 'Compréhension' },
  { key: 'executing', label: 'Planification' },
  { key: 'done', label: 'Exécution' },
] as const;

function getPhaseIndex(phase: AgentPhase): number {
  if (phase === 'idle') return -1;
  if (phase === 'planning') return 0;
  if (phase === 'executing') return 1;
  if (phase === 'done' || phase === 'error') return 2;
  return 1;
}

export default function PhaseBanner({ phase }: PhaseBannerProps) {
  const activeIdx = getPhaseIndex(phase);
  if (activeIdx < 0) return null;

  return (
    <div
      className="flex items-center gap-1 px-4 py-2.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {PHASES.map((p, i) => {
        const isPast = i < activeIdx;
        const isActive = i === activeIdx;

        return (
          <div key={p.key} className="flex items-center gap-1">
            {i > 0 && (
              <div className="w-6 h-px mx-1" style={{ background: isPast ? '#00D4AA' : 'rgba(255,255,255,0.08)' }} />
            )}

            <div className="flex items-center gap-1.5">
              {isPast ? (
                <span className="text-xs" style={{ color: '#00D4AA' }}>✓</span>
              ) : isActive ? (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#C5A059' }}
                />
              ) : (
                <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              )}

              <span
                className="text-[12px] font-medium"
                style={{
                  color: isActive ? '#C5A059' : isPast ? '#8A8A92' : '#525258',
                }}
              >
                {p.label}
              </span>
            </div>

            {isActive && (
              <motion.div
                layoutId="phase-underline"
                className="absolute bottom-0 h-0.5 rounded-full"
                style={{ background: '#C5A059' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
