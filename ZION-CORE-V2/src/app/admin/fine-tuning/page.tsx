/* GabomaGPT · Fine-tuning Jobs · SmartANDJ AI Technologies */
'use client';
import { SectionHeader, DataTable, StatusBadge, KPICard } from '@/components/admin/AdminComponents';

const ftKpis = [
  { title: 'Jobs Total', value: 18, icon: '🧬' },
  { title: 'En Cours', value: 1, icon: '🔄' },
  { title: 'Réussis', value: 15, change: '83%', changeType: 'up' as const, icon: '✅' },
  { title: 'Dataset Total', value: '12.4K', icon: '📊', subtitle: 'exemples d\'entraînement' },
];

const jobs = [
  { id: 'ft-018', model: 'Qwen2.5-7B', type: 'LoRA', dataset: 'gaboma_agent_v3', examples: 247, epochs: 5, lr: '2e-4', status: 'running', loss: 0.38, progress: '68%', started: '18/06 20:00' },
  { id: 'ft-017', model: 'Qwen2.5-7B', type: 'SFT', dataset: 'gaboma_chat_v5', examples: 3200, epochs: 3, lr: '1e-4', status: 'completed', loss: 0.31, progress: '100%', started: '17/06 14:00' },
  { id: 'ft-016', model: 'Llama-3.3-8B', type: 'LoRA', dataset: 'gaboma_rag_v2', examples: 890, epochs: 3, lr: '2e-4', status: 'completed', loss: 0.44, progress: '100%', started: '16/06 10:00' },
  { id: 'ft-015', model: 'Qwen2.5-7B', type: 'SFT', dataset: 'gaboma_multilang_v1', examples: 1200, epochs: 5, lr: '5e-5', status: 'failed', loss: 2.1, progress: '23%', started: '15/06 08:00' },
];

const cols = [
  { key: 'id', header: 'Job', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-gray-500">{r.id as string}</span> },
  { key: 'model', header: 'Modèle' },
  { key: 'type', header: 'Type', render: (r: Record<string, unknown>) => <StatusBadge label={r.type as string} variant={r.type === 'SFT' ? 'info' : 'warning'} /> },
  { key: 'dataset', header: 'Dataset', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-emerald-400">{r.dataset as string}</span> },
  { key: 'examples', header: 'Exemples', render: (r: Record<string, unknown>) => <span>{(r.examples as number).toLocaleString()}</span> },
  { key: 'epochs', header: 'Epochs' },
  { key: 'loss', header: 'Loss', render: (r: Record<string, unknown>) => {
    const l = r.loss as number;
    return <span className={`font-mono text-sm ${l > 1 ? 'text-red-400' : l > 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>{l}</span>;
  }},
  { key: 'progress', header: 'Progrès', render: (r: Record<string, unknown>) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: r.progress as string }} />
      </div>
      <span className="text-[10px] text-gray-500">{r.progress as string}</span>
    </div>
  )},
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.status as string} variant={r.status === 'completed' ? 'success' : r.status === 'running' ? 'info' : 'error'} />
  )},
];

export default function FineTuningPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Fine-tuning Jobs" subtitle="SFT et LoRA — Entraînement des modèles Gaboma"
        action={<button className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">+ Nouveau Job</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ftKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <DataTable columns={cols} data={jobs} />
    </div>
  );
}
