/**
 * Gaboma AI · Sidebar.tsx · Client Component (orchestrateur)
 * SmartANDJ AI Technologies
 * Sidebar principale — mobile slide-in + desktop permanent.
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import SidebarOverlay from './SidebarOverlay';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import SidebarRecent from './SidebarRecent';
import SidebarFooter from './SidebarFooter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    tier: 'FREE' | 'NYEL' | 'WANDANA' | 'ONYX' | 'BLACK_PANTHER' | 'BLUE_PANTHER';
  };
  recentChats: Array<{ id: string; title: string; updatedAt: Date }>;
}

export default function Sidebar({ isOpen, onClose, user, recentChats }: SidebarProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Mobile backdrop */}
      <SidebarOverlay isOpen={isOpen} onClose={onClose} />

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 300, damping: 30 }
        }
        className="fixed left-0 top-0 z-50 flex h-full flex-col lg:z-30 lg:translate-x-0"
        style={{
          width: 280,
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
        }}
        /* Desktop: always visible, ignore isOpen */
        {...({
          'data-sidebar': 'true',
        })}
      >
        <SidebarHeader />
        <SidebarNav />
        <SidebarRecent chats={recentChats} />
        <SidebarFooter user={user} />
      </motion.aside>

      {/* Desktop spacer — pushes content right */}
      <div className="hidden lg:block lg:w-[260px] lg:flex-shrink-0" />

      {/* CSS override: desktop always visible */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          [data-sidebar="true"] {
            transform: translateX(0) !important;
            width: 260px !important;
          }
        }
      `}</style>
    </>
  );
}
