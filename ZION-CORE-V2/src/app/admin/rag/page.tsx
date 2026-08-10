/* GabomaGPT · RAG Monitor · SmartANDJ AI Technologies */
'use client';
import { KPICard, SectionHeader, DataTable, StatusBadge } from '@/components/admin/AdminComponents';

const ragKpis = [
  { title: 'Collections Qdrant', value: 8, icon: '📚' },
  { title: 'Documents Indexés', value: 1247, change: '+34', changeType: 'up' as const, icon: '📄' },
  { title: 'Chunks Total', value: '45.2K', icon: '🧩' },
  { title: 'Latence Moyenne', value: '12ms', change: '-3ms', changeType: 'up' as const, icon: '⚡' },
];

const collections = [
  { name: 'code_forestier', documents: 156, chunks: 4820, embedding: 'all-MiniLM-L6-v2', size: '234MB', status: 'active' },
  { name: 'constitution_gabon', documents: 12, chunks: 890, embedding: 'all-MiniLM-L6-v2', size: '45MB', status: 'active' },
  { name: 'lois_gabonaises', documents: 342, chunks: 12400, embedding: 'all-MiniLM-L6-v2', size: '567MB', status: 'active' },
  { name: 'culture_gabon', documents: 89, chunks: 3200, embedding: 'all-MiniLM-L6-v2', size: '128MB', status: 'active' },
  { name: 'langues_locales', documents: 234, chunks: 8900, embedding: 'all-MiniLM-L6-v2', size: '345MB', status: 'indexing' },
];

const cols = [
  { key: 'name', header: 'Collection', render: (r: Record<string, unknown>) => <span className="font-mono text-emerald-400 text-sm">{r.name as string}</span> },
  { key: 'documents', header: 'Documents' },
  { key: 'chunks', header: 'Chunks', render: (r: Record<string, unknown>) => <span>{(r.chunks as number).toLocaleString()}</span> },
  { key: 'embedding', header: 'Modèle', render: (r: Record<string, unknown>) => <span className="text-xs text-gray-500">{r.embedding as string}</span> },
  { key: 'size', header: 'Taille' },
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => <StatusBadge label={r.status as string} variant={r.status === 'active' ? 'success' : 'info'} /> },
];

export default function RagMonitorPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="RAG Monitor" subtitle="Qdrant collections et statistiques d'indexation" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ragKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <DataTable columns={cols} data={collections} />
    </div>
  );
}
