/**
 * Ñkyel AI — Sandboxed Website & Application Viewer · SmartANDJ AI Technologies
 * Visualiseur d'applications et pages web générées :
 * - Aperçu dans iframe sandboxed sécurisée (zéro exécution dangereuse sur l'hôte)
 * - Switcher de résolution (Desktop, Tablette, Mobile)
 * - Arborescence des fichiers du projet
 * - Exportation directe de l'archive ZIP complète
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  Globe,
  Desktop,
  DeviceTablet,
  DeviceMobile,
  ArrowSquareOut,
  DownloadSimple,
  Code,
  FileZip,
} from '@phosphor-icons/react';

interface WebsiteViewerProps {
  title: string;
  htmlContent?: string;
  url?: string;
  files?: Record<string, string>;
  onExportZip?: () => void;
}

export default function WebsiteViewer({
  title,
  htmlContent = `<!DOCTYPE html><html><head><style>body{margin:0;font-family:sans-serif;background:#0e1626;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;}h1{color:#c39a52;margin-bottom:8px;}p{color:#94a3b8;max-width:500px;line-height:1.6;}.btn{margin-top:20px;padding:10px 24px;border-radius:8px;background:#c39a52;color:#0e1626;font-weight:bold;text-decoration:none;}</style></head><body><h1>Gabon Écotourisme 2026</h1><p>Découvrez les sanctuaires naturels de Loango et Pongara. Réservez votre expédition durable au cœur de la forêt primaire équatoriale.</p><a href="#" class="btn">Explorer les Séjours</a></body></html>`,
  url,
  files,
  onExportZip,
}: WebsiteViewerProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const viewportWidth = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[viewport];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#10b981]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            Sandbox Active
          </span>
        </div>

        {/* Viewport Switcher & Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' ? 'bg-[#c39a52] text-[#0a0e17]' : 'text-slate-400 hover:text-white'}`}
              title="Aperçu Desktop (100%)"
            >
              <Desktop size={14} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' ? 'bg-[#c39a52] text-[#0a0e17]' : 'text-slate-400 hover:text-white'}`}
              title="Aperçu Tablette (768px)"
            >
              <DeviceTablet size={14} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' ? 'bg-[#c39a52] text-[#0a0e17]' : 'text-slate-400 hover:text-white'}`}
              title="Aperçu Mobile (375px)"
            >
              <DeviceMobile size={14} />
            </button>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <Code size={14} />
            <span>{activeTab === 'preview' ? 'Code Source' : 'Aperçu'}</span>
          </button>

          <button
            onClick={onExportZip}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <FileZip size={14} weight="bold" />
            <span>Export ZIP</span>
          </button>
        </div>
      </div>

      {/* Zone Centrale : Iframe Sandboxed ou Code Source */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#060911]">
        {activeTab === 'preview' ? (
          <div className={`${viewportWidth} h-full max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0e1626] transition-all duration-300 flex flex-col`}>
            {/* Header style navigateur */}
            <div className="px-4 py-2 bg-[#121826] border-b border-white/10 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 max-w-sm mx-auto px-3 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-slate-400 text-center truncate">
                https://launch.nkyel.ai/site-preview/
              </div>
            </div>

            {/* Iframe Sandboxed */}
            <iframe
              srcDoc={htmlContent}
              sandbox="allow-scripts"
              className="w-full flex-1 border-none bg-white"
              title="Site Web Sandboxed"
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl h-full p-4 rounded-xl bg-[#0d1422] border border-white/10 overflow-auto font-mono text-xs text-slate-300">
            <pre>{htmlContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
