/**
 * Ñkyel AI — Jupyter Notebook Viewer (.ipynb) · SmartANDJ AI Technologies
 * Visualiseur de notebooks scientifiques et analytiques :
 * - Cellules Markdown, Code et sorties d'exécution
 * - Téléchargement .ipynb
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { BookOpen, DownloadSimple, Play, Code } from '@phosphor-icons/react';

interface NotebookViewerProps {
  title: string;
  cells?: Array<{ cell_type: 'markdown' | 'code'; source: string[]; outputs?: any[] }>;
  onExport?: () => void;
}

const DEFAULT_CELLS = [
  {
    cell_type: 'markdown' as const,
    source: ['# Analyse Prévisionnelle — Écotourisme Gabon 2026\n', 'Modélisation des flux touristiques et de l\'impact économique direct.'],
  },
  {
    cell_type: 'code' as const,
    source: ['import numpy as np\n', 'import pandas as pd\n\n', '# Projections de croissance 2026-2028\n', 'years = np.array([2026, 2027, 2028])\n', 'visitors = np.array([35000, 65000, 100000])\n', 'print(f"Objectif 2028: {visitors[-1]} visiteurs")'],
    outputs: ['Objectif 2028: 100000 visiteurs\n'],
  },
];

export default function NotebookViewer({
  title,
  cells = DEFAULT_CELLS,
  onExport,
}: NotebookViewerProps) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#c39a52]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            Jupyter Notebook (.ipynb)
          </span>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
        >
          <DownloadSimple size={14} weight="bold" />
          <span>Export .ipynb</span>
        </button>
      </div>

      {/* Cellules du Notebook */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-[#060911]">
        {cells.map((c, i) => (
          <div key={i} className="max-w-4xl mx-auto rounded-xl border border-white/10 bg-[#0e1626] overflow-hidden">
            {c.cell_type === 'code' && (
              <div className="px-3 py-1 bg-black/40 border-b border-white/5 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <Code size={12} />
                <span>In [{i + 1}]:</span>
              </div>
            )}
            <pre className={`p-4 text-xs font-mono overflow-x-auto ${c.cell_type === 'markdown' ? 'text-slate-200 font-sans leading-relaxed' : 'text-slate-300'}`}>
              {c.source.join('')}
            </pre>
            {c.outputs && c.outputs.length > 0 && (
              <div className="p-3 bg-black/60 border-t border-white/5 font-mono text-[11px] text-emerald-400">
                <div className="text-[9px] text-slate-500 mb-1">Out [{i + 1}]:</div>
                {c.outputs.join('')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
