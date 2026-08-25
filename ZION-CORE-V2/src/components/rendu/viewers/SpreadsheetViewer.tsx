/**
 * Ñkyel AI — Interactive Spreadsheet & Data Grid Viewer · SmartANDJ AI Technologies
 * Visualiseur de feuilles de calculs et modèles financiers interactifs :
 * - Grille de données dynamique avec tri et recherche
 * - Calcul automatique des totaux
 * - Exportation directe XLSX (Excel authentique) et CSV
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  MagnifyingGlass,
  DownloadSimple,
  Funnel,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';

export interface SpreadsheetViewerProps {
  title: string;
  data?: Array<Record<string, any>>;
  onExport?: (format: 'xlsx' | 'csv') => void;
}

const DEFAULT_ROWS = [
  { "Poste / Activité": "Campagne Digitale & Médias", "Catégorie": "Marketing", "Budget Q1 ($)": 40000, "Budget Q2 ($)": 80000, "Total ($)": 120000 },
  { "Poste / Activité": "Résidences d'Influence & Presse", "Catégorie": "Marketing", "Budget Q1 ($)": 25000, "Budget Q2 ($)": 60000, "Total ($)": 85000 },
  { "Poste / Activité": "Certifications Éco-Lodge & Parc", "Catégorie": "Opérations", "Budget Q1 ($)": 50000, "Budget Q2 ($)": 0, "Total ($)": 50000 },
  { "Poste / Activité": "Relations Publiques Internationales", "Catégorie": "Marketing", "Budget Q1 ($)": 20000, "Budget Q2 ($)": 30000, "Total ($)": 50000 },
];

export default function SpreadsheetViewer({
  title,
  data = DEFAULT_ROWS,
  onExport,
}: SpreadsheetViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return result;
  }, [data, searchTerm, sortKey, sortAsc]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Table size={18} className="text-[#6f9485]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            {filteredData.length} lignes · {columns.length} colonnes
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Recherche */}
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer les cellules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c39a52]"
            />
          </div>

          <button
            onClick={() => onExport && onExport('csv')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Export CSV
          </button>

          <button
            onClick={() => onExport && onExport('xlsx')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export XLSX</span>
          </button>
        </div>
      </div>

      {/* Grille de données interactive */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d1422] shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121b2d] border-b border-white/10 text-slate-300 select-none">
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="p-3 font-semibold hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{col}</span>
                      {sortKey === col && (
                        sortAsc ? <CaretUp size={12} className="text-[#c39a52]" /> : <CaretDown size={12} className="text-[#c39a52]" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  {columns.map((col) => {
                    const val = row[col];
                    const isNum = typeof val === 'number';
                    return (
                      <td
                        key={col}
                        className={`p-3 ${isNum ? 'text-right font-mono text-[#c39a52]' : ''}`}
                      >
                        {isNum ? val.toLocaleString() : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pied de page */}
      <div className="px-4 py-2 bg-[#121826] border-t border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>Tableur Souverain Ñkyel AI</span>
        <span>Format standard OpenXML XLSX</span>
      </div>
    </div>
  );
}
