/**
 * Nkyel AI · EnergyGauge (Énergie Quotidienne)
 * SmartANDJ AI Technologies
 */

'use client';

import { motion } from 'framer-motion';

interface EnergyGaugeProps {
  used: number;
  total: number;
}

export default function EnergyGauge({ used, total }: EnergyGaugeProps) {
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const fillColor = pct > 50 ? 'var(--accent)' : pct > 20 ? 'var(--warning)' : 'var(--error)';

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
          ⚡ Énergie Quotidienne
        </span>
      </div>

      {/* Barre */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--control-bg)', border: '1px solid var(--border)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        />
      </div>

      <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)' }}>
        {remaining} / {total} crédits
      </p>
    </div>
  );
}
