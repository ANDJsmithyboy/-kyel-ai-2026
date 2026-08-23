/**
 * Ñkyel AI — Page Projets Souverains
 * Route : /projects
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Folder,
  Plus,
  ArrowRight,
  GitBranch,
  Sparkle,
  ShieldCheck,
  Clock,
  DotsThreeVertical,
} from '@phosphor-icons/react';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  threadsCount: number;
  artifactsCount: number;
  updatedAt: string;
  status: 'active' | 'archived';
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_numerique_gabon',
    name: 'Accélération Numérique Gabon 2026',
    description: 'Stratégie nationale d’adoption de l’IA, gouvernance des données et souveraineté technologique.',
    threadsCount: 8,
    artifactsCount: 14,
    updatedAt: 'Il y a 2 heures',
    status: 'active',
  },
  {
    id: 'proj_brand_identity',
    name: 'Studio de Marque & Multimédia Ñkyel',
    description: 'Harmonie Wada Sanzo, direction visuelle, storyboards et kit de communication institutionnel.',
    threadsCount: 5,
    artifactsCount: 22,
    updatedAt: 'Hier',
    status: 'active',
  },
  {
    id: 'proj_mcp_mesh',
    name: 'Déploiement Maillage MCP & A2A',
    description: 'Interconnexion des serveurs MCP sécurisés et coordination agentique distribuée.',
    threadsCount: 12,
    artifactsCount: 9,
    updatedAt: 'Il y a 3 jours',
    status: 'active',
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Projet stratégique Ñkyel AI.',
      threadsCount: 0,
      artifactsCount: 0,
      updatedAt: 'À l’instant',
      status: 'active',
    };
    setProjects([newProj, ...projects]);
    setNewProjectName('');
    setNewProjectDesc('');
    setShowModal(false);
  };

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <Folder size={24} className="text-[#C39A52]" />
              Projets & Espaces Dédiés
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Cloisonnement par projet avec mémoire isolée <code className="text-[#AAA2C8]">user/&#123;id&#125;/projects/&#123;projectId&#125;</code>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/80 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={16} weight="bold" />
            Nouveau Projet
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-[#665F9E]/50 transition-all group flex flex-col justify-between min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#C39A52]/10 border border-[#C39A52]/20 flex items-center justify-center text-[#C39A52]">
                    <Folder size={18} />
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[#7E8795] font-mono">
                    {proj.updatedAt}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#F1EEE7] group-hover:text-[#AAA2C8] transition-colors line-clamp-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-[#7E8795] mt-1.5 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-4 text-[11px] text-[#B8C0CC]">
                <div className="flex items-center gap-3">
                  <span>{proj.threadsCount} missions</span>
                  <span>•</span>
                  <span>{proj.artifactsCount} livrables</span>
                </div>
                <ArrowRight size={14} className="text-[#7E8795] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0E121A] border border-white/[0.1] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-[#F1EEE7] mb-4">Créer un Nouveau Projet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#7E8795] block mb-1">Nom du projet</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ex: Plan Stratégique 2026"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F1EEE7] outline-none focus:border-[#665F9E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7E8795] block mb-1">Description / Objectifs</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Précisez les enjeux et livrables attendus..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-[#F1EEE7] outline-none focus:border-[#665F9E]"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-[#7E8795] hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#665F9E] text-white text-xs font-semibold hover:bg-[#665F9E]/80 disabled:opacity-50"
                  >
                    Créer l’espace
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
