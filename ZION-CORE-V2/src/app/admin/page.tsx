/* GabomaGPT · Admin Dashboard · SmartANDJ AI Technologies
   Main dashboard — KPIs, charts, activity feed, system health
   Apple/Vercel-inspired Glassmorphism UI
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { 
  Users, ChatCircle, Lightning, CurrencyCircleDollar, 
  HardDrives, Database, Pulse, Cpu 
} from '@phosphor-icons/react';
import { 
  KPICard, ChartCard, StatusBadge, DataTable, 
  SectionHeader, TraceTimeline 
} from '@/components/admin/AdminComponents';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

// ── Mock data ──────────
const kpis = [
  { title: 'Meute (Utilisateurs)', value: 2847, change: '+12%', changeType: 'up' as const, icon: Users, subtitle: '143 cette semaine' },
  { title: 'Pistes (Conversations)', value: 18432, change: '+8%', changeType: 'up' as const, icon: ChatCircle, subtitle: '1,247 aujourd\'hui' },
  { title: 'Tokens Utilisés', value: '4.2M', change: '+15%', changeType: 'up' as const, icon: Lightning, subtitle: 'Flash: 3.1M · Pro: 1.1M' },
  { title: 'Pactes (Revenus)', value: '₣ 1.2M', change: '+5%', changeType: 'up' as const, icon: CurrencyCircleDollar, subtitle: 'FCFA ce mois' },
];

const systemStatus = [
  { label: 'Nœud Gaboma-Core', status: 'Opérationnel', uptime: '99.99%', load: '42%', isHigh: false },
  { label: 'DB Vectorielle (RAG)', status: 'Opérationnel', uptime: '100%', load: '18%', isHigh: false },
  { label: 'AUTOMATA V2.0', status: 'Haute Charge', uptime: '99.95%', load: '89%', isHigh: true },
  { label: 'Pactes (Billing)', status: 'Opérationnel', uptime: '99.98%', load: '34%', isHigh: false },
];

const recentConversations = [
  { user: 'Jean M.', mode: 'Onyx', messages: 12, lastMessage: 'Explique-moi le code forestier...', time: 'il y a 3min', status: 'active' },
  { user: 'Marie O.', mode: 'Aurata', messages: 8, lastMessage: 'Analyse ce document PDF...', time: 'il y a 7min', status: 'completed' },
  { user: 'Paul N.', mode: 'Black Panther', messages: 24, lastMessage: 'Recherche web approfondie sur...', time: 'il y a 15min', status: 'completed' },
  { user: 'Sophie K.', mode: 'Onyx', messages: 3, lastMessage: 'Traduis en fang...', time: 'il y a 22min', status: 'error' },
  { user: 'Alain B.', mode: 'Aurata', messages: 15, lastMessage: 'Résume le rapport annuel...', time: 'il y a 30min', status: 'completed' },
];

const systemHealth = [
  { service: 'API ZION-CORE-V2', status: 'operational', latency: '45ms', uptime: '99.97%', icon: HardDrives },
  { service: 'Onyx LLM', status: 'operational', latency: '320ms', uptime: '99.9%', icon: Cpu },
  { service: 'Qdrant RAG', status: 'operational', latency: '12ms', uptime: '99.95%', icon: Database },
  { service: 'AUTOMATA Agent', status: 'operational', latency: '890ms', uptime: '99.8%', icon: Pulse },
  { service: 'Neon PostgreSQL', status: 'operational', latency: '8ms', uptime: '99.99%', icon: HardDrives },
  { service: 'Upstash Redis', status: 'operational', latency: '3ms', uptime: '99.99%', icon: Pulse },
];

const columns = [
  { key: 'user', header: 'Utilisateur' },
  { key: 'mode', header: 'Vecteur', render: (row: Record<string, unknown>) => (
    <StatusBadge
      label={row.mode as string}
      variant={row.mode === 'Black Panther' ? 'info' : row.mode === 'Aurata' ? 'warning' : 'success'}
    />
  )},
  { key: 'messages', header: 'Requêtes' },
  { key: 'lastMessage', header: 'Dernière Piste', className: 'max-w-[300px] truncate' },
  { key: 'time', header: 'Heure' },
  { key: 'status', header: 'Statut', render: (row: Record<string, unknown>) => (
    <StatusBadge
      label={row.status as string}
      variant={row.status === 'active' ? 'success' : row.status === 'error' ? 'error' : 'neutral'}
    />
  )},
];

const chartData = [
  { day: '01', Onyx: 400, aurata: 240, panther: 100 },
  { day: '02', Onyx: 300, aurata: 139, panther: 220 },
  { day: '03', Onyx: 200, aurata: 980, panther: 229 },
  { day: '04', Onyx: 278, aurata: 390, panther: 200 },
  { day: '05', Onyx: 189, aurata: 480, panther: 218 },
  { day: '06', Onyx: 239, aurata: 380, panther: 250 },
  { day: '07', Onyx: 349, aurata: 430, panther: 210 },
];

const traceMock = [
  { label: 'User "Daniel" initiated AUTOMATA V2.0', status: 'success' as const, detail: 'Intent recognized: "Analyse rapport CNAMGS"', timestamp: '14:32:01', duration: '120ms' },
  { label: 'RAG Retrieval (Pinecone)', status: 'success' as const, detail: 'Searched index "gabon-laws-v2". Retrieved 4 relevant chunks.', timestamp: '14:32:02', duration: '840ms' },
  { label: 'LLM Reasoning (Aurata)', status: 'success' as const, detail: 'Generated 450 tokens. Context window: 12k tokens.', timestamp: '14:32:05', duration: '3.2s' },
  { label: 'Agent Tools Execution', status: 'running' as const, detail: 'Calling external API: "Ministère de l\'économie"...', timestamp: '14:32:06', duration: 'Running...' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 antialiased animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader 
        title="Dashboard Central" 
        subtitle="Aperçu global des performances du nœud ZION-CORE-V2."
      />

      {/* ── KPIs Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <KPICard key={k.title} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* ── Gauche : Charts & Metrics ─────────────── */}
        <div className="xl:col-span-2 space-y-5">
          <ChartCard title="Activité des Vecteurs IA" subtitle="Consommation de requêtes par modèle sur 7 jours">
            <div className="h-72 mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOnyx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAurata" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPanther" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Onyx" name="Onyx" stroke="var(--emerald)" strokeWidth={2} fillOpacity={1} fill="url(#colorOnyx)" />
                  <Area type="monotone" dataKey="aurata" name="Aurata" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorAurata)" />
                  <Area type="monotone" dataKey="panther" name="Black Panther" stroke="var(--destructive)" strokeWidth={2} fillOpacity={1} fill="url(#colorPanther)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="État des Serveurs & Sous-Systèmes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {systemStatus.map((sys) => {
                return (
                  <div key={sys.label} className="bg-[var(--bg-base)] rounded-xl p-5 border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <HardDrives size={16} weight="thin" className="text-[var(--text-muted)]" />
                        <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">{sys.label}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                        sys.isHigh ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20' 
                        : 'bg-[var(--emerald)]/10 text-[var(--emerald)] border-[var(--emerald)]/20'
                      }`}>
                        {sys.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5 uppercase tracking-widest font-semibold">
                          <span className="text-[var(--text-muted)]">Charge CPU/RAM</span>
                          <span className={sys.isHigh ? 'text-[var(--destructive)]' : 'text-[var(--text-primary)]'}>{sys.load}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-[var(--glass)] border border-[var(--glass-border)]">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_currentColor] ${sys.isHigh ? 'bg-[var(--destructive)]' : 'bg-[var(--emerald)]'}`} 
                            style={{ width: sys.load }} 
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest">
                        <span className="text-[var(--text-muted)]">Uptime</span>
                        <span className="text-[var(--text-primary)]">{sys.uptime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* ── Droite : Live Agent Traces ───────────────────── */}
        <div className="xl:col-span-1">
          <ChartCard title="Traces AUTOMATA V2.0" subtitle="Dernière exécution de l'agent" className="h-full">
            <div className="mt-8">
              <TraceTimeline steps={traceMock} />
            </div>
            
            <div className="mt-8 pt-5 border-t border-[var(--glass-border)] text-center">
              <button className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">
                Voir toutes les traces →
              </button>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Recent Conversations ─────────────────────────── */}
      <div className="mt-4">
        <SectionHeader
          title="Pistes en Direct"
          subtitle="Dernières requêtes de la Meute sur le réseau"
          action={
            <a href="/admin/pistes" className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--glass)]">
              Historique Complet →
            </a>
          }
        />
        <DataTable columns={columns} data={recentConversations} />
      </div>

      {/* ── System Health ────────────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
        <SectionHeader title="Infrastructure Réseau" subtitle="Santé des micro-services et bases de données en temps réel" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {systemHealth.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.service} className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl p-5 flex items-center justify-between hover:bg-[var(--bg-card2)] transition-colors group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shadow-inner">
                    <Icon size={18} weight="thin" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">{svc.service}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-semibold text-[var(--text-muted)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded-md border border-[var(--glass-border)] uppercase tracking-widest">
                        {svc.latency}
                      </span>
                      <span className="text-[9px] font-semibold text-[var(--emerald)] bg-[var(--emerald)]/10 px-1.5 py-0.5 rounded-md border border-[var(--emerald)]/20 uppercase tracking-widest">
                        {svc.uptime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--emerald)] shadow-[0_0_8px_var(--emerald)] animate-pulse" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
