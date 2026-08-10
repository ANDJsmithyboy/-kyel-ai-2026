/* GabomaGPT · Distillation Lab · SmartANDJ AI Technologies
   Section 18+20C: Teacher/Student pipeline, dataset status, SFT/LoRA jobs */
'use client';
import { SectionHeader, KPICard, ChartCard, DataTable, StatusBadge } from '@/components/admin/AdminComponents';

const distillKpis = [
  { title: 'Seed Examples', value: 247, change: '+23', changeType: 'up' as const, icon: '🌱', subtitle: 'Objectif: 300' },
  { title: 'Filtered Dataset', value: 198, icon: '🔬', subtitle: '80% retention rate' },
  { title: 'Eval Cases', value: 50, icon: '📊' },
  { title: 'Student Score', value: '72%', change: '+4%', changeType: 'up' as const, icon: '🎓', subtitle: 'vs Teacher: 91%' },
];

const datasets = [
  { name: 'distillation_agent_seed.jsonl', examples: 247, size: '12.4MB', status: 'ready', updated: '18/06/2026' },
  { name: 'distillation_agent_filtered.jsonl', examples: 198, size: '9.8MB', status: 'ready', updated: '18/06/2026' },
  { name: 'distillation_agent_eval.jsonl', examples: 50, size: '2.5MB', status: 'ready', updated: '17/06/2026' },
];

const jobs = [
  { id: 'job-001', type: 'SFT', model: 'Qwen2.5-7B', dataset: 'filtered', status: 'completed', epochs: 3, loss: 0.42, duration: '2h 34min', date: '17/06' },
  { id: 'job-002', type: 'LoRA', model: 'Qwen2.5-7B', dataset: 'filtered', status: 'running', epochs: 5, loss: 0.38, duration: '1h 12min', date: '18/06' },
  { id: 'job-003', type: 'LoRA', model: 'Llama-3.3-8B', dataset: 'seed', status: 'queued', epochs: 3, loss: null, duration: '-', date: '18/06' },
];

const comparison = [
  { metric: 'task_success_rate', teacher: '91%', student: '72%', gap: '-19%' },
  { metric: 'tool_success_rate', teacher: '95%', student: '84%', gap: '-11%' },
  { metric: 'verification_rate', teacher: '88%', student: '65%', gap: '-23%' },
  { metric: 'hallucination_rate', teacher: '2%', student: '8%', gap: '+6%' },
  { metric: 'avg_latency', teacher: '3.2s', student: '1.1s', gap: '-66%' },
  { metric: 'avg_cost', teacher: '$0.12', student: '$0.008', gap: '-93%' },
  { metric: 'user_feedback_score', teacher: '4.5', student: '3.9', gap: '-0.6' },
];

const dsCols = [
  { key: 'name', header: 'Fichier', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-emerald-400">{r.name as string}</span> },
  { key: 'examples', header: 'Exemples' },
  { key: 'size', header: 'Taille' },
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => <StatusBadge label={r.status as string} variant="success" /> },
  { key: 'updated', header: 'MàJ' },
];

const jobCols = [
  { key: 'id', header: 'Job', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-gray-500">{r.id as string}</span> },
  { key: 'type', header: 'Type', render: (r: Record<string, unknown>) => <StatusBadge label={r.type as string} variant={r.type === 'SFT' ? 'info' : 'warning'} /> },
  { key: 'model', header: 'Modèle' },
  { key: 'epochs', header: 'Epochs' },
  { key: 'loss', header: 'Loss', render: (r: Record<string, unknown>) => <span className="font-mono text-sm">{r.loss !== null ? r.loss as number : '—'}</span> },
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.status as string} variant={r.status === 'completed' ? 'success' : r.status === 'running' ? 'info' : 'neutral'} />
  )},
  { key: 'duration', header: 'Durée' },
];

export default function DistillationPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Distillation Lab" subtitle="Pipeline Teacher→Student pour l'agent souverain Gaboma" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {distillKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>

      {/* Teacher vs Student Comparison */}
      <ChartCard title="Teacher vs Student" subtitle="Comparaison des métriques clés">
        <div className="space-y-2">
          {comparison.map((c) => (
            <div key={c.metric} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-gray-400 font-mono">{c.metric}</span>
              <span className="text-sm text-violet-400 text-center">{c.teacher}</span>
              <span className="text-sm text-amber-400 text-center">{c.student}</span>
              <span className={`text-xs text-center ${c.metric === 'avg_latency' || c.metric === 'avg_cost' ? 'text-emerald-400' : c.gap.startsWith('+') ? 'text-red-400' : 'text-gray-500'}`}>{c.gap}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-4 pt-2 text-[10px] text-gray-600">
            <span>Métrique</span><span className="text-center">🎓 Teacher</span><span className="text-center">📚 Student</span><span className="text-center">Δ Gap</span>
          </div>
        </div>
      </ChartCard>

      <SectionHeader title="Datasets" />
      <DataTable columns={dsCols} data={datasets} />

      <SectionHeader title="Jobs d'Entraînement" subtitle="SFT et LoRA"
        action={<button className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors">+ Lancer Job</button>}
      />
      <DataTable columns={jobCols} data={jobs} />
    </div>
  );
}
