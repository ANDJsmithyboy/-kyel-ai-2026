/**
 * GabomaAI · EnergyGauge (Énergie Quotidienne)
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
  const fillColor = pct > 50 ? '#C5A059' : pct > 20 ? '#FF8C00' : '#C0392D';

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8A8A92' }}>
          ⚡ Énergie Quotidienne
        </span>
      </div>

      {/* Barre */}
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        />
      </div>

      <p className="mt-1.5 text-[11px]" style={{ color: '#525258', fontFamily: 'var(--font-body)' }}>
        {remaining} / {total} crédits
      </p>
    </div>
  );
}
