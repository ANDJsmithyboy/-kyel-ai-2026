import { SVGProps } from "react";

export const EnPisteIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 10 C3 9 5 9 5 10 C5 11 3 11 3 10 Z" />
    <circle cx="2.5" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="4" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="5.5" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M9 4 C9 3 11 3 11 4 C11 5 9 5 9 4 Z" />
    <circle cx="8.5" cy="2.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="10" cy="1.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="11.5" cy="2.5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);
