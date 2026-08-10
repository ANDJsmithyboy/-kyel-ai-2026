import React from 'react';

export const RenduIcon = ({ size = 24, className = '', ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} {...props}><path d="M18,8 L30,8 L40,18 L24,42 L8,18 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><polygon points="20,11 28,11 24,19" fill="currentColor" fillOpacity="0.35"/><path d="M20,11 L28,11 M18,8 L20,11 M30,8 L28,11 M20,11 L24,42 M28,11 L24,42 M8,18 L20,11 M40,18 L28,11" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55"/>
  </svg>
);
