/**
 * GabomaAI · SidebarBackdrop
 * SmartANDJ AI Technologies
 * Mobile overlay backdrop — click to close
 */

'use client';

import styles from './sidebar.module.css';

interface SidebarBackdropProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SidebarBackdrop({ isVisible, onClose }: SidebarBackdropProps) {
  return (
    <div
      className={styles.backdrop}
      data-visible={isVisible}
      aria-hidden="true"
      tabIndex={-1}
      onClick={onClose}
    />
  );
}
