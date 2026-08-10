import { SVGProps } from "react";

export const ModeGrisIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 2 C11 2 12 3 12 4 C13 4 13.5 5 12.5 6 C12 6 11 5 11 4" />
    <path d="M9 2 C7 2 6 4 6 6 C6 9 7 10 8 10 L8 13" />
    <path d="M11 6 C11 9 10 10 8 10" />
    <path d="M7 6 L9 9" />
    <circle cx="10" cy="3.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
