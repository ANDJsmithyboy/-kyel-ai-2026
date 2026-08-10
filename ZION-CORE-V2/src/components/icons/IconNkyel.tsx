import { SVGProps } from 'react';

export const IconNkyel = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 15 15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Corps streamline — du rostre à la queue */}
    <path d="M2 11C4 7 9 2 13 4.5" />
    {/* Bec / rostre */}
    <path d="M13 4.5C13.5 5 12.5 6.5 11 7.5" />
    {/* Ventre */}
    <path d="M11 7.5C8 9 7.5 7.5 7 8" />
    <path d="M7 8C5 9.5 3 10.5 2 11" />
    {/* Nageoire caudale — 2 lobes */}
    <path d="M2 11L1 9.5" />
    <path d="M2 11L1 12.5" />
    {/* Oeil */}
    <circle cx="11.5" cy="5.5" r="0.4" fill="currentColor" stroke="none" />
    {/* Nageoire dorsale — triangle distinctif */}
    <path d="M8 5.5L7 3.5L6.5 5.5" strokeWidth="1" />
  </svg>
);
