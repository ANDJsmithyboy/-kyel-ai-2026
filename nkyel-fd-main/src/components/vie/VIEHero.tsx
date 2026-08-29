import React from 'react';
import { Eye, Brain, Lightning, ShieldCheck } from '@phosphor-icons/react';

export function VIEHero() {
  return (
    <div className="relative w-full rounded-[24px] bg-[var(--surface-1,var(--surface))] border border-[var(--border)] overflow-hidden shadow-lg mb-8">
      
      {/* Decorative Glow/Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)] opacity-5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-stretch">
        
        {/* Left: Illustration Area */}
        <div className="w-full md:w-2/5 min-h-[280px] p-8 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-[var(--border)]">
          {/* Placeholder for the Panther Illustration */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#ffffff03] dark:to-[#ffffff02]"></div>
          
          {/* SVG Placeholder representing Panther / Abstract shapes if asset is missing */}
          <svg className="w-48 h-48 opacity-30 text-[var(--accent)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 160 C 20 120, 60 40, 140 30 C 180 25, 190 60, 160 100 C 120 140, 100 180, 40 160 Z" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="140" cy="70" r="4" fill="currentColor" className="animate-pulse" />
          </svg>
        </div>

        {/* Right: Statement & Pillars */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          
          {/* Statement */}
          <div className="mb-12 max-w-lg">
            <h1 className="text-2xl md:text-3xl font-serif text-[var(--text-primary)] leading-snug mb-3">
              VIE voit, comprend et agit.
              <br />
              Chaque décision est traçable.
            </h1>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Perception */}
            <div className="flex flex-col gap-3">
              <Eye size={24} className="text-[var(--text-secondary)]" weight="light" />
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                  Perception
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight">
                  Voir le réel
                </p>
              </div>
            </div>

            {/* Intention */}
            <div className="flex flex-col gap-3">
              <Brain size={24} className="text-[var(--text-secondary)]" weight="light" />
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                  Intention
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight">
                  Comprendre le sens
                </p>
              </div>
            </div>

            {/* Execution */}
            <div className="flex flex-col gap-3">
              <Lightning size={24} className="text-[var(--text-secondary)]" weight="light" />
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                  Exécution
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight">
                  Agir avec précision
                </p>
              </div>
            </div>

            {/* Evidence */}
            <div className="flex flex-col gap-3">
              <ShieldCheck size={24} className="text-[var(--text-secondary)]" weight="light" />
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                  Preuve
                </h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-tight">
                  Prouver chaque résultat
                </p>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
