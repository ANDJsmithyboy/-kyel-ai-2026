import React from 'react';

export const PawHistoryIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><g opacity="0.65" stroke="currentColor" strokeWidth="1.6" fill="none"><ellipse cx="24" cy="32" rx="6.5" ry="5"/><circle cx="17" cy="21" r="2.7"/><circle cx="21.5" cy="16" r="3"/><circle cx="26.5" cy="16" r="3"/><circle cx="31" cy="21" r="2.7"/></g>
  </svg>
);
