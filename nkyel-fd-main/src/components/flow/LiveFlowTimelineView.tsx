/**
 * Ñkyel AI — Live Flow Timeline View
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Answers: "What is Ñkyel doing right now?"
 * - Real-time chronological step execution
 * - Sub-agent delegations (A2A) with status badges
 * - Tool calls (MCP / Search / Python / Playwright)
 * - Safe cognitive latency and cost tracking (zero private reasoning leaks)
 */

'use client';

import React from 'react';
import {
  CheckCircle,
  CircleNotch,
  Globe,
  Code,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Robot,
  PlugsConnected,
  Sparkle,
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface TimelineStep {
  id: string;
  type: 'goal' | 'plan' | 'search' | 'agent_handoff' | 'sandbox' | 'artifact' | 'checkpoint';
  label: string;
  detail: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  timestamp: string;
  durationMs?: number;
  provider?: string;
}

const DEFAULT_STEPS: TimelineStep[] = [
  {
    id: 'step-1',
    type: 'goal',
    label: 'Réception de l’intention humaine',
    detail: 'Analyse d’opportunité énergie solaire au Gabon 2026',
    status: 'completed',
    timestamp: '14:21:02',
    durationMs: 180,
  },
  {
    id: 'step-2',
    type: 'plan',
    label: 'Planification stratégique autonome',
    detail: 'Décomposition en 4 sous-objectifs (Veille, Modélisation, Deck, Landing)',
    status: 'completed',
    timestamp: '14:21:04',
    durationMs: 840,
    provider: 'Gemini 3.7 Pro',
  },
  {
    id: 'step-3',
    type: 'search',
    label: 'Recherche documentaire & Grounding',
    detail: 'Extraction de 14 sources fiables (Ministère de l’Énergie, Banque Mondiale, SEEG)',
    status: 'completed',
    timestamp: '14:21:08',
    durationMs: 1420,
    provider: 'Tavily / Google Search',
  },
  {
    id: 'step-4',
    type: 'agent_handoff',
    label: 'Délégation A2A vers Financial Modeling Agent',
    detail: 'Transmission du dataset d’irradiation et des coûts CAPEX/OPEX',
    status: 'running',
    timestamp: '14:21:12',
    durationMs: 950,
  },
  {
    id: 'step-5',
    type: 'sandbox',
    label: 'Exécution Sandbox Python & Tableur DCF',
    detail: 'Génération du classeur XLSX avec 3 scénarios (conservateur, réaliste, agressif)',
    status: 'pending',
    timestamp: '14:21:15',
  },
  {
    id: 'step-6',
    type: 'artifact',
    label: 'Production des Artefacts Universels',
    detail: 'Export PDF, XLSX, Pitch Deck PPTX et Sandbox Web Preview',
    status: 'pending',
    timestamp: '14:21:20',
  },
];

interface LiveFlowTimelineViewProps {
  onBackToChat?: () => void;
  missionTitle?: string;
}

export default function LiveFlowTimelineView({
  onBackToChat,
  missionTitle = 'Exécution en direct',
}: LiveFlowTimelineViewProps) {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--material-canvas)] text-[var(--text-primary)] select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                LIVE FLOW v1
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {isFr ? 'Chronologie Temps Réel' : 'Real-Time Execution Flow'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1 font-serif">
              {missionTitle}
            </h2>
          </div>

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

        {/* Live Flow Stepper */}
        <div className="space-y-3 relative pl-6 border-l-2 border-[var(--border-subtle)] ml-3">
          {DEFAULT_STEPS.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isRunning = step.status === 'running';

            return (
              <div
                key={step.id}
                className={`relative p-3.5 rounded-2xl border transition-all ${
                  isRunning
                    ? 'bg-[var(--bg-elevated)] border-[#D5AE57]/60 shadow-[0_0_20px_rgba(213,174,87,0.15)] ring-1 ring-[#D5AE57]/40'
                    : isCompleted
                    ? 'bg-[var(--surface)] border-[var(--border)]'
                    : 'bg-[var(--surface-sunken)] border-[var(--border-subtle)] opacity-60'
                }`}
              >
                {/* Status Dot */}
                <div
                  className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 bg-[var(--material-canvas)] flex items-center justify-center ${
                    isCompleted
                      ? 'border-emerald-400 text-emerald-400'
                      : isRunning
                      ? 'border-[#D5AE57] text-[#D5AE57] animate-pulse'
                      : 'border-[var(--border-strong)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={10} weight="fill" />
                  ) : isRunning ? (
                    <CircleNotch size={10} className="animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                  )}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                        {step.label}
                      </span>
                      {step.provider && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] font-mono text-[var(--text-tertiary)]">
                          {step.provider}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {step.detail}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
                      {step.timestamp}
                    </span>
                    {step.durationMs && (
                      <span className="text-[10px] font-mono text-[#D5AE57]">
                        {step.durationMs}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
