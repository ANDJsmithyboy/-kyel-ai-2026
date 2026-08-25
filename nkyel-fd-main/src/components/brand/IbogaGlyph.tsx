/**
 * SmartANDJ AI Ecosystem · Iboga Navigation Signature
 * Canonical Abstract Geometric Iboga Glyph
 *
 * Products: Ñkyel AI + Gaboma AI
 * Shared UI Interaction Signature (Wordmark-first shell, Navigation Trigger)
 */

'use client';

import React from 'react';

export interface IbogaGlyphProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  open?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const IbogaGlyph = React.forwardRef<SVGSVGElement, IbogaGlyphProps>(
  ({ size = 20, open = false, strokeWidth = 1.75, className = '', style, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`iboga-glyph ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          transform: open ? 'rotate(8deg) scale(0.96)' : 'rotate(0deg) scale(1)',
          transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms ease',
          transformOrigin: 'center center',
          ...style,
        }}
        aria-hidden="true"
        {...props}
      >
        {/* Central Stem */}
        <path d="M12 3.5V17.5" />

        {/* Upper Right Subtle Organic Leaf */}
        <path
          d="M12 8.5C14.8 6.8 17.5 7.2 19 8.5C17.2 10.2 14.8 10.2 12 8.5Z"
          style={{
            transform: open ? 'translateX(0.5px)' : 'none',
            transition: 'transform 180ms ease',
          }}
        />

        {/* Mid Left Subtle Organic Leaf */}
        <path
          d="M12 11.5C9.2 9.8 6.5 10.2 5 11.5C6.8 13.2 9.2 13.2 12 11.5Z"
          style={{
            transform: open ? 'translateX(-0.5px)' : 'none',
            transition: 'transform 180ms ease',
          }}
        />

        {/* Lower Root & Intelligence Network Gesture */}
        <path d="M7.5 20.5C9.5 18.8 10.8 17.8 12 17.5C13.2 17.8 14.5 18.8 16.5 20.5" />
        <path d="M12 17.5V21" />
      </svg>
    );
  }
);

IbogaGlyph.displayName = 'IbogaGlyph';

export default IbogaGlyph;
