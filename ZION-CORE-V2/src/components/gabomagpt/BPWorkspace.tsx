/* GabomaGPT · BPWorkspace.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Panneau workspace Manus-style pour le mode Black Panther */
'use client';

import { useState } from 'react';
import { useModeStore } from '@/stores/mode';

type Tab = 'preview' | 'code' | 'files' | 'terminal';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'preview', label: 'Aperçu', icon: '◎' },
  { id: 'code', label: 'Code', icon: '⟨/⟩' },
  { id: 'files', label: 'Fichiers', icon: '▤' },
  { id: 'terminal', label: 'Terminal', icon: '▸_' },
];

const tabContent: Record<Tab, { icon: string; title: string; desc: string }> = {
  preview: { icon: '◎', title: 'Workspace Black Panther', desc: "L'agent va afficher ici les résultats en temps réel : pages web, code généré, fichiers créés." },
  code: { icon: '⟨/⟩', title: 'Éditeur de code', desc: "Le code généré par l'agent s'affichera ici avec coloration syntaxique." },
  files: { icon: '▤', title: 'Explorateur de fichiers', desc: "Les fichiers et artefacts générés par l'agent seront listés ici." },
  terminal: { icon: '▸_', title: 'Terminal', desc: "Sortie en temps réel des commandes exécutées par l'agent." },
};

export default function BPWorkspace() {
  const activeMode = useModeStore((s) => s.activeMode);
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  if (activeMode !== 'superagent') return null;

  const content = tabContent[activeTab];

  return (
    <div className="flex flex-col w-1/2 min-w-[360px] max-w-[55%] h-full border-l border-[rgba(212,164,23,0.12)] bg-[#010102] font-mono max-md:w-full max-md:max-w-full max-md:min-w-0 max-md:h-[40vh] max-md:border-l-0 max-md:border-t max-md:border-t-[rgba(212,164,23,0.12)]">
      {/* Tabbar */}
      <div className="flex items-center gap-0 px-1 h-9 border-b border-[rgba(212,164,23,0.08)] bg-[rgba(2,3,4,0.95)] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-[5px] px-3 py-1.5 border-none bg-transparent text-[11px] cursor-pointer border-b-2 whitespace-nowrap transition-colors duration-150 ${
              activeTab === tab.id
                ? 'text-[#D4A417] border-b-[#D4A417]'
                : 'text-white/35 border-b-transparent hover:text-white/60 hover:bg-white/[0.03]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-[10px] opacity-70">{tab.icon}</span>
            <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-8 text-center max-w-[280px]">
          <div className="text-[28px] text-[rgba(212,164,23,0.3)] mb-1">{content.icon}</div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">{content.title}</p>
          <p className="text-[11px] leading-relaxed text-white/25 font-[Outfit,Sora,sans-serif]">{content.desc}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-1.5 px-3 h-6 border-t border-[rgba(212,164,23,0.08)] bg-[rgba(2,3,4,0.95)] text-[9px] text-white/30 uppercase tracking-wider shrink-0">
        <span className="w-[5px] h-[5px] rounded-full bg-[#00FF87] animate-[blink-dot_2s_ease-in-out_infinite]" />
        <span>Agent prêt</span>
        <span className="opacity-30">·</span>
        <span>Black Panther</span>
      </div>
    </div>
  );
}
