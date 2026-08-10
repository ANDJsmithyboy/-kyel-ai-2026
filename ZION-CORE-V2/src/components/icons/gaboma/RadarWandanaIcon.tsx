import React from 'react';

export const RadarWandanaIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/><circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55"/><circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/><path d="M24,24 L24,6 A18,18 0 0 1 38,15 Z" fill="currentColor" fillOpacity="0.22"/><circle cx="24" cy="24" r="2.3" fill="currentColor"/>
  </svg>
);
