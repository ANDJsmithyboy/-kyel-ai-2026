import { SVGProps } from "react";

export const IbogaAiIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2.5 13C4.5 11.5 6 10.5 7.5 10.5C9 10.5 10.5 11.5 12.5 13 M7.5 13V10.5 M7.5 10.5V6" />
    <path d="M7.5 6C5.5 4.5 4 3 2.5 2 M5.5 4.5L2.5 5" />
    <path d="M7.5 6C9.5 4.5 11 3 12.5 2 M9.5 4.5L12.5 5" />
    <path d="M7.5 6V2" />
    <circle cx="2.5" cy="2" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="2" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="2" r="0.8" fill="currentColor" stroke="none" />
    <path d="M12.5 8.5L13 7.5L13.5 8.5L14.5 9L13.5 9.5L13 10.5L12.5 9.5L11.5 9Z" fill="currentColor" stroke="none" />
  </svg>
);
