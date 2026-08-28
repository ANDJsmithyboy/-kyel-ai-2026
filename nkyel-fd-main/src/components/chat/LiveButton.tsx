/**
 * Nkyel AI · LiveButton.tsx · Client Component
 * SmartANDJ AI Technologies
 * Bouton audio live — cercle 36px, 3 barres animées.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);
  return reduced;
}

const BAR_HEIGHTS = [
  { min: 4, max: 6, duration: 0.6 },
  { min: 6, max: 12, duration: 0.75 },
  { min: 5, max: 8, duration: 0.9 },
];

export default function LiveButton() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      animate={shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }}
      transition={
        shouldReduceMotion
          ? {}
          : { duration: 1.8, ease: 'easeInOut', repeat: Infinity }
      }
      className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center gap-[3px] rounded-full"
      style={{
        background: 'radial-gradient(circle, var(--accent-20), var(--bg-elevated))',
        border: '1px solid var(--accent-35)',
      }}
      aria-label="Activer le mode vocal"
    >
      {BAR_HEIGHTS.map((bar, i) => (
        <motion.span
          key={i}
          animate={
            shouldReduceMotion
              ? {}
              : { height: [`${bar.min}px`, `${bar.max}px`, `${bar.min}px`] }
          }
          transition={
            shouldReduceMotion
              ? {}
              : {
                  duration: bar.duration,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: i * 0.15,
                }
          }
          className="w-[2.5px] rounded-full bg-[var(--accent)]"
          style={{ height: `${bar.min}px` }}
        />
      ))}
    </motion.button>
  );
}
