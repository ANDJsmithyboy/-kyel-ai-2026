'use client';

import React from 'react';
import type { NkyelMissionState, NkyelVisualEvent } from '@/lib/visualEvents';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { useTerrainPanel } from '@/hooks/useTerrainPanel';
import {
  ActivityIcon,
  Check,
  Circle,
  Cpu,
  GitBranch,
  Lightning,
  MagnifyingGlass,
  ShieldCheck,
  Sparkle,
  SidebarSimple,
  Timer,
} from '@phosphor-icons/react';

interface DesktopExecutionPaneProps {
  isStreaming?: boolean;
  hasConversation?: boolean;
  missionState?: NkyelMissionState;
  visualEvents?: NkyelVisualEvent[];
}

const PHASES = ['Comprendre', 'Planifier', 'Exécuter', 'Vérifier', 'Livrer'];

const PANTHERS = [
  { name: 'Panthère Financière', detail: 'Analyse et synthèse', icon: MagnifyingGlass },
  { name: 'Panthère Administrative', detail: 'Vérification', icon: ShieldCheck },
  { name: 'Panthère Analytics', detail: 'Structure du résultat', icon: GitBranch },
];

export default function DesktopExecutionPane({
  isStreaming = false,
  hasConversation = false,
  missionState = 'idle',
  visualEvents = [],
}: DesktopExecutionPaneProps) {
  if (!hasConversation) return null;

  const activePhase = missionState === 'completed' ? 4 : missionState === 'delivering' ? 4 : missionState === 'verifying' ? 3 : missionState === 'working' ? 2 : missionState === 'planning' ? 1 : isStreaming ? 2 : 4;
  const closeTerrain = useTerrainPanel((state) => state.close);
  const graphNodeCount = useWorkGraphStore((state) => state.nodes.size);
  const graphEdgeCount = useWorkGraphStore((state) => state.edges.size);
  const sourceCount = visualEvents.filter((event) => event.type === 'source.found').length;
  const artifactCount = visualEvents.filter((event) => event.type === 'artifact.created').length;
  const statusLabel = missionState === 'failed' ? 'Échec' : missionState === 'reconnecting' ? 'Reconnexion' : missionState === 'completed' ? 'Terminé' : isStreaming ? 'En cours' : 'Prêt';

  return (
    <aside data-vie-state={missionState} className="nkyel-vie-pane hidden min-w-[420px] w-[55%] max-w-[720px] shrink-0 border-l border-white/[0.08] bg-[#151515] lg:flex lg:flex-col" aria-label="Terrain de la mission">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
        <div className="flex items-center gap-2.5">
          <ActivityIcon size={17} className="text-[#D0D0D0]" />
          <div>
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#F1F1F1]">Terrain</h2>
            <p className="text-[10px] text-[#777777]">Activité de la mission</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#A8A8A8]">
          <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? 'animate-pulse bg-[#D0D0D0]' : 'bg-[#777777]'}`} />
          {statusLabel}
        </span>
        <button type="button" onClick={closeTerrain} aria-label="Fermer le Terrain" title="Fermer le Terrain" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A8A8A8] transition-colors hover:bg-white/[0.07] hover:text-white">
          <SidebarSimple size={16} weight="regular" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hidden">
        <section className="nkyel-vie-section border-b border-white/[0.07] pb-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Mission active</span>
            <span className="font-mono text-[10px] text-[#696969]">RUN LIVE</span>
          </div>
          <h3 className="text-[16px] font-medium leading-6 text-[#F1F1F1]">Nouvelle mission Ñkyel</h3>
          <p className="mt-1.5 text-[12px] leading-5 text-[#858585]">Le Terrain rassemble les étapes utiles, les agents mobilisés et les décisions observables.</p>
        </section>

        <section className="nkyel-vie-section border-b border-white/[0.07] py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Progression</span>
            <span className="text-[11px] text-[#A8A8A8]">{missionState === 'completed' ? '5' : missionState === 'idle' ? '0' : Math.min(activePhase + 1, 5)} / 5</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" aria-label="Étapes de la mission">
            {PHASES.map((phase, index) => {
              const done = index < activePhase;
              const current = index === activePhase;
              return (
                <div key={phase} className="min-w-0">
                  <div className={`mb-2 h-1 rounded-full ${done || current ? 'bg-[#BDBDBD]' : 'bg-white/[0.10]'}`} />
                  <span className={`block truncate text-[9px] ${current ? 'font-semibold text-[#F1F1F1]' : done ? 'text-[#A0A0A0]' : 'text-[#666666]'}`}>{phase}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="nkyel-vie-section border-b border-white/[0.07] py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Panthères</span>
            <span className="font-mono text-[10px] text-[#696969]">{Math.max(3, graphNodeCount)} nœuds</span>
          </div>
          <div className="space-y-2">
            {PANTHERS.map((panther, index) => {
              const Icon = panther.icon;
              const working = isStreaming ? index === 0 : index === 2;
              return (
                <div key={panther.name} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.09] bg-[#242424] text-[#BDBDBD]"><Icon size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#D6D6D6]">{panther.name}</p>
                    <p className="truncate text-[10px] text-[#707070]">{panther.detail}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-[#8E8E8E]">
                    <span className={`h-1.5 w-1.5 rounded-full ${working ? 'animate-pulse bg-[#C8C8C8]' : 'bg-[#666666]'}`} />
                    {working ? 'Travaille' : 'Prête'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="nkyel-vie-section border-b border-white/[0.07] py-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Flow récent</span>
            <Timer size={14} className="text-[#777777]" />
          </div>
          <ol className="space-y-3" aria-label="Activité récente de la mission">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-[#BEBEBE]"><Check size={11} weight="bold" /></span>
              <div><p className="text-[11px] text-[#C8C8C8]">Mission reçue</p><p className="text-[10px] text-[#6F6F6F]">L’objectif est prêt à être traité</p></div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-[#BEBEBE]"><Cpu size={11} /></span>
              <div><p className="text-[11px] text-[#C8C8C8]">Plan de travail structuré</p><p className="text-[10px] text-[#6F6F6F]">Tâches et agents reliés à la mission</p></div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-[#BEBEBE]"><Lightning size={11} weight="fill" /></span>
              <div><p className="text-[11px] text-[#C8C8C8]">{missionState === 'working' || isStreaming ? 'Analyse en cours' : missionState === 'failed' ? 'Mission interrompue' : 'Résultat vérifié'}</p><p className="text-[10px] text-[#6F6F6F]">{missionState === 'working' || isStreaming ? 'Le Terrain suit le travail en temps réel' : missionState === 'failed' ? 'Une reprise est nécessaire' : 'Les éléments utiles sont disponibles'}</p></div>
            </li>
          </ol>
        </section>

        <section className="nkyel-vie-section pt-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">WorkGraph</span>
            <GitBranch size={14} className="text-[#777777]" />
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#9A9A9A]">
              <span className="rounded border border-white/[0.12] px-2 py-1">Mission</span>
              <span className="text-[#666666]">→</span>
              <span className="rounded border border-white/[0.12] px-2 py-1">Tâche</span>
              <span className="text-[#666666]">→</span>
              <span className="rounded border border-white/[0.12] px-2 py-1">Livrable</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.1em] text-[#6F6F6F]">
              <span>{graphEdgeCount || 0} liens</span>
              <span>{sourceCount} sources</span>
              <span>{artifactCount} artifacts</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex h-11 shrink-0 items-center gap-1 border-t border-white/[0.07] px-5 text-[10px] text-[#777777]">
        <button type="button" className="rounded-md px-2 py-1.5 text-[#D0D0D0]">Flow</button>
        <button type="button" className="rounded-md px-2 py-1.5 hover:bg-white/[0.05]">VIE</button>
        <button type="button" className="rounded-md px-2 py-1.5 hover:bg-white/[0.05]">Sources</button>
        <span className="ml-auto flex items-center gap-1.5"><Circle size={8} weight="fill" /> Connexion stable</span>
      </footer>
    </aside>
  );
}
