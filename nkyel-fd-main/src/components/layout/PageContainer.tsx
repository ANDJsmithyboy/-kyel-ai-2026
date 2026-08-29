/**
 * Ñkyel AI · Canonical Page Container
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Provides standardized dimensional variants and responsive horizontal padding
 * to guarantee global frontend visual coherence across all routes.
 *
 * Variants:
 * - 'reading': max-w-[840px] (Chat reading column, focused text, simple forms)
 * - 'standard': max-w-[1140px] (Settings, account, dashboards)
 * - 'wide': max-w-[1360px] (Connectors, Sanctuary, Protocols, VIE, Live Flow)
 * - 'full': w-full (WorkGraph, full-width canvas, interactive studios)
 */

'use client';

import React from 'react';

export type PageContainerVariant = 'reading' | 'standard' | 'wide' | 'full';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: PageContainerVariant;
  className?: string;
  noPadding?: boolean;
}

const VARIANT_MAX_WIDTH: Record<PageContainerVariant, string> = {
  reading: 'max-w-[840px]',
  standard: 'max-w-[1140px]',
  wide: 'max-w-[1360px]',
  full: 'w-full max-w-none',
};

export default function PageContainer({
  children,
  variant = 'wide',
  className = '',
  noPadding = false,
}: PageContainerProps) {
  const maxWidthClass = VARIANT_MAX_WIDTH[variant];
  const paddingClass = noPadding
    ? ''
    : 'px-4 sm:px-6 md:px-8 xl:px-10 py-4 sm:py-6';

  return (
    <div
      className={`w-full mx-auto ${maxWidthClass} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
}
