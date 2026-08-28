/**
 * Ñkyel AI — Right Context Inspector
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Panneau d'inspection contextuelle à 5 onglets calmes :
 * 1. Run (Activité en direct, phase, agents mobilisés, métriques)
 * 2. Sources (Sources web, fichiers, citations avec mise en évidence)
 * 3. Tools (Outils actifs, latence, autorisations)
 * 4. Skills (Compétences scientifiques & techniques de l'agent)
 * 5. MCP (Connecteurs et serveurs MCP connectés)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GeistActivity,
  GeistGlobe,
  GeistWrench,
  GeistSparkle,
  GeistPlugs,
  GeistCross,
  GeistCheck,
  GeistCpu,
  GeistFile,
  GeistShield,
} from '@/components/icons/GeistIcons';
import { Clock, Cpu, CheckCircle, Globe, ArrowSquareOut } from '@phosphor-icons/react';
import { useWorkspaceLayout, InspectorTab } from '@/hooks/useWorkspaceLayout';
import Surface from '@/components/ui/Surface';

export interface SourceItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevance: number; // 0 to 100
  usedByAgent?: string;
  publishedDate?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'available' | 'approval_required' | 'disabled';
  lastRun?: string;
  latencyMs?: number;
  category: 'search' | 'code' | 'vision' | 'system' | 'mcp';
}

export interface SkillItem {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'loaded' | 'ready';
  category: string;
}

export interface McpConnectorItem {
  id: string;
  name: string;
  status: 'connected' | 'idle' | 'disconnected';
  toolsCount: number;
  uri: string;
}

interface RightContextInspectorProps {
  isStreaming?: boolean;
  activePhase?: number;
  sources?: SourceItem[];
  tools?: ToolItem[];
  skills?: SkillItem[];
  mcpConnectors?: McpConnectorItem[];
  missionTitle?: string;
  elapsedSeconds?: number;
}

export default function RightContextInspector({
  isStreaming = false,
  activePhase = 0,
  sources = [],
  tools = [],
  skills = [],
  mcpConnectors = [],
  missionTitle = '',
  elapsedSeconds = 0,
}: RightContextInspectorProps) {
  const { isRightOpen, toggleRight, rightTab, setRightTab, selectedSourceId, openSource } =
    useWorkspaceLayout();

  const [searchFilter, setSearchFilter] = useState('');

  if (!isRightOpen) return null;

  const TABS: { id: InspectorTab; label: string; icon: React.ComponentType<any>; count?: number }[] = [
    { id: 'run', label: 'Run', icon: GeistActivity },
    { id: 'sources', label: 'Sources', icon: GeistGlobe, count: sources.length },
    { id: 'tools', label: 'Tools', icon: GeistWrench, count: tools.length },
    { id: 'skills', label: 'Skills', icon: GeistSparkle, count: skills.length },
    { id: 'mcp', label: 'MCP', icon: GeistPlugs, count: mcpConnectors.length },
  ];

  return (
    <aside
      className="h-full w-full flex flex-col shrink-0 select-none bg-[var(--material-glass-regular)] border-s border-[var(--border)] backdrop-blur-2xl transition-all z-20"
      aria-label="Inspecteur de Contexte de la Mission"
    >
      {/* ─── Header: Titre & Bouton Fermer ─── */}
      <div className="h-12 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate font-sans">
            Contexte de la Mission
          </span>
        </div>

        <button
          onClick={toggleRight}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
          title="Fermer l'inspecteur contextuel (Esc)"
          aria-label="Fermer"
        >
          <GeistCross size={14} />
        </button>
      </div>

      {/* ─── Tabs Segmentés Calmes (Apple × Geist) ─── */}
      <div className="px-3 pt-2 pb-1 border-b border-[var(--border-subtle)] shrink-0">
        <div className="grid grid-cols-5 gap-1 p-0.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
          {TABS.map((tab) => {
            const isSelected = rightTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                }`}
                title={tab.label}
              >
                <Icon size={14} weight={isSelected ? 'bold' : 'regular'} />
                <span className="text-[11px] hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[9px] font-mono text-[var(--text-tertiary)]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Contenu Déroulant Dynamique ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* ── 1. RUN TAB ── */}
        {rightTab === 'run' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">{missionTitle}</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {isStreaming ? 'STREAMING' : 'EN VEILLE'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Orchestration multi-agents Google Gemini & SmartANDJ Sovereign Fabric.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--text-tertiary)] font-mono">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  <span>{elapsedSeconds}s</span>
                </span>
                <span className="flex items-center gap-1">
                  <Cpu size={13} />
                  <span>Phase {activePhase}/5</span>
                </span>
              </div>
            </div>

            {/* Progression par Étapes */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
              <div className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
                Phases d&apos;Exécution
              </div>
              <div className="space-y-1.5 text-xs">
                {['1. Ingestion Multimodale 2M', '2. Décomposition WorkGraph', '3. Exécution Sandbox & Outils', '4. Vérification Rigueur', '5. Restitution VIE Canvas'].map((phase, idx) => {
                  const isDone = idx < activePhase;
                  const isCurrent = idx === activePhase;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-xl border ${
                        isCurrent
                          ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--text-primary)] font-semibold'
                          : isDone
                          ? 'bg-[var(--surface-raised)] border-transparent text-[var(--text-secondary)]'
                          : 'opacity-50 border-transparent text-[var(--text-tertiary)]'
                      }`}
                    >
                      <span className="text-[11px]">{phase}</span>
                      {isDone ? (
                        <CheckCircle size={14} className="text-emerald-400" weight="fill" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. SOURCES TAB ── */}
        {rightTab === 'sources' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
              Preuves & Documents Mémorisés ({sources.length})
            </div>

            {sources.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                Aucune source externe consultée pour le moment.
              </div>
            ) : (
              sources.map((src) => {
                const isSelected = selectedSourceId === src.id;
                return (
                  <div
                    key={src.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/50 text-[var(--text-primary)] shadow-md'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent)]">
                        <Globe size={13} />
                        <span className="font-bold">{src.domain}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-raised)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] font-bold">
                        {src.relevance}% pertinence
                      </span>
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--text-primary)] hover:underline flex items-center gap-1"
                    >
                      <span>{src.title}</span>
                      <ArrowSquareOut size={12} className="text-[var(--text-tertiary)] shrink-0" />
                    </a>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {src.snippet}
                    </p>

                    {src.usedByAgent && (
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)] pt-1">
                        Mobilisé par : <span className="text-[var(--text-primary)] font-medium">{src.usedByAgent}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── 3. TOOLS TAB ── */}
        {rightTab === 'tools' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
              Outils & Capacités Opérationnelles ({tools.length})
            </div>

            {tools.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{t.name}</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      t.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[var(--surface-raised)] text-[var(--text-tertiary)] border border-[var(--border)]'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {t.description}
                </p>
                {t.latencyMs && (
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-[var(--text-tertiary)]">
                    <span>Latence : {t.latencyMs}ms</span>
                    {t.lastRun && <span>Dernier run : {t.lastRun}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 4. SKILLS TAB ── */}
        {rightTab === 'skills' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
              Skills Spécialisées Actives ({skills.length})
            </div>

            {skills.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{s.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[var(--accent)] font-bold">
                      v{s.version}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">ACTIF</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {s.description}
                </p>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)] pt-1">
                  Catégorie : <span className="text-[var(--text-primary)] font-medium">{s.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 5. MCP TAB ── */}
        {rightTab === 'mcp' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] font-bold">
              Connecteurs & Serveurs MCP ({mcpConnectors.length})
            </div>

            {mcpConnectors.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{m.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    CONNECTÉ
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">
                  URI : {m.uri}
                </div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)] pt-1">
                  {m.toolsCount} outils et protocoles exposés
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
