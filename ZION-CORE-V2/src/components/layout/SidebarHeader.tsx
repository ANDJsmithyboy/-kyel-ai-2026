/**
 * Gaboma AI · SidebarHeader.tsx
 * SmartANDJ AI Technologies
 * Logo GabomaAI (gauche) + IbogaAI toggle (droite) + dot live pulsant.
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GabomaAILogo } from '@/components/icons';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { useSidebarStore } from '@/stores/sidebar';

export default function SidebarHeader() {
  const shouldReduceMotion = useReducedMotion();
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div
      className="group flex h-[52px] flex-shrink-0 items-center justify-between px-4"
    >
      {/* LEFT — GabomaAI Logo + Wordmark */}
      <div className="flex items-center gap-2">
        <GabomaAILogo
          width={24}
          height={24}
        />
        <span
          className="select-none text-[14px] font-bold uppercase"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}
        >
          GABOMA AI
        </span>
      </div>

      {/* RIGHT — IbogaAI toggle button + Live dot */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.background = 'var(--accent-06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Replier la barre latérale"
        >
          <IbogaAiIcon width={18} height={18} />
        </button>

        {/* Live dot */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: [1, 0.5, 1] }
              : { scale: [1, 1.3, 1] }
          }
          transition={{
            duration: 2,
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
