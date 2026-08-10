import { SVGProps } from "react";

export const SmartAndJTechIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9.5 2.5L5.5 6.5H9L4.5 11.5" />
    <path d="M1.5 6H3.5" />
    <path d="M1.5 9H3.5" />
    <path d="M11.5 6H13.5" />
    <path d="M11.5 9H13.5" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
