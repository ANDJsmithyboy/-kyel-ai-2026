/* GabomaGPT · Admin Conversations · SmartANDJ AI Technologies
   View all conversations, search, filter, read messages
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { useState } from 'react';
import { SectionHeader, DataTable, StatusBadge, FilterBar } from '@/components/admin/AdminComponents';
import { useAdminTheme, adminThemes } from '@/stores/adminTheme';
import { Search } from 'lucide-react';

const mockConversations = [
  { id: '1', user: 'Jean Moussavou', email: 'jean@email.ga', mode: 'Flash', messages: 12, tokens: 3420, language: 'fr', title: 'Code forestier du Gabon', status: 'active', createdAt: '2026-06-18 14:32' },
  { id: '2', user: 'Marie Ondo', email: 'marie@email.ga', mode: 'Pro', messages: 28, tokens: 12800, language: 'fr', title: 'Analyse du rapport CNAMGS', status: 'completed', createdAt: '2026-06-18 13:15' },
  { id: '3', user: 'Paul Nze', email: 'paul@email.ga', mode: 'Agent', messages: 45, tokens: 28000, language: 'fr', title: 'Recherche sur le PIB gabonais', status: 'completed', createdAt: '2026-06-18 11:44' },
  { id: '4', user: 'Sophie Koumba', email: 'sophie@email.ga', mode: 'Flash', messages: 3, tokens: 890, language: 'fang', title: 'Traduction en fang', status: 'error', createdAt: '2026-06-18 10:20' },
  { id: '5', user: 'Alain Bongo', email: 'alain@email.ga', mode: 'Pro', messages: 15, tokens: 8900, language: 'fr', title: 'Résumé du plan stratégique', status: 'completed', createdAt: '2026-06-17 22:10' },
];

export default function ConversationsPage() {
  const { currentTheme } = useAdminTheme();
  const theme = adminThemes[currentTheme];

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');

  const filtered = mockConversations.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.user.toLowerCase().includes(search.toLowerCase())) return false;
    if (modeFilter !== 'all' && c.mode.toLowerCase() !== modeFilter) return false;
    if (langFilter !== 'all' && c.language !== langFilter) return false;
    return true;
  });

  const columns = [
    { key: 'user', header: 'Utilisateur', render: (row: Record<string, unknown>) => (
      <div>
        <p className="text-sm font-semibold text-zinc-50 tracking-tight antialiased">{row.user as string}</p>
        <p className="text-xs font-medium text-zinc-400 mt-0.5">{row.email as string}</p>
      </div>
    )},
    { key: 'title', header: 'Titre', className: 'max-w-[250px]', render: (row: Record<string, unknown>) => (
      <span className="text-sm font-medium text-zinc-300 truncate block max-w-[250px]">{row.title as string}</span>
    )},
    { key: 'mode', header: 'Mode', render: (row: Record<string, unknown>) => (
      <StatusBadge label={row.mode as string} variant={row.mode === 'Agent' ? 'info' : row.mode === 'Pro' ? 'warning' : 'success'} />
    )},
    { key: 'messages', header: 'Messages' },
    { key: 'tokens', header: 'Tokens', render: (row: Record<string, unknown>) => (
      <span className="text-sm font-semibold text-zinc-300 tracking-tight">{(row.tokens as number).toLocaleString('fr-FR')}</span>
    )},
    { key: 'language', header: 'Langue', render: (row: Record<string, unknown>) => (
      <StatusBadge label={row.language as string} variant="neutral" />
    )},
    { key: 'status', header: 'Statut', render: (row: Record<string, unknown>) => (
      <StatusBadge label={row.status as string} variant={row.status === 'active' ? 'success' : row.status === 'error' ? 'error' : 'neutral'} />
    )},
    { key: 'createdAt', header: 'Date', render: (row: Record<string, unknown>) => (
      <span className="text-[11px] font-medium text-zinc-500 tracking-widest uppercase">{row.createdAt as string}</span>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Toutes les Conversations" subtitle={`${filtered.length} conversations trouvées en base`} />

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
          </div>
          <input
            type="search"
            placeholder="Rechercher par mot-clé, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-900 border border-white/10 text-sm font-medium text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-zinc-800 transition-all shadow-sm antialiased"
          />
        </div>
        <FilterBar filters={[
          { name: 'Mode', value: modeFilter, onChange: setModeFilter, options: [
            { label: 'Tous les modèles', value: 'all' },
            { label: 'Flash (Rapide)', value: 'flash' },
            { label: 'Pro (Raisonnement)', value: 'pro' },
            { label: 'DeerFlow Agent', value: 'agent' },
          ]},
          { name: 'Langue', value: langFilter, onChange: setLangFilter, options: [
            { label: 'Toutes les langues', value: 'all' },
            { label: 'Français', value: 'fr' },
            { label: 'Fang', value: 'fang' },
            { label: 'Mpongwé', value: 'mpongwe' },
            { label: 'Punu', value: 'punu' },
          ]},
        ]} />
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
