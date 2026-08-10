/**
 * Gaboma AI · Custom Icons · TSX
 * SmartANDJ AI Technologies
 * Icônes originales — NouvellePiste, Aurata, Ñkyel, OnyxGris, GabomaAgent, Wandana, Rendu, Projet
 */

import { SVGProps } from 'react';

/* 🐾 NOUVELLE PISTE — Empreinte de panthère */
export const NouvellePisteIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <ellipse cx="7.5" cy="10.2" rx="2.2" ry="1.65" />
    <ellipse cx="4.1" cy="7.5" rx="0.82" ry="1.05" transform="rotate(-15 4.1 7.5)" />
    <ellipse cx="6.2" cy="6.3" rx="0.82" ry="1" />
    <ellipse cx="8.8" cy="6.3" rx="0.82" ry="1" />
    <ellipse cx="10.9" cy="7.5" rx="0.82" ry="1.05" transform="rotate(15 10.9 7.5)" />
  </svg>
);

/* 🐱 AURATA — Chat doré */
export const AurataIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M3.5 6.5L2.5 3L6 5" />
    <path d="M11.5 6.5L12.5 3L9 5" />
    <path d="M6 5C4 5.5 3.5 7 3.5 8.5C3.5 10.8 5 12.5 7.5 12.5C10 12.5 11.5 10.8 11.5 8.5C11.5 7 11 5.5 9 5L6 5" />
    <path d="M5.5 8C5.5 7.3 6.3 7 6.8 7.5" />
    <path d="M9.5 8C9.5 7.3 8.7 7 8.2 7.5" />
    <path d="M7 9.5L7.5 10L8 9.5" />
    <path d="M2.5 9.2L5.2 8.8" strokeWidth="0.85" />
    <path d="M2.8 10.2L5.2 9.8" strokeWidth="0.85" />
    <path d="M12.5 9.2L9.8 8.8" strokeWidth="0.85" />
    <path d="M12.2 10.2L9.8 9.8" strokeWidth="0.85" />
  </svg>
);

/* 🐬 ÑKYEL — Dauphin (mode avancé) */
export const NkyelIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    {/* Corps streamline */}
    <path d="M2 11C4 7 9 2 13 4.5" />
    {/* Bec / rostre */}
    <path d="M13 4.5C13.5 5 12.5 6.5 11 7.5" />
    {/* Ventre */}
    <path d="M11 7.5C8 9 7.5 7.5 7 8" />
    <path d="M7 8C5 9.5 3 10.5 2 11" />
    {/* Nageoire caudale */}
    <path d="M2 11L1 9.5" />
    <path d="M2 11L1 12.5" />
    {/* Oeil */}
    <circle cx="11.5" cy="5.5" r="0.4" fill="currentColor" stroke="none" />
    {/* Nageoire dorsale — triangle distinctif */}
    <path d="M8 5.5L7 3.5L6.5 5.5" strokeWidth="1" />
  </svg>
);

/* 🦜 ONYXGRIS — Perroquet gris africain */
export const OnyxGrisIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M5 6.5C5 4 6.5 2 9 2.5C11 3 11.5 5 11 6.5" />
    <path d="M5 6.5C4 6.5 3.2 7.2 3.5 8.3C3.7 8.9 4.5 9 5.2 8.5" />
    <path d="M5.2 8.5C4.8 9.3 3.8 9.2 3.5 8.8" />
    <path d="M5 6.5L4.5 10C4.5 12 6 13.5 8 13.5C10 13.5 11.5 12 11 10L11 6.5" />
    <path d="M5 9.2C6.5 10.2 9.5 10.2 11 9.2" />
    <path d="M6.5 13.5L6 14.8" />
    <path d="M8 13.5V14.8" />
    <path d="M9.5 13.5L10 14.8" />
    <circle cx="9.2" cy="4.5" r="1.1" strokeWidth="0.7" />
    <circle cx="9.2" cy="4.5" r="0.42" fill="currentColor" stroke="none" />
  </svg>
);

/* 🕸️ GABOMA AGENT — Panthère multi-agent */
export const GabomaAgentIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path d="M4 5.5L4 3.5L5.5 4.5" />
    <path d="M11 5.5L11 3.5L9.5 4.5" />
    <path d="M5.5 4.5L9.5 4.5L11.5 6.5L11 9.5L7.5 11L4 9.5L3.5 6.5Z" />
    <circle cx="6" cy="7" r="0.42" fill="currentColor" stroke="none" />
    <circle cx="9" cy="7" r="0.42" fill="currentColor" stroke="none" />
    <path d="M7.5 4.5L7.5 1.2" />
    <path d="M11.5 6.5L14 4.8" />
    <path d="M11 9.5L13.5 11.5" />
    <path d="M4 9.5L1.5 11.5" />
    <path d="M3.5 6.5L1 4.8" />
    <circle cx="7.5" cy="1.2" r="0.65" fill="currentColor" stroke="none" />
    <circle cx="14" cy="4.8" r="0.65" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="11.5" r="0.65" fill="currentColor" stroke="none" />
    <circle cx="1.5" cy="11.5" r="0.65" fill="currentColor" stroke="none" />
    <circle cx="1" cy="4.8" r="0.65" fill="currentColor" stroke="none" />
  </svg>
);

/* 💎 RENDU — Diamant à facettes */
export { RenduIcon } from './RenduIcon';

/* 📁 PROJET — Dossier avec étoile */
export { ProjetIcon } from './ProjetIcon';
