/* Nkyel AI · motion.ts · SmartANDJ AI Technologies
   Shared motion constants — single source of truth for all animations
   Both platforms (Next.js + Kotlin) must use identical values.
   Fondateur : Daniel Jonathan ANDJ */

// -- Duration tokens (seconds for Motion/framer-motion) -------
export const DURATION = {
  instant: 0.1,   // icon swaps, checkbox fill
  fast:    0.15,  // button state changes, focus ring
  base:    0.22,  // sheet/drawer open, card expand
  slow:    0.4,   // route/tab transitions, page reveals
} as const;

// -- Easing tokens (CSS cubic-bezier arrays) ------------------
export const EASE = {
  standard:   [0.2, 0, 0, 1] as const,   // most UI motion
  decelerate: [0, 0, 0, 1]   as const,   // things entering
  accelerate: [0.3, 0, 1, 1] as const,   // things leaving
} as const;

// -- CSS cubic-bezier strings (for vanilla CSS transitions) ---
export const EASE_CSS = {
  standard:   'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
} as const;

// -- Spring tokens (for Motion/framer-motion spring()) --------
export const SPRING = {
  snappy: { stiffness: 500, damping: 30 },
} as const;

// -- Signature mark timings -----------------------------------
export const MARK = {
  idleCycleMs:   7000,  // ~7s per idle breathing cycle
  activeCycleMs: 1200,  // faster during generation
} as const;

// -- Convenience: Motion transition presets -------------------
export const transition = {
  base:    { duration: DURATION.base,    ease: EASE.standard },
  fast:    { duration: DURATION.fast,    ease: EASE.standard },
  instant: { duration: DURATION.instant, ease: EASE.standard },
  slow:    { duration: DURATION.slow,    ease: EASE.standard },
  enter:   { duration: DURATION.base,    ease: EASE.decelerate },
  exit:    { duration: DURATION.fast,    ease: EASE.accelerate },
  snappy:  { type: 'spring' as const, ...SPRING.snappy },
} as const;
