/* GabomaGPT · Quality Lab · SmartANDJ AI Technologies
   Section 20B: Transform feedback into test cases, compare prompt/model versions */
'use client';
import { SectionHeader, DataTable, StatusBadge, KPICard, ChartCard } from '@/components/admin/AdminComponents';

const qualityKpis = [
  { title: 'Test Cases Total', value: 234, change: '+18', changeType: 'up' as const, icon: '🧪' },
  { title: 'Tests Passés', value: '89%', change: '+2%', changeType: 'up' as const, icon: '✅' },
  { title: 'Régressions', value: 3, change: '-2', changeType: 'up' as const, icon: '🐛' },
  { title: 'Versions Prompt', value: 12, icon: '📝' },
];

const testCases = [
  { id: 'TC-001', input: 'Explique le code forestier du Gabon', expected: 'Mention Loi 16/01...', version: 'v2.3', status: 'passed', severity: 'high', source: 'feedback' },
  { id: 'TC-002', input: 'Traduis "bonjour" en fang', expected: '"Mbolo"', version: 'v2.3', status: 'passed', severity: 'medium', source: 'feedback' },
  { id: 'TC-003', input: 'PIB du Gabon 2025', expected: 'Données actualisées...', version: 'v2.3', status: 'failed', severity: 'high', source: 'feedback' },
  { id: 'TC-004', input: 'Résume la Constitution', expected: 'Structure complète...', version: 'v2.3', status: 'passed', severity: 'low', source: 'manual' },
  { id: 'TC-005', input: 'Aide-moi à coder en Python', expected: 'Code fonctionnel...', version: 'v2.3', status: 'regression', severity: 'high', source: 'feedback' },
];

const promptVersions = [
  { version: 'v2.3', active: true, score: 4.3, passed: 209, total: 234, date: '18/06/2026' },
  { version: 'v2.2', active: false, score: 4.1, passed: 195, total: 220, date: '10/06/2026' },
  { version: 'v2.1', active: false, score: 3.9, passed: 178, total: 210, date: '01/06/2026' },
];

const tcCols = [
  { key: 'id', header: 'ID', render: (r: Record<string, unknown>) => <span className="font-mono text-xs text-gray-500">{r.id as string}</span> },
  { key: 'input', header: 'Input', className: 'max-w-[200px] truncate' },
  { key: 'expected', header: 'Expected', className: 'max-w-[200px] truncate' },
  { key: 'severity', header: 'Sévérité', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.severity as string} variant={r.severity === 'high' ? 'error' : r.severity === 'medium' ? 'warning' : 'neutral'} />
  )},
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.status as string} variant={r.status === 'passed' ? 'success' : r.status === 'regression' ? 'error' : 'warning'} />
  )},
  { key: 'source', header: 'Source' },
];

export default function QualityLabPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Quality Lab" subtitle="Test cases, régressions et comparaison de versions"
        action={<button className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">+ Créer Test Case</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {qualityKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <ChartCard title="Comparaison Versions Prompt" subtitle="Score feedback et tests passés">
        <div className="space-y-3">
          {promptVersions.map((pv) => (
            <div key={pv.version} className="flex items-center gap-4 bg-white/[0.02] rounded-xl p-3 border border-white/[0.06]">
              <div className="flex items-center gap-2 w-20">
                <span className="font-mono text-sm text-white">{pv.version}</span>
                {pv.active && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${(pv.passed / pv.total) * 100}%` }} />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-24 text-right">{pv.passed}/{pv.total} passed</span>
              <span className="text-xs text-amber-400 w-16 text-right">⭐ {pv.score}</span>
              <span className="text-[10px] text-gray-600 w-20 text-right">{pv.date}</span>
            </div>
          ))}
        </div>
      </ChartCard>
      <SectionHeader title="Test Cases" subtitle="Cas de test issus du feedback et corrections manuelles" />
      <DataTable columns={tcCols} data={testCases} />
    </div>
  );
}
