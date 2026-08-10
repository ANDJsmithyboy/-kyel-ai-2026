/* GabomaGPT · Agent Traces · SmartANDJ AI Technologies
   Section 17+20D: Visualize agent trajectories, mark gold examples
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { SectionHeader, StatusBadge, TraceTimeline, KPICard } from '@/components/admin/AdminComponents';

const agentKpis = [
  { title: 'Sessions Total', value: 342, change: '+23%', changeType: 'up' as const, icon: '🦌' },
  { title: 'Taux Succès', value: '78%', change: '+3%', changeType: 'up' as const, icon: '✅' },
  { title: 'Gold Examples', value: 47, change: '+8', changeType: 'up' as const, icon: '⭐' },
  { title: 'Latence Moyenne', value: '2.4s', change: '-0.3s', changeType: 'up' as const, icon: '⚡' },
];

const sampleTrace = {
  id: 'trace-2026-06-18-001',
  user: 'Paul Nze',
  intent: 'Recherche approfondie sur l\'impact du code forestier gabonais sur l\'économie locale',
  outcome: 'success' as const,
  duration: '4.2s',
  tokens: 12400,
  steps: [
    { label: 'Intent Analysis', status: 'success' as const, detail: 'Recherche factuelle + analyse économique', duration: '120ms', timestamp: '14:32:01.000' },
    { label: 'Tool Selection', status: 'success' as const, detail: 'web_search, qdrant_query, calculator', duration: '45ms', timestamp: '14:32:01.120' },
    { label: 'RAG Query', status: 'success' as const, detail: '12 chunks retrieved from "code_forestier" collection', duration: '340ms', timestamp: '14:32:01.165' },
    { label: 'Web Search', status: 'success' as const, detail: 'Tavily: 5 results for "code forestier Gabon économie 2025"', duration: '890ms', timestamp: '14:32:01.505' },
    { label: 'Verification', status: 'success' as const, detail: 'Cross-referenced RAG chunks with web sources — 4/5 confirmed', duration: '650ms', timestamp: '14:32:02.395' },
    { label: 'Synthesis', status: 'success' as const, detail: 'Generated 1,200 word analysis with citations', duration: '1.8s', timestamp: '14:32:03.045' },
    { label: 'Quality Check', status: 'success' as const, detail: 'Confidence: 0.92 — No hallucination detected', duration: '280ms', timestamp: '14:32:04.845' },
  ],
};

const recentSessions = [
  { id: 'trace-001', user: 'Paul N.', intent: 'Recherche code forestier...', outcome: 'success', tools: 3, duration: '4.2s', gold: true },
  { id: 'trace-002', user: 'Marie O.', intent: 'Analyse rapport CNAMGS...', outcome: 'success', tools: 2, duration: '3.1s', gold: false },
  { id: 'trace-003', user: 'Jean M.', intent: 'Comparaison PIB Gabon/Congo...', outcome: 'partial', tools: 4, duration: '6.8s', gold: false },
  { id: 'trace-004', user: 'Sophie K.', intent: 'Traduction juridique en fang...', outcome: 'failure', tools: 1, duration: '1.2s', gold: false },
];

export default function AgentTracesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Agent Trace Viewer" subtitle="Trajectoires complètes des sessions DeerFlow" />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentKpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      {/* Selected Trace Detail */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold text-white">Trace: {sampleTrace.id}</h3>
              <StatusBadge label={sampleTrace.outcome} variant="success" />
              {true && (
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">⭐ Gold Example</span>
              )}
            </div>
            <p className="text-sm text-gray-400">{sampleTrace.intent}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[11px] text-gray-500">👤 {sampleTrace.user}</span>
              <span className="text-[11px] text-gray-500">⏱ {sampleTrace.duration}</span>
              <span className="text-[11px] text-gray-500">🔤 {sampleTrace.tokens.toLocaleString()} tokens</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-8 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium hover:bg-amber-500/20 transition-all">
              ⭐ Marquer Gold
            </button>
            <button className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 text-[11px] font-medium hover:bg-white/[0.08] transition-all">
              Export JSON
            </button>
          </div>
        </div>

        <TraceTimeline steps={sampleTrace.steps} />
      </div>

      {/* Recent Sessions List */}
      <div>
        <SectionHeader title="Sessions Récentes" subtitle="Cliquer pour voir la trajectoire" />
        <div className="space-y-2">
          {recentSessions.map((s) => (
            <div key={s.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.04] cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-mono">{s.id}</span>
                <span className="text-sm text-white">{s.user}</span>
                <span className="text-sm text-gray-400 truncate max-w-[300px]">{s.intent}</span>
              </div>
              <div className="flex items-center gap-3">
                {s.gold && <span className="text-amber-400 text-xs">⭐</span>}
                <span className="text-[11px] text-gray-500">{s.tools} outils</span>
                <span className="text-[11px] text-gray-500">{s.duration}</span>
                <StatusBadge
                  label={s.outcome}
                  variant={s.outcome === 'success' ? 'success' : s.outcome === 'failure' ? 'error' : 'warning'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
