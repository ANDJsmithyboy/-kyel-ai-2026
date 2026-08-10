/* GabomaGPT · Admin Settings · SmartANDJ AI Technologies */
'use client';
import { useState } from 'react';
import { SectionHeader, StatusBadge } from '@/components/admin/AdminComponents';

const modelConfigs = [
  { mode: 'Flash', publicName: 'Flash', internalModel: 'llama-3.3-70b-versatile', provider: 'Groq', active: true },
  { mode: 'Pro', publicName: 'Pro', internalModel: 'llama-3.3-70b-versatile', provider: 'Groq', active: true },
  { mode: 'Black Panther', publicName: 'Black Panther', internalModel: 'llama-3.3-70b-versatile', provider: 'Groq', active: true },
];

const featureFlags = [
  { key: 'agent_enabled', label: 'Mode Agent (DeerFlow)', enabled: true, roles: ['admin', 'pro'] },
  { key: 'rag_enabled', label: 'RAG Qdrant', enabled: true, roles: ['admin', 'pro', 'free'] },
  { key: 'web_search', label: 'Recherche Web (Tavily)', enabled: true, roles: ['admin', 'pro'] },
  { key: 'file_upload', label: 'Upload de Fichiers', enabled: false, roles: ['admin'] },
  { key: 'fang_ui', label: 'Interface en Fang', enabled: true, roles: ['admin', 'pro', 'free'] },
  { key: 'punu_ui', label: 'Interface en Punu', enabled: true, roles: ['admin', 'pro', 'free'] },
  { key: 'crisp_chat', label: 'Support Crisp Chat', enabled: true, roles: ['admin', 'pro', 'free'] },
  { key: 'distillation', label: 'Pipeline Distillation', enabled: false, roles: ['admin'] },
];

const rateLimits = [
  { tier: 'Free', requests: 10, window: '1 minute', dailyTokens: '50K' },
  { tier: 'Pro', requests: 60, window: '1 minute', dailyTokens: '500K' },
  { tier: 'Admin', requests: 200, window: '1 minute', dailyTokens: 'Illimité' },
];

export default function SettingsPage() {
  const [flags, setFlags] = useState(featureFlags);

  const toggleFlag = (key: string) => {
    setFlags(flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-10">
      <SectionHeader title="Settings" subtitle="Configuration système de Gaboma AI" />

      {/* Model Configuration */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">🤖 Configuration des Modèles</h3>
        <div className="space-y-3">
          {modelConfigs.map((m) => (
            <div key={m.mode} className="bg-[var(--bg-card,var(--bg-elevated))] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--border)] transition-all">
              <div className="flex items-center gap-4">
                <StatusBadge label={m.mode} variant={m.active ? 'success' : 'neutral'} />
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{m.publicName}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{m.internalModel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-muted)]">{m.provider}</span>
                <div className={`w-10 h-5 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-gray-600'} relative cursor-pointer transition-colors`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${m.active ? 'left-5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Flags */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">🚩 Feature Flags</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flags.map((flag) => (
            <div key={flag.key} className="bg-[var(--bg-card,var(--bg-elevated))] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--border)] transition-all">
              <div>
                <p className="text-sm text-[var(--text-primary)]">{flag.label}</p>
                <div className="flex gap-1 mt-1">
                  {flag.roles.map(r => (
                    <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">{r}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleFlag(flag.key)}
                className={`w-10 h-5 rounded-full ${flag.enabled ? 'bg-emerald-500' : 'bg-gray-600'} relative transition-colors`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${flag.enabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Rate Limits */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">⚡ Rate Limiting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rateLimits.map((rl) => (
            <div key={rl.tier} className="bg-[var(--bg-card,var(--bg-elevated))] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge label={rl.tier} variant={rl.tier === 'Admin' ? 'info' : rl.tier === 'Pro' ? 'warning' : 'neutral'} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Requêtes</span>
                  <span className="text-[var(--text-primary)] font-mono">{rl.requests}/{rl.window}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Tokens/jour</span>
                  <span className="text-[var(--text-primary)] font-mono">{rl.dailyTokens}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Info */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">ℹ️ Informations Système</h3>
        <div className="bg-[var(--bg-card,var(--bg-elevated))] border border-[var(--border)] rounded-xl p-5 space-y-3">
          {[
            ['App', 'Gaboma AI v2.0.0'],
            ['Fondateur', 'Daniel Jonathan ANDJ'],
            ['Entreprise', 'SmartANDJ AI Technologies'],
            ['Ville', 'Libreville, Gabon 🇬🇦'],
            ['Stack Frontend', 'Next.js 15 + React 19 + TypeScript'],
            ['Stack Backend', 'FastAPI 2.0 (Python 3.12+)'],
            ['Database', 'Neon PostgreSQL (Drizzle ORM)'],
            ['Cache', 'Upstash Redis'],
            ['Vector DB', 'Qdrant (Northflank)'],
            ['LLM Provider', 'Groq (Llama 3.3 70B)'],
            ['Agent Engine', 'DeerFlow 2.0'],
            ['Auth', 'Clerk'],
            ['Analytics', 'PostHog'],
            ['Errors', 'Sentry'],
            ['Logs', 'Better Stack'],
            ['Paiement', 'E-Billing Digitech Africa (Airtel/Moov)'],
            ['Support', 'Crisp.chat'],
            ['i18n', 'next-intl (fr, fang, punu)'],
            ['Lancement', '27 Août 2026'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-0">
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
              <span className="text-xs text-[var(--text-primary)]">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
