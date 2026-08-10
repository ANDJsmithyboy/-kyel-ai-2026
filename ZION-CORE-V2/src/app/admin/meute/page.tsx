/* GabomaGPT · Admin Users (Meute) · SmartANDJ AI Technologies */
'use client';

import { useState } from 'react';
import { SectionHeader, StatusBadge, KPICard } from '@/components/admin/AdminComponents';
import { Users, UserCheck, Crown, Pulse, CaretDown, CaretUp, Funnel, MagnifyingGlass } from '@phosphor-icons/react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';

const userKpis = [
  { title: 'Meute Globale', value: 2847, change: '+12%', changeType: 'up' as const, icon: Users },
  { title: 'Actifs Aujourd\'hui', value: 143, change: '+8', changeType: 'up' as const, icon: UserCheck },
  { title: 'Pactes VIP', value: 89, change: '+12', changeType: 'up' as const, icon: Crown },
  { title: 'Taux Rétention', value: '72%', change: '+3%', changeType: 'up' as const, icon: Pulse },
];

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  conversations: number;
  tokensUsed: number;
  lastActive: string;
  status: string;
};

const mockUsers: UserData[] = [
  { id: '1', name: 'Jean Moussavou', email: 'jean@email.ga', role: 'free', credits: 450, conversations: 34, tokensUsed: 124000, lastActive: '18/06 14:32', status: 'active' },
  { id: '2', name: 'Marie Ondo', email: 'marie@email.ga', role: 'pro', credits: 1500, conversations: 128, tokensUsed: 890000, lastActive: '18/06 13:15', status: 'active' },
  { id: '3', name: 'Paul Nze', email: 'paul@email.ga', role: 'pro', credits: 800, conversations: 67, tokensUsed: 456000, lastActive: '18/06 11:44', status: 'active' },
  { id: '4', name: 'Sophie Koumba', email: 'sophie@email.ga', role: 'free', credits: 12, conversations: 8, tokensUsed: 23000, lastActive: '17/06 22:10', status: 'inactive' },
  { id: '5', name: 'Alain B.', email: 'alain@email.ga', role: 'free', credits: 0, conversations: 2, tokensUsed: 5400, lastActive: '15/06 10:00', status: 'banned' },
  { id: '6', name: 'Daniel ANDJ', email: 'founder@gaboma.ga', role: 'admin', credits: 999999, conversations: 1450, tokensUsed: 15000000, lastActive: '19/06 16:30', status: 'active' },
];

const columnHelper = createColumnHelper<UserData>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Utilisateur',
    cell: (info) => (
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight antialiased">{info.getValue()}</p>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{info.row.original.email}</p>
      </div>
    ),
  }),
  columnHelper.accessor('role', {
    header: 'Pacte (Rôle)',
    cell: (info) => {
      const r = info.getValue();
      return <StatusBadge label={r} variant={r === 'pro' ? 'warning' : r === 'admin' ? 'info' : 'neutral'} />;
    },
  }),
  columnHelper.accessor('credits', {
    header: 'Crédits Restants',
    cell: (info) => {
      const val = info.getValue();
      return <span className={`font-mono text-[13px] tracking-tight ${val < 50 ? 'text-[var(--destructive)]' : 'text-[var(--text-secondary)]'}`}>{val.toLocaleString()}</span>;
    },
  }),
  columnHelper.accessor('conversations', {
    header: 'Pistes (Conv.)',
    cell: (info) => <span className="text-[13px] font-medium text-[var(--text-primary)]">{info.getValue()}</span>,
  }),
  columnHelper.accessor('tokensUsed', {
    header: 'Tokens',
    cell: (info) => <span className="text-[13px] font-semibold text-[var(--text-secondary)]">{(info.getValue() / 1000).toFixed(0)}K</span>,
  }),
  columnHelper.accessor('lastActive', {
    header: 'Dernière Activité',
    cell: (info) => <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{info.getValue()}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Statut',
    cell: (info) => {
      const st = info.getValue();
      return <StatusBadge label={st} variant={st === 'active' ? 'success' : st === 'banned' ? 'error' : 'neutral'} />;
    },
  }),
];

export default function MeutePage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredData = mockUsers.filter(u => roleFilter === 'all' ? true : u.role === roleFilter);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  return (
    <div className="space-y-8 antialiased animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader 
        title="La Meute" 
        subtitle="Gestion avancée des utilisateurs, rôles et crédits du réseau." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {userKpis.map((k) => <KPICard key={k.title} {...k} />)}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl shadow-sm backdrop-blur-xl p-6">
        
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-2">
            {['all', 'free', 'pro', 'admin'].map((r) => {
              const isActive = roleFilter === r;
              return (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`h-9 px-4 rounded-lg text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 antialiased
                    ${isActive 
                      ? `bg-[var(--glass)] text-[var(--text-primary)] border border-[var(--accent)]/30` 
                      : `bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--glass-border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card2)]`
                    }`}>
                  {r === 'all' ? 'Toute la Meute' : r}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm antialiased"
            />
            <MagnifyingGlass size={16} weight="thin" className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          </div>
        </div>
        
        {/* TanStack Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-[var(--bg-base)]/50 border-b border-[var(--glass-border)]">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="flex items-center text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {{
                            asc: <CaretUp size={12} weight="bold" />,
                            desc: <CaretDown size={12} weight="bold" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <Funnel size={12} weight="thin" className="opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-sm font-medium text-[var(--text-muted)]">
                    Aucun membre trouvé dans la meute.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-[var(--bg-card2)] transition-colors duration-200">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-6">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-4 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-widest disabled:opacity-50 hover:bg-[var(--glass)] transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-4 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-widest disabled:opacity-50 hover:bg-[var(--glass)] transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
