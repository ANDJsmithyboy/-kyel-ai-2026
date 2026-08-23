'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'ghost',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-[var(--accent)] text-[var(--text-primary)] border-transparent shadow-[var(--shadow-sm)] hover:bg-[color-mix(in srgb, var(--accent) 20%, #ffffff)]',
        variant === 'secondary' && 'bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.08)]',
        variant === 'ghost' && 'bg-transparent text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)]',
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        className,
      )}
      {...props}
    />
  );
}
