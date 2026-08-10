/* GabomaGPT · admin/analytics/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Analytics — graphiques d'usage et métriques avancées */
'use client';

import { BarChart3, TrendingUp, Clock, MessageSquare, Users, Cpu } from 'lucide-react';

/* ── Carte de statistique ── */
function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof BarChart3; label: string; value: string; color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      </div>
      <div className="text-xl font-bold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

/* ── Barre de progression horizontale ── */
function ProgressBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-[var(--text-tertiary)]">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-overlay)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Analytics</h2>
        <p className="text-sm text-[var(--text-tertiary)]">
          Métriques d&apos;utilisation de GabomaGPT
        </p>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MessageSquare} label="Messages/jour" value="—" color="#38BDF8" />
        <StatCard icon={Users} label="DAU" value="—" color="#22C55E" />
        <StatCard icon={Cpu} label="Tokens/jour" value="—" color="#FACC15" />
        <StatCard icon={Clock} label="Latence moy." value="—" color="#EF4444" />
      </div>

      {/* Utilisation par modèle */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--accent)]" />
          Utilisation par modèle
        </h3>
        <div className="space-y-4">
          <ProgressBar label="GabomaGPT Flash" value={0} max={100} color="#FFD54F" />
          <ProgressBar label="GabomaGPT Standard" value={0} max={100} color="#29B6F6" />
          <ProgressBar label="GabomaGPT Pro" value={0} max={100} color="#CE93D8" />
          <ProgressBar label="Black Panther" value={0} max={100} color="#D4A417" />
        </div>
      </div>

      {/* Messages par jour (placeholder) */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--accent)]" />
          Messages par jour (7 derniers jours)
        </h3>
        <div className="h-40 flex items-end justify-between gap-2 px-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(8, Math.random() * 80)}%`,
                  background: 'var(--accent)',
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
              <span className="text-[10px] text-[var(--text-tertiary)]">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 rounded-2xl bg-[var(--accent-10)] border border-[var(--accent-35)]">
        <p className="text-sm text-[var(--text-primary)]">
          Les analytics en temps réel seront disponibles une fois le backend Open WebUI connecté et les données collectées.
          Les graphiques interactifs avec filtrage par date seront ajoutés dans la prochaine version.
        </p>
      </div>
    </div>
  );
}
