'use client';

import { Plus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function PlusMenu() {
  // TODO: Implement actual dropdown for LOXO and File upload
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 mb-1 ml-1 rounded-full flex items-center justify-center bg-black/40 border border-white/10 hover:bg-black/60 transition-colors shrink-0"
      title="Relever un indice / Menu"
    >
      <Plus size={18} weight="bold" className="text-[var(--text-primary)]" />
    </motion.button>
  );
}
