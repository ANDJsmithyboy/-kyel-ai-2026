/**
 * Ñkyel AI · Programmes (Workflows)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * 
 * Real automated workflows, agents, and routines backed by backend API.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlass, Plus, Play, Copy, ChartBar, Globe, 
  Code, Users, Briefcase, FileText 
} from '@phosphor-icons/react';
import { programsApi, type ProgramItem } from '@/lib/api';

const CATEGORIES = ['Tout', 'Business', 'Contenu', 'Dev', 'Analyse', 'Équipe'];

function getCategoryIcon(cat: string) {
  switch (cat?.toLowerCase()) {
    case 'business': return ChartBar;
    case 'analyse': return Globe;
    case 'dev': return Code;
    case 'équipe': return Users;
    case 'contenu': return FileText;
    default: return Briefcase;
  }
}

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<ProgramItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsApi.list()
      .then((data) => {
        setProgrammes(data);
      })
      .catch((err) => {
        console.error('[Programmes Page] Fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProgrammes = programmes.filter(p => {
    const matchCategory = activeCategory === 'Tout' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 pb-24">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Programmes
            </h1>
            <p className="text-[var(--text-secondary)]">
              Workflows et routines d'intelligence artificielle connectés au moteur backend.
            </p>
          </div>
          <button 
            onClick={async () => {
              const title = prompt('Titre du nouveau programme :');
              if (title) {
                const created = await programsApi.create(title, 'Business', 'Routine automatisée', 'Sur demande');
                setProgrammes([created, ...programmes]);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 transition-all font-semibold text-[14px] shadow-sm cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            Nouveau programme
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={18} className="text-[var(--text-tertiary)]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un programme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] focus:border-[var(--border)] outline-none text-[14.5px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-sm'
                    : 'bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            Chargement des programmes actifs...
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProgrammes.map((prog) => {
            const Icon = getCategoryIcon(prog.category);
            return (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border)] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--hover)] text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg)] transition-colors">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <span className="px-2 py-1 rounded-md bg-[var(--bg)] border border-[var(--border-subtle)] text-[10px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">
                    {prog.category}
                  </span>
                </div>
                
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1 tracking-tight">
                  {prog.title}
                </h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-6 flex-1">
                  {prog.description}
                </p>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--text-primary)] text-[var(--text-primary)] transition-colors text-[13px] font-semibold cursor-pointer">
                    <Play size={14} weight="fill" />
                    Lancer
                  </button>
                  <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg)] border border-[var(--border-subtle)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors cursor-pointer" title="Cloner">
                    <Copy size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!loading && filteredProgrammes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MagnifyingGlass size={48} className="text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Aucun programme trouvé</h3>
            <p className="text-[var(--text-secondary)] mt-1">Essayez de modifier vos filtres ou de chercher autre chose.</p>
          </div>
        )}

      </div>
    </div>
  );
}
