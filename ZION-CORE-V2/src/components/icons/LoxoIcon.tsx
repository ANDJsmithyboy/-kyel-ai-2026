import { SVGProps } from "react";

export const LoxoIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M5 4C2 4 1 6 2 9.5C2.5 11 4.5 10.5 5 9" />
    <path d="M10 4C13 4 14 6 13 9.5C12.5 11 10.5 10.5 10 9" />
    <path d="M5 4H10" />
    <path d="M6.5 9V12C6.5 13 8.5 13 8.5 12V9" />
    <path d="M5.5 10L4.5 11.5" />
    <path d="M9.5 10L10.5 11.5" />
    <path d="M5.5 6.5h0.01" />
    <path d="M9.5 6.5h0.01" />
  </svg>
);
