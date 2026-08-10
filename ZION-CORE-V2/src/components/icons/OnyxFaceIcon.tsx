import { SVGProps } from "react";

export const OnyxFaceIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2.5 5.5 L2 2.5 L5 4" />
    <path d="M12.5 5.5 L13 2.5 L10 4" />
    <path d="M5 4 H10 L12.5 6.5 L11.5 10.5 L7.5 13 L3.5 10.5 L2.5 6.5 Z" />
    <path d="M4.5 6.5 L6 7" />
    <path d="M10.5 6.5 L9 7" />
    <path d="M6.5 9 H8.5 L7.5 10 Z" />
    <path d="M7.5 10 V11" />
  </svg>
);
