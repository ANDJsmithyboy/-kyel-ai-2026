/**
 * Ñkyel AI · Model Experience (MX) Banner
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Real semantic progress bar displaying actual mission steps:
 * Analysis -> Plan -> Skill -> MCP Tool -> A2A Delegation -> Google -> Deliverable
 * No generic spinning wheels; provides live pulse & user intervention controls.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkle,
  PuzzlePiece,
  SquaresFour,
  Users,
  CheckCircle,
  Clock,
  Pause,
  Play,
  WarningCircle,
  SlidersHorizontal,
} from '@phosphor-icons/react';

export interface MXStep {
  id: string;
  label: string;
  protocol: 'gemini' | 'skill' | 'mcp' | 'a2a' | 'a2ui' | 'artifact' | 'verification';
  status: 'pending' | 'running' | 'done' | 'warning';
  detail?: string;
}

interface ModelExperienceBannerProps {
  steps: MXStep[];
  currentStepIndex: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  onIntervene?: () => void;
}

const PROTOCOL_STEP_ICONS = {
  gemini: '🧠',
  skill: '🧩',
  mcp: '🔧',
  a2a: '👥',
  a2ui: '📐',
  artifact: '💎',
  verification: '✅',
};

export default function ModelExperienceBanner({
  steps,
  currentStepIndex,
  isPaused = false,
  onTogglePause,
  onIntervene,
}: ModelExperienceBannerProps) {
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="w-full my-3 p-3.5 rounded-2xl bg-[#0E121A] border border-white/[0.08] shadow-lg space-y-3">
      {/* Top Banner: Step Name & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6F9485] animate-ping shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#F1EEE7]">
                {currentStep ? currentStep.label : 'Mission en cours…'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#665F9E]/20 text-[#AAA2C8] font-semibold">
                Étape {Math.min(steps.length, currentStepIndex + 1)} / {steps.length}
              </span>
            </div>
            {currentStep?.detail && (
              <p className="text-[11px] text-[#7E8795] mt-0.5">{currentStep.detail}</p>
            )}
          </div>
        </div>

        {/* User live intervention buttons */}
        <div className="flex items-center gap-1.5">
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-[#B8C0CC] flex items-center gap-1 transition-colors"
            >
              {isPaused ? <Play size={12} weight="fill" /> : <Pause size={12} weight="fill" />}
              <span>{isPaused ? 'Reprendre' : 'Suspendre'}</span>
            </button>
          )}

          {onIntervene && (
            <button
              onClick={onIntervene}
              className="px-2.5 py-1 rounded-lg bg-[#665F9E]/20 hover:bg-[#665F9E]/30 text-[11px] text-[#AAA2C8] font-semibold transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal size={12} />
              <span>Intervenir</span>
            </button>
          )}
        </div>
      </div>

      {/* Semantic Pipeline Progress Track */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-2 border-t border-white/[0.04]">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={step.id}
              className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-[#665F9E]/15 border-[#665F9E]/40 shadow-sm'
                  : isDone
                  ? 'bg-[#08090D] border-[#6F9485]/30'
                  : 'bg-[#08090D]/50 border-white/[0.04] opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span>{PROTOCOL_STEP_ICONS[step.protocol] || '◈'}</span>
                {isDone ? (
                  <CheckCircle size={12} weight="fill" className="text-[#6F9485]" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#665F9E] animate-pulse" />
                ) : (
                  <Clock size={12} className="text-[#7E8795]" />
                )}
              </div>
              <span className="text-[10px] font-medium text-[#B8C0CC] truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
