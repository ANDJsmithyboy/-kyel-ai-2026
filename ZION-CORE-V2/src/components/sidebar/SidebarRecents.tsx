/**
 * Nkyel AI · SidebarRecents (Projets + Missions récentes)
 * SmartANDJ AI Technologies
 * Visual design matching Manus / ChatGPT structure with Ñkyel Sovereign Identity
 */

'use client';

import { useState } from 'react';
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
  const [projects, setProjects] = useState<DefaultProject[]>(DEFAULT_PROJECTS);

  if (isCollapsed) return null;

  // Recent default demos if none yet, to make UI vibrant
  const displayMissions = conversations.length > 0
    ? conversations.slice(0, 8)
    : [
        { id: 'm-1', title: 'Créer un PowerPoint Professionnel...', icon: Presentation },
        { id: 'm-2', title: 'Analyse Exhaustive des Discours...', icon: FileText },
        { id: 'm-3', title: 'Développement d\'une application...', icon: Code },
        { id: 'm-4', title: 'Recherche Marché & Veille Stratégique', icon: Browsers },
        { id: 'm-5', title: 'Décrivez le Logo et la Charte Graphique', icon: Sparkle },
      ];

  const handleAddProject = () => {
    const name = prompt('Nom du nouveau projet :');
    if (name && name.trim()) {
      setProjects((prev) => [...prev, { id: `proj-${Date.now()}`, name: name.trim(), count: 0 }]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-[13px] scrollbar-thin">
      {/* 1. SECTION PROJETS */}
      <div>
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9199A8]">
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
              <FolderSimplePlus size={15} className="shrink-0 text-[#6757E8]" />
              <span className="truncate text-[12px]">{proj.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. SECTION MISSIONS RÉCENTES */}
      <div>
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9199A8]">
          <span>Missions récentes</span>
        </div>

        <div className="space-y-0.5 mt-1">
          {displayMissions.map((item: any) => {
            const Icon = item.icon || Article;
            const isActive = pathname === `/chat/${item.id}`;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(item.id.startsWith('m-') ? '/' : `/chat/${item.id}`)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors group ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-[#9199A8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={14} className="shrink-0 text-[#D5AE57]" />
                  <span className="truncate text-[12px]">{item.title}</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-[#9199A8] hover:text-white transition-opacity p-0.5">
                  <DotsThreeVertical size={13} weight="bold" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
