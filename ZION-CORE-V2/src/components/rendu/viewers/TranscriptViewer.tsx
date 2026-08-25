/**
 * Ñkyel AI — Transcript & Subtitle Viewer (SRT / VTT) · SmartANDJ AI Technologies
 * Visualiseur de sous-titres et transcriptions temporelles :
 * - Alignement temporel des sous-titres (Timecodes)
 * - Téléchargement SRT / VTT
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { Clock, DownloadSimple, ClosedCaptioning } from '@phosphor-icons/react';

interface TranscriptItem {
  id: number;
  start: string;
  end: string;
  text: string;
}

interface TranscriptViewerProps {
  title: string;
  entries?: TranscriptItem[];
  onExport?: (format: 'srt' | 'vtt') => void;
}

const DEFAULT_ENTRIES: TranscriptItem[] = [
  { id: 1, start: '00:00:01.000', end: '00:00:03.500', text: 'Gabon — Le dernier sanctuaire équatorial préservé.' },
  { id: 2, start: '00:00:03.800', end: '00:00:06.000', text: 'Où la forêt primaire rencontre les plages sauvages de l\'Atlantique.' },
  { id: 3, start: '00:00:06.200', end: '00:00:08.500', text: 'Réservez votre expédition durable sur nkyel.ai.' },
];

export default function TranscriptViewer({
  title,
  entries = DEFAULT_ENTRIES,
  onExport,
}: TranscriptViewerProps) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ClosedCaptioning size={18} className="text-[#cf72a8]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            {entries.length} Sous-titres (SRT)
          </span>
        </div>

        <button
          onClick={() => onExport && onExport('srt')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
        >
          <DownloadSimple size={14} weight="bold" />
          <span>Export SRT</span>
        </button>
      </div>

      {/* Liste des timecodes */}
      <div className="flex-1 overflow-auto p-6 space-y-3 bg-[#060911]">
        {entries.map((e) => (
          <div key={e.id} className="max-w-2xl mx-auto p-3.5 rounded-xl border border-white/10 bg-[#0e1626] flex items-start gap-4">
            <div className="px-2 py-1 rounded bg-black/40 border border-white/5 font-mono text-[10px] text-[#cf72a8] shrink-0">
              {e.start} → {e.end}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
