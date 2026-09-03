/**
 * Ñkyel AI · Sanctuary & Universal Creative Artifact Vault (Apple × Manus Level)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Route: /library & /sanctuary
 * Canonical One-Artifact-One-ID Creative Vault across Chat, WorkGraph, and VIE.
 */

'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
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
  DownloadSimple,
  ShareNetwork,
  Eye,
  ShieldCheck,
  Sparkle,
  CalendarBlank,
  HardDrives,
  Graph,
  ArrowSquareOut,
  Trash,
} from '@phosphor-icons/react';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import { useLanguageStore } from '@/stores/language.store';
import { artifactsApi, api } from '@/lib/api';

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

export default function LibraryPage() {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const { data: backendArtifacts, error, isLoading, mutate } = useSWR(
    'artifacts',
    () => artifactsApi.list()
  );


  const artifacts = useMemo<LibraryArtifact[]>(() => {
    if (!backendArtifacts || !Array.isArray(backendArtifacts)) return [];
    
    return backendArtifacts.map((a): LibraryArtifact => {
      let mappedType: ArtifactType = 'document';
      if (a.artifact_type === 'REPORT') mappedType = 'document';
      else if (a.artifact_type === 'CODE') mappedType = 'code';
      else if (a.artifact_type === 'CHART' || a.artifact_type === 'IMAGE') mappedType = 'image';
      else if (a.artifact_type === 'TABLE') mappedType = 'spreadsheet';
      
      return {
        id: a.id,
        title: a.title,
        type: mappedType,
        missionTitle: a.mission_id ? `Mission: ${a.mission_id.substring(0,8)}` : 'Génération',
        projectName: 'Workspace',
        url: a.content_url || '#',
        size: a.content_size_bytes ? `${Math.round(a.content_size_bytes / 1024)} KB` : 'N/A',
        createdAtHuman: 'Récemment',
        updatedAtTimestamp: new Date(a.created_at).getTime(),
        previewSnippet: a.description || 'Artefact généré par IA.',
      };
    });
  }, [backendArtifacts]);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { openRendu } = useRenduPanel();

  const filterTabs = [
    { id: 'all', label: t('sanctuary.all') || 'All Artifacts', icon: Books },
    { id: 'slide', label: t('sanctuary.slides') || 'Presentations', icon: Presentation },
    { id: 'document', label: t('sanctuary.docs') || 'Documents', icon: FileText },
    { id: 'spreadsheet', label: t('sanctuary.spreadsheets') || 'Spreadsheets', icon: Table },
    { id: 'website', label: isFr ? 'Sites & Web' : 'Web & Apps', icon: Browsers },
    { id: 'image', label: t('sanctuary.media') || 'Media & Visuals', icon: ImageIcon },
    { id: 'video', label: isFr ? 'Vidéos & Clips' : 'Videos', icon: VideoCamera },
  ];

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

  const handleOpenArtifact = (item: LibraryArtifact) => {
    openRendu({
      id: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      created_at: item.updatedAtTimestamp,
    });
  };

  const handleDeleteArtifact = async (id: string) => {
    try {
      const res = await fetch(`/api/artifacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Assume SWR will re-fetch or we manually mutate
        console.log('Deleted artifact', id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFormatBadge = (type: ArtifactType) => {
    switch (type) {
      case 'slide':
        return { label: 'PPTX / DECK', icon: Presentation, color: 'var(--accent)' };
      case 'document':
        return { label: 'PDF / DOC', icon: FileText, color: '#3B82F6' };
      case 'spreadsheet':
        return { label: 'XLSX / SHEET', icon: Table, color: '#10B981' };
      case 'website':
        return { label: 'HTML / APP', icon: Browsers, color: '#8B5CF6' };
      case 'image':
        return { label: 'IMAGE / PNG', icon: ImageIcon, color: '#EC4899' };
      case 'video':
        return { label: 'VIDEO / MP4', icon: VideoCamera, color: '#F59E0B' };
      default:
        return { label: 'ARTIFACT', icon: HardDrives, color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none" style={{ background: 'var(--material-canvas)' }}>
      {/* ── Scrollable Stage ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full space-y-6 pb-28">
        
        {/* ── Header: Sanctuary Identity ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-[var(--border-subtle)] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-raised)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
              <Books size={26} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {t('sanctuary.heading') || 'Sanctuary'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30">
                  {artifacts.length} {isFr ? 'Artefacts' : 'Artifacts'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('sanctuary.subheading') || 'Canonical Sovereign Artifact Vault & Creative Archive.'}
              </p>
            </div>
          </div>

          {/* Zero Knowledge Sovereign Vault Ribbon */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-secondary)] shadow-xs">
            <ShieldCheck size={16} weight="fill" className="text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">
              {isFr ? 'Coffre Zéro-Connaissance Chiffré' : 'Zero-Knowledge Encrypted Vault'}
            </span>
          </div>
        </div>

        {/* ── Search Bar & View Mode Switcher ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sanctuary.searchPlaceholder') || 'Search artifacts, decks, documents, models...'}
              className="w-full h-11 ps-10 pe-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              title="Grid view"
            >
              <SquaresFour size={17} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              title="List view"
            >
              <ListDashes size={17} />
            </button>
          </div>
        </div>

        {/* ── Horizontally Scrollable Category Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all touch-manipulation min-h-[38px] ${
                  isActive
                    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] border border-transparent'
                }`}
              >
                <Icon size={16} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-[var(--accent)]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Artifact Cards Grid / List View ── */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] space-y-2">
            <Books size={32} className="mx-auto text-[var(--text-disabled)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isFr ? 'Aucun artefact ne correspond à votre recherche.' : 'No artifacts found matching your query.'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Lancez une directive avec l’agent pour générer de nouveaux livrables.' : 'Dispatch a directive to the agent to generate new deliverables.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const badge = getFormatBadge(item.type);
              const FormatIcon = badge.icon;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenArtifact(item)}
                  className="group relative p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-all flex flex-col justify-between cursor-pointer shadow-xs active:scale-[0.99] touch-manipulation min-h-[220px]"
                >
                  <div className="space-y-3">
                    {/* Top Format Pill & Time */}
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wide border"
                        style={{
                          background: 'var(--control-bg)',
                          borderColor: 'var(--border-subtle)',
                          color: badge.color,
                        }}
                      >
                        <FormatIcon size={13} weight="bold" />
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                        {item.size}
                      </span>
                    </div>

                    {/* Title & Preview Snippet */}
                    <div>
                      <h3 className="font-semibold text-sm sm:text-[15px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      {item.previewSnippet && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                          {item.previewSnippet}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Metadata & Actions */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <span className="truncate max-w-[160px]">{item.missionTitle}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenArtifact(item);
                        }}
                        className="w-8 h-8 rounded-xl bg-[var(--control-bg)] hover:bg-[var(--active)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={t('sanctuary.open') || 'Open'}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank');
                        }}
                        className="w-8 h-8 rounded-xl bg-[var(--control-bg)] hover:bg-[var(--active)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={t('sanctuary.download') || 'Download'}
                      >
                        <DownloadSimple size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArtifact(item.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-[var(--control-bg)] hover:bg-red-500/20 flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List Mode */
          <div className="space-y-2.5">
            {filtered.map((item) => {
              const badge = getFormatBadge(item.type);
              const FormatIcon = badge.icon;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenArtifact(item)}
                  className="p-4 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-xs active:scale-[0.99] touch-manipulation"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-[var(--border-subtle)]"
                      style={{ background: 'var(--control-bg)', color: badge.color }}
                    >
                      <FormatIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5">
                        <span className="font-mono">{badge.label}</span>
                        <span>·</span>
                        <span>{item.missionTitle}</span>
                        <span>·</span>
                        <span className="font-mono">{item.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenArtifact(item);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--control-bg)] hover:bg-[var(--active)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
                    >
                      <Eye size={14} />
                      <span>{t('sanctuary.open') || 'Open'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(item.url, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--control-bg)] hover:bg-[var(--active)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
                    >
                      <DownloadSimple size={14} />
                      <span>{t('sanctuary.download') || 'Download'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArtifact(item.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--control-bg)] hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-colors"
                    >
                      <Trash size={14} />
                      <span>{isFr ? 'Supprimer' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
