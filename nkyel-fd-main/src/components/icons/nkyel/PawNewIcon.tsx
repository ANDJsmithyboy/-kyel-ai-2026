import React from 'react';

export const PawNewIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><ellipse cx="24" cy="31" rx="10" ry="8" fill="currentColor"/><circle cx="13" cy="17" r="4.2" fill="currentColor"/><circle cx="21" cy="10" r="4.6" fill="currentColor"/><circle cx="29" cy="10" r="4.6" fill="currentColor"/><circle cx="37" cy="17" r="4.2" fill="currentColor"/>
  </svg>
);
