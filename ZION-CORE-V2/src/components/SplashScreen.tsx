/* GabomaGPT · SplashScreen.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Splash screen cinematique — gere par React (pas de DOM manipulation directe) */
'use client';

import { useState, useEffect } from 'react';

const SmartAndJTechIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9.5 2.5L5.5 6.5H9L4.5 11.5" />
    <path d="M1.5 6H3.5" />
    <path d="M1.5 9H3.5" />
    <path d="M11.5 6H13.5" />
    <path d="M11.5 9H13.5" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 800);
    const removeTimer = setTimeout(() => setVisible(false), 1400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: '#080B12',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <img
        src="/gabomagpt-logo.jpeg"
        alt="GabomaGPT"
        className="splash-logo w-auto h-28 rounded-[22px]"
      />
      <div
        className="splash-title mt-6 text-[28px] font-bold tracking-tight text-[#F0F4FF]"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Mbolo !
      </div>
      <div
        className="splash-subtitle mt-2 text-[13px] text-[#8A9BBE] whitespace-nowrap"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        GabomaGPT — IA Souveraine du Gabon
      </div>

      <div className="absolute bottom-10 opacity-80" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-[11px] tracking-wide">
          Gaboma AI peut faire des erreurs. Votre discernement reste souverain.
        </span>
      </div>
    </div>
  );
}
