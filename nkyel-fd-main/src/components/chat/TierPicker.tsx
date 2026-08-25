/**
 * Ñkyel AI · TierPicker.tsx
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * User Models:
 * 1. Ñkyel (Auto - Dynamic Router)
 * 2. Ñkyel Chui (Deep reasoning & complex code - Pro)
 * 3. Ñkyel Radi (Ultra-fast & concise)
 * 4. Ñkyel Research (Live web search & deep grounding)
 * 5. Ñkyel Tai (Multimodal reasoning & creativity - Plus)
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkle, Lightning, Brain, Globe, Eye, Check } from '@phosphor-icons/react';
import { ENGINES, type NkyelEngineId } from '@/hooks/useNkyelModel';

export type TierKey = NkyelEngineId;

interface TierPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: NkyelEngineId;
  onSelect: (mode: NkyelEngineId) => void;
}

export default function TierPicker({
  isOpen,
  onClose,
  selectedMode,
  onSelect,
}: TierPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const iconMap: Record<NkyelEngineId, React.ComponentType<any>> = {
    auto: Sparkle,
    chui: Brain,
    radi: Lightning,
    research: Globe,
    tai: Eye,
  };

  const modelsList = Object.values(ENGINES);

  /* Close on click outside */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={containerRef}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.16, ease: [0.25, 0.8, 0.25, 1] }}
            className={cn(
              'z-50 overflow-hidden shadow-2xl',
              'fixed inset-x-0 bottom-0 rounded-t-2xl lg:rounded-2xl',
              'lg:absolute lg:inset-auto lg:bottom-full lg:left-0 lg:mb-2 lg:w-[320px]',
            )}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Modèles Ñkyel
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                SmartANDJ AI
              </span>
            </div>

            {/* List of Models */}
            <div className="p-2 space-y-1">
              {modelsList.map((m) => {
                const Icon = iconMap[m.id as NkyelEngineId] || Sparkle;
                const isSelected = selectedMode === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelect(m.id as NkyelEngineId);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors',
                      isSelected
                        ? 'bg-[var(--surface-raised)] border border-[#D5AE57]/40 shadow-xs'
                        : 'hover:bg-[var(--hover)] border border-transparent',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        isSelected
                          ? 'bg-[#D5AE57] text-black font-bold'
                          : 'bg-white/[0.06] text-[var(--text-secondary)]',
                      )}
                    >
                      <Icon size={16} weight={isSelected ? 'bold' : 'regular'} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {m.name}
                        </span>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D5AE57]/15 text-[#D5AE57] font-medium">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5">
                        {m.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <Check size={14} weight="bold" className="text-[#D5AE57] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
