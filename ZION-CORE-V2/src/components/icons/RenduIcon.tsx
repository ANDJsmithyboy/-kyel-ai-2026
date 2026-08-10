/**
 * Gaboma AI · RenduIcon — Diamant 💎
 * SmartANDJ AI Technologies
 * Icône "Le Rendu" — diamant à facettes géométriques
 */

import { SVGProps } from 'react';

export const RenduIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
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
    {/* Couronne supérieure */}
    <path d="M2.5 6L4.5 3H10.5L12.5 6" />
    {/* Ceinture horizontale */}
    <path d="M2.5 6H12.5" />
    {/* Pointe inférieure */}
    <path d="M2.5 6L7.5 13.5L12.5 6" />
    {/* Facettes intérieures — table */}
    <path d="M4.5 3L5.5 6" />
    <path d="M10.5 3L9.5 6" />
    <path d="M7.5 3V6" />
    {/* Facettes inférieures — pavillon */}
    <path d="M5.5 6L7.5 13.5" />
    <path d="M9.5 6L7.5 13.5" />
  </svg>
);
