/**
 * Ñkyel AI — Simulation & Prediction View
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Answers: "What will Ñkyel likely do before execution?"
 * - Pre-execution workflow projection
 * - Probabilistic duration & cost estimation
 * - External side-effects safety check
 * - Human acceptance / constraint adjustment
 */

'use client';

import React from 'react';
import {
  Sparkle,
  Clock,
  CurrencyDollar,
  ShieldCheck,
  Play,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle,
  FileText,
  Database,
  Presentation,
  Browsers,
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface SimulationScenarioViewProps {
  onAcceptAndRun?: () => void;
  onBackToChat?: () => void;
  missionPrompt?: string;
}

export default function SimulationScenarioView({
  onAcceptAndRun,
  onBackToChat,
  missionPrompt = 'Analyse d’opportunité énergie solaire au Gabon 2026',
}: SimulationScenarioViewProps) {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--material-canvas)] text-[var(--text-primary)] select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30">
                ÑKYEL SIMULATION v1
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {isFr ? 'Projection & Prédiction Pré-Exécution' : 'Pre-Execution Projection'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">
              {missionPrompt}
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

        {/* Estimation Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Clock size={20} weight="bold" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-tertiary)]">{isFr ? 'Durée estimée' : 'Estimated duration'}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">3–5 minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <CurrencyDollar size={20} weight="bold" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-tertiary)]">{isFr ? 'Coût estimé' : 'Estimated tokens/cost'}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">~45k tok (~$0.01)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-tertiary)]">{isFr ? 'Actions externes' : 'Side effects'}</p>
              <p className="text-sm font-bold text-emerald-400">{isFr ? 'Aucune (Lecture seule)' : 'None (Read-only)'}</p>
            </div>
          </div>
        </div>

        {/* Projected Workflow Pipeline */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            {isFr ? 'Scénario d’exécution projeté' : 'Projected Execution Scenario'}
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">1</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">Research Agent (Wandana + Google Grounding)</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Extraction de 12 à 20 sources primaires sur le marché photovoltaïque gabonais.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">2</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">Financial & Strategic Analysis Agent</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Modélisation DCF 3 scénarios (conservateur, réaliste, agressif) dans la sandbox Python.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">3</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)]">Universal Artifacts Exporter</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Génération du Rapport PDF, Classeur XLSX, Pitch Deck PPTX et Sandbox Web.</p>
              </div>
            </div>
          </div>

          {/* Action Launch Bar */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {isFr ? 'Confiance de simulation : Élevée (94%)' : 'Simulation confidence: High (94%)'}
            </span>

            <button
              type="button"
              onClick={onAcceptAndRun}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-semibold text-xs shadow-md transition-colors active:scale-95"
            >
              <Play size={14} weight="fill" />
              <span>{isFr ? 'Valider et lancer l’exécution' : 'Accept & Start Execution'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
