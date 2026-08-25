/**
 * Ñkyel AI — Dataset & Structured Data Viewer · SmartANDJ AI Technologies
 * Visualiseur de jeux de données, flux JSON, JSONL et Parquet :
 * - Bascule Arborescence JSON / Tableau structuré
 * - Inspection du schéma et types de champs
 * - Exportation directe JSON / CSV
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  Database,
  TreeStructure,
  Table,
  DownloadSimple,
  Copy,
  Check,
} from '@phosphor-icons/react';

interface DataViewerProps {
  title: string;
  data?: Record<string, any> | Array<any>;
  onExport?: (format: 'json' | 'csv') => void;
}

export default function DataViewer({
  title,
  data = {
    dataset_name: "Gabon Tourism Statistics 2026",
    record_count: 1420,
    fields: ["region", "visitors_q1", "growth_rate_pct", "primary_attraction"],
    sample: [
      { region: "Loango", visitors_q1: 12400, growth_rate_pct: 18.4, primary_attraction: "Elephant Surf Safari" },
      { region: "Pongara", visitors_q1: 28500, growth_rate_pct: 12.1, primary_attraction: "Leatherback Turtle Nesting" },
      { region: "Ivindo", visitors_q1: 8200, growth_rate_pct: 22.7, primary_attraction: "Kongou Waterfalls UNESCO" },
    ]
  },
  onExport,
}: DataViewerProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('table');
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleRows = Array.isArray(data) ? data : (data.sample || [data]);
  const columns = sampleRows.length > 0 && typeof sampleRows[0] === 'object' ? Object.keys(sampleRows[0]) : [];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-[#c39a52]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            Dataset JSON / Table
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#c39a52] text-[#0a0e17] font-bold' : 'text-slate-400'}`}
            >
              <Table size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${viewMode === 'tree' ? 'bg-[#c39a52] text-[#0a0e17] font-bold' : 'text-slate-400'}`}
            >
              <TreeStructure size={14} />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Copier les données JSON"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          <button
            onClick={() => onExport && onExport('json')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Zone Centrale */}
      <div className="flex-1 overflow-auto p-4 bg-[#060911]">
        {viewMode === 'table' && columns.length > 0 ? (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d1422]">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#121b2d] border-b border-white/10 text-slate-300 font-semibold">
                  {columns.map((c) => (
                    <th key={c} className="p-3 font-mono text-[#c39a52]">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {sampleRows.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    {columns.map((c) => (
                      <td key={c} className="p-3 font-mono text-[11px] text-slate-300">
                        {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <pre className="w-full h-full p-4 rounded-xl bg-[#0d1422] border border-white/10 overflow-auto font-mono text-xs text-slate-300">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
}
