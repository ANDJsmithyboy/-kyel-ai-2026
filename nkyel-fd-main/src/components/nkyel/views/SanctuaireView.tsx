import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, LayoutGrid, FileText, Clock, Sparkles, Link, 
  ChevronRight, Lock, MoreVertical, ShieldCheck, Pin, Play, Star,
  CheckCircle2, Folder, Check
} from 'lucide-react';

export default function SanctuaireView() {
  const [activeTab, setActiveTab] = useState('tout');

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="flex items-center gap-4 mb-6 mt-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0E1322] to-[#1A1F35] border-2 border-[#A855F7]/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
           <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-[#A855F7] stroke-2">
             <path d="M3 21h18M5 21V9M19 21V9M9 21V9M15 21V9M3 9l9-6 9 6" />
           </svg>
        </div>
        <div>
          <h1 className="font-serif text-[32px] leading-tight flex items-center gap-2">
            Sanctuaire <Sparkles size={20} className="text-[#A855F7]" />
          </h1>
          <p className="text-slate-400 text-[13px] leading-snug">
            Votre coffre de connaissances personnel<br/>protégé, organisé, à tout moment.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher dans votre sanctuaire..." 
          className="w-full bg-[#05070E] border border-white/10 rounded-2xl py-3.5 pl-10 pr-10 text-[14px] focus:outline-none focus:border-[#A855F7]/50 focus:ring-1 focus:ring-[#A855F7]/50 transition-all placeholder:text-slate-500"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-4 px-4">
        {[
          { id: 'tout', label: 'tout', icon: LayoutGrid },
          { id: 'documents', label: 'documents', icon: FileText },
          { id: 'memoires', label: 'mémoires', icon: Clock },
          { id: 'sorties', label: 'sorties', icon: Sparkles },
          { id: 'sources', label: 'sources', icon: Link },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors border ${activeTab === tab.id ? 'bg-[#A855F7]/20 border-[#A855F7]/50 text-white' : 'bg-[#0E1322] border-white/5 text-slate-400 hover:bg-white/5'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#A855F7]' : 'text-slate-500'} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collections Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-medium">
            <Folder size={18} className="text-[#6366F1]" /> Collections
          </h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {[
            { title: 'Stratégie produit', count: '12 éléments', color: 'from-[#A855F7]/40 to-transparent' },
            { title: 'Idées & inspiration', count: '27 éléments', color: 'from-[#F59E0B]/40 to-transparent' },
            { title: 'Apprentissage', count: '18 éléments', color: 'from-[#10B981]/40 to-transparent' },
            { title: 'Projets passés', count: '9 éléments', color: 'from-[#6366F1]/40 to-transparent' },
          ].map((col, i) => (
            <div key={i} className="min-w-[150px] w-[150px] h-[100px] rounded-2xl bg-[#0E1322] border border-white/5 relative overflow-hidden group cursor-pointer flex flex-col justify-end p-3">
              <div className={`absolute inset-0 bg-gradient-to-br ${col.color} opacity-50`}></div>
              {/* Fake abstract graphic bg */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0,100 C30,80 50,20 100,50 L100,100 Z" fill="white" />
              </svg>
              
              <div className="relative z-10">
                <div className="text-[13px] font-medium leading-tight mb-1 shadow-black drop-shadow-md">{col.title}</div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-300">{col.count}</div>
                  <Lock size={12} className="text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fichiers enregistrés */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-medium">
            <FileText size={18} className="text-[#A855F7]" /> Fichiers enregistrés
          </h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="bg-[#0E1322] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {[
            { name: 'Roadmap Ñkyel AI.pdf', meta: 'PDF • 2,4 Mo • 12 mai', iconColor: 'text-red-400' },
            { name: 'Brief lancement v2.docx', meta: 'DOCX • 1,1 Mo • 9 mai', iconColor: 'text-blue-400' },
            { name: 'Modèle financier.xlsx', meta: 'XLSX • 980 Ko • 6 mai', iconColor: 'text-green-400' },
          ].map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors">
              <div className="flex gap-3 items-center">
                <FileText size={20} className={file.iconColor} />
                <div>
                  <div className="text-[14px] font-medium">{file.name}</div>
                  <div className="text-[12px] text-slate-400">{file.meta}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck size={12} className="text-slate-500" /> sécurisé
                </div>
                <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mémoires épinglées */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-medium">
            <Clock size={18} className="text-[#A855F7]" /> Mémoires épinglées
          </h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-2">
          {[
            { title: 'Vision Ñkyel : devenir le copilote IA n°1 des solopreneurs', meta: 'Épinglé • 12 mai' },
            { title: 'Principes clés : rapidité, clarté, confiance, élégance', meta: 'Épinglé • 4 mai' },
          ].map((mem, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[#0E1322]/80 border border-[#A855F7]/20 rounded-xl">
              <div className="flex gap-3 items-start">
                <Pin size={16} className="text-[#A855F7] mt-0.5" />
                <div>
                  <div className="text-[13px] font-medium leading-tight mb-1">{mem.title}</div>
                  <div className="text-[11px] text-slate-400">{mem.meta}</div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-[#A855F7] bg-[#A855F7]/10 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                <Pin size={10} /> épinglé
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sorties favorites */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-medium">
            <Sparkles size={18} className="text-[#A855F7]" /> Sorties favorites
          </h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="bg-[#0E1322] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {[
            { title: 'Plan marketing Q3 généré', meta: '12 mai • 8 min' },
            { title: 'Analyse concurrentielle complète', meta: '7 mai • 6 min' },
          ].map((out, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full border border-[#A855F7]/50 flex items-center justify-center text-[#A855F7]">
                  <Play size={14} className="ml-0.5" />
                </div>
                <div>
                  <div className="text-[14px] font-medium">{out.title}</div>
                  <div className="text-[12px] text-slate-400">{out.meta}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Star size={10} className="fill-[#10B981]" /> favori
                </span>
                <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources de confiance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-medium">
            <Link size={18} className="text-[#A855F7]" /> Sources de confiance
          </h3>
          <button className="text-[12px] text-slate-400 flex items-center gap-1 hover:text-white">
            voir tout <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {[
            { name: 'OpenAI', type: 'API', icon: () => <div className="text-white font-bold text-lg">O</div> },
            { name: 'Google Scholar', type: 'Recherche', icon: () => <div className="text-[#4285F4] font-bold text-lg">G</div> },
            { name: 'Wikipédia', type: 'Encyclopédie', icon: () => <div className="text-white font-serif italic text-lg">W</div> },
            { name: 'arXiv', type: 'Recherche', icon: () => <div className="text-red-500 font-bold text-lg">ar</div> },
          ].map((src, i) => (
            <div key={i} className="min-w-[140px] flex items-center justify-between p-3 rounded-2xl bg-[#05070E] border border-white/10">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg bg-[#0E1322] flex items-center justify-center border border-white/5 shrink-0">
                  <src.icon />
                </div>
                <div>
                  <div className="text-[13px] font-medium whitespace-nowrap">{src.name}</div>
                  <div className="text-[10px] text-slate-500">{src.type}</div>
                </div>
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                <Check size={10} className="text-[#10B981]" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
