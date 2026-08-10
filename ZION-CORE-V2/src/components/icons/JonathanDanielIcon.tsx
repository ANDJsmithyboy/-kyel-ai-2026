import { SVGProps } from "react";

export const JonathanDanielIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M7.5 2.5L12.5 7.5L7.5 12.5L2.5 7.5Z" />
    <path d="M8 2V11A3.5 3.5 0 0 1 4.5 13" />
    <path d="M8 4A3 3 0 0 1 8 10" />
  </svg>
);
