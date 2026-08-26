/**
 * Ñkyel AI — Page Détail d'un Projet
 * Route : /projects/[projectId]
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Folder,
  ArrowLeft,
  ChatCircleText,
  FileText,
  Clock,
  Plus,
  GitBranch,
} from '@phosphor-icons/react';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || 'proj_default';

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs text-[#7E8795] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Retour aux projets
        </Link>

        {/* Project Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/40 flex items-center justify-center text-[var(--accent)]">
                <Folder size={22} />
              </span>
              <div>
                <h1 className="text-xl font-bold font-heading text-[#F1EEE7]">Projet : {projectId}</h1>
                <p className="text-xs text-[#7E8795] mt-0.5">
                  Namespace Mémoire : <code className="text-[#AAA2C8]">user/default/projects/{projectId}</code>
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/chat"
            className="px-4 py-2 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/80 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus size={15} />
            Lancer une mission
          </Link>
        </div>

        {/* Project Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1 : Missions & Conversations */}
          <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-[#F1EEE7] mb-4 flex items-center gap-2">
              <ChatCircleText size={18} className="text-[#665F9E]" />
              Missions Associées
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/chat"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between text-xs transition-all block"
              >
                <span className="text-[#F1EEE7]">Cadrage des opportunités sectorielles</span>
                <span className="text-[10px] text-[#7E8795]">v1.0</span>
              </Link>
              <Link
                href="/chat"
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] flex items-center justify-between text-xs transition-all block"
              >
                <span className="text-[#F1EEE7]">Direction artistique & Storyboard</span>
                <span className="text-[10px] text-[#7E8795]">v2.1</span>
              </Link>
            </div>
          </div>

          {/* Section 2 : Livrables & Artefacts */}
          <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-[#F1EEE7] mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#6F9485]" />
              Livrables & Artefacts Produits
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#F1EEE7]">rapport_cadrage_strategique.pdf</span>
                <span className="text-[10px] text-[#6F9485] font-semibold">Validé</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#F1EEE7]">storyboard_campagne_2026.png</span>
                <span className="text-[10px] text-[#6F9485] font-semibold">R2 Object</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
