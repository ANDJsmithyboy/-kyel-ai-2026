import React from 'react';

export const ProjetsIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><path d="M6,16 H18 L22,20 H42 V38 A2,2 0 0 1 40,40 H8 A2,2 0 0 1 6,38 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M31,25 L33,29 L37.5,29.5 L34.2,32.6 L35,37 L31,34.8 L27,37 L27.8,32.6 L24.5,29.5 L29,29 Z" fill="currentColor"/>
  </svg>
);
