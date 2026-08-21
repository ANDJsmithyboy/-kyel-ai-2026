/**
 * Ñkyel AI — Page Mémoire Permanente (DeerMem sur Neon)
 * Route : /memory
 */

'use client';

import React, { useState } from 'react';
import {
  Brain,
  MagnifyingGlass,
  Sparkle,
  Trash,
  CheckCircle,
  Clock,
  ShieldCheck,
  Globe,
  UsersThree,
  Folder,
} from '@phosphor-icons/react';

interface MemoryItem {
  id: string;
  namespace: string;
  key: string;
  category: string;
  value: string;
  updatedAt: string;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    namespace: 'user/default/global',
    key: 'preferred_language',
    category: 'Préférence',
    value: 'Français (avec termes culturels Fang & Mpongwè)',
    updatedAt: 'Aujourd’hui à 00:15',
  },
  {
    id: 'mem_2',
    namespace: 'user/default/global',
    key: 'brand_palette',
    category: 'Design System',
    value: 'Wada Sanzo (#08090D, #665F9E, #C39A52, #6F9485, #315A70)',
    updatedAt: 'Hier',
  },
  {
    id: 'mem_3',
    namespace: 'user/default/agents/visual-director',
    key: 'aspect_ratio_preference',
    category: 'Agent Memory',
    value: '16:9 cinématique & 1:1 pour les réseaux sociaux',
    updatedAt: '20 Août 2026',
  },
  {
    id: 'mem_4',
    namespace: 'user/default/projects/proj_numerique_gabon',
    key: 'project_target',
    category: 'Projet',
    value: 'Déploiement de solutions d’IA souveraines au Gabon d’ici fin 2026',
    updatedAt: '19 Août 2026',
  },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [search, setSearch] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');

  const handleDelete = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const filtered = memories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(search.toLowerCase()) || m.value.toLowerCase().includes(search.toLowerCase());
    const matchesNs = selectedNamespace === 'all' || m.namespace.includes(selectedNamespace);
    return matchesSearch && matchesNs;
  });

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <Brain size={24} className="text-[#C39A52]" />
              Mémoire Permanente & Profil (DeerMem sur Neon)
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Faits extraits, préférences et mémoires propres à chaque agent persistés durablement dans Neon PostgreSQL.
            </p>
          </div>
        </div>

        {/* Namespace tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8795]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un souvenir..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0E121A] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'global', label: 'Global' },
              { id: 'agents', label: 'Agents' },
              { id: 'projects', label: 'Projets' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedNamespace(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedNamespace === t.id
                    ? 'bg-[#C39A52]/20 text-[#C39A52] border border-[#C39A52]/40'
                    : 'text-[#7E8795] hover:text-white bg-[#0E121A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Items List */}
        <div className="space-y-3">
          {filtered.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#C39A52] shrink-0 mt-0.5">
                  <Brain size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[#F1EEE7] font-mono">{mem.key}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#665F9E]/15 text-[#AAA2C8] font-mono">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8C0CC] mt-1.5 leading-relaxed">{mem.value}</p>
                  <p className="text-[10px] text-[#7E8795] mt-2 font-mono">
                    Namespace : <span className="text-[#AAA2C8]">{mem.namespace}</span> • {mem.updatedAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(mem.id)}
                className="p-2 rounded-lg bg-white/[0.02] hover:bg-[#BE6254]/20 text-[#7E8795] hover:text-[#BE6254] transition-colors shrink-0"
                title="Supprimer ce souvenir"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
