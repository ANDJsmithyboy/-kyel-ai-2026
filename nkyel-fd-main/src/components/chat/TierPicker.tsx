/**
 * Ñkyel AI · TierPicker.tsx
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical Intelligence Mode Picker (Modal / Bottom sheet for mobile fallback):
 * 1. Auto (Auto - Autonomous Router)
 * 2. Fast (Rapide - Ultra-fast & concise)
 * 3. Deep (Profond - Deep reasoning & complex code)
 * 4. Research (Recherche - Live web search & grounding)
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkle, Lightning, Brain, Globe, Check } from '@phosphor-icons/react';
import { INTELLIGENCE_MODES, type IntelligenceModeId } from '@/hooks/useNkyelModel';
import { useLanguageStore } from '@/stores/language.store';

export type TierKey = IntelligenceModeId;

interface TierPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: IntelligenceModeId | string;
  onSelect: (mode: IntelligenceModeId) => void;
}

export default function TierPicker({
  isOpen,
  onClose,
  selectedMode,
  onSelect,
}: TierPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const iconMap: Record<IntelligenceModeId, React.ComponentType<any>> = {
    auto: Sparkle,
    fast: Lightning,
    deep: Brain,
    research: Globe,
  };

  const modesList = Object.values(INTELLIGENCE_MODES);

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={onClose}
          />

          {/* Bottom Sheet / Panel */}
          <motion.div
            ref={containerRef}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
            className={cn(
              'z-50 overflow-hidden shadow-2xl',
              'fixed inset-x-0 bottom-0 rounded-t-3xl md:rounded-2xl',
              'md:absolute md:inset-auto md:bottom-full md:left-0 md:mb-2 md:w-[320px]',
              'max-h-[85vh] overflow-y-auto pb-safe',
            )}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Mobile Tactile Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-[var(--border-strong)] mx-auto mt-3 mb-1 md:hidden" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                {isFr ? "Mode d'intelligence" : "Intelligence Mode"}
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                SmartANDJ AI
              </span>
            </div>

            {/* List of Models */}
            <div className="p-2 space-y-1 pb-4 md:pb-2">
              {modesList.map((m) => {
                const Icon = iconMap[m.id] || Sparkle;
                const isSelected = selectedMode === m.id || (selectedMode === 'radi' && m.id === 'fast') || (selectedMode === 'chui' && m.id === 'deep');
                const label = m.name; // Keep sovereign African model name untranslated
                const desc = isFr ? m.descFr : m.descEn;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelect(m.id);
                      onClose();
                    }}
                    className={cn(
                      'w-full min-h-[48px] flex items-start gap-3 p-3 rounded-2xl text-left transition-colors touch-manipulation active:scale-[0.99]',
                      isSelected
                        ? 'bg-[var(--surface-raised)] border border-[#D5AE57]/40 shadow-xs'
                        : 'hover:bg-[var(--hover)] border border-transparent',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
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
                          {label}
                        </span>
                        {m.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D5AE57]/15 text-[#D5AE57] font-semibold">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-snug mt-0.5">
                        {desc}
                      </p>
                    </div>

                    {isSelected && (
                      <Check size={15} weight="bold" className="text-[#D5AE57] shrink-0 self-center" />
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
