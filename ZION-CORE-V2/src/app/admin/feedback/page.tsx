/* GabomaGPT · Admin Feedback Center · SmartANDJ AI Technologies
   Section 16+20A: Feedback volume, thumbs_down rates, top motifs, export
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { KPICard, ChartCard, DataTable, SectionHeader, StatusBadge } from '@/components/admin/AdminComponents';

const feedbackKpis = [
  { title: 'Total Feedback', value: 3847, change: '+18%', changeType: 'up' as const, icon: '📝' },
  { title: 'Taux Thumbs Down', value: '11.2%', change: '-2.1%', changeType: 'up' as const, icon: '👎', subtitle: 'Amélioration vs semaine dernière' },
  { title: 'Score Moyen', value: '4.3/5', change: '-0.1', changeType: 'down' as const, icon: '⭐' },
  { title: 'Hallucinations Signalées', value: 23, change: '-5', changeType: 'up' as const, icon: '🫧', subtitle: '0.6% des réponses' },
];

const topMotifs = [
  { motif: 'Réponse incomplète', count: 87, percentage: '22%', trend: 'down' },
  { motif: 'Hallucination factuelle', count: 54, percentage: '14%', trend: 'down' },
  { motif: 'Mauvaise langue', count: 43, percentage: '11%', trend: 'up' },
  { motif: 'Réponse trop lente', count: 38, percentage: '10%', trend: 'stable' },
  { motif: 'Mauvais ton', count: 31, percentage: '8%', trend: 'down' },
  { motif: 'RAG mauvais documents', count: 28, percentage: '7%', trend: 'up' },
];

const recentFeedback = [
  { user: 'Jean M.', type: 'thumbs_down', model: 'Flash', mode: 'chat', message: 'La réponse sur le code minier était incomplète...', language: 'fr', date: '18/06 14:32' },
  { user: 'Marie O.', type: 'hallucination', model: 'Pro', mode: 'rag', message: 'Le document cité n\'existe pas dans la source...', language: 'fr', date: '18/06 13:15' },
  { user: 'Paul N.', type: 'thumbs_up', model: 'Flash', mode: 'chat', message: 'Excellente traduction en fang !', language: 'fang', date: '18/06 11:44' },
  { user: 'Sophie K.', type: 'bad_tone', model: 'Pro', mode: 'agent', message: 'Ton trop formel pour une conversation...', language: 'fr', date: '18/06 10:20' },
  { user: 'Alain B.', type: 'rating', model: 'Flash', mode: 'chat', message: 'Note: 5/5 — Résumé parfait', language: 'fr', date: '17/06 22:10' },
];

const feedbackColumns = [
  { key: 'user', header: 'Utilisateur' },
  { key: 'type', header: 'Type', render: (row: Record<string, unknown>) => {
    const t = row.type as string;
    const v = t === 'thumbs_up' ? 'success' : t === 'thumbs_down' ? 'error' : t === 'hallucination' ? 'error' : t === 'rating' ? 'info' : 'warning';
    return <StatusBadge label={t.replace('_', ' ')} variant={v as 'success' | 'warning' | 'error' | 'info'} />;
  }},
  { key: 'model', header: 'Modèle' },
  { key: 'mode', header: 'Mode', render: (row: Record<string, unknown>) => (
    <StatusBadge label={row.mode as string} variant="neutral" />
  )},
  { key: 'message', header: 'Commentaire', className: 'max-w-[300px] truncate' },
  { key: 'language', header: 'Langue' },
  { key: 'date', header: 'Date' },
];

export default function FeedbackCenterPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Feedback Center"
        subtitle="Signaux explicites et implicites des utilisateurs"
        action={
          <button className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
            Export CSV
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {feedbackKpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      {/* Top Motifs */}
      <ChartCard title="Top Motifs d'Insatisfaction" subtitle="Ce mois-ci">
        <div className="space-y-3">
          {topMotifs.map((m) => (
            <div key={m.motif} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-48 truncate">{m.motif}</span>
              <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500/80 to-amber-500/60 rounded-full transition-all duration-500"
                  style={{ width: m.percentage }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">{m.count}</span>
              <span className={`text-[10px] ${m.trend === 'down' ? 'text-emerald-400' : m.trend === 'up' ? 'text-red-400' : 'text-gray-500'}`}>
                {m.trend === 'down' ? '↓' : m.trend === 'up' ? '↑' : '—'}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Recent Feedback */}
      <div>
        <SectionHeader title="Feedback Récent" subtitle="Derniers retours utilisateurs" />
        <DataTable columns={feedbackColumns} data={recentFeedback} />
      </div>
    </div>
  );
}
