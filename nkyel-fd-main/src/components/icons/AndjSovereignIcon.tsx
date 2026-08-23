import { SVGProps } from "react";

export const AndjSovereignIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M7.5 2L2 12M7.5 2L13 12" />
    <path d="M11 3V11.5A1.5 1.5 0 0 1 8 11.5" />
    <path d="M4.5 7.5H11M4.5 7.5V12M11 7.5V10" />
  </svg>
);
