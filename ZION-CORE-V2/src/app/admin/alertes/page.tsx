/* GabomaGPT · Alerts & Incidents · SmartANDJ AI Technologies */
'use client';
import { SectionHeader, DataTable, StatusBadge, KPICard } from '@/components/admin/AdminComponents';

const alertKpis = [
  { title: 'Erreurs (24h)', value: 12, change: '-3', changeType: 'up' as const, icon: '🚨' },
  { title: 'Uptime Global', value: '99.95%', icon: '🟢' },
  { title: 'Incidents Ouverts', value: 1, icon: '⚠️' },
  { title: 'Temps Résolution Moy.', value: '12min', change: '-4min', changeType: 'up' as const, icon: '⏱' },
];

const alerts = [
  { id: 'INC-012', service: 'Groq API', type: 'Timeout', message: 'Request timeout after 30s on model llama-3.3-70b', severity: 'high', status: 'open', count: 3, firstSeen: '18/06 14:32', lastSeen: '18/06 14:35' },
  { id: 'INC-011', service: 'DeerFlow', type: 'Tool Error', message: 'web_search tool returned empty results for 5 consecutive calls', severity: 'medium', status: 'resolved', count: 5, firstSeen: '18/06 12:10', lastSeen: '18/06 12:22' },
  { id: 'INC-010', service: 'RAG Qdrant', type: 'Connection', message: 'Qdrant cluster reconnection after brief network issue', severity: 'low', status: 'resolved', count: 1, firstSeen: '17/06 22:45', lastSeen: '17/06 22:45' },
  { id: 'INC-009', service: 'Frontend', type: 'JS Error', message: 'Uncaught TypeError in ChatScreen component on Safari iOS', severity: 'medium', status: 'resolved', count: 8, firstSeen: '17/06 18:00', lastSeen: '17/06 20:15' },
];

const cols = [
  { key: 'id', header: 'Incident', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-gray-500">{r.id as string}</span> },
  { key: 'service', header: 'Service', render: (r: Record<string, unknown>) => <StatusBadge label={r.service as string} variant="info" /> },
  { key: 'type', header: 'Type' },
  { key: 'message', header: 'Message', className: 'max-w-[300px] truncate' },
  { key: 'severity', header: 'Sévérité', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.severity as string} variant={r.severity === 'high' ? 'error' : r.severity === 'medium' ? 'warning' : 'neutral'} />
  )},
  { key: 'count', header: 'Occurrences' },
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.status as string} variant={r.status === 'open' ? 'error' : 'success'} />
  )},
  { key: 'lastSeen', header: 'Dernier' },
];

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Alertes & Incidents" subtitle="Sentry errors + Better Stack incidents" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alertKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <DataTable columns={cols} data={alerts} />
    </div>
  );
}
