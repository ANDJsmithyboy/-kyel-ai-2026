/* GabomaGPT · DeerFlow Monitor · SmartANDJ AI Technologies */
'use client';
import { KPICard, SectionHeader, DataTable, StatusBadge, ChartCard } from '@/components/admin/AdminComponents';

const deerflowKpis = [
  { title: 'Sessions Actives', value: 3, icon: '🦌', subtitle: 'En cours maintenant' },
  { title: 'Sessions Aujourd\'hui', value: 47, change: '+12%', changeType: 'up' as const, icon: '📈' },
  { title: 'Taux de Succès', value: '78%', change: '+3%', changeType: 'up' as const, icon: '✅' },
  { title: 'Latence P95', value: '4.8s', change: '-0.5s', changeType: 'up' as const, icon: '⚡' },
];

const sessions = [
  { id: 'df-001', user: 'Paul N.', intent: 'Recherche sur PIB gabonais', tools: 'web_search, qdrant, calculator', outcome: 'success', tokens: 12400, duration: '4.2s', time: '14:32' },
  { id: 'df-002', user: 'Marie O.', intent: 'Analyse rapport financier', tools: 'qdrant, summarizer', outcome: 'success', tokens: 8900, duration: '3.1s', time: '13:15' },
  { id: 'df-003', user: 'Jean M.', intent: 'Comparaison codes miniers', tools: 'web_search, qdrant, comparator, verifier', outcome: 'partial', tokens: 18200, duration: '6.8s', time: '11:44' },
  { id: 'df-004', user: 'Sophie K.', intent: 'Traduction juridique fang', tools: 'translator', outcome: 'failure', tokens: 1200, duration: '1.2s', time: '10:20' },
];

const cols = [
  { key: 'id', header: 'ID', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-gray-500">{r.id as string}</span> },
  { key: 'user', header: 'User' },
  { key: 'intent', header: 'Intent', className: 'max-w-[200px] truncate' },
  { key: 'tools', header: 'Outils', render: (r: Record<string, unknown>) => (
    <div className="flex flex-wrap gap-1">{(r.tools as string).split(', ').map((t) => (
      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400">{t}</span>
    ))}</div>
  )},
  { key: 'outcome', header: 'Résultat', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.outcome as string} variant={r.outcome === 'success' ? 'success' : r.outcome === 'failure' ? 'error' : 'warning'} />
  )},
  { key: 'tokens', header: 'Tokens', render: (r: Record<string, unknown>) => <span>{(r.tokens as number).toLocaleString()}</span> },
  { key: 'duration', header: 'Durée' },
  { key: 'time', header: 'Heure' },
];

export default function DeerFlowPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="DeerFlow Agent Monitor" subtitle="Sessions agent en temps réel — CPU RunPod" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deerflowKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <ChartCard title="Outils Utilisés" subtitle="Répartition des appels d'outils cette semaine">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'web_search', count: 234, pct: '35%' },
            { name: 'qdrant_query', count: 189, pct: '28%' },
            { name: 'summarizer', count: 112, pct: '17%' },
            { name: 'calculator', count: 67, pct: '10%' },
          ].map((tool) => (
            <div key={tool.name} className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{tool.count}</p>
              <p className="text-[10px] text-gray-500 font-mono">{tool.name}</p>
              <p className="text-[10px] text-emerald-400 mt-1">{tool.pct}</p>
            </div>
          ))}
        </div>
      </ChartCard>
      <SectionHeader title="Sessions Récentes" />
      <DataTable columns={cols} data={sessions} />
    </div>
  );
}
