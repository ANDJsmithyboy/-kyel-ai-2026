/**
 * Ñkyel AI · MobileMissionModal — Mobile Mission Intelligence
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Full-screen mobile mission intelligence sheet:
 * - Overview (Objectif, Agents, Métriques, Artefacts générés)
 * - WorkGraph (Structure, Plan, Tâches, Dépendances)
 * - VIE (Vérification, Décisions, Contraintes, Approbations)
 * - Flow (Timeline verticale en direct d'exécution)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GeistCross,
  GeistCpu,
  GeistSliders,
  GeistActivity,
  GeistGlobe,
  GeistFile,
  GeistCheck,
  GeistSparkle,
} from '@/components/icons/GeistIcons';
import { CheckCircle, Clock, ShieldCheck, ArrowSquareOut } from '@phosphor-icons/react';

export type MobileMissionTab = 'overview' | 'workgraph' | 'vie' | 'flow';

interface MobileMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  isStreaming?: boolean;
  activePhase?: number;
  sourcesCount?: number;
  evidenceCount?: number;
  artifactsCount?: number;
}

export default function MobileMissionModal({
  isOpen,
  onClose,
  missionTitle,
  isStreaming = false,
  activePhase = 2,
  sourcesCount = 14,
  evidenceCount = 9,
  artifactsCount = 3,
}: MobileMissionModalProps) {
  const [activeTab, setActiveTab] = useState<MobileMissionTab>('overview');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex flex-col bg-[var(--material-canvas)] text-[var(--text-primary)] animate-in fade-in duration-200"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* ─── Mobile Header (48-54px) ─── */}
        <header className="h-14 px-4 border-b border-[var(--border)] bg-[var(--material-glass-regular)] backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="min-w-0">
              <h2 className="text-xs font-bold truncate max-w-[240px] text-[var(--text-primary)]">
                {missionTitle}
              </h2>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                Intelligence de Mission
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)] active:scale-95 transition-all"
            aria-label="Fermer"
          >
            <GeistCross size={14} />
          </button>
        </header>

        {/* ─── Segmented Navigation Bar (Touch-friendly >= 44px) ─── */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface)] shrink-0">
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
            {[
              { id: 'overview' as MobileMissionTab, label: 'Aperçu' },
              { id: 'workgraph' as MobileMissionTab, label: 'WorkGraph' },
              { id: 'vie' as MobileMissionTab, label: 'VIE' },
              { id: 'flow' as MobileMissionTab, label: 'Flux' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 text-center rounded-lg font-semibold text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--material-glass-elevated)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Body Content by Tab ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">État d'Exécution</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    {isStreaming ? 'STREAMING ACTIF' : 'SYNTHÉTISÉ'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Orchestration multi-agents sous gouvernance DeerFlow 2.0 & Google Capability Fabric.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{sourcesCount}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Sources</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{evidenceCount}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Preuves</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="text-sm font-bold text-[#D5AE57]">{artifactsCount}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Artefacts</div>
                  </div>
                </div>
              </div>

              {/* Agents Mobilisés */}
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-2.5">
                <div className="text-xs font-bold text-[var(--text-primary)]">Agents Actifs</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D5AE57]" />
                      <span className="font-medium">Research Agent</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">TERMINÉ</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      <span className="font-medium">Financial Synthesizer</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 font-bold">EN COURS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. WORKGRAPH (Full-screen Mobile Readable Flow) */}
          {activeTab === 'workgraph' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)]">Structure du WorkGraph</div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Représentation des tâches, dépendances logiques et artefacts produits par la mission.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { title: '1. Cadrage de la Thématique', desc: 'Analyse sémantique et identification des axes clés', status: 'done' },
                  { title: '2. Recherche Multimodale Approfondie', desc: '14 sources web & documents vérifiés', status: 'done' },
                  { title: '3. Synthèse Modèle DCF & Présentation', desc: 'Génération slides et feuille de calcul', status: 'active' },
                  { title: '4. Validation & Restitution VIE', desc: 'Revue humaine et export final', status: 'pending' },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      step.status === 'active'
                        ? 'bg-[#D5AE57]/15 border-[#D5AE57]/50 text-[var(--text-primary)]'
                        : step.status === 'done'
                        ? 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-secondary)]'
                        : 'opacity-50 bg-[var(--surface)] border-transparent text-[var(--text-tertiary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{step.title}</span>
                      {step.status === 'done' && <CheckCircle size={14} className="text-emerald-400" weight="fill" />}
                      {step.status === 'active' && <span className="w-2 h-2 rounded-full bg-[#D5AE57] animate-ping" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. VIE (Visual Intelligence & Human Validation) */}
          {activeTab === 'vie' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)]">Contrôle & Validation Humaine (VIE)</div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Vérification des hypothèses critiques et gouvernance des décisions agentiques.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Niveau de Confiance Établi</span>
                </div>
                <div className="w-full bg-[var(--surface-raised)] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D5AE57] h-full rounded-full" style={{ width: '94%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
                  <span>Rigueur Scientifique : 94%</span>
                  <span>Tolérance d'Incertitude : Faible</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. VISUAL FLOW (Vertical Execution Timeline for Phone) */}
          {activeTab === 'flow' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-1">
                <div className="text-xs font-bold text-[var(--text-primary)]">Flux d'Exécution en Direct</div>
                <p className="text-[11px] text-[var(--text-secondary)]">Étapes séquentielles et temps de réponse.</p>
              </div>

              <div className="relative pl-6 space-y-4 border-l border-[var(--border)] ml-3 pt-2">
                {[
                  { label: 'Ingestion de la consigne utilisateur', time: '0.2s', status: 'done' },
                  { label: 'Déploiement du Research Agent', time: '1.1s', status: 'done' },
                  { label: 'Interrogation Wandana Web Radar (14 sources)', time: '2.4s', status: 'done' },
                  { label: 'Modélisation DCF & Génération Slide Deck', time: 'En cours', status: 'active' },
                  { label: 'Compilation des artefacts finaux', time: 'En attente', status: 'pending' },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        item.status === 'done'
                          ? 'bg-emerald-500 text-black'
                          : item.status === 'active'
                          ? 'bg-[#D5AE57] text-black animate-pulse'
                          : 'bg-[var(--surface-raised)] text-[var(--text-tertiary)] border border-[var(--border)]'
                      }`}
                    >
                      {item.status === 'done' ? '✓' : idx + 1}
                    </span>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{item.label}</div>
                    <div className="text-[10px] font-mono text-[var(--text-tertiary)]">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
