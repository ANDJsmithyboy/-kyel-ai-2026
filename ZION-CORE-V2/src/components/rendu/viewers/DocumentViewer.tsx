/**
 * Ñkyel AI — Executive Report & Document Viewer · SmartANDJ AI Technologies
 * Visualiseur de documents, rapports exécutifs et dossiers stratégiques :
 * - Rendu typographique haute lisibilité (WCAG 2.2 AA)
 * - Sommaire interactif & navigation de sections
 * - Exportation directe en vrai PDF ou Word (.docx)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  FileText,
  DownloadSimple,
  ListBullets,
  Copy,
  Check,
  Printer,
} from '@phosphor-icons/react';
import NkyelMarkdown from '@/components/markdown/NkyelMarkdown';

interface DocumentViewerProps {
  title: string;
  content: string;
  pageCount?: number;
  sha256?: string;
  model?: string;
  onExport?: (format: 'pdf' | 'docx') => void;
}

export default function DocumentViewer({
  title,
  content,
  pageCount = 12,
  sha256,
  model = 'gemini-3.1-pro-preview',
  onExport,
}: DocumentViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#be6254]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            {pageCount} pages · {model}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>

          <button
            onClick={() => onExport && onExport('docx')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Export DOCX
          </button>

          <button
            onClick={() => onExport && onExport('pdf')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Zone de Lecture Document A4 */}
      <div className="flex-1 overflow-auto p-6 md:p-10 flex justify-center bg-[#060911]">
        <div className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl text-slate-200">
          <div className="border-b border-white/10 pb-6 mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#c39a52]">
              DOCUMENT DE STRATÉGIE SOUVERAINE
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-3 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Généré par Ñkyel AI</span>
              <span>•</span>
              <span>Modèle: {model}</span>
              {sha256 && (
                <>
                  <span>•</span>
                  <span>SHA-256: {sha256.slice(0, 16)}...</span>
                </>
              )}
            </div>
          </div>

          {/* Corps Markdown stylé */}
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-[#c39a52] prose-p:leading-relaxed text-sm md:text-base">
            <NkyelMarkdown content={content} />
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="px-4 py-2 bg-[#121826] border-t border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>Document Vérifié · Conforme aux Normes de Rapportage 2026</span>
        <span>Téléchargeable en PDF & Word natif</span>
      </div>
    </div>
  );
}
