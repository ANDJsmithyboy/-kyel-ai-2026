'use client';
import React, { useEffect } from 'react';
import { useVIEProjection } from '@/lib/nkyel/vie-projection';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { workspacesApi } from '@/lib/api';
import { VIEHero } from './VIEHero';
import { VIEPerception } from './sections/VIEPerception';
import { VIEInterpretation } from './sections/VIEInterpretation';
import { VIEActionPlan } from './sections/VIEActionPlan';
import { VIEResults } from './sections/VIEResults';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';

interface VIEScreenProps {
  missionId: string;
}

export default function VIEScreen({ missionId }: VIEScreenProps) {
  const { fetchWorkGraph } = useWorkGraphStore();

  useEffect(() => {
    workspacesApi.current().then(ws => {
      fetchWorkGraph(ws.id, missionId);
    }).catch(() => {
      fetchWorkGraph('default', missionId);
    });
  }, [missionId, fetchWorkGraph]);

  const projection = useVIEProjection(missionId, 'default-thread');


  return (
    <div className="min-h-screen bg-[var(--bg,var(--graph-canvas,#0A0A0A))] text-[var(--text-primary)] flex flex-col items-center selection:bg-[var(--accent)] selection:text-white">
      
      {/* 
        Topbar / Header 
        We rely on the standard layout or app shell for the Iboga logo and profile, 
        but we add the VIE Title here as per the design requirements.
      */}
      <div className="w-full max-w-[1200px] px-6 md:px-8 lg:px-12 pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--text-primary)] mb-2 tracking-tight">
          VIE
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Moteur d'intelligence visuelle de Ñkyel
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1200px] px-6 md:px-8 lg:px-12 flex flex-col gap-6 pb-24">
        
        <VIEHero />
        
        <VIEPerception state={projection.perception} />
        
        <VIEInterpretation state={projection.interpretation} />
        
        <VIEActionPlan state={projection.plan} />
        
        <VIEResults state={projection.results} />
        
        {/* Info Bar */}
        <div className="mt-4 w-full rounded-[16px] bg-[var(--surface-1)] border border-[var(--border)] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[var(--text-secondary)]">
            <Sparkle size={20} className="text-[var(--accent)]" weight="fill" />
            <span className="text-[13px]">
              VIE met à jour son contexte au fur et à mesure que de nouvelles preuves arrivent.
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-raised)] transition-colors text-[13px] text-[var(--text-primary)] group whitespace-nowrap">
            En savoir plus
            <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>
        </div>
      </div>

    </div>
  );
}
