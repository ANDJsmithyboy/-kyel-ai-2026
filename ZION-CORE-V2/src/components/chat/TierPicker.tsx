/**
 * Gaboma AI · TierPicker.tsx · Client Component
 * SmartANDJ AI Technologies
 * Sélecteur de tier — Bottom sheet mobile, popover desktop.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconAurata, IconNkyel, IconOnyxGris, IconWandana, IconBlackPanther, IconBluePanther } from '@/components/icons';

/* ── Types ────────────────────────────────────────── */
export type TierKey = 'AURATA' | 'NYEL' | 'WANDANA' | 'ONYX' | 'BLACK_PANTHER' | 'BLUE_PANTHER';

interface Tier {
  key: TierKey;
  label: string;
  description: string;
  badge: string;
  available: boolean;
  accentColor: string;
}

const TIERS: Tier[] = [
  { key: 'AURATA',        label: 'Aurata',        description: 'Mode fondamental',               badge: 'AURATA',        available: true,  accentColor: '#C5A059' },
  { key: 'NYEL',          label: 'Ñkyel',          description: 'Mode avancé',                    badge: 'ÑKYEL',          available: false, accentColor: '#94A3B8' },
  { key: 'WANDANA',       label: 'Wandana',       description: 'Recherche & Deep Recherche',     badge: 'WANDANA',       available: false, accentColor: '#A855F7' },
  { key: 'ONYX',          label: 'OnyxGris',          description: 'Agent IA autonome',              badge: 'ONYXGRIS',          available: false, accentColor: '#E2E8F0' },
  { key: 'BLACK_PANTHER', label: 'Black Panther', description: 'Super Agent multi-agents', badge: 'BLACK PANTHER', available: false, accentColor: '#C5A059' },
  { key: 'BLUE_PANTHER', label: 'Blue Panther', description: 'Mode Créateur Illimité', badge: 'BLUE PANTHER', available: true, accentColor: '#0070F3' },
];

/* ── Props ────────────────────────────────────────── */
interface TierPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: TierKey;
  onSelect: (tier: TierKey) => void;
}

/* ── Component ───────────────────────────────────── */
export default function TierPicker({ isOpen, onClose, selectedTier, onSelect }: TierPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

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
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
            /* Mobile: bottom sheet fixed. Desktop: popover absolute */
            className={cn(
              'z-50 overflow-hidden',
              /* Mobile */
              'fixed inset-x-0 bottom-0 rounded-t-2xl lg:rounded-2xl',
              /* Desktop */
              'lg:absolute lg:inset-auto lg:bottom-full lg:left-0 lg:mb-2 lg:w-[320px]',
            )}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
            drag={shouldReduceMotion ? false : 'y'}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
          >
            {/* Drag handle — mobile */}
            <div className="flex justify-center py-2 lg:hidden">
              <div
                className="h-1 w-8 rounded-full"
                style={{ background: 'var(--text-tertiary)' }}
              />
            </div>

            {/* Header */}
            <div className="px-4 pb-2 pt-1 lg:pt-3">
              <h3
                className="text-sm font-semibold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                }}
              >
                Vecteur de Force
              </h3>
            </div>

            {/* Tier list */}
            <div className="px-2 pb-3">
              {TIERS.map((tier) => {
                const isSelected = selectedTier === tier.key;
                const isAvailable = tier.available;

                return (
                  <button
                    key={tier.key}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        onSelect(tier.key);
                        onClose();
                      }
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors',
                      isAvailable ? 'cursor-pointer' : 'cursor-not-allowed',
                    )}
                    style={{
                      opacity: isAvailable ? 1 : 0.4,
                      background: isSelected ? 'var(--accent-10)' : 'transparent',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable && !isSelected) {
                        e.currentTarget.style.background = 'var(--accent-06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected
                        ? 'var(--accent-10)'
                        : 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Tier Icon */}
                      <div className="flex-shrink-0" style={{ color: tier.accentColor }}>
                        {(() => {
                          const props = { width: 16, height: 16 };
                          switch (tier.key) {
                            case 'AURATA': return <IconAurata {...props} />;
                            case 'NYEL': return <IconNkyel {...props} />;
                            case 'WANDANA': return <IconWandana {...props} />;
                            case 'ONYX': return <IconOnyxGris {...props} />;
                            case 'BLACK_PANTHER': return <IconBlackPanther {...props} />;
                            case 'BLUE_PANTHER': return <IconBluePanther {...props} />;
                            default: return <div className="h-2.5 w-2.5 rounded-full" style={{ background: tier.accentColor }} />;
                          }
                        })()}
                      </div>
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: '#FFFFFF',
                          }}
                        >
                          {tier.label}
                        </div>
                        <div
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tier.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Badge */}
                      {isAvailable ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            fontFamily: 'var(--font-body)',
                            background: 'var(--accent-06)',
                            color: 'var(--accent)',
                          }}
                        >
                          {tier.badge}
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            background: 'rgba(224,88,75,0.08)',
                            color: 'rgba(224,88,75,0.6)',
                          }}
                        >
                          Verrouillé
                        </span>
                      )}

                      {/* Check mark for selected */}
                      {isSelected && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ color: 'var(--accent)' }}
                        >
                          <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
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
