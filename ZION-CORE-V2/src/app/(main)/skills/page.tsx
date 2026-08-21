/**
 * Ñkyel AI — Page Skills Studio
 * Route : /skills
 */

'use client';

import React, { useState } from 'react';
import {
  PuzzlePiece,
  MagnifyingGlass,
  Sparkle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Code,
} from '@phosphor-icons/react';

interface SkillItem {
  id: string;
  name: string;
  category: string;
  description: string;
  author: string;
  version: string;
  enabled: boolean;
  permissions: string[];
}

const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'generate-image',
    name: 'Génération d’Image Souveraine',
    category: 'multimedia',
    description: 'Routage multi-fournisseurs FLUX-1 Schnell / FLUX.2 Klein 4B avec cadrage dynamique.',
    author: 'Ñkyel Core (SmartANDJ)',
    version: '2.0.0',
    enabled: true,
    permissions: ['media:write', 'r2:upload'],
  },
  {
    id: 'edit-image',
    name: 'Retouche & Édition d’Image',
    category: 'multimedia',
    description: 'Inpainting, suppression d’éléments et variations guidées par prompt.',
    author: 'Ñkyel Core',
    version: '2.0.0',
    enabled: true,
    permissions: ['media:write'],
  },
  {
    id: 'image-to-video',
    name: 'Animation Image vers Vidéo (Wan2.1)',
    category: 'multimedia',
    description: 'Conversion d’images statiques en séquences cinématiques 5s 24 FPS.',
    author: 'Ñkyel Video Team',
    version: '2.1.0',
    enabled: true,
    permissions: ['media:video', 'runpod:inference'],
  },
  {
    id: 'communication-kit',
    name: 'Kit de Communication Réseaux Sociaux',
    category: 'marketing',
    description: 'Génération structurée de publications percutantes LinkedIn & Facebook.',
    author: 'SmartANDJ Studio',
    version: '1.2.0',
    enabled: true,
    permissions: ['text:generate'],
  },
  {
    id: 'wide-research-tavily',
    name: 'Recherche Web Approfondie (Tavily)',
    category: 'research',
    description: 'Navigation Web multi-requêtes, extraction de contenu et vérification de sources.',
    author: 'Ñkyel Intelligence',
    version: '2.0.0',
    enabled: true,
    permissions: ['web:search', 'network:external'],
  },
  {
    id: 'sandbox-python-runner',
    name: 'Exécuteur Sandbox AIO Python',
    category: 'execution',
    description: 'Exécution isolée de code Python dans le conteneur sécurisé DeerFlow.',
    author: 'DeerFlow Native',
    version: '1.11.0',
    enabled: true,
    permissions: ['sandbox:exec'],
  },
];

export default function SkillsStudioPage() {
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [search, setSearch] = useState('');

  const toggleSkill = (id: string) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const filtered = skills.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <PuzzlePiece size={24} className="text-[#665F9E]" />
              Ñkyel Skills Studio
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Capacités agentiques modulaires conformes au format standard <code className="text-[#AAA2C8]">SKILL.md</code>.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md mb-6">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8795]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une compétence..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0E121A] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none"
          />
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#665F9E]/20 text-[#AAA2C8] flex items-center justify-center border border-[#665F9E]/30">
                      <PuzzlePiece size={16} />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F1EEE7]">{skill.name}</h3>
                      <span className="text-[10px] text-[#7E8795] font-mono">v{skill.version} • {skill.author}</span>
                    </div>
                  </div>

                  <button onClick={() => toggleSkill(skill.id)} className="text-[#665F9E] hover:text-[#AAA2C8]">
                    {skill.enabled ? <ToggleRight size={28} weight="fill" className="text-[#6F9485]" /> : <ToggleLeft size={28} className="text-[#7E8795]" />}
                  </button>
                </div>

                <p className="text-xs text-[#7E8795] leading-relaxed mb-4">
                  {skill.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px] text-[#B8C0CC]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#6F9485]" />
                  <span>{skill.permissions.join(', ')}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${skill.enabled ? 'bg-[#6F9485]/20 text-[#6F9485]' : 'bg-white/[0.04] text-[#7E8795]'}`}>
                  {skill.enabled ? 'Actif' : 'Désactivé'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
