/**
 * Nkyel AI · HomeInputBar.tsx · Client Component
 * SmartANDJ AI Technologies
 * Barre d'input — page d'accueil (état vide, pas de conversation).
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LiveButton from './LiveButton';
import TierPicker, { type TierKey } from './TierPicker';
import type { IntelligenceModeId } from '@/hooks/useNkyelModel';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);
  return reduced;
}

export default function HomeInputBar() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTier, setSelectedTier] = useState<IntelligenceModeId>('auto');
  const [showTierPicker, setShowTierPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const hasValue = value.trim().length > 0;

  /* Auto-resize textarea */
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    handleInput();
  }, [value, handleInput]);

  /* Handle submit */
  const handleSubmit = useCallback(() => {
    if (!hasValue) return;
    // Route to conversation with value + selectedTier
  }, [hasValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const tierLabel = selectedTier === 'auto' ? 'Auto' : selectedTier.toUpperCase();

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4">
      <div
        className={cn(
          'relative flex flex-col rounded-3xl border p-3.5 transition-all duration-200',
          isFocused
            ? 'border-[var(--accent)] shadow-lg'
            : 'border-[var(--border)] bg-[var(--surface-raised)]'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {/* Tier picker trigger */}
          <button
            type="button"
            onClick={() => setShowTierPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--control-bg)] hover:bg-[var(--hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors"
          >
            <span>{tierLabel}</span>
          </button>

          <TierPicker
            isOpen={showTierPicker}
            onClose={() => setShowTierPicker(false)}
            selectedMode={selectedTier}
            onSelect={setSelectedTier}
          />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Exécuter une directive..."
          rows={1}
          className="min-h-[44px] w-full resize-none border-0 bg-transparent text-sm leading-[1.5] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />

        {/* Bottom controls */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <LiveButton />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasValue}
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center transition-all',
              hasValue
                ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                : 'bg-[var(--control-bg)] text-[var(--text-tertiary)] opacity-50'
            )}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
