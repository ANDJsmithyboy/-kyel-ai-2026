'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Brain,
  CheckCircle,
  WarningCircle,
  SlidersHorizontal,
  Hand,
  Clock,
  ArrowRight,
  FileText,
  Globe,
  Database,
  ArrowClockwise,
  Check,
  X,
  Play,
  Pause,
  Eye,
  Target,
  Lightning,
  MagnifyingGlass
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { protocolEventBus } from '@/lib/protocols/protocol-events';

interface VIEComprehensionViewProps {
  onBackToChat?: () => void;
  missionTitle?: string;
}

export default function VIEComprehensionView({
  onBackToChat,
  missionTitle = 'Mission en cours',
}: VIEComprehensionViewProps) {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');
  const { nodes, isRunning, stopRun, resumeRun } = useWorkGraphStore();

  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    action: string;
    target: string;
    risk: 'low' | 'medium' | 'high';
    details: string;
  } | null>(null);

  // Derive world model summary from graph nodes
  const sources = nodes.filter((n: any) => n.type === 'source');
  const goals = nodes.filter((n: any) => n.type === 'goal' || n.type === 'objective' || n.type === 'intent' || n.type === 'plan');
  const executionNodes = nodes.filter((n: any) => n.type === 'agent' || n.type === 'task' || n.type === 'tool');
  const activeAgent = executionNodes.find((n: any) => n.status === 'active');
  const evidence = nodes.filter((n: any) => n.type === 'evidence' || n.type === 'fact' || n.type === 'hypothesis');
  const artifacts = nodes.filter((n: any) => n.type === 'artifact');

  const handleApprove = () => {
    if (pendingApproval) {
      protocolEventBus.emit('agui.approval.granted', 'agui', `Approval granted for ${pendingApproval.id}`, { id: pendingApproval.id });
      setPendingApproval(null);
    }
  };

  const handleReject = () => {
    if (pendingApproval) {
      protocolEventBus.emit('agui.approval.rejected', 'agui', `Approval rejected for ${pendingApproval.id}`, { id: pendingApproval.id });
      setPendingApproval(null);
    }
  };

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center py-6 text-[var(--text-tertiary)] space-y-2">
      <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center bg-[var(--surface)]">
        <Clock size={14} />
      </div>
      <span className="text-[10px] uppercase tracking-wider">{message}</span>
    </div>
  );

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--material-canvas)] text-[var(--text-primary)] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold border border-[var(--accent-muted)]">
                ÑKYEL VIE v1
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {isFr ? 'Compréhension & Contrôle Humain' : 'Human Comprehension & Control'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">
              {missionTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                type="button"
                onClick={stopRun}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/25 transition-colors"
              >
                <Pause size={13} weight="fill" />
                <span>{isFr ? 'Suspendre' : 'Pause'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRun}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/25 transition-colors"
              >
                <Play size={13} weight="fill" />
                <span>{isFr ? 'Reprendre' : 'Resume'}</span>
              </button>
            )}

            {onBackToChat && (
              <button
                type="button"
                onClick={onBackToChat}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {isFr ? 'Retour Chat' : 'Back to Chat'}
              </button>
            )}
          </div>
        </div>

        {/* Pending Human Approval Card (A2UI Pattern) if active */}
        {pendingApproval && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg space-y-3 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Hand size={16} weight="bold" />
                <span>{isFr ? 'Action Sensible en Attente d’Approbation' : 'Sensitive Action Awaiting Approval'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono uppercase">
                {pendingApproval.risk} risk
              </span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              <strong>{pendingApproval.action} :</strong> {pendingApproval.details} (Cible : {pendingApproval.target})
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Check size={14} weight="bold" />
                <span>{isFr ? 'Approuver' : 'Approve'}</span>
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <X size={14} weight="bold" />
                <span>{isFr ? 'Rejeter' : 'Reject'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Pillars Grid: Perception, Intention, Execution, Preuve */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* 1. PERCEPTION (Raw sources) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Eye size={16} className="text-blue-400" />
                <span className="uppercase tracking-widest">{isFr ? 'Perception' : 'Perception'}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {sources.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pe-1">
              {sources.length === 0 ? renderEmptyState(isFr ? 'Aucune source raw' : 'No raw sources') : sources.map((src: any) => (
                <div key={src.id} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-[11px]">
                    <Globe size={13} />
                    <span>{src.data?.label || 'Source'}</span>
                  </div>
                  {src.data?.description && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{src.data.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. INTENTION (Goals, Plans) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Target size={16} className="text-purple-400" />
                <span className="uppercase tracking-widest">{isFr ? 'Intention' : 'Intention'}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {goals.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pe-1">
              {goals.length === 0 ? renderEmptyState(isFr ? 'Aucun objectif défini' : 'No goals defined') : goals.map((goal: any) => (
                <div key={goal.id} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-semibold text-[11px]">
                    <ArrowRight size={13} />
                    <span>{goal.data?.label || 'Objectif'}</span>
                  </div>
                  {goal.data?.description && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{goal.data.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. EXECUTION (Agents, Tasks) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Lightning size={16} className="text-amber-400" />
                <span className="uppercase tracking-widest">{isFr ? 'Exécution' : 'Execution'}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ opacity: isRunning ? 1 : 0 }} />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pe-1">
              {executionNodes.length === 0 ? renderEmptyState(isFr ? 'En attente...' : 'Awaiting...') : (
                <>
                  {activeAgent && (
                    <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] text-xs space-y-1">
                      <p className="font-medium text-[var(--text-primary)] flex items-center gap-1">
                        <Brain size={14} className="text-[var(--accent)]" />
                        {activeAgent.data?.label || 'Agent Actif'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {activeAgent.data?.description || 'En cours...'}
                      </p>
                    </div>
                  )}
                  {executionNodes.filter((n: any) => n.id !== activeAgent?.id).map((node: any) => (
                    <div key={node.id} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs opacity-70">
                       <p className="font-medium text-[var(--text-secondary)]">{node.data?.label}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* 4. PREUVE (Evidence, Artifacts) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <MagnifyingGlass size={16} className="text-emerald-400" />
                <span className="uppercase tracking-widest">{isFr ? 'Preuve' : 'Evidence'}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {evidence.length + artifacts.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pe-1">
              {evidence.length === 0 && artifacts.length === 0 ? renderEmptyState(isFr ? 'Aucune preuve structurée' : 'No structured evidence') : (
                <>
                  {evidence.map((ev: any) => (
                    <div key={ev.id} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle size={13} weight="fill" />
                        <span>{ev.data?.label || 'Fait'}</span>
                      </div>
                      {ev.data?.description && (
                         <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{ev.data.description}</p>
                      )}
                    </div>
                  ))}
                  {artifacts.map((art: any) => (
                    <div key={art.id} className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={15} className="text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate text-blue-100">{art.data?.label || 'Artifact'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-medium">Livrable</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
