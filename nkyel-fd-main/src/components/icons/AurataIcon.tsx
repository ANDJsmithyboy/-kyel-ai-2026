import { SVGProps } from "react";

export const AurataIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 4 L10 2 L11 4 L13 5 L11 6" />
    <path d="M9 4 C6 5 4 6 3 8 C1.5 11 3 13 4 11" />
    <path d="M11 6 C9 10 7 13 6 13 L5 9" />
  </svg>
);
