/* GabomaGPT · AuroraBackground.tsx · SmartANDJ AI Technologies
   Arrière-plan dynamique "Aurora" avec halos animés et texture grain */
'use client';

import React from 'react';
import { useSettingsStore } from '@/stores/settings.store';

export default function AuroraBackground() {
  const { theme, blackPantherMode } = useSettingsStore();

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden bg-[var(--zc-background)] transition-colors duration-700">
      
      {/* Halo 1 - Top Left */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-60 mix-blend-screen"
        style={{
          background: 'var(--aurora-glow-1)',
          filter: 'blur(120px)',
          animation: 'aurora-drift 12s ease-in-out infinite alternate',
        }}
      />
      
      {/* Halo 2 - Bottom Right */}
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-60 mix-blend-screen"
        style={{
          background: 'var(--aurora-glow-2)',
          filter: 'blur(140px)',
          animation: 'aurora-drift 15s ease-in-out infinite alternate-reverse',
        }}
      />
      
      {/* Halo 3 - Center (Bathing light) */}
      <div 
        className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-40 mix-blend-screen"
        style={{
          background: 'var(--aurora-glow-3)',
          filter: 'blur(160px)',
          animation: 'aurora-breathe 8s ease-in-out infinite',
        }}
      />

      {/* Grain Overlay */}
      <div className="absolute inset-0 grain-overlay opacity-[0.03] dark:opacity-[0.015]" />
    </div>
  );
}
