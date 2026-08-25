/**
 * Ñkyel AI — Architecture & Diagram Viewer · SmartANDJ AI Technologies
 * Visualiseur de diagrammes Mermaid et architectures SVG :
 * - Zoom et panoramique interactif
 * - Exportation SVG / PNG
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  Graph,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsClockwise,
  DownloadSimple,
} from '@phosphor-icons/react';

interface DiagramViewerProps {
  title: string;
  svgContent?: string;
  onExport?: (format: 'svg' | 'png') => void;
}

export default function DiagramViewer({
  title,
  svgContent,
  onExport,
}: DiagramViewerProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Graph size={18} className="text-[#665f9e]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            Diagramme Architecture SVG
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <MagnifyingGlassMinus size={15} />
          </button>
          <span className="font-mono text-[11px] px-1 text-slate-400">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <MagnifyingGlassPlus size={15} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <ArrowsClockwise size={15} />
          </button>

          <button
            onClick={() => onExport && onExport('svg')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Zone Canvas Centrale */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#060911]">
        <div
          className="transition-transform duration-200 p-8 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl"
          style={{ transform: `scale(${zoom})` }}
        >
          {svgContent ? (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <svg width="600" height="320" viewBox="0 0 600 320" className="text-white">
              <rect x="20" y="20" width="160" height="70" rx="12" fill="#121826" stroke="#c39a52" strokeWidth="2" />
              <text x="100" y="55" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Recherche & Données</text>
              <text x="100" y="72" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Tavily & Google Maps</text>

              <path d="M 180 55 L 240 55" stroke="#c39a52" strokeWidth="2" markerEnd="url(#arrow)" />

              <rect x="240" y="20" width="160" height="70" rx="12" fill="#121826" stroke="#6f9485" strokeWidth="2" />
              <text x="320" y="55" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Analyse Stratégique</text>
              <text x="320" y="72" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Gemini 3.7 Flash</text>

              <path d="M 400 55 L 460 55" stroke="#6f9485" strokeWidth="2" />

              <rect x="460" y="20" width="120" height="70" rx="12" fill="#121826" stroke="#cf72a8" strokeWidth="2" />
              <text x="520" y="55" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Livrables</text>
              <text x="520" y="72" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">PDF, PPTX, MP4</text>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
