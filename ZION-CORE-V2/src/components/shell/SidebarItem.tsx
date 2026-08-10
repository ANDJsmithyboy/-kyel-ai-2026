/**
 * GabomaAI · SidebarItem
 * SmartANDJ AI Technologies
 * Accepts ReactNode icons (SVG components) or string emojis
 */

'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export default function SidebarItem({ label, icon, href, active, badge, badgeColor, onClick }: SidebarItemProps) {
  const Wrapper = href ? 'a' : 'button';
  const wrapperProps = href ? { href } : { type: 'button' as const, onClick };

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Wrapper
        {...wrapperProps}
        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors text-left"
        style={{
          background: active ? 'var(--accent-10)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {icon && <span className="text-sm flex-shrink-0">{icon}</span>}
        <span className="truncate flex-1">{label}</span>
        {badge && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
            style={{
              background: badgeColor ? `${badgeColor}15` : 'var(--accent-06)',
              color: badgeColor ?? 'var(--text-tertiary)',
            }}
          >
            {badge}
          </span>
        )}
      </Wrapper>
    </motion.div>
  );
}
