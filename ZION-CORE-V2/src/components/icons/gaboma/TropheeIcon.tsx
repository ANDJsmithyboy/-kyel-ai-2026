import React from 'react';

export const TropheeIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><path d="M15,10 H33 V17 C33,24 28.5,28 24,28 C19.5,28 15,24 15,17 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M15,12 C9,12 9,20 15,19.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M33,12 C39,12 39,20 33,19.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><rect x="22" y="28" width="4" height="7" fill="currentColor"/><rect x="16" y="36" width="16" height="3.4" rx="1" fill="currentColor"/>
  </svg>
);
