import React from 'react';
import { VIESection } from '../VIESection';
import { VIEInterpretation as InterpretationData, VIESectionState } from '@/lib/nkyel/vie-projection';

interface VIEInterpretationProps {
  state: VIESectionState<InterpretationData>;
}

export function VIEInterpretation({ state }: VIEInterpretationProps) {
  const { data, status } = state;

  const hasIntent = data.goals.length > 0;
  const hasRisks = data.risks.length > 0;
  // Naive check for "context understood" (if we have any hypotheses or decisions or goals)
  const hasContext = data.hypotheses.length > 0 || data.decisions.length > 0 || data.goals.length > 0;

  const primaryVisualization = (
    <div className="relative w-full h-[80px] flex items-end">
      {/* Decorative structural chart line. Only render a real-looking line if we have confidence metrics, 
          otherwise it's a flat/subtle line indicating idle state. */}
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {status !== 'idle' ? (
          <>
            <path 
              d="M 0,60 Q 20,40 40,60 T 80,40 T 120,50 T 160,20 T 200,40 T 250,10" 
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
            d="M 0,60 L 250,60" 
            stroke="var(--text-muted)" 
            strokeWidth="1" 
            fill="none"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* Chart Background Grid (subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[size:40px_100%] opacity-20 pointer-events-none"></div>
    </div>
  );

  const chipBase = "px-3 py-1.5 rounded-lg border text-[12px] transition-colors";
  const chipActive = "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-primary)]";
  const chipInactive = "border-[var(--border)] bg-transparent text-[var(--text-muted)] opacity-50";

  const interpretationChips = (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      <div className={`${chipBase} ${hasContext ? chipActive : chipInactive}`}>
        Contexte compris
      </div>
      <div className={`${chipBase} ${hasIntent ? chipActive : chipInactive}`}>
        Intentions détectées
      </div>
      <div className={`${chipBase} ${hasRisks ? chipActive : chipInactive}`}>
        Risques évalués
      </div>
    </div>
  );

  return (
    <VIESection
      number={2}
      title="INTERPRÉTATION"
      description="VIE analyse, relie et déduit l'intention derrière les données."
      status={status}
      metric={data.confidenceMetrics ? <span>{data.confidenceMetrics}% confiance</span> : undefined}
      primaryContent={primaryVisualization}
      secondaryContent={interpretationChips}
    />
  );
}
