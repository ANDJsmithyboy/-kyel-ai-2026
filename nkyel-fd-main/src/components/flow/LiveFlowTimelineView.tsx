'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  CircleNotch,
  WarningCircle,
  Check,
  Code,
  Globe,
  FileText,
  Robot,
  PlugsConnected,
  Lightning,
  Clock,
  ArrowRight,
  Article,
  Briefcase,
  StopCircle
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { protocolEventBus } from '@/lib/protocols/protocol-events';
import type { WorkNode, NkyelEvent } from '@/lib/nkyel/work-graph.types';

// ============================================================================
// TYPING & NORMALIZATION
// ============================================================================

interface NormalizedPhase {
  id: string;
  kind: string;
  title: string;
  status: 'completed' | 'running' | 'waiting' | 'failed' | 'waiting_approval';
  startedAt?: Date;
  endedAt?: Date;
  sourceCount: number;
  durationMs?: number;
}

interface NormalizedAgent {
  id: string;
  name: string;
  status: 'running' | 'waiting' | 'completed' | 'failed';
  activity: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const PhaseIcon = ({ kind, status }: { kind: string, status: string }) => {
  const getIcon = () => {
    switch (kind) {
      case 'plan': return <Briefcase size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'task': return <ArrowRight size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'source': return <Globe size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'tool_call': return <Code size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'artifact': return <FileText size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'mcp_tool': return <PlugsConnected size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      case 'agent': return <Robot size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
      default: return <Clock size={22} weight={status === 'running' ? 'fill' : 'regular'} />;
    }
  };

  const colorClass = status === 'completed'
    ? 'text-emerald-500'
    : status === 'failed'
    ? 'text-red-500'
    : status === 'running'
    ? 'text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-muted)]'
    : 'text-[var(--text-tertiary)]';

  return <div className={`flex items-center justify-center transition-colors ${colorClass}`}>{getIcon()}</div>;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface LiveFlowTimelineViewProps {
  onBackToChat?: () => void;
  missionTitle?: string;
}

export default function LiveFlowTimelineView({
  onBackToChat,
  missionTitle = 'Nouvelle mission',
}: LiveFlowTimelineViewProps) {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');
  const router = useRouter();
  
  // Connect to canonical stores
  const { nodes, eventLog, runId, isRunning, stopRun } = useWorkGraphStore();
  
  // Local state for live clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Derived Projections
  const nodesArr = Array.from(nodes.values()) as import('@/lib/nkyel/work-graph.types').WorkNode[];

  // 1. Map backend nodes to Phase Timeline
  // For Live Flow, we treat 'plan', 'task', and 'goal' as primary phases.
  const phases: NormalizedPhase[] = useMemo(() => {
    return nodesArr
      .filter((n) => ['plan', 'task', 'goal'].includes(n.type))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((n) => {
        let derivedStatus: NormalizedPhase['status'] = 'waiting';
        if (n.status === 'completed') derivedStatus = 'completed';
        else if (n.status === 'active') derivedStatus = 'running';
        else if (n.status === 'failed' || n.status === 'cancelled') derivedStatus = 'failed';
        else if (n.status === 'waiting_approval') derivedStatus = 'waiting_approval';

        return {
          id: n.id,
          kind: n.type,
          title: n.title,
          status: derivedStatus,
          startedAt: new Date(n.createdAt),
          endedAt: n.status === 'completed' || n.status === 'failed' ? new Date(n.updatedAt) : undefined,
          sourceCount: nodesArr.filter(sn => (sn.type === 'source' || sn.type === 'evidence') && sn.parentId === n.id).length,
          durationMs: n.latencyMs,
        };
      });
  }, [nodesArr]);

  // 2. Map Active Agents
  const activeAgents: NormalizedAgent[] = useMemo(() => {
    return nodesArr
      .filter(n => n.type === 'agent' || n.type === 'a2a_agent')
      .map(n => ({
        id: n.id,
        name: n.title,
        status: n.status === 'active' ? 'running' : n.status === 'completed' ? 'completed' : n.status === 'failed' ? 'failed' : 'waiting',
        activity: n.summary || 'En attente',
      }));
  }, [nodesArr]);

  // 3. Live Journal (from protocolEventBus or eventLog)
  // We use eventLog from workGraphStore for the most deterministic safe events.
  const journalEvents = useMemo(() => {
    return [...eventLog].sort((a, b) => b.sequenceNumber - a.sequenceNumber);
  }, [eventLog]);

  // 4. Execution Metrics
  const startTime = phases.length > 0 ? phases[0].startedAt : undefined;
  const elapsedSeconds = startTime ? Math.floor((now.getTime() - startTime.getTime()) / 1000) : 0;
  
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const totalPhases = Math.max(phases.length, 1);
  const completionPercent = Math.round((completedPhases / totalPhases) * 100);
  
  const tokenUsage = nodesArr.reduce((acc, n) => acc + ((n.metadata?.tokens as number) || 0), 0);
  const executionCount = nodesArr.filter(n => ['tool_call', 'mcp_tool', 'google_tool'].includes(n.type)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-[var(--accent)]';
      case 'completed': return 'bg-emerald-500';
      case 'failed': return 'bg-red-500';
      case 'waiting_approval': return 'bg-amber-500';
      default: return 'bg-[var(--border-strong)]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return isFr ? 'En cours' : 'Running';
      case 'completed': return isFr ? 'Terminé' : 'Completed';
      case 'failed': return isFr ? 'Échoué' : 'Failed';
      case 'waiting_approval': return isFr ? 'En attente' : 'Waiting';
      default: return isFr ? 'En file' : 'Queued';
    }
  };

  // Safe empty state
  if (!runId && phases.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-[var(--material-canvas)] text-[var(--text-primary)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-tertiary)] mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-lg font-semibold mb-2">{isFr ? 'Aucune exécution en cours' : 'No running execution'}</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-6">
          {isFr ? 'Le Live Flow s\'affichera automatiquement dès que la mission commencera son exécution.' : 'Live Flow will appear automatically when the mission begins execution.'}
        </p>
        {onBackToChat && (
          <button onClick={onBackToChat} className="px-4 py-2 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--hover)] transition-colors">
            {isFr ? 'Retourner à la mission' : 'Return to mission'}
          </button>
        )}
      </div>
    );
  }

  const globalStatus = isRunning ? 'running' : (phases.some(p => p.status === 'failed') ? 'failed' : 'completed');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--material-canvas)]">
      {/* ── Page Title Region ── */}
      <header className="shrink-0 px-6 sm:px-8 lg:px-12 pt-8 pb-6 flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[var(--text-primary)]">
            Live Flow
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--border-strong)]">
            <span className={`w-2 h-2 rounded-full ${getStatusColor(globalStatus)} ${globalStatus === 'running' ? 'animate-pulse' : ''}`} />
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {getStatusText(globalStatus)}
            </span>
          </div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          {isFr ? 'Suivez l’exécution de cette Mission en temps réel.' : 'Follow this Mission execution in real time.'}
        </p>
      </header>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-12 pb-12 scrollbar-thin">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6">
          
          {/* ── LEFT COLUMN: Primary Execution Timeline ── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 sm:p-6 lg:p-8 flex-1">
                {phases.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                    {isFr ? 'Chargement des phases...' : 'Loading phases...'}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Execution Spine */}
                    <div className="absolute top-8 bottom-8 start-4 sm:start-6 w-[2px] bg-[var(--border-subtle)]" />

                    <div className="space-y-0">
                      {phases.map((phase, idx) => {
                        const isLast = idx === phases.length - 1;
                        const isActive = phase.status === 'running';
                        const isDone = phase.status === 'completed';
                        
                        let durationStr = '00:00';
                        if (phase.startedAt) {
                          const end = phase.endedAt || now;
                          const secs = Math.floor((end.getTime() - phase.startedAt.getTime()) / 1000);
                          const m = Math.floor(secs / 60).toString().padStart(2, '0');
                          const s = (secs % 60).toString().padStart(2, '0');
                          durationStr = `${m}:${s}`;
                        }

                        return (
                          <div 
                            key={phase.id} 
                            onClick={() => router.push(`/workgraph?node=${phase.id}`)}
                            className={`relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-[var(--accent-subtle)] border border-[var(--accent-muted)] shadow-[0_0_15px_var(--accent-subtle)]' 
                                : 'border border-transparent hover:bg-[var(--hover)]'
                            }`}
                          >
                            {/* Spine dot overlay */}
                            <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-sm">
                              <PhaseIcon kind={phase.kind} status={phase.status} />
                              {isActive && (
                                <span className="absolute inset-0 rounded-xl border border-[var(--accent)] animate-pulse" />
                              )}
                            </div>

                            {/* Phase Content */}
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1 truncate">
                                <h3 className={`text-[15px] font-semibold truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                  {phase.title}
                                </h3>
                                {phase.sourceCount > 0 && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)] font-medium">
                                    <Globe size={12} />
                                    <span>{phase.sourceCount} sources</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                {/* Elapsed Time */}
                                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-mono text-xs">
                                  <Clock size={14} />
                                  <span>{durationStr}</span>
                                </div>
                                {/* Status Badge */}
                                <div className="flex items-center gap-1.5 w-24 justify-end">
                                  {isDone ? (
                                    <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                                  ) : isActive ? (
                                    <CircleNotch size={16} className="text-[var(--accent)] animate-spin" />
                                  ) : phase.status === 'failed' ? (
                                    <WarningCircle size={16} weight="fill" className="text-red-500" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
                                  )}
                                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                                    {getStatusText(phase.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* ── RIGHT COLUMN: Secondary Cards ── */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
            
            {/* Live Journal */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm flex flex-col max-h-[380px]">
              <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Article size={18} className="text-[var(--text-secondary)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {isFr ? 'Journal en direct' : 'Live Journal'}
                  </h3>
                </div>
                {isRunning && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500/80 font-medium uppercase tracking-wider">
                      {isFr ? 'Flux actif' : 'Live stream'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {journalEvents.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-[var(--text-tertiary)]">
                    {isFr ? 'Aucun événement' : 'No events'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {journalEvents.map(evt => {
                      const tStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const handleClick = () => {
                        if (evt.protocol === 'agui' || evt.protocol === 'a2ui') router.push(`/vie?event=${evt.id}`);
                        else if (evt.protocol === 'mcp') router.push(`/sanctuary?tool=${evt.id}`);
                      };
                      return (
                        <div key={evt.id} onClick={handleClick} className="p-2.5 rounded-xl hover:bg-[var(--hover)] transition-colors flex items-start gap-3 cursor-pointer">
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0 pt-0.5">{tStr}</span>
                          <div className="min-w-0">
                            <p className="text-[12px] text-[var(--text-primary)] leading-tight">{evt.type}</p>
                            {evt.node?.title && (
                              <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{evt.node.title}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Agents */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm flex flex-col">
              <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Robot size={18} className="text-[var(--text-secondary)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {isFr ? 'Agents actifs' : 'Active Agents'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">{activeAgents.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {activeAgents.length === 0 ? (
                  <div className="text-center text-[11px] text-[var(--text-tertiary)]">
                    {isFr ? 'Aucun agent assigné' : 'No agents assigned'}
                  </div>
                ) : (
                  activeAgents.map(agent => (
                    <div 
                      key={agent.id} 
                      onClick={() => router.push(`/agent?id=${agent.id}`)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] cursor-pointer hover:border-[var(--border-strong)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border-strong)] flex items-center justify-center">
                          <Robot size={16} className="text-[var(--text-secondary)]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">{agent.name}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">{agent.activity}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${agent.status === 'running' ? 'animate-pulse' : ''}`} />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM COLUMN: Execution Summary Card ── */}
        <div className="max-w-[1200px] mx-auto mt-6">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-12 flex-1">
              {/* Duration */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                  {isFr ? 'Temps écoulé' : 'Elapsed Time'}
                </p>
                <div className="text-2xl font-mono text-[var(--text-primary)]">
                  {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              {/* Progress */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                  {isFr ? 'Étapes' : 'Steps completed'}
                </p>
                <div className="text-2xl font-mono text-[var(--text-primary)]">
                  {completedPhases}/{totalPhases} <span className="text-sm text-[var(--text-tertiary)] ml-1">({completionPercent}%)</span>
                </div>
              </div>

              {/* Tokens */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                  {isFr ? 'Tokens' : 'Token usage'}
                </p>
                <div className="text-2xl font-mono text-[var(--text-primary)]">
                  {tokenUsage > 0 ? (tokenUsage / 1000).toFixed(1) + 'K' : '—'}
                </div>
              </div>

              {/* Executions */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                  {isFr ? 'Exécutions' : 'Executions'}
                </p>
                <div className="text-2xl font-mono text-[var(--text-primary)]">
                  {executionCount}
                </div>
              </div>
            </div>

            {/* Stop Action */}
            <div className="flex items-center gap-4 lg:border-l lg:border-[var(--border-subtle)] lg:pl-8">
              {isRunning ? (
                <button
                  type="button"
                  onClick={stopRun}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-semibold transition-colors shrink-0"
                >
                  <StopCircle size={20} weight="fill" />
                  <span>{isFr ? 'Arrêter l\'exécution' : 'Stop execution'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBackToChat}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-[var(--text-primary)] border border-[var(--border-strong)] font-semibold transition-colors shrink-0"
                >
                  <Check size={20} />
                  <span>{isFr ? 'Terminé' : 'Done'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
        
        {/* Optimization Bar */}
        <div className="max-w-[1200px] mx-auto mt-4 flex items-center justify-center">
          <div className="px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] shadow-sm flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] font-medium">
            <Lightning size={12} weight="fill" className="text-[var(--accent)]" />
            <span>{isFr ? 'Optimisation des ressources temps réel activée' : 'Real-time resource optimization enabled'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
