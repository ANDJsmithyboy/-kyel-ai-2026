/**
 * Ñkyel AI — PantherMissionGlyph (Canonical "Nouvelle mission" Glyph)
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 *
 * Minimalist proprietary two-panther-paw navigation glyph.
 * Evokes forward movement, agent mission launch, agility, African identity.
 *
 * Geometry:
 * - Exactly two crisp panther paw impressions in diagonal motion
 *   (Paw 1 slightly upper-left, Paw 2 slightly lower-right).
 * - Optimized for 16px, 18px, 20px, 22px, 24px with high contrast and optical balance.
 */

'use client';

import React from 'react';

export interface PantherMissionGlyphProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const PantherMissionGlyph = React.forwardRef<SVGSVGElement, PantherMissionGlyphProps>(
  ({ size = 18, className = '', style, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`panther-mission-glyph shrink-0 ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
        aria-hidden="true"
        {...props}
      >
        {/* ── PAW 1 (Leading Upper-Left Impression) ── */}
        {/* Main Plantar Pad */}
        <path d="M7.4 7.2C8.6 7.2 9.6 8.1 9.6 9.3C9.6 10.7 8.5 11.8 7.4 11.8C6.3 11.8 5.2 10.7 5.2 9.3C5.2 8.1 6.2 7.2 7.4 7.2Z" />
        {/* 4 Digital Toe Pads */}
        <circle cx="4.5" cy="6.8" r="0.95" />
        <circle cx="6.4" cy="4.8" r="1.05" />
        <circle cx="8.7" cy="4.9" r="1.05" />
        <circle cx="10.5" cy="6.9" r="0.95" />

        {/* ── PAW 2 (Advancing Lower-Right Impression) ── */}
        {/* Main Plantar Pad */}
        <path d="M16.6 15.2C17.8 15.2 18.8 16.1 18.8 17.3C18.8 18.7 17.7 19.8 16.6 19.8C15.5 19.8 14.4 18.7 14.4 17.3C14.4 16.1 15.4 15.2 16.6 15.2Z" />
        {/* 4 Digital Toe Pads */}
        <circle cx="13.7" cy="14.8" r="0.95" />
        <circle cx="15.6" cy="12.8" r="1.05" />
        <circle cx="17.9" cy="12.9" r="1.05" />
        <circle cx="19.7" cy="14.9" r="0.95" />
      </svg>
    );
  }
);

PantherMissionGlyph.displayName = 'PantherMissionGlyph';

export default PantherMissionGlyph;
