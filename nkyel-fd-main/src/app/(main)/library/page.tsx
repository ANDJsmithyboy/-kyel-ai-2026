/**
 * Ñkyel AI — Page Bibliothèque Souveraine (Artefacts & Fichiers)
 * Route : /library
 */

'use client';

import React, { useState } from 'react';
import {
  FolderSimple,
  FileText,
  Image as ImageIcon,
  VideoCamera,
  Code,
  DownloadSimple,
  ShareNetwork,
  Eye,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';
import { useRenduPanel } from '@/hooks/useRenduPanel';

interface LibraryItem {
  id: string;
  title: string;
  type: 'document' | 'image' | 'video' | 'code' | 'report';
  url: string;
  size: string;
  date: string;
  provider: string;
}

const ITEMS: LibraryItem[] = [
  {
    id: 'art_1',
    title: 'Rapport Stratégique Gabon 2026',
    type: 'report',
    url: 'https://media.nkyel.ai/users/default/artifacts/rapport_2026.pdf',
    size: '1.4 MB',
    date: 'Aujourd’hui à 00:30',
    provider: 'DeerFlow 2.0 × Gemini',
  },
  {
    id: 'art_2',
    title: 'Visuel Identité Heptagramme',
    type: 'image',
    url: 'https://media.nkyel.ai/users/default/artifacts/heptagramme.png',
    size: '840 KB',
    date: 'Hier',
    provider: 'Cloudflare FLUX-1 Schnell',
  },
  {
    id: 'art_3',
    title: 'Animation Logo 5s (Wan2.1)',
    type: 'video',
    url: 'https://media.nkyel.ai/users/default/artifacts/anim_logo.mp4',
    size: '4.8 MB',
    date: '20 Août 2026',
    provider: 'ComfyUI Wan2.1',
  },
  {
    id: 'art_4',
    title: 'Composant Dashboard A2UI',
    type: 'code',
    url: '',
    size: '12 KB',
    date: '19 Août 2026',
    provider: 'A2UI Declarative Engine',
  },
];

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { openRendu } = useRenduPanel();

  const filtered = ITEMS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <FolderSimple size={24} className="text-[#6F9485]" />
              Bibliothèque de Livrables & Artefacts
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Tous les documents, images, vidéos et codes produits de manière souveraine (Cloudflare R2 + Neon).
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8795]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un artefact..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0E121A] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'report', 'image', 'video', 'code'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === t
                    ? 'bg-[#6F9485]/20 text-[#6F9485] border border-[#6F9485]/40'
                    : 'text-[#7E8795] hover:text-white bg-[#0E121A]'
                }`}
              >
                {t === 'all' ? 'Tous' : t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Artifacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#C39A52] shrink-0">
                  {item.type === 'image' && <ImageIcon size={20} className="text-[#6F9485]" />}
                  {item.type === 'video' && <VideoCamera size={20} className="text-[#CF72A8]" />}
                  {item.type === 'code' && <Code size={20} className="text-[#665F9E]" />}
                  {(item.type === 'report' || item.type === 'document') && <FileText size={20} className="text-[#C39A52]" />}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#F1EEE7] truncate">{item.title}</h4>
                  <p className="text-[10px] text-[#7E8795] mt-0.5 truncate">
                    {item.size} • {item.date} • <span className="text-[#B8C0CC]">{item.provider}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openRendu({ id: item.id, title: item.title, type: item.type, url: item.url, created_at: Date.now() })}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#7E8795] hover:text-white transition-colors"
                  title="Ouvrir dans Artifact Studio"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
