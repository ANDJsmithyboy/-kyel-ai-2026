import React from 'react';

export const OmbreIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><path d="M24,8 C16,8 10,14 10,22 V38 L14,34 L18,38 L22,34 L26,38 L30,34 L34,38 L38,34 V22 C38,14 32,8 24,8 Z" fill="currentColor" fillOpacity="0.85"/><circle cx="18" cy="22" r="2.1" fill="var(--surface-inverse, #020304)"/><circle cx="30" cy="22" r="2.1" fill="var(--surface-inverse, #020304)"/>
  </svg>
);
