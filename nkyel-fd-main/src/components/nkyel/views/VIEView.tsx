import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Brain, Zap, ShieldCheck, Globe, FileText, Database, MessageSquare, 
  ChevronRight, CheckCircle2, ArrowRight, Sparkles, Info
} from 'lucide-react';

export default function VIEView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col overflow-y-auto pb-32 no-scrollbar"
    >
      <h1 className="font-serif text-[40px] leading-tight mb-1">VIE</h1>
      <p className="text-slate-400 text-[15px] mb-6">Moteur d'intelligence visuelle de Ñkyel</p>

      {/* Hero Card with Panther */}
      <div className="bg-gradient-to-br from-[#0E1322] to-[#0A0D18] border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] mb-4">
        {/* Abstract Panther Graphic */}
        <div className="absolute -left-10 -top-10 w-64 h-64 opacity-60 mix-blend-screen pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#A855F7] fill-none stroke-[0.5]">
             <path d="M50 150 Q20 100 60 70 T120 50 Q160 40 180 80 T140 130 Q120 150 90 140 Z" />
             <path d="M70 140 Q40 90 80 60 T140 40 Q180 30 190 70" />
             <circle cx="120" cy="70" r="2" fill="white" className="shadow-[0_0_10px_white]" />
          </svg>
        </div>
        
        <div className="relative z-10 pl-24">
          <h3 className="font-serif text-[20px] leading-snug mb-6 text-white text-right">
            VIE voit, comprend et agit.<br/>
            Chaque décision est traçable.
          </h3>
          
          <div className="grid grid-cols-4 gap-2 text-center mt-8">
            <div className="flex flex-col items-center">
              <Eye size={20} className="text-[#A855F7] mb-2" />
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Perception</div>
              <div className="text-[10px] text-slate-500 leading-tight">Voir le réel</div>
            </div>
            <div className="flex flex-col items-center">
              <Brain size={20} className="text-[#A855F7] mb-2" />
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Intention</div>
              <div className="text-[10px] text-slate-500 leading-tight">Comprendre le sens</div>
            </div>
            <div className="flex flex-col items-center">
              <Zap size={20} className="text-[#A855F7] mb-2" />
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Exécution</div>
              <div className="text-[10px] text-slate-500 leading-tight">Agir avec précision</div>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={20} className="text-[#A855F7] mb-2" />
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Preuve</div>
              <div className="text-[10px] text-slate-500 leading-tight">Prouver chaque résultat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: PERCEPTION */}
      <div className="bg-[#0E1322]/80 border border-white/5 rounded-3xl p-5 mb-4 relative overflow-hidden">
        <div className="flex gap-4">
          <div className="w-1/2 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-bold text-lg">1</div>
              <h4 className="font-semibold text-[15px] tracking-wide text-[#A855F7] uppercase">Perception</h4>
            </div>
            <p className="text-[13px] text-slate-300 mb-6 leading-relaxed">
              VIE collecte et structure les signaux du monde réel.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div> EN COURS
              </span>
              <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                128 sources
              </span>
            </div>
          </div>
          
          <div className="w-1/2 flex items-center justify-end">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px] text-slate-200">
                <Globe size={16} className="text-slate-400" /> Web
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-200">
                <FileText size={16} className="text-slate-400" /> Documents
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-200">
                <Database size={16} className="text-slate-400" /> Bases internes
              </div>
              <div className="flex items-center gap-3 text-[13px] text-slate-200">
                <MessageSquare size={16} className="text-slate-400" /> Conversations
              </div>
              <div className="text-[12px] text-slate-500 pt-1">+ 8 autres</div>
            </div>
          </div>
        </div>
        {/* Dot pattern background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-8 -translate-y-1/2 w-32 h-32 opacity-30 pointer-events-none">
          <svg viewBox="0 0 100 100">
             <circle cx="20" cy="50" r="2" fill="#A855F7" />
             <circle cx="30" cy="30" r="1.5" fill="#A855F7" />
             <circle cx="30" cy="70" r="1.5" fill="#A855F7" />
             <circle cx="45" cy="15" r="1" fill="#A855F7" />
             <circle cx="45" cy="85" r="1" fill="#A855F7" />
             <path d="M20 50 Q50 50 80 20" stroke="#A855F7" strokeWidth="0.5" fill="none" opacity="0.5" />
             <path d="M20 50 Q50 50 80 80" stroke="#A855F7" strokeWidth="0.5" fill="none" opacity="0.5" />
             <path d="M20 50 Q60 50 90 50" stroke="#A855F7" strokeWidth="0.5" fill="none" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Step 2: INTERPRÉTATION */}
      <div className="bg-[#0E1322]/80 border border-white/5 rounded-3xl p-5 mb-4 relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-[60%]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-bold text-lg">2</div>
                <h4 className="font-semibold text-[15px] tracking-wide text-[#A855F7] uppercase">Interprétation</h4>
              </div>
              <p className="text-[13px] text-slate-300 mb-6 leading-relaxed">
                VIE analyse, relie et déduit l'intention derrière les données.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div> EN COURS
                </span>
                <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                  92% confiance
                </span>
              </div>
            </div>
            
            {/* Wave Graphic */}
            <div className="w-[35%] h-12 relative border-b border-l border-white/10">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path d="M0 30 Q10 20 20 25 T40 20 T60 15 T80 20 T100 5" stroke="#A855F7" strokeWidth="1.5" fill="none" />
                <circle cx="100" cy="5" r="3" fill="#A855F7" className="shadow-[0_0_10px_#A855F7]" />
                {/* Grid lines */}
                <line x1="25" y1="0" x2="25" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />
                <line x1="50" y1="0" x2="50" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />
                <line x1="75" y1="0" x2="75" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-[12px] text-slate-300 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">Contexte compris</div>
            <div className="text-[12px] text-slate-300 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">Intentions détectées</div>
            <div className="text-[12px] text-slate-300 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">Risques évalués</div>
          </div>
        </div>
      </div>

      {/* Step 3: PLAN D'ACTION */}
      <div className="bg-[#0E1322]/80 border border-white/5 rounded-3xl p-5 mb-4">
        <div className="flex gap-4">
          <div className="w-[45%]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-bold text-lg">3</div>
              <h4 className="font-semibold text-[15px] tracking-wide text-[#A855F7] uppercase">Plan d'action</h4>
            </div>
            <p className="text-[13px] text-slate-300 mb-6 leading-relaxed">
              VIE propose des actions hiérarchisées et prêtes à être exécutées.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> PRÊT
              </span>
              <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                4 actions
              </span>
            </div>
          </div>
          
          <div className="w-[55%] flex flex-col gap-2">
            {[
              { id: 1, label: 'Prioriser les tâches critiques', tag: 'ÉLEVÉE', tagColor: 'text-[#A855F7]' },
              { id: 2, label: 'Générer le plan détaillé', tag: 'MOYENNE', tagColor: 'text-[#F59E0B]' },
              { id: 3, label: 'Automatiser les suivis', tag: 'MOYENNE', tagColor: 'text-[#F59E0B]' },
              { id: 4, label: 'Notifier les parties prenantes', tag: 'FAIBLE', tagColor: 'text-slate-400' },
            ].map(act => (
              <div key={act.id} className="flex items-center justify-between text-[12px] bg-white/5 rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] text-slate-400">{act.id}</div>
                  <span className="text-slate-200">{act.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium ${act.tagColor}`}>{act.tag}</span>
                  <ChevronRight size={14} className="text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4: RÉSULTATS & PREUVE */}
      <div className="bg-[#0E1322]/80 border border-white/5 rounded-3xl p-5 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="w-1/2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-bold text-lg">4</div>
              <h4 className="font-semibold text-[15px] tracking-wide text-[#A855F7] uppercase">Résultats & Preuve</h4>
            </div>
            <p className="text-[13px] text-slate-300 mb-6 leading-relaxed">
              VIE exécute, mesure et fournit une preuve vérifiable.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> TERMINÉ
              </span>
              <span className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                Traçabilité 100%
              </span>
            </div>
          </div>
          
          <div className="w-[45%] flex gap-4">
            <div className="flex-1">
              <div className="text-[11px] text-slate-400 mb-1">Impact estimé</div>
              <div className="text-3xl font-serif text-[#A855F7] mb-1 leading-none">+27%</div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1">
                Gain de temps <Info size={12} className="text-slate-500" />
              </div>
            </div>
            
            {/* Chart Graphic */}
            <div className="w-16 h-12 relative border-b border-l border-white/10 mt-2">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <path d="M0 35 L20 25 L40 30 L60 15 L80 10 L100 5" stroke="#A855F7" strokeWidth="2" fill="none" />
                <circle cx="100" cy="5" r="3" fill="#A855F7" className="shadow-[0_0_10px_#A855F7]" />
                <path d="M0 35 L20 25 L40 30 L60 15 L80 10 L100 5 L100 40 L0 40 Z" fill="url(#grad)" opacity="0.2" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Footer Preuve */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <div className="flex items-center gap-2 text-[12px] text-slate-300">
            <CheckCircle2 size={16} className="text-[#10B981]" />
            <span className="text-white">Preuve</span> <ChevronRight size={12} className="text-slate-500" /> Journal d'exécution
          </div>
          <div className="flex items-center gap-1 text-[12px] text-slate-400 cursor-pointer hover:text-white transition-colors">
            Voir les détails <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Bottom info card */}
      <div className="bg-[#0E1322] border border-[#A855F7]/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.1)]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#A855F7]/10 text-[#A855F7]">
            <Sparkles size={18} />
          </div>
          <div className="text-[13px] text-slate-200">
            VIE apprend en continu pour des décisions toujours plus justes.
          </div>
        </div>
        <button className="text-[12px] flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-white">
          En savoir plus <ArrowRight size={14} />
        </button>
      </div>

    </motion.div>
  );
}
