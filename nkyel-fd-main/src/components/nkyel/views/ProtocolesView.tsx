import React from 'react';
import { motion } from 'framer-motion';
import { 
  Network, ArrowUpRight, ArrowDownRight, CheckCircle2, ExternalLink, 
  Settings, AlertTriangle, HeartPulse, ChevronRight, ShieldCheck, 
  RefreshCw, Server, Activity, UserCircle
} from 'lucide-react';

export default function ProtocolesView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="flex items-center gap-4 mb-6 mt-2">
        <div className="w-14 h-14 rounded-2xl bg-[#0E1322] border border-white/10 flex items-center justify-center">
          <Network size={28} className="text-[#A855F7]" />
        </div>
        <div>
          <h1 className="font-serif text-[32px] leading-tight">Protocoles</h1>
          <p className="text-slate-400 text-[13px] leading-snug">
            Orchestrez les standards d'interopérabilité<br/>et contrôlez vos connexions.
          </p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Sessions actives', value: '12', trend: 'up', change: '2', graphColor: '#10B981', svgPath: 'M0 20 Q10 15 20 18 T40 10' },
          { label: 'Exécutions (24h)', value: '1 248', trend: 'up', change: '18%', graphColor: '#10B981', svgPath: 'M0 20 Q15 5 25 15 T40 5' },
          { label: 'Erreurs (24h)', value: '3', trend: 'down', change: '2', graphColor: '#EF4444', svgPath: 'M0 10 Q10 20 20 15 T40 20' },
          { label: 'Latence médiane', value: '182 ms', trend: 'down', change: '24 ms', graphColor: '#10B981', svgPath: 'M0 15 Q10 10 20 15 T40 18' },
        ].map((metric, i) => (
          <div key={i} className="bg-[#05070E] relative border-b border-white/5 py-2">
            <div className="text-[10px] text-slate-500 mb-1">{metric.label}</div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[17px] font-medium text-white">{metric.value}</span>
              <span className={`text-[10px] flex items-center ${metric.trend === 'up' ? 'text-[#10B981]' : metric.trend === 'down' && metric.graphColor === '#10B981' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {metric.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {metric.change}
              </span>
            </div>
            {/* Sparkline */}
            <div className="h-4 w-full">
              <svg viewBox="0 0 40 20" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <path d={metric.svgPath} stroke={metric.graphColor} strokeWidth="1.5" fill="none" />
                <path d={`${metric.svgPath} L40 20 L0 20 Z`} fill="url(#grad)" opacity="0.1" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={metric.graphColor} />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Cards 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* MCP Card */}
        <div className="bg-[#0E1322] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#05070E] border border-[#A855F7]/30 flex items-center justify-center">
                <Server size={20} className="text-[#A855F7]" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-[15px]">MCP</div>
                <div className="flex items-center gap-1 justify-end text-[11px] text-[#10B981]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> Actif
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Latence médiane</span>
                <span className="text-slate-200">128 ms</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Auth</span>
                <span className="text-slate-200 flex items-center gap-1">OAuth 2.1 <CheckCircle2 size={12} className="text-[#10B981]"/></span>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] text-slate-300">
            <span className="flex items-center gap-2"><Settings size={14}/> Gérer</span>
            <ChevronRight size={14} className="text-slate-500"/>
          </button>
        </div>

        {/* A2A Card */}
        <div className="bg-[#0E1322] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#05070E] border border-[#A855F7]/30 flex items-center justify-center">
                <Network size={20} className="text-[#A855F7]" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-[15px]">A2A</div>
                <div className="flex items-center gap-1 justify-end text-[11px] text-[#10B981]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> Actif
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Latence médiane</span>
                <span className="text-slate-200">164 ms</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Auth</span>
                <span className="text-slate-200 flex items-center gap-1">Clé API <CheckCircle2 size={12} className="text-[#10B981]"/></span>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] text-slate-300">
            <span>Ouvrir</span>
            <ExternalLink size={14} className="text-slate-400"/>
          </button>
        </div>

        {/* A2-UI Card */}
        <div className="bg-[#0E1322] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#05070E] border border-[#A855F7]/30 flex items-center justify-center">
                <Activity size={20} className="text-[#A855F7]" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-[15px]">A2-UI</div>
                <div className="flex items-center gap-1 justify-end text-[11px] text-[#10B981]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> Actif
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Latence médiane</span>
                <span className="text-slate-200">176 ms</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Auth</span>
                <span className="text-slate-200 flex items-center gap-1">JWT <CheckCircle2 size={12} className="text-[#10B981]"/></span>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] text-slate-300">
            <span>Ouvrir</span>
            <ExternalLink size={14} className="text-slate-400"/>
          </button>
        </div>

        {/* AG-UI Card */}
        <div className="bg-[#0E1322] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#05070E] border border-[#A855F7]/30 flex items-center justify-center">
                <UserCircle size={20} className="text-[#A855F7]" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-[15px]">AG-UI</div>
                <div className="flex items-center gap-1 justify-end text-[11px] text-[#F59E0B]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div> Dégradé
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Latence médiane</span>
                <span className="text-slate-200">312 ms</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400">Auth</span>
                <span className="text-slate-200 flex items-center gap-1">Session <AlertTriangle size={12} className="text-[#F59E0B]"/></span>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] text-slate-300">
            <span className="flex items-center gap-2"><Settings size={14}/> Gérer</span>
            <ChevronRight size={14} className="text-slate-500"/>
          </button>
        </div>
      </div>

      {/* Serveurs MCP Full Width Card */}
      <div className="bg-[#0E1322] border border-white/10 rounded-2xl p-4 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.05)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#05070E] border border-white/10 flex items-center justify-center">
              <Server size={18} className="text-slate-300" />
            </div>
            <div>
              <div className="text-[15px] font-medium leading-tight">Serveurs MCP</div>
              <div className="text-[12px] text-[#10B981]">5 actifs</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 leading-tight mb-0.5">Santé globale</div>
            <div className="text-[13px] font-medium text-[#10B981] flex items-center gap-1.5 justify-end">
              Sain <HeartPulse size={14} className="text-[#10B981] animate-pulse" />
            </div>
          </div>
        </div>
        <button className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] text-slate-300">
          <span className="flex items-center gap-2"><Settings size={14}/> Gérer</span>
          <ChevronRight size={14} className="text-slate-500"/>
        </button>
      </div>

      {/* Connexions en direct */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-medium">Connexions en direct</h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="bg-[#05070E] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {[
            { name: 'github.com', badge: 'MCP', status: 'En ligne', color: 'bg-[#10B981]', lat: '115 ms', icon: () => <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.49C9.339 21.58 9.52 21.27 9.52 21.012C9.52 20.782 9.51 20.141 9.505 19.282C6.728 19.884 6.142 17.94 6.142 17.94C5.687 16.786 5.031 16.48 5.031 16.48C4.123 15.86 5.1 15.872 5.1 15.872C6.105 15.943 6.633 16.903 6.633 16.903C7.525 18.431 8.973 17.989 9.54 17.734C9.63 17.086 9.89 16.645 10.178 16.395C7.962 16.143 5.632 15.286 5.632 11.477C5.632 10.392 6.019 9.503 6.647 8.812C6.545 8.56 6.208 7.545 6.744 6.155C6.744 6.155 7.571 5.89 9.493 7.191C10.278 6.973 11.127 6.864 11.97 6.86C12.813 6.864 13.662 6.973 14.448 7.191C16.368 5.89 17.194 6.155 17.194 6.155C17.731 7.545 17.394 8.56 17.293 8.812C17.923 9.503 18.307 10.392 18.307 11.477C18.307 15.297 15.975 16.14 13.754 16.386C14.116 16.698 14.441 17.311 14.441 18.257C14.441 19.613 14.429 20.707 14.429 21.012C14.429 21.273 14.608 21.587 15.114 21.488C19.085 20.163 21.947 16.417 21.947 12C21.947 6.477 17.47 2 11.947 2H12Z"/></svg></div> },
            { name: 'slack.com', badge: 'A2A', status: 'En ligne', color: 'bg-[#10B981]', lat: '134 ms', icon: () => <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="9" width="4" height="10" rx="2" fill="#E01E5A"/><rect x="9" y="5" width="4" height="10" rx="2" fill="#36C5F0"/><rect x="15" y="5" width="4" height="10" rx="2" fill="#2EB67D"/><rect x="11" y="9" width="10" height="4" rx="2" fill="#ECB22E"/></svg></div> },
            { name: 'Snowflake', badge: 'MCP', status: 'En ligne', color: 'bg-[#10B981]', lat: '156 ms', icon: () => <div className="text-[#29B5E8] font-bold">S</div> },
            { name: 'PostgreSQL', badge: 'MCP', status: 'Dégradé', color: 'bg-[#F59E0B]', lat: '286 ms', icon: () => <div className="text-[#336791] font-bold">P</div> },
          ].map((conn, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-[#0E1322]">
                  <conn.icon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium">{conn.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium uppercase tracking-wide">{conn.badge}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 w-20">
                  <div className={`w-1.5 h-1.5 rounded-full ${conn.color}`}></div>
                  <span className={`text-[12px] ${conn.color.replace('bg-', 'text-')}`}>{conn.status}</span>
                </div>
                <div className="text-[13px] text-slate-400 w-12 text-right">{conn.lat}</div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[11px] text-slate-400 mt-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#A855F7]" /> Chiffrement TLS 1.3
        </div>
        <div className="flex items-center gap-2">
          Dernière vérification : il y a 2 min
          <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <RefreshCw size={10} />
          </button>
        </div>
      </div>

    </motion.div>
  );
}
