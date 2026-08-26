/**
 * Ñkyel AI · Universal Artifacts Library
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Route: /library
 * The Canonical Creative & Executive Artifact Library.
 * One Artifact — One ID across Chat, Library, WorkGraph, and VIE.
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Books,
  SquaresFour,
  ListDashes,
  MagnifyingGlass,
  FileText,
  Presentation,
  Browsers,
  Table,
  Image as ImageIcon,
  VideoCamera,
  Code,
  DownloadSimple,
  ShareNetwork,
  Eye,
  DotsThreeVertical,
  FolderSimple,
  Sparkle,
  CalendarBlank,
} from '@phosphor-icons/react';
import { useRenduPanel } from '@/hooks/useRenduPanel';

export type ArtifactType =
  | 'slide'
  | 'website'
  | 'document'
  | 'spreadsheet'
  | 'image'
  | 'video'
  | 'code';

export interface LibraryArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  missionTitle: string;
  projectName?: string;
  url: string;
  size: string;
  createdAtHuman: string;
  updatedAtTimestamp: number;
  previewSnippet?: string;
  pageCount?: number;
  duration?: string;
}

const CANONICAL_ARTIFACTS: LibraryArtifact[] = [
  {
    id: 'art_deck_gabon_2026',
    title: 'Présentation Stratégique Gabon 2026',
    type: 'slide',
    missionTitle: 'Analyse Économique & Transition Énergétique',
    projectName: 'Gabon Énergie 2026',
    url: 'https://media.nkyel.ai/artifacts/gabon_2026_deck.pptx',
    size: '4.2 MB',
    createdAtHuman: 'Aujourd’hui à 11:20',
    updatedAtTimestamp: Date.now() - 3600000 * 2,
    previewSnippet: 'Diapositive 1 : Transition Énergétique & Potentiel Hydroélectrique',
    pageCount: 14,
  },
  {
    id: 'art_report_dcf_model',
    title: 'Rapport d’Évaluation & Modélisation DCF',
    type: 'document',
    missionTitle: 'Analyse Économique & Transition Énergétique',
    projectName: 'Gabon Énergie 2026',
    url: 'https://media.nkyel.ai/artifacts/rapport_dcf.pdf',
    size: '1.8 MB',
    createdAtHuman: 'Aujourd’hui à 10:45',
    updatedAtTimestamp: Date.now() - 3600000 * 4,
    previewSnippet: 'Synthèse exécutive des flux de trésorerie actualisés...',
    pageCount: 28,
  },
  {
    id: 'art_fin_model_sheets',
    title: 'Modèle Financier & Hypothèses TRI-VAN',
    type: 'spreadsheet',
    missionTitle: 'Analyse Économique & Transition Énergétique',
    projectName: 'Gabon Énergie 2026',
    url: 'https://media.nkyel.ai/artifacts/modele_tri_van.xlsx',
    size: '850 KB',
    createdAtHuman: 'Aujourd’hui à 09:30',
    updatedAtTimestamp: Date.now() - 3600000 * 6,
    previewSnippet: 'WACC: 8.4% | TRI: 18.2% | VAN: 42.5M €',
  },
  {
    id: 'art_landing_tourism',
    title: 'Site Vitrine Tourisme & Éco-Parcs Gabon',
    type: 'website',
    missionTitle: 'Développement Landing Page Tourisme',
    projectName: 'Tourisme Durable',
    url: 'https://nkyel.app/preview/tourisme-gabon',
    size: '18 KB Code',
    createdAtHuman: 'Hier à 16:00',
    updatedAtTimestamp: Date.now() - 86400000,
    previewSnippet: 'Landing page interactive React / Tailwind / Hero 3D',
  },
  {
    id: 'art_hero_visual_flux',
    title: 'Visuel Identité Heptagramme & Climat',
    type: 'image',
    missionTitle: 'Génération Multimédia FLUX & Wan2.1',
    projectName: 'Identité Souveraine',
    url: 'https://media.nkyel.ai/artifacts/heptagramme_hero.png',
    size: '3.4 MB',
    createdAtHuman: 'Hier à 14:15',
    updatedAtTimestamp: Date.now() - 86400000 * 1.2,
  },
  {
    id: 'art_motion_clip_wan',
    title: 'Teaser Vidéo de Lancement 15s (Wan2.1)',
    type: 'video',
    missionTitle: 'Génération Multimédia FLUX & Wan2.1',
    projectName: 'Identité Souveraine',
    url: 'https://media.nkyel.ai/artifacts/teaser_wan21.mp4',
    size: '8.6 MB',
    createdAtHuman: '22 Août 2026',
    updatedAtTimestamp: Date.now() - 86400000 * 3,
    duration: '0:15',
  },
];

const FILTER_TABS: Array<{ id: string; label: string; icon: React.ComponentType<any> }> = [
  { id: 'all', label: 'Tous les livrables', icon: Books },
  { id: 'slide', label: 'Diaporamas', icon: Presentation },
  { id: 'document', label: 'Documents & Rapports', icon: FileText },
  { id: 'spreadsheet', label: 'Tableaux & Finance', icon: Table },
  { id: 'website', label: 'Sites Web & Apps', icon: Browsers },
  { id: 'image', label: 'Images & Visuels', icon: ImageIcon },
  { id: 'video', label: 'Vidéos & Clips', icon: VideoCamera },
];

export default function LibraryPage() {
  const [artifacts, setArtifacts] = useState<LibraryArtifact[]>(CANONICAL_ARTIFACTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [groupBy, setGroupBy] = useState<'mission' | 'project' | 'date'>('mission');

  const { openRendu } = useRenduPanel();

  // Filtered artifacts
  const filtered = useMemo(() => {
    return artifacts.filter((item) => {
      const matchesType = activeFilter === 'all' || item.type === activeFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.missionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.projectName && item.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [artifacts, activeFilter, searchQuery]);

  // Grouped artifacts
  const groupedData = useMemo(() => {
    const map = new Map<string, LibraryArtifact[]>();

    filtered.forEach((item) => {
      let key = item.missionTitle;
      if (groupBy === 'project') key = item.projectName || 'Sans projet';
      if (groupBy === 'date') key = item.createdAtHuman.split(' à ')[0];

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    return Array.from(map.entries()).map(([groupTitle, items]) => ({
      groupTitle,
      items,
    }));
  }, [filtered, groupBy]);

  const handleOpenArtifact = (item: LibraryArtifact) => {
    // Canonical One-Artifact-One-ID bridge
    openRendu({
      id: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      created_at: item.updatedAtTimestamp,
    });
  };

  const getFormatBadge = (type: ArtifactType) => {
    switch (type) {
      case 'slide':
        return { label: 'PPTX / SLIDES', color: 'var(--accent)', icon: Presentation };
      case 'document':
        return { label: 'PDF / DOC', color: '#6F9485', icon: FileText };
      case 'spreadsheet':
        return { label: 'XLSX / SHEET', color: '#5BA3B5', icon: Table };
      case 'website':
        return { label: 'WEB APP', color: '#665F9E', icon: Browsers };
      case 'image':
        return { label: 'FLUX PNG', color: '#CF72A8', icon: ImageIcon };
      case 'video':
        return { label: 'WAN2.1 MP4', color: '#E06D53', icon: VideoCamera };
      default:
        return { label: 'CODE', color: '#9199A8', icon: Code };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* ═══════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 p-6"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-raised)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <Books size={18} weight="bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Créations
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Tous les livrables générés au fil de vos missions (documents, présentations, code, applications, médias).
            </p>
          </div>

          {/* Search & View Mode Toggles */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, mission..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border outline-none text-xs"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div
              className="flex items-center p-0.5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: viewMode === 'grid' ? 'var(--surface-raised)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
                title="Affichage Grille"
              >
                <SquaresFour size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: viewMode === 'list' ? 'var(--surface-raised)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
                title="Affichage Liste"
              >
                <ListDashes size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         FILTER TABS & GROUPING SELECTOR
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 px-6 py-2.5"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Format Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--accent-muted)' : '1px solid transparent',
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group By selector */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span>Grouper par :</span>
            <select
              value={groupBy}
              onChange={(e: any) => setGroupBy(e.target.value)}
              className="px-2 py-1 rounded-lg border outline-none text-xs"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="mission">Mission</option>
              <option value="project">Projet</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         ARTIFACTS STREAM (GRID / LIST)
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-8">
          {groupedData.length > 0 ? (
            groupedData.map(({ groupTitle, items }) => (
              <div key={groupTitle} className="space-y-3">
                {/* Group Heading */}
                <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <FolderSimple size={15} style={{ color: 'var(--accent)' }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    {groupTitle}
                  </h3>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    ({items.length} livrables)
                  </span>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const badge = getFormatBadge(item.type);
                      const Icon = badge.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenArtifact(item)}
                          className="group rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all"
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
                            {/* Format badge + page/duration */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                                style={{
                                  background: `${badge.color}15`,
                                  color: badge.color,
                                  border: `1px solid ${badge.color}35`,
                                }}
                              >
                                <Icon size={12} />
                                <span>{badge.label}</span>
                              </span>

                              {item.pageCount && (
                                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                  {item.pageCount} pages
                                </span>
                              )}
                              {item.duration && (
                                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                  {item.duration}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-xs leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
                              {item.title}
                            </h4>

                            {/* Snippet Preview */}
                            {item.previewSnippet && (
                              <p className="text-[11px] line-clamp-2 leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                                {item.previewSnippet}
                              </p>
                            )}
                          </div>

                          {/* Footer metadata & Open action */}
                          <div className="flex items-center justify-between pt-3 mt-auto border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                              {item.size} • {item.createdAtHuman}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenArtifact(item);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                              style={{
                                background: 'var(--surface)',
                                color: 'var(--accent)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <Eye size={13} />
                              <span>Ouvrir</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const badge = getFormatBadge(item.type);
                      const Icon = badge.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenArtifact(item)}
                          className="p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all"
                          style={{
                            background: 'var(--surface-raised)',
                            border: '1px solid var(--border-subtle)',
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.borderColor = 'var(--border-strong)';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: `${badge.color}15`,
                                color: badge.color,
                                border: `1px solid ${badge.color}35`,
                              }}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                                {item.title}
                              </h4>
                              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                {item.missionTitle} • {item.size} • {item.createdAtHuman}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenArtifact(item);
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-semibold shrink-0"
                            style={{
                              background: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            Consulter
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Empty state */
            <div
              className="p-12 text-center rounded-3xl space-y-2"
              style={{
                background: 'var(--surface-raised)',
                border: '1px dashed var(--border-strong)',
              }}
            >
              <Books size={24} className="mx-auto" style={{ color: 'var(--text-tertiary)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Aucun livrable ne correspond à votre recherche
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Lancez une mission pour générer des présentations, documents, feuilles de calcul ou visuels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
