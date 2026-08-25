/**
 * SmartANDJ Ecosystem · Iboga UI Signature Glyph
 * Canonical Cross-Product Interaction Signature (Ñkyel AI & Gaboma AI)
 *
 * Abstract, geometric, minimal Iboga-inspired UI glyph.
 * Designed with Apple precision, Geist clarity, and Luma simplicity.
 * Legible at 16px, 18px, 20px, 22px, 24px, 32px.
 *
 * Theme-safe: Uses stroke="currentColor" and fill="none".
 */

import React from 'react';

export interface IbogaGlyphProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  open?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function IbogaGlyph({
  size = 20,
  open = false,
  strokeWidth = 1.75,
  className = '',
  style,
  ...props
}: IbogaGlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`iboga-glyph inline-block shrink-0 transition-transform duration-200 ease-out select-none ${
        open ? 'iboga-glyph--open' : 'iboga-glyph--closed'
      } ${className}`}
      style={{
        transform: open ? 'rotate(-6deg) scale(0.96)' : 'rotate(0deg) scale(1)',
        transformOrigin: '50% 50%',
        ...style,
      }}
      {...props}
    >
      {/* Central Stem & Intelligence Apex */}
      <path d="M12 3.5V15.5" />
      <path d="M10.2 4.8C11 3.8 12 3.5 12 3.5C12 3.5 13 3.8 13.8 4.8" />

      {/* Left Foliole (Ancestral Knowledge & Cognition) */}
      <path
        d="M12 10.2C8.8 8.8 6.8 10 6 11.6C8.2 12.4 10.6 11.8 12 11"
        className="transition-transform duration-200"
        style={{
          transform: open ? 'translateY(-0.5px) rotate(-2deg)' : 'none',
          transformOrigin: '12px 10.2px',
        }}
      />

      {/* Right Foliole (Autonomous Intelligence & Growth) */}
      <path
        d="M12 7.8C15.2 6.4 17.2 7.6 18 9.2C15.8 10 13.4 9.4 12 8.6"
        className="transition-transform duration-200"
        style={{
          transform: open ? 'translateY(-0.5px) rotate(2deg)' : 'none',
          transformOrigin: '12px 7.8px',
        }}
      />

      {/* Root / Ground Neural Network (Sovereign Foundations) */}
      <path d="M12 15.5C9.8 17.2 7.5 18.2 5.5 18.8" />
      <path d="M12 15.5C14.2 17.2 16.5 18.2 18.5 18.8" />
      <path d="M12 15.5V19.8" />
    </svg>
  );
}

export default IbogaGlyph;
