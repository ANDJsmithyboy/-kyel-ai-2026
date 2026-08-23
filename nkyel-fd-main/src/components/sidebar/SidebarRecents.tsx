/**
 * Ñkyel AI · SidebarRecents (Section 42 — Historique style Manus)
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 *
 * Catégories temporelles :
 * - Aujourd'hui
 * - Hier
 * - 7 derniers jours
 * - Mois précédent
 * - Projets
 * - Conversations archivées
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FolderSimplePlus,
  Presentation,
  FileText,
  Article,
  Browsers,
  Code,
  DotsThreeVertical,
  Plus,
  Sparkle,
  Archive,
  Trash,
  PencilSimple,
  Copy,
  DownloadSimple,
} from '@phosphor-icons/react';
import { useChatStore } from '@/stores/chat.store';

interface SidebarRecentsProps {
  isCollapsed: boolean;
}

interface DefaultProject {
  id: string;
  name: string;
  count: number;
}

const DEFAULT_PROJECTS: DefaultProject[] = [
  { id: 'proj-1', name: 'Nouveau projet', count: 0 },
];

export default function SidebarRecents({ isCollapsed }: SidebarRecentsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const conversations = useChatStore((s) => s.conversations);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const [projects, setProjects] = useState<DefaultProject[]>(DEFAULT_PROJECTS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  if (isCollapsed) return null;

  // Catégorisation temporelle des conversations
  const categorized = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;
    const thirtyDaysAgo = today - 30 * 86400000;

    const groups: {
      today: any[];
      yesterday: any[];
      last7Days: any[];
      previousMonth: any[];
      archived: any[];
    } = {
      today: [],
      yesterday: [],
      last7Days: [],
      previousMonth: [],
      archived: [],
    };

    if (conversations.length === 0) {
      // Démos interactives par défaut
      groups.today = [
        { id: 'm-1', title: 'Analyse Économique & Transition Énergétique...', icon: Presentation, updatedAt: Date.now() },
        { id: 'm-2', title: 'Synthèse des Rapports de Veille Stratégique...', icon: FileText, updatedAt: Date.now() - 3600000 },
      ];
      groups.yesterday = [
        { id: 'm-3', title: 'Recherche Web Wide & Multilingue (Fang/FR)...', icon: Browsers, updatedAt: yesterday + 1000 },
      ];
      groups.last7Days = [
        { id: 'm-4', title: 'Génération Multimédia FLUX & Wan2.1...', icon: Sparkle, updatedAt: sevenDaysAgo + 86400000 },
      ];
      return groups;
    }

    conversations.forEach((conv: any) => {
      const time = new Date(conv.updatedAt || conv.createdAt || Date.now()).getTime();
      if (conv.isArchived) {
        groups.archived.push(conv);
      } else if (time >= today) {
        groups.today.push(conv);
      } else if (time >= yesterday) {
        groups.yesterday.push(conv);
      } else if (time >= sevenDaysAgo) {
        groups.last7Days.push(conv);
      } else {
        groups.previousMonth.push(conv);
      }
    });

    return groups;
  }, [conversations]);

  const handleAddProject = () => {
    const name = prompt('Nom du nouveau projet :');
    if (name && name.trim()) {
      setProjects((prev) => [...prev, { id: `proj-${Date.now()}`, name: name.trim(), count: 0 }]);
    }
  };

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-0.5">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7E8795]">
          {title}
        </div>
        {items.map((item: any) => {
          const Icon = item.icon || Article;
          const isActive = pathname === `/chat/${item.id}`;
          const isMenuOpen = activeMenuId === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => router.push(item.id.startsWith('m-') ? '/' : `/chat/${item.id}`)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#9199A8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} className="shrink-0 text-[#C39A52]" />
                  <span className="truncate text-[12px]">{item.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#7E8795] hover:text-white transition-opacity p-0.5"
                >
                  <DotsThreeVertical size={13} weight="bold" />
                </button>
              </button>

              {/* Menu Contextuel */}
              {isMenuOpen && (
                <div
                  className="absolute right-2 top-8 z-50 w-40 py-1 rounded-xl bg-[#0E121A] border border-white/[0.08] shadow-2xl text-[11px] text-[#B8C0CC]"
                  onMouseLeave={() => setActiveMenuId(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const newTitle = prompt('Nouveau titre :', item.title);
                      if (newTitle) item.title = newTitle;
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.06] hover:text-white text-left"
                  >
                    <PencilSimple size={13} />
                    <span>Renommer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Mission dupliquée');
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.06] hover:text-white text-left"
                  >
                    <Copy size={13} />
                    <span>Dupliquer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      item.isArchived = !item.isArchived;
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.06] hover:text-white text-left"
                  >
                    <Archive size={13} />
                    <span>{item.isArchived ? 'Désarchiver' : 'Archiver'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/export-data');
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.06] hover:text-white text-left"
                  >
                    <DownloadSimple size={13} />
                    <span>Exporter</span>
                  </button>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Supprimer cette mission ?')) {
                        deleteConversation(item.id);
                      }
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[#BE6254] hover:bg-[#BE6254]/10 text-left font-semibold"
                  >
                    <Trash size={13} />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-[13px] scrollbar-thin">
      {/* 1. SECTION PROJETS */}
      <div>
        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7E8795]">
          <span>Projets</span>
          <button
            type="button"
            onClick={handleAddProject}
            className="w-5 h-5 rounded flex items-center justify-center hover:text-white hover:bg-white/5 transition-colors"
            title="Créer un projet"
          >
            <Plus size={13} weight="bold" />
          </button>
        </div>

        <div className="space-y-0.5 mt-1">
          {projects.map((proj) => (
            <button
              key={proj.id}
              type="button"
              onClick={handleAddProject}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#9199A8] hover:text-white hover:bg-white/[0.04] transition-colors text-left"
            >
              <FolderSimplePlus size={15} className="shrink-0 text-[#665F9E]" />
              <span className="truncate text-[12px]">{proj.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. HISTORIQUE CATÉGORISÉ STYLE MANUS */}
      <div className="space-y-3">
        {renderGroup("Aujourd'hui", categorized.today)}
        {renderGroup("Hier", categorized.yesterday)}
        {renderGroup("7 derniers jours", categorized.last7Days)}
        {renderGroup("Mois précédent", categorized.previousMonth)}

        {categorized.archived.length > 0 && (
          <div className="pt-2 border-t border-white/[0.04]">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7E8795] hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Archive size={12} />
                <span>Conversations archivées ({categorized.archived.length})</span>
              </span>
              <span>{showArchived ? '▲' : '▼'}</span>
            </button>
            {showArchived && renderGroup("Archivées", categorized.archived)}
          </div>
        )}
      </div>
    </div>
  );
}
