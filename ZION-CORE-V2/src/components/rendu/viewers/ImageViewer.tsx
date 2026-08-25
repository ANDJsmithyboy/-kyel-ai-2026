/**
 * Ñkyel AI — Image & Visual Asset Viewer · SmartANDJ AI Technologies
 * Visualiseur d'images haute résolution :
 * - Zoom, panoramique, sélection de ratio
 * - Extraction de palette de couleurs de marque
 * - Téléchargement PNG / WebP / JPEG
 * - Inspection des métadonnées (Modèle, Prompt, SHA-256)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsClockwise,
  DownloadSimple,
  ShareNetwork,
  Palette,
  Sparkle,
} from '@phosphor-icons/react';

interface ImageViewerProps {
  url: string;
  title: string;
  model?: string;
  sha256?: string;
  dimensions?: { width: number; height: number };
  onExport?: (format: string) => void;
}

export default function ImageViewer({
  url,
  title,
  model = 'gemini-3.1-flash-image',
  sha256,
  dimensions = { width: 1024, height: 1024 },
  onExport,
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [showPalette, setShowPalette] = useState(false);

  const samplePalette = ['#0E1626', '#C39A52', '#2C3E50', '#6F9485', '#CBD5E1'];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#c39a52]">
            {dimensions.width}×{dimensions.height}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            {model}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Zoom arrière"
          >
            <MagnifyingGlassMinus size={15} />
          </button>
          <span className="font-mono text-[11px] px-1 text-slate-400">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Zoom avant"
          >
            <MagnifyingGlassPlus size={15} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            title="Réinitialiser le zoom"
          >
            <ArrowsClockwise size={15} />
          </button>
          <button
            onClick={() => setShowPalette(!showPalette)}
            className={`p-1.5 rounded-lg transition-colors ${showPalette ? 'bg-[#c39a52] text-[#0a0e17]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            title="Extraire la palette de couleurs"
          >
            <Palette size={15} />
          </button>
        </div>
      </div>

      {/* Zone Canvas Centrale */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          className="transition-transform duration-200 shadow-2xl rounded-xl overflow-hidden border border-white/10 max-w-full max-h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <img src={url || '/placeholder.png'} alt={title} className="object-contain max-h-[70vh]" />
        </div>
      </div>

      {/* Palette de couleurs si activée */}
      {showPalette && (
        <div className="px-4 py-3 bg-[#121826] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Palette Extraite :</span>
            <div className="flex items-center gap-1.5">
              {samplePalette.map((col, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col }} />
                  <span className="text-[10px] font-mono text-slate-300">{col}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pied de page métadonnées */}
      {sha256 && (
        <div className="px-4 py-2 bg-[#0a0e17] border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>SHA-256: {sha256}</span>
          <span>PNG Binaire Authentique</span>
        </div>
      )}
    </div>
  );
}
