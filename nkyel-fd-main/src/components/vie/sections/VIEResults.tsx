import React from 'react';
import { VIESection } from '../VIESection';
import { VIEResults as ResultsData, VIESectionState } from '@/lib/nkyel/vie-projection';
import { CheckCircle, ShieldCheck, ArrowRight } from '@phosphor-icons/react';

interface VIEResultsProps {
  state: VIESectionState<ResultsData>;
}

export function VIEResults({ state }: VIEResultsProps) {
  const { data, status } = state;

  const metricValue = data.metrics?.value; // e.g. "+27"
  const metricUnit = data.metrics?.unit;   // e.g. "%"
  const metricLabel = data.metrics?.label; // e.g. "Gain de temps"

  const primaryContent = (
    <div className="flex flex-col justify-center h-full">
      <div className="text-[12px] text-[var(--text-secondary)] mb-1">Impact estimé</div>
      {metricValue ? (
        <>
          <div className="text-4xl lg:text-5xl font-light text-[var(--accent)] tracking-tight font-sans">
            {metricValue}<span className="text-2xl lg:text-3xl">{metricUnit}</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            {metricLabel}
            <span className="w-3 h-3 rounded-full border border-[var(--border)] inline-flex items-center justify-center text-[8px] cursor-help" title="Basé sur les données de la mission">i</span>
          </div>
        </>
      ) : (
        <div className="text-[14px] text-[var(--text-muted)] italic py-4">
          En attente de résultats mesurables.
        </div>
      )}
    </div>
  );

  const secondaryVisualization = (
    <div className="relative w-full h-[80px] flex items-end">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {status !== 'idle' ? (
          <>
            <path 
              d="M 0,70 L 40,50 L 80,60 L 120,40 L 160,50 L 200,20 L 250,10" 
              stroke="var(--accent)" 
              strokeWidth="2" 
              fill="none"
              className="opacity-70"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="250" cy="10" r="4" fill="var(--accent)" className="drop-shadow-md shadow-[var(--accent)]" />
          </>
        ) : (
          <path 
            d="M 0,70 L 250,70" 
            stroke="var(--text-muted)" 
            strokeWidth="1" 
            fill="none"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* Chart Background Grid (subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_20px] opacity-10 pointer-events-none"></div>
    </div>
  );

  const actionLinks = (
    <div className="w-full flex items-center justify-between text-[13px]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <ShieldCheck size={16} className="text-[var(--nkyel-success,var(--success))]" />
          Preuve
        </div>
        <div className="w-px h-4 bg-[var(--border)]"></div>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          Journal d'exécution
        </button>
      </div>
      <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group">
        Voir les détails
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  return (
    <VIESection
      number={4}
      title="RÉSULTATS & PREUVE"
      description="VIE exécute, mesure et fournit une preuve vérifiable."
      status={status}
      metric={data.traceability !== null ? <span>Traçabilité {data.traceability}%</span> : undefined}
      primaryContent={primaryContent}
      secondaryContent={secondaryVisualization}
      actions={actionLinks}
    />
  );
}
