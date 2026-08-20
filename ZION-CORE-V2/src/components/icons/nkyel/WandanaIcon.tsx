import React from 'react';

export const WandanaIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><ellipse cx="10" cy="20" rx="6.5" ry="7.5" fill="currentColor" fillOpacity="0.55"/><ellipse cx="27" cy="27" rx="13" ry="9.5" fill="currentColor"/><circle cx="15" cy="21" r="8" fill="currentColor"/><path d="M9,23 C5,25 4.5,31 7.5,36 C8.5,37.5 10.5,37.3 10.3,35.2" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/><rect x="18" y="35" width="3.2" height="8" rx="1.4" fill="currentColor"/><rect x="24" y="35.5" width="3.2" height="8" rx="1.4" fill="currentColor"/><rect x="31" y="35.5" width="3.2" height="8" rx="1.4" fill="currentColor"/><rect x="36" y="34.5" width="3.2" height="8" rx="1.4" fill="currentColor"/><circle cx="17.5" cy="19" r="1.1" fill="var(--surface-inverse, #020304)"/>
  </svg>
);
