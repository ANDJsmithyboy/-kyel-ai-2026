/**
 * Gaboma AI · SidebarOverlay.tsx · Client Component
 * SmartANDJ AI Technologies
 * Backdrop mobile — opacity animée, click to close.
 */

'use client';

import { motion } from 'framer-motion';

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-40 lg:hidden"
      initial={false}
      animate={{ opacity: isOpen ? 0.6 : 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: '#000',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      onClick={onClose}
      aria-hidden={!isOpen}
    />
  );
}
