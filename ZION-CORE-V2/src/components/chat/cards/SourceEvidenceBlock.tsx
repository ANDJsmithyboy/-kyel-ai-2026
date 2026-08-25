/**
 * Ñkyel AI — In-Line Sources & Evidence Block · SmartANDJ AI Technologies
 * Pilules de sources et liens de preuves ancrées dans la conversation :
 * - Affiche le nombre de sources vérifiées ("12 sources analysées")
 * - Pilules interactives ouvrant l'inspecteur contextuel de droite
 * - Liens vers les affirmations étayées (Evidence)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { Globe, ArrowUpRight, ShieldCheck, BookmarkSimple } from '@phosphor-icons/react';

export interface SourceItemData {
  id: string;
  title: string;
  domain: string;
  url: string;
  snippet?: string;
  claimSupported?: string;
}

interface SourceEvidenceBlockProps {
  sources: SourceItemData[];
  onOpenInspectorSources?: () => void;
  onSelectSource?: (source: SourceItemData) => void;
}

export default function SourceEvidenceBlock({
  sources,
  onOpenInspectorSources,
  onSelectSource,
}: SourceEvidenceBlockProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full my-2.5 flex flex-wrap items-center gap-2 text-xs">
      <button
        onClick={onOpenInspectorSources}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[11px] transition-colors"
      >
        <Globe size={13} className="text-[#c39a52]" />
        <span>{sources.length} sources analysées</span>
      </button>

      {sources.slice(0, 3).map((src) => (
        <a
          key={src.id}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (onSelectSource) {
              e.preventDefault();
              onSelectSource(src);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-white/15 text-slate-400 hover:text-white transition-colors truncate max-w-[200px]"
        >
          <span className="font-semibold text-slate-300">{src.domain}</span>
          <span className="truncate text-[11px]">{src.title}</span>
          <ArrowUpRight size={11} className="shrink-0 text-slate-500" />
        </a>
      ))}

      {sources.length > 3 && (
        <button
          onClick={onOpenInspectorSources}
          className="text-[11px] font-mono text-[#c39a52] hover:underline"
        >
          +{sources.length - 3} autres
        </button>
      )}
    </div>
  );
}
