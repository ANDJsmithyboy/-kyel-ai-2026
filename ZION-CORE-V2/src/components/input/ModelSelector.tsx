/**
 * GabomaAI · ModelSelector (Vecteur de Force)
 * SmartANDJ AI Technologies
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODEL_META, type GabomaModel } from '@/lib/models';

interface ModelSelectorProps {
  value: GabomaModel;
  onChange: (model: GabomaModel) => void;
  isPioneer?: boolean;
}

export default function ModelSelector({ value, onChange, isPioneer = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = MODEL_META[value];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#C5A059',
          cursor: 'pointer',
        }}
      >
        <span>{meta.icon}</span>
        {meta.label}
        <span className="text-[10px]" style={{ color: '#525258' }}>▾</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 p-1.5 rounded-xl z-50"
            style={{
              background: '#131618',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              minWidth: 220,
            }}
          >
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#525258' }}>
              Vecteur de Force
            </p>
            {(Object.entries(MODEL_META) as [GabomaModel, typeof MODEL_META[GabomaModel]][]).map(([key, m]) => {
              const locked = m.tier > 0 && !isPioneer;
              return (
                <motion.button
                  key={key}
                  whileHover={locked ? {} : { x: 2 }}
                  onClick={() => { if (!locked) { onChange(key); setOpen(false); } }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-[13px] transition-colors"
                  style={{
                    background: value === key ? 'rgba(197,160,89,0.08)' : 'transparent',
                    border: value === key ? '1px solid rgba(197,160,89,0.15)' : '1px solid transparent',
                    color: locked ? '#525258' : '#F0EDE6',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    opacity: locked ? 0.5 : 1,
                  }}
                  disabled={locked}
                >
                  <span>{m.icon}</span>
                  <div className="flex-1">
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-[11px] ml-1" style={{ color: '#8A8A92' }}>
                      — {m.desc}
                    </span>
                  </div>
                  {locked && (
                    <span className="text-[10px]" style={{ color: '#525258' }}>🔒 Pro</span>
                  )}
                  {!locked && (
                    <span className="text-[10px]" style={{ color: '#525258' }}>{m.credits}cr</span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
