'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GabomaModel } from '@/lib/models';
import { MODEL_META } from '@/lib/models';
import { IconAurata } from '../icons/IconAurata';
import { IconNkyel } from '../icons/IconNkyel';
import { IconOnyxGris } from '../icons/IconOnyxGris';
import { IconWandana } from '../icons/IconWandana';
import { IconBlackPanther } from '../icons/IconBlackPanther';

interface ModelBadgeProps {
  model: GabomaModel;
  isVisible: boolean;
  onDismiss: () => void;
}

export default function ModelBadge({ model, isVisible, onDismiss }: ModelBadgeProps) {
  const meta = MODEL_META[model];

  const getIcon = () => {
    switch(model) {
      case 'AURATA': return <IconAurata className="w-4 h-4" />;
      case 'NKYEL': return <IconNkyel className="w-4 h-4" />;
      case 'ONYXGRIS': return <IconOnyxGris className="w-4 h-4" />;
      case 'WANDANA': return <IconWandana className="w-4 h-4" />;
      case 'BLACK_PANTHER': return <IconBlackPanther className="w-4 h-4" />;
      case 'BLUE_PANTHER': return <IconBlackPanther className="w-4 h-4" style={{ color: '#0070F3' }} />;
      default: return <IconAurata className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          onClick={onDismiss}
          className="absolute left-1/2 -translate-x-1/2 bottom-[100%] mb-3 flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer shadow-lg backdrop-blur-xl z-50"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="text-[var(--accent)] flex items-center justify-center">
            {getIcon()}
          </div>
          <span className="text-[12px] font-semibold text-[var(--text-primary)] font-mono tracking-wide uppercase">
            {meta.label}
          </span>
          <span className="text-[12px] text-[var(--text-tertiary)]">·</span>
          <span className="text-[12px] text-[var(--text-secondary)]">
            {meta.desc}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
