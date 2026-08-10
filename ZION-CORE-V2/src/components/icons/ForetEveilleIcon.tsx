import { SVGProps } from "react";

export const ForetEveilleIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M7.5 1.5L2.5 7.5H12.5Z" />
    <path d="M7.5 4.5L3.5 10.5H11.5Z" />
    <path d="M7.5 10.5V13.5" />
  </svg>
);
