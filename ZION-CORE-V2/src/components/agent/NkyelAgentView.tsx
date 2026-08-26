/**
 * Ñkyel AI · NkyelAgentView — Personal Agent Experience
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Calm, sovereign agent workspace with progressive disclosure:
 * - "This is your Ñkyel Agent. Ready to work."
 * - Integrated live mission view & VIE metrics
 * - Natural language primary composer
 * - Personalization drawer (Style, Language, Memory, Connected Tools)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkle,
  PaperPlaneRight,
  Microphone,
  Paperclip,
  Graph,
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
} from '@phosphor-icons/react';
import { NkyelAgentIcon } from '@/components/icons';

interface ActiveMissionState {
  isActive: boolean;
  objective: string;
  currentTask: string;
  activeAgentsCount: number;
  sourcesCount: number;
  evidenceCount: number;
  artifactsCount: number;
}

export default function NkyelAgentView() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  // Agent configuration state (Personalization)
  const [agentName, setAgentName] = useState('Ñkyel');
  const [workingStyle, setWorkingStyle] = useState<'analytical' | 'creative' | 'executive'>('analytical');
  const [agentLanguage, setAgentLanguage] = useState<'fr' | 'en' | 'fang'>('fr');
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  // Live mission simulation state
  const [missionState, setMissionState] = useState<ActiveMissionState>({
    isActive: true,
    objective: 'Analyse d’Opportunités & Transition Énergétique au Gabon 2026',
    currentTask: 'Synthèse des données macro-économiques et modélisation DCF...',
    activeAgentsCount: 3,
    sourcesCount: 14,
    evidenceCount: 9,
    artifactsCount: 3,
  });

  const handleLaunchMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/chat?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* ═══════════════════════════════════════════════════
         MAIN CALM WORKSPACE
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between max-w-4xl mx-auto w-full">
        {/* Agent Header & Personalization button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm"
              style={{
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-muted)',
              }}
            >
              <NkyelAgentIcon className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Mon agent
                </h1>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: 'var(--success, #22c55e)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                  }}
                >
                  Prêt
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Votre agent persistant pour les missions complexes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPersonalizing(!isPersonalizing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: isPersonalizing ? 'var(--surface-raised)' : 'var(--surface)',
              color: isPersonalizing ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <SlidersHorizontal size={14} />
            <span>Personnaliser</span>
          </button>
        </div>

        {/* Center: Live Mission State or Calm Prompt Cards */}
        <div className="my-auto py-8 space-y-6">
          {missionState.isActive ? (
            /* Live Mission Execution Banner (VIE Integration) */
            <div
              className="p-6 rounded-3xl relative overflow-hidden"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-strong)',
                boxShadow: 'var(--shadow-key)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                    Mission en cours d&apos;exécution
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/workspace')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shadow-sm"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  <Graph size={14} weight="bold" />
                  <span>Ouvrir le WorkGraph</span>
                </button>
              </div>

              {/* Mission Objective */}
              <div className="pt-4 pb-2">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {missionState.objective}
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {missionState.currentTask}
                </p>
              </div>

              {/* Metrics Row (No chain-of-thought jargon) */}
              <div className="grid grid-cols-4 gap-3 pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="text-center">
                  <span className="block text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {missionState.activeAgentsCount}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Agents actifs
                  </span>
                </div>

                <div className="text-center">
                  <span className="block text-base font-bold font-mono" style={{ color: 'var(--accent)' }}>
                    {missionState.sourcesCount}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Sources certifiées
                  </span>
                </div>

                <div className="text-center">
                  <span className="block text-base font-bold font-mono" style={{ color: 'var(--success, #22c55e)' }}>
                    {missionState.evidenceCount}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Preuves validées
                  </span>
                </div>

                <div className="text-center">
                  <span className="block text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {missionState.artifactsCount}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Livrables générés
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Calm Initial State */
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Que souhaitez-vous accomplir aujourd&apos;hui ?
              </h2>
              <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Votre agent peut rechercher, modéliser, planifier, utiliser vos intégrations connectées et produire des livrables de haute précision.
              </p>
            </div>
          )}

          {/* Progressive Personalization Drawer (when toggled) */}
          {isPersonalizing && (
            <div
              className="p-5 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Préférences de Travail de l&apos;Agent
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Nom personnalisé
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border outline-none text-xs"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Style d&apos;analyse
                  </label>
                  <select
                    value={workingStyle}
                    onChange={(e: any) => setWorkingStyle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border outline-none text-xs"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="analytical">Analytique & Rigoureux</option>
                    <option value="executive">Synthétique Exécutif</option>
                    <option value="creative">Créatif & Visuel</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Langue principale
                  </label>
                  <select
                    value={agentLanguage}
                    onChange={(e: any) => setAgentLanguage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border outline-none text-xs"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="fang">Fang (Souverain)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
           PRIMARY COMPOSER (Refined Material Box)
           ═══════════════════════════════════════════════════ */}
        <form onSubmit={handleLaunchMission} className="relative w-full">
          <div
            className="rounded-2xl p-2 transition-all shadow-lg"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleLaunchMission(e);
                }
              }}
              placeholder="Assignez une nouvelle mission à votre agent (ex: Analysez mes fichiers Drive et préparez un diaporama exécutif)..."
              className="w-full bg-transparent px-3 py-2 text-xs outline-none resize-none leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            />

            <div className="flex items-center justify-between pt-2 px-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Joindre un document"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Enregistrement vocal"
                >
                  <Microphone size={16} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!prompt.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: prompt.trim() ? 'var(--accent)' : 'var(--surface)',
                  color: prompt.trim() ? 'var(--accent-fg)' : 'var(--text-disabled)',
                  cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Démarrer la mission</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
