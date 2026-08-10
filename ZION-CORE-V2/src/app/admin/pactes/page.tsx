/* GabomaGPT · Billing & Credits · SmartANDJ AI Technologies */
'use client';
import { KPICard, SectionHeader, DataTable, StatusBadge, ChartCard } from '@/components/admin/AdminComponents';

const billingKpis = [
  { title: 'Revenus Mois', value: '₣ 1.2M', change: '+5%', changeType: 'up' as const, icon: '💰', subtitle: 'FCFA' },
  { title: 'Users Pro', value: 89, change: '+12', changeType: 'up' as const, icon: '👑' },
  { title: 'Crédits Distribués', value: '284K', icon: '🎫' },
  { title: 'Coût LLM', value: '$342', change: '+8%', changeType: 'down' as const, icon: '🤖', subtitle: 'Groq API ce mois' },
];

const ledger = [
  { user: 'Jean M.', type: 'debit', amount: -50, balance: 450, reason: 'Chat Pro — 12 messages', date: '18/06 14:32' },
  { user: 'Marie O.', type: 'credit', amount: 500, balance: 1500, reason: 'Achat Pack Pro', date: '18/06 12:00' },
  { user: 'Paul N.', type: 'debit', amount: -200, balance: 800, reason: 'Agent session — recherche approfondie', date: '18/06 11:44' },
  { user: 'Sophie K.', type: 'refund', amount: 100, balance: 600, reason: 'Remboursement — erreur agent', date: '17/06 22:15' },
  { user: 'Alain B.', type: 'credit', amount: 1000, balance: 2000, reason: 'Achat Pack Entreprise', date: '17/06 18:30' },
];

const cols = [
  { key: 'user', header: 'Utilisateur' },
  { key: 'type', header: 'Type', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.type as string} variant={r.type === 'credit' ? 'success' : r.type === 'refund' ? 'info' : 'error'} />
  )},
  { key: 'amount', header: 'Montant', render: (r: Record<string, unknown>) => {
    const amt = r.amount as number;
    return <span className={`font-mono text-sm ${amt > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{amt > 0 ? '+' : ''}{amt}</span>;
  }},
  { key: 'balance', header: 'Solde', render: (r: Record<string, unknown>) => <span className="font-mono text-sm text-white">{r.balance as number}</span> },
  { key: 'reason', header: 'Raison', className: 'max-w-[250px]' },
  { key: 'date', header: 'Date' },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Billing & Credits" subtitle="Revenus, crédits et coûts LLM" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {billingKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <ChartCard title="Répartition des Coûts" subtitle="Coût par service ce mois">
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Groq API', cost: '$342', pct: '68%', color: 'from-emerald-500 to-teal-500' },
            { name: 'Neon DB', cost: '$25', pct: '5%', color: 'from-blue-500 to-indigo-500' },
            { name: 'Infra (RunPod)', cost: '$135', pct: '27%', color: 'from-violet-500 to-purple-500' },
          ].map((s) => (
            <div key={s.name} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${s.color} mb-3`} />
              <p className="text-lg font-bold text-white">{s.cost}</p>
              <p className="text-xs text-gray-500">{s.name}</p>
              <p className="text-[10px] text-gray-600 mt-1">{s.pct} du total</p>
            </div>
          ))}
        </div>
      </ChartCard>
      <SectionHeader title="Journal des Crédits" subtitle="Transactions récentes" />
      <DataTable columns={cols} data={ledger} />
    </div>
  );
}
