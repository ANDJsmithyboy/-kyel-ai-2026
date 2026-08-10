/* GabomaGPT · Waitlist · SmartANDJ AI Technologies */
'use client';
import { useState } from 'react';
import { SectionHeader, DataTable, StatusBadge, KPICard } from '@/components/admin/AdminComponents';

const waitlistKpis = [
  { title: 'Total Inscrits', value: 1432, change: '+89', changeType: 'up' as const, icon: '📋' },
  { title: 'En Attente', value: 876, icon: '⏳' },
  { title: 'Invités', value: 412, icon: '✉️' },
  { title: 'Convertis', value: 144, change: '32%', changeType: 'up' as const, icon: '✅', subtitle: 'taux de conversion' },
];

const mockWaitlist = [
  { id: '1', name: 'Fabrice M.', email: 'fabrice@univ-gabon.ga', reason: 'Recherche académique IA en langues locales', source: 'Twitter', status: 'pending', date: '18/06/2026' },
  { id: '2', name: 'Cynthia O.', email: 'cynthia@startup.ga', reason: 'Intégrer GabomaGPT dans notre SaaS', source: 'LinkedIn', status: 'invited', date: '17/06/2026' },
  { id: '3', name: 'Michel N.', email: 'michel@gov.ga', reason: 'Modernisation administration publique', source: 'Referral', status: 'pending', date: '16/06/2026' },
  { id: '4', name: 'Estelle B.', email: 'estelle@media.ga', reason: 'Création de contenu multilingue', source: 'Google', status: 'converted', date: '15/06/2026' },
  { id: '5', name: 'Patrick A.', email: 'patrick@edu.ga', reason: 'Plateforme éducative pour le fang', source: 'Twitter', status: 'pending', date: '14/06/2026' },
];

const cols = [
  { key: 'name', header: 'Nom', render: (r: Record<string, unknown>) => (
    <div><p className="text-sm font-medium text-white">{r.name as string}</p><p className="text-[10px] text-gray-500">{r.email as string}</p></div>
  )},
  { key: 'reason', header: 'Raison', className: 'max-w-[250px] truncate' },
  { key: 'source', header: 'Source', render: (r: Record<string, unknown>) => <StatusBadge label={r.source as string} variant="neutral" /> },
  { key: 'status', header: 'Statut', render: (r: Record<string, unknown>) => (
    <StatusBadge label={r.status as string} variant={r.status === 'converted' ? 'success' : r.status === 'invited' ? 'info' : 'warning'} />
  )},
  { key: 'date', header: 'Date' },
  { key: 'actions', header: 'Actions', render: (r: Record<string, unknown>) => (
    <div className="flex gap-2">
      {r.status === 'pending' && (
        <button className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
          Inviter
        </button>
      )}
      <button className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
        Rejeter
      </button>
    </div>
  )},
];

export default function WaitlistPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = statusFilter === 'all' ? mockWaitlist : mockWaitlist.filter((w) => w.status === statusFilter);

  return (
    <div className="space-y-8">
      <SectionHeader title="Waitlist Bêta" subtitle="Gestion des inscriptions à l'accès anticipé"
        action={<button className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">Inviter Sélection</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {waitlistKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>
      <div className="flex gap-2">
        {['all', 'pending', 'invited', 'converted'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`h-8 px-4 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]'}`}>
            {s === 'all' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <DataTable columns={cols} data={filtered} />
    </div>
  );
}
