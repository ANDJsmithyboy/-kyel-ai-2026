/**
 * GabomaAI · WandanaToggle
 * Toggle standalone WANDANA — réutilisable.
 */

'use client';

import { motion } from 'framer-motion';
import { IconWandana } from '../icons/IconWandana';

interface WandanaToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function WandanaToggle({ enabled, onToggle }: WandanaToggleProps) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label="Activer WANDANA — Recherche web"
      className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300"
      style={{
        background: enabled ? 'rgba(31, 157, 107, 0.10)' : 'transparent',
        borderLeft: enabled ? '2px solid #1F9D6B' : '2px solid transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <IconWandana
          className={`w-5 h-5 transition-colors duration-300 ${
            enabled ? 'text-[#1F9D6B]' : 'text-[var(--text-secondary,#8A8378)]'
          }`}
        />
        <div className="flex flex-col text-left">
          <span
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-primary, #EDEAE3)' }}
          >
            WANDANA
          </span>
          <span
            className="text-[11px]"
            style={{ color: 'var(--text-secondary, #8A8378)' }}
          >
            Recherche web & vidéo
          </span>
        </div>
      </div>

      {/* Toggle switch */}
      <div
        className="w-11 h-6 rounded-full p-0.5 transition-colors duration-300"
        style={{
          background: enabled ? '#1F9D6B' : 'rgba(138,131,120,0.3)',
        }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          style={{
            marginLeft: enabled ? 'auto' : '0',
          }}
        />
      </div>
    </button>
  );
}
