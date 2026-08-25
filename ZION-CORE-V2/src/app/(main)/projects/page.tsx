/**
 * Ñkyel AI · Projects Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Route: /projects
 * Project isolation organizing missions, evidence, artifacts, and memory.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Folder,
  Plus,
  ArrowRight,
  Sparkle,
  ShieldCheck,
  Clock,
  DotsThreeVertical,
  Books,
  ChatCircleDots,
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
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* Header */}
      <div
        className="shrink-0 p-6"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-raised)',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <Folder size={18} weight="bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Projets & Espaces Dédiés
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Organisez vos missions, sources de recherche, mémoire et livrables par espace stratégique.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            <Plus size={14} weight="bold" />
            <span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl flex flex-col justify-between transition-all min-h-[190px] cursor-pointer"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-key)',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.borderColor = 'var(--accent-muted)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                  >
                    <Folder size={16} weight="fill" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {proj.updatedAt}
                  </span>
                </div>

                <h3 className="text-sm font-bold truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                  {proj.name}
                </h3>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {proj.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-4 border-t text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{proj.threadsCount} missions</span>
                  <span>•</span>
                  <span>{proj.artifactsCount} livrables</span>
                </div>
                <ArrowRight size={13} style={{ color: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--material-scrim)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Créer un Nouveau Projet
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ex: Stratégie Énergétique 2026"
                  className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Description / Objectifs
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Précisez le périmètre et les livrables attendus..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border outline-none text-xs leading-relaxed"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-1.5 rounded-xl font-semibold"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  Créer l’espace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
