/**
 * GabomaAI · MessageUser
 * SmartANDJ AI Technologies
 * Task 7 — Bulle utilisateur alignée droite
 */

'use client';

import { motion } from 'framer-motion';
import type { GabomaMessage } from '@/lib/models';

interface MessageUserProps {
  message: GabomaMessage;
}

export default function MessageUser({ message }: MessageUserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div
        className="max-w-[80%] md:max-w-[65%] px-5 py-3.5 text-[var(--text-sm)] bg-[var(--accent-10)] border hairline-border text-[var(--text-primary)] shadow-md tracking-wide"
        style={{
          borderRadius: '24px 24px 6px 24px',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
