/**
 * GabomaAI · SidebarItem
 * SmartANDJ AI Technologies
 * Reusable interactive row — expanded & collapsed states
 */

'use client';

import type { ReactNode } from 'react';
import styles from './sidebar.module.css';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function SidebarItem({
  icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
  className = '',
}: SidebarItemProps) {
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${styles.itemCollapsed} ${isActive ? styles.itemCollapsedActive : ''} ${className}`}
        aria-label={label}
      >
        {icon}
        <span className={styles.tooltip}>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.item} ${isActive ? styles.itemActive : ''} ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={styles.itemIcon}>{icon}</span>
      <span className={styles.sidebarLabel}>{label}</span>
    </button>
  );
}
