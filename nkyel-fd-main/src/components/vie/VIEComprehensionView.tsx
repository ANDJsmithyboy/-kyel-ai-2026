/**
 * Ñkyel AI — VIE Comprehension & Control View
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Answers: "What do I need to understand, verify, modify or approve?"
 * - Mission Intent & Current State
 * - World Model (Entities, Relations, Verified Facts vs Assumptions)
 * - Evidence Grounding & Cross-Checking
 * - Human-in-the-Graph Arbitrage & Pending Approvals
 * - Universal Artifacts Lineage
 */

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
  const goals = nodes.filter((n: any) => n.type === 'goal');
  const facts = nodes.filter((n: any) => n.type === 'evidence' || n.type === 'source');
  const artifacts = nodes.filter((n: any) => n.type === 'artifact');
  const activeAgent = nodes.find((n: any) => n.status === 'active' && (n.type === 'agent' || n.type === 'task'));

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

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--material-canvas)] text-[var(--text-primary)] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* 3 Pillars Grid: What Ñkyel is Doing · What Ñkyel Knows · What Has Been Produced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Current Activity & Active Agents */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Brain size={16} className="text-[var(--accent)]" />
                <span>{isFr ? 'Ce que fait Ñkyel' : 'Current Action'}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {activeAgent?.title || (isFr ? 'Synthèse et validation en cours...' : 'Synthesizing and validating...')}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {activeAgent?.summary || (isFr ? 'Croisement des sources, vérification de cohérence financière et rédaction du rapport.' : 'Cross-checking sources, financial consistency and drafting deliverable.')}
                </p>
              </div>

              <div className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-between pt-1">
                <span>{isFr ? 'Phase actuelle :' : 'Current phase:'}</span>
                <span className="font-mono text-[var(--accent)]">2 / 4 (Analyse)</span>
              </div>
            </div>
          </div>

          {/* Column 2: World Model (Facts & Verified Evidence) */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Globe size={16} className="text-cyan-400" />
                <span>{isFr ? 'Ce que sait Ñkyel (World Model)' : 'What Ñkyel Knows'}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {facts.length} {isFr ? 'faits' : 'facts'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
              <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle size={13} weight="fill" />
                  <span>{isFr ? 'Fait vérifié' : 'Verified Fact'}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Potentiel d’irradiation solaire au Gabon : 4.5 à 5.5 kWh/m²/jour.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                  <Globe size={13} />
                  <span>{isFr ? 'Donnée macroéconomique' : 'Macro Data'}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Plan Gabon 2026 : exonérations douanières sur les panneaux photovoltaïques.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Universal Artifacts Produced */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <FileText size={16} className="text-purple-400" />
                <span>{isFr ? 'Artefacts Produits' : 'Produced Artifacts'}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {artifacts.length > 0 ? artifacts.length : 3} {isFr ? 'livrables' : 'items'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
              <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={15} className="text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">Rapport Solaire Gabon 2026</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">PDF · 12 pages</p>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">Prêt</span>
              </div>

              <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Database size={15} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">Modèle Financier DCF 3 Scénarios</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">XLSX · 4 feuilles</p>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">Prêt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
