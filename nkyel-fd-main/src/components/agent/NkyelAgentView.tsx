/**
 * Ñkyel AI · NkyelAgentView — Sovereign Personal Agent Hub (Apple × Manus Level)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Architecture & Style :
 * - Manus-grade autonomous directive composer & capability deck
 * - Apple-level restraint, glassmorphism, and responsive layout
 * - Real-time tool status (MCP, Grounding, Sandbox, Memory)
 * - Multi-language reactive support via useLanguageStore
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Robot,
  Sparkle,
  PaperPlaneTilt,
  Microphone,
  Plus,
  SlidersHorizontal,
  FileText,
  CheckCircle,
  Database,
  Lightning,
  Brain,
  Globe,
  ArrowRight,
  ShieldCheck,
  HardDrives,
  Cpu,
  Terminal,
  Clock,
  Graph,
  Check,
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { useNkyelModel } from '@/hooks/useNkyelModel';

interface RecentDispatch {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  duration: string;
  status: 'completed' | 'running' | 'ready';
  artifactsCount: number;
  sourcesCount: number;
}

const RECENT_DISPATCHES: RecentDispatch[] = [
  {
    id: 'disp_01',
    title: 'Analyse Économique & Transition Énergétique Gabon 2026',
    category: 'Deep Research & Financial Modeling',
    timestamp: 'Aujourd’hui à 11:20',
    duration: '4m 12s',
    status: 'completed',
    artifactsCount: 3,
    sourcesCount: 18,
  },
  {
    id: 'disp_02',
    title: 'Architecture & Implémentation Système de Feedback Sentry/Neon',
    category: 'Software Engineering',
    timestamp: 'Hier à 16:45',
    duration: '2m 30s',
    status: 'completed',
    artifactsCount: 2,
    sourcesCount: 8,
  },
  {
    id: 'disp_03',
    title: 'Recherche Réglementaire & Code des Investissements CEMAC',
    category: 'Legal & Executive Briefing',
    timestamp: '26 Août 2026',
    duration: '6m 05s',
    status: 'completed',
    artifactsCount: 4,
    sourcesCount: 24,
  },
];

export default function NkyelAgentView() {
  const router = useRouter();
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const { engineId, setEngineId } = useNkyelModel();

  const [prompt, setPrompt] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [workingStyle, setWorkingStyle] = useState<'analytical' | 'executive' | 'code' | 'creative'>('analytical');
  const [selectedTools, setSelectedTools] = useState<string[]>(['mcp_brave', 'mcp_fs', 'sandbox_py', 'memory']);

  const handleLaunchMission = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  const handleQuickDirective = (directive: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(directive)}`);
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* ── Scrollable Agent Stage ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full space-y-7 pb-28">
        
        {/* ── Header: Agent Identity & Status ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-[var(--border-subtle)] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-raised)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
              <Robot size={26} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {t('agent.myAgent') || 'My Agent'}
                </h1>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isFr ? 'Prêt à agir' : 'Ready to work'}</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isFr
                  ? 'Agent autonome persistant avec mémoire souveraine et exécution en bac à sable.'
                  : 'Persistent autonomous agent with sovereign memory and sandboxed tool execution.'}
              </p>
            </div>
          </div>

          {/* Quick Engine & Tuning Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'fast', label: isFr ? 'Rapide' : 'Fast' },
                { id: 'deep', label: isFr ? 'Profond' : 'Deep' },
                { id: 'research', label: isFr ? 'Recherche' : 'Research' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setEngineId(m.id as any)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    engineId === m.id
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                isConfigOpen
                  ? 'bg-[var(--surface-raised)] border-[var(--accent)] text-[var(--accent)] shadow-xs'
                  : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title={isFr ? 'Configurer les paramètres' : 'Configure parameters'}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ── Optional Agent Tuning Drawer (Apple Restraint) ── */}
        <AnimatePresence>
          {isConfigOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-strong)] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  {isFr ? 'Configuration du Comportement & Outils' : 'Behavior & Tool Capabilities'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} weight="fill" />
                  <span>{isFr ? 'Zéro-Fuite Garanti' : 'Zero-Leakage Certified'}</span>
                </span>
              </div>

              {/* Working Style Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Style d’Analyse & de Restitution' : 'Working Persona & Tone'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'analytical', label: isFr ? 'Architecte Exécutif' : 'Executive Architect', desc: isFr ? 'Synthèses rigoureuses & décisives' : 'Rigorous & decisive synthesis' },
                    { id: 'code', label: isFr ? 'Ingénieur Logiciel' : 'Software Engineer', desc: isFr ? 'Code modulaire & TypeScript strict' : 'Modular code & strict TypeScript' },
                    { id: 'executive', label: isFr ? 'Analyste Financier' : 'Financial Analyst', desc: isFr ? 'Modélisation DCF & ratios chiffrés' : 'DCF modeling & key ratios' },
                    { id: 'creative', label: isFr ? 'Concepteur Graphique' : 'Creative Director', desc: isFr ? 'Présentations & design soigné' : 'Decks & high visual polish' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setWorkingStyle(style.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        workingStyle === style.id
                          ? 'bg-[var(--control-bg)] border-[var(--accent)] text-[var(--text-primary)] shadow-xs'
                          : 'bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[var(--text-primary)]">{style.label}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-tight">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tools Grid */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Outils Autonomes Connectés' : 'Connected Autonomous Tools'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'mcp_brave', label: 'Brave Search MCP', icon: Globe },
                    { id: 'mcp_fs', label: 'Filesystem Sandbox', icon: HardDrives },
                    { id: 'sandbox_py', label: 'Python 3.12 Runtime', icon: Terminal },
                    { id: 'memory', label: 'Sovereign Memory', icon: Brain },
                    { id: 'google_ws', label: 'Google Workspace', icon: Cpu },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    const isEnabled = selectedTools.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => toggleTool(tool.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isEnabled
                            ? 'bg-[var(--control-bg)] border border-[var(--accent)]/40 text-[var(--text-primary)]'
                            : 'bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-disabled)] opacity-60'
                        }`}
                      >
                        <Icon size={14} className={isEnabled ? 'text-[var(--accent)]' : ''} />
                        <span>{tool.label}</span>
                        {isEnabled && <Check size={12} weight="bold" className="text-emerald-400 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Directive Composer (Manus × Apple Floating Glass) ── */}
        <div className="space-y-3">
          <form
            onSubmit={handleLaunchMission}
            className="p-3.5 sm:p-4 rounded-[28px] bg-[var(--surface-raised)] border border-[var(--border-strong)] shadow-[var(--shadow-key)] space-y-3 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleLaunchMission();
                }
              }}
              rows={3}
              placeholder={t('agent.directivePlaceholder') || 'Give a complex mission directive to your agent...'}
              className="w-full bg-transparent border-0 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none resize-none px-1 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
                  title="Attach file or dataset"
                >
                  <Plus size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
                  title="Voice directive"
                >
                  <Microphone size={16} />
                </button>
                <span className="text-[11px] font-mono ml-2 hidden sm:inline text-[var(--text-disabled)]">
                  ⌘ + Enter
                </span>
              </div>

              <button
                type="submit"
                disabled={!prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all touch-manipulation"
              >
                <span>{t('agent.launchMission') || 'Execute Directive'}</span>
                <PaperPlaneTilt size={14} weight="bold" />
              </button>
            </div>
          </form>

          {/* Capability Quick Starters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: isFr ? 'Modélisation DCF & Tableaux' : 'DCF Modeling & Tables', query: isFr ? 'Conçois une modélisation financière DCF avec VAN et TRI pour un projet d’infrastructure.' : 'Build a DCF financial model with NPV and IRR for an infrastructure project.' },
              { label: isFr ? 'Synthèse Juridique CEMAC' : 'Legal & Regulatory Briefing', query: isFr ? 'Rédige une synthèse exécutive des règles d’investissement CEMAC et garanties de change.' : 'Draft an executive briefing on CEMAC investment regulations and FX guarantees.' },
              { label: isFr ? 'Architecture TypeScript' : 'Clean TypeScript Architecture', query: isFr ? 'Structure une architecture Next.js / TypeScript modulaire avec état réactif.' : 'Structure a modular Next.js / TypeScript architecture with reactive state.' },
              { label: isFr ? 'Générer Présentation PPTX' : 'Generate Presentation Deck', query: isFr ? 'Génère une présentation exécutive de 12 diapositives sur la transition énergétique.' : 'Generate a 12-slide executive presentation deck on energy transition.' },
            ].map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickDirective(starter.query)}
                className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-all active:scale-98"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Dispatches & Mission History ── */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              {t('agent.recentDispatches') || 'Recent Agent Dispatches'}
            </h3>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">
              {RECENT_DISPATCHES.length} {isFr ? 'missions archivées' : 'archived missions'}
            </span>
          </div>

          <div className="space-y-2.5">
            {RECENT_DISPATCHES.map((dispatch) => (
              <div
                key={dispatch.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push('/chat')}
                className="p-4 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-xs active:scale-[0.99]"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {dispatch.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span>{dispatch.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {dispatch.duration}
                    </span>
                    <span>·</span>
                    <span>{dispatch.timestamp}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-mono text-[var(--text-secondary)] block">
                      {dispatch.artifactsCount} {isFr ? 'artefacts' : 'artifacts'}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)] block">
                      {dispatch.sourcesCount} {isFr ? 'sources' : 'sources'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--accent-muted)] transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
