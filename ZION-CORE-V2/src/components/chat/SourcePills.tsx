/**
 * GabomaAI · SourcePills
 * SmartANDJ AI Technologies
 * Task 7 — Chips de sources (Radar LOXO / Invoquer LOXO / Coffre-Fort)
 */

'use client';

import { motion } from 'framer-motion';
import type { GabomaSource } from '@/lib/models';

const SOURCE_ICONS: Record<GabomaSource['type'], string> = {
  loxo_web: '🌐',
  loxo_rag: '📚',
  coffre_fort: '🔐',
};

interface SourcePillsProps {
  sources: GabomaSource[];
}

export default function SourcePills({ sources }: SourcePillsProps) {
  if (!sources.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sources.map((src, i) => (
        <motion.button
          key={`${src.url}-${i}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => window.open(src.url, '_blank', 'noopener,noreferrer')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8A8A92',
            cursor: 'pointer',
          }}
        >
          {src.favicon ? (
            <img src={src.favicon} alt="" width={12} height={12} className="rounded-sm" />
          ) : (
            <span className="text-xs">{SOURCE_ICONS[src.type]}</span>
          )}
          <span className="truncate max-w-[140px]">{src.title}</span>
        </motion.button>
      ))}
    </div>
  );
}
