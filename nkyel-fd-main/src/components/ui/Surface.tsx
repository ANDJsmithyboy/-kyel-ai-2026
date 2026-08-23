'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type MaterialType =
  | 'canvas'
  | 'content'
  | 'content-raised'
  | 'glass-regular'
  | 'glass-elevated'
  | 'glass-floating'
  | 'glass-clear'
  | 'overlay'
  | 'scrim';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  material?: MaterialType;
  as?: React.ElementType;
  interactive?: boolean;
}

/**
 * Surface — Composant fondamental du Système Matériel Ñkyel
 *
 * Implémente l'architecture stricte Apple Liquid Glass × Geist :
 * - LEVEL 0 : canvas (fond d'application)
 * - LEVEL 1 : content / content-raised (surfaces de contenu SOLIDES, zéro verre parasite)
 * - LEVEL 2 : glass-regular / glass-elevated / glass-floating (couche fonctionnelle en verre liquide)
 * - LEVEL 3 : glass-clear / overlay / scrim (couche transitoire / modale)
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ material = 'content', as: Component = 'div', interactive = false, className, children, ...props }, ref) => {
    const materialClasses: Record<MaterialType, string> = {
      'canvas': 'bg-[var(--material-canvas)] text-[var(--text-primary)]',
      'content': 'bg-[var(--material-content)] text-[var(--text-primary)] border border-[var(--border)]',
      'content-raised': 'bg-[var(--material-content-raised)] text-[var(--text-primary)] border border-[var(--border)] shadow-[var(--shadow-key)]',
      'glass-regular': 'bg-[var(--material-glass-regular)] text-[var(--text-primary)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--shadow-key)]',
      'glass-elevated': 'bg-[var(--material-glass-elevated)] text-[var(--text-primary)] backdrop-blur-2xl border border-[var(--border-strong)] shadow-[var(--shadow-ambient)]',
      'glass-floating': 'bg-[var(--material-glass-floating)] text-[var(--text-primary)] backdrop-blur-2xl border border-[var(--border-strong)] shadow-[var(--shadow-floating)]',
      'glass-clear': 'bg-[var(--material-glass-clear)] text-[var(--text-primary)] backdrop-blur-lg border border-[var(--glass-border)]',
      'overlay': 'bg-[var(--material-overlay)] backdrop-blur-md',
      'scrim': 'bg-[var(--material-scrim)] backdrop-blur-sm',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          materialClasses[material],
          interactive && 'transition-colors duration-150 hover:bg-[var(--hover)] active:bg-[var(--active)] cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Surface.displayName = 'Surface';

export default Surface;
