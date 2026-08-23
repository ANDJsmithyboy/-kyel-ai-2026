/**
 * Ñkyel AI · Véritable Logo Souverain à Sept Branches (Heptagramme / 7-ray star)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import React from 'react';

interface NkyelLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  glow?: boolean;
}

export function NkyelSeptBranchLogo({
  size = 24,
  glow = true,
  className = '',
  ...props
}: NkyelLogoProps) {
  // Calcul précis des 7 branches régulières (Heptagramme 7/2 ou 7/3)
  const center = 50;
  const outerRadius = 42;
  const innerRadius = 18;
  const numPoints = 7;
  const points: string[] = [];

  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  const polygonPoints = points.join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="nkyel-star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C39A52" />
          <stop offset="50%" stopColor="#665F9E" />
          <stop offset="100%" stopColor="#B8C0CC" />
        </linearGradient>
        {glow && (
          <filter id="nkyel-star-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Étoile à 7 branches */}
      <polygon
        points={polygonPoints}
        fill="url(#nkyel-star-gradient)"
        stroke="#F1EEE7"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={glow ? 'url(#nkyel-star-glow)' : undefined}
      />

      {/* Cœur central souverain */}
      <circle cx="50" cy="50" r="7" fill="#08090D" stroke="#C39A52" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill="#F1EEE7" />
    </svg>
  );
}

export default NkyelSeptBranchLogo;
