/**
 * Gaboma AI · HomeInputBar.tsx · Client Component
 * SmartANDJ AI Technologies
 * Barre d'input — page d'accueil (état vide, pas de conversation).
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import LiveButton from './LiveButton';
import TierPicker, { type TierKey } from './TierPicker';

export default function HomeInputBar() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierKey>('AURATA');
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
    // TODO: route to conversation with value + selectedTier
    setValue('');
  }, [hasValue, value, selectedTier]);

  /* Handle keydown — Enter to submit, Shift+Enter for newline */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  /* Tier chip label */
  const tierLabel = (() => {
    const labels: Record<TierKey, string> = {
      AURATA: 'Aurata',
      NYEL: 'Ñkyel',
      WANDANA: 'Wandana',
      ONYX: 'OnyxGris',
      BLACK_PANTHER: 'Black Panther',
      BLUE_PANTHER: 'Blue Panther (Créateur)',
    };
    return labels[selectedTier];
  })();

  return (
    <div className="relative w-full">
      {/* Wrapper pill */}
      <div
        className={cn(
          'relative flex w-full items-end gap-2 rounded-[var(--radius-pill)] px-4 py-3',
          'transition-all',
        )}
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${isFocused ? 'var(--accent-20)' : 'var(--border)'}`,
          transition: 'var(--transition-fast)',
        }}
      >
        {/* LEFT — Plus button / Tier chip */}
        <div className="relative flex flex-shrink-0 items-center">
          <button
            type="button"
            onClick={() => setShowTierPicker(!showTierPicker)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors"
            style={{
              background: showTierPicker ? 'var(--accent-10)' : 'transparent',
              color: 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
            }}
            aria-label="Choisir le tier"
          >
            {/* Plus icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Tier chip (visible when not showing picker) */}
          {!showTierPicker && selectedTier !== 'AURATA' && (
            <span
              className="ml-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'var(--accent-06)',
                color: 'var(--accent)',
              }}
            >
              {tierLabel}
            </span>
          )}

          {/* TierPicker */}
          <TierPicker
            isOpen={showTierPicker}
            onClose={() => setShowTierPicker(false)}
            selectedTier={selectedTier}
            onSelect={setSelectedTier}
          />
        </div>

        {/* CENTER — Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Exécuter une directive..."
          rows={1}
          className="min-h-[36px] flex-1 resize-none border-0 bg-transparent text-sm leading-[1.5] outline-none placeholder:select-none"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent)',
            maxHeight: 160,
          }}
        />

        {/* RIGHT — LiveButton or Send */}
        <div className="flex flex-shrink-0 items-center">
          <AnimatePresence mode="wait">
            {hasValue ? (
              <motion.button
                key="send"
                type="button"
                onClick={handleSubmit}
                initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.2 }}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
                style={{ background: 'var(--accent)' }}
                aria-label="Envoyer"
              >
                {/* Arrow up icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 14V4M9 4L5 8M9 4L13 8"
                    stroke="var(--accent-fg)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            ) : (
              <motion.div
                key="live"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <LiveButton />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
