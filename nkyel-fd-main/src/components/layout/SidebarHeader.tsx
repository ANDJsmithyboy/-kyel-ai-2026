/**
 * Ñkyel AI · SidebarHeader.tsx
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * Wordmark-First Ñkyel + Iboga Navigation Signature
 */

'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar';
import { IbogaNavigationTrigger } from '@/components/brand';

export default function SidebarHeader() {
  const shouldReduceMotion = useReducedMotion();
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div className="group flex h-[52px] flex-shrink-0 items-center justify-between px-4 border-b border-white/[0.04]">
      {/* LEFT — Wordmark-first Ñkyel */}
      <div className="flex items-center gap-2">
        <span
          className="select-none text-[16px] font-bold tracking-tight text-[var(--text-primary)]"
          style={{
            letterSpacing: '-0.025em',
          }}
        >
          Ñkyel
        </span>
      </div>

      {/* RIGHT — Iboga Navigation Trigger + Live pulse dot */}
      <div className="flex items-center gap-2">
        <IbogaNavigationTrigger
          open={true}
          onToggle={toggle}
          glyphSize={18}
          variant="desktop"
          title="Replier la barre latérale"
          label="Replier la barre latérale"
        />

        {/* Live status dot */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: [1, 0.5, 1] }
              : { scale: [1, 1.25, 1] }
          }
          transition={{
            duration: 2.2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          className="h-2 w-2 rounded-full"
          style={{ background: 'var(--accent)' }}
          aria-label="Système actif"
        />
      </div>
    </div>
  );
}
