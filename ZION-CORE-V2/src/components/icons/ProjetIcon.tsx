/**
 * Gaboma AI · ProjetIcon — Dossier Projet ★
 * SmartANDJ AI Technologies
 * Icône "Projet" — dossier avec étoile (style Claude Projects)
 */

import { SVGProps } from 'react';

export const ProjetIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 15 15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Corps du dossier */}
    <path d="M1.5 4.5V12.5C1.5 13.1 2 13.5 2.5 13.5H12.5C13 13.5 13.5 13.1 13.5 12.5V5.5C13.5 4.9 13 4.5 12.5 4.5H7.5L6 2.5H2.5C2 2.5 1.5 3 1.5 3.5V4.5Z" />
    {/* Étoile centrale parfaitement centrée */}
    <path
      d="M7.5 6.3 L8.1 7.7 L9.6 7.7 L8.4 8.6 L8.8 10 L7.5 9.1 L6.2 10 L6.6 8.6 L5.4 7.7 L6.9 7.7 Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);
