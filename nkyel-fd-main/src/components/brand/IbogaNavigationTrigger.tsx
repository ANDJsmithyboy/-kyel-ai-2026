/**
 * SmartANDJ AI Ecosystem · Iboga Navigation Trigger
 * Reusable interaction signature for opening/closing main product navigation
 *
 * Products: Ñkyel AI + Gaboma AI
 * Shared UI Interaction Signature
 */

'use client';

import React from 'react';
import { IbogaGlyph } from './IbogaGlyph';

export interface IbogaNavigationTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  onToggle?: () => void;
  glyphSize?: number;
  label?: string;
  variant?: 'desktop' | 'mobile' | 'header' | 'floating';
  className?: string;
}

export const IbogaNavigationTrigger = React.forwardRef<HTMLButtonElement, IbogaNavigationTriggerProps>(
  (
    {
      open = false,
      onToggle,
      onClick,
      glyphSize = 20,
      label,
      variant = 'desktop',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(e);
      if (onToggle) onToggle();
    };

    const computedLabel =
      label || (open ? 'Fermer la navigation' : 'Ouvrir la navigation');

    // Touch targets: minimum 44x44px for mobile, 36-40px for desktop
    const baseTargetClass =
      variant === 'mobile'
        ? 'h-11 w-11 min-h-[44px] min-w-[44px]'
        : 'h-9 w-9 min-h-[36px] min-w-[36px]';

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-label={computedLabel}
        aria-expanded={open}
        title={computedLabel}
        className={`group relative inline-flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${baseTargetClass} ${className}`}
        style={{
          color: 'var(--text-secondary)',
          background: 'transparent',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--hover, rgba(255, 255, 255, 0.05))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }}
        {...props}
      >
        <IbogaGlyph
          size={glyphSize}
          open={open}
          className="transition-colors duration-150 group-hover:text-[var(--text-primary)]"
        />
      </button>
    );
  }
);

IbogaNavigationTrigger.displayName = 'IbogaNavigationTrigger';

export default IbogaNavigationTrigger;
