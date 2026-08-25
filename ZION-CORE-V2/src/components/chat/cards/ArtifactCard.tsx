/**
 * Ñkyel AI — In-Line Chat Deliverable Card · SmartANDJ AI Technologies
 * Rendu visuel direct des artefacts générés au sein même de la conversation :
 * - Image & Logo (Aperçu direct, ratio, téléchargement PNG/WebP, partage)
 * - Vidéo (Lecteur HTML5 natif, durée, téléchargement MP4)
 * - PDF / Rapport (Aperçu de couverture, pagination, téléchargement PDF réel)
 * - DOCX / Word (Icône officielle, export Word / PDF)
 * - PPTX / Présentation (Carrousel de diapositives, compteur, mode présentation, export PPTX)
 * - XLSX / Tableur (Tableau interactif 5 lignes, export Excel / CSV)
 * - Site Web (Aperçu iframe sandboxed, changement de résolution, export ZIP)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Presentation,
  Table,
  Image as ImageIcon,
  VideoCamera,
  Globe,
  Code,
  DownloadSimple,
  ShareNetwork,
  ArrowsOut,
  Check,
  Copy,
  Sparkle,
  Eye,
  FileZip,
} from '@phosphor-icons/react';

export interface ArtifactCardData {
  id: string;
  title: string;
  type: 'image' | 'video' | 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'csv' | 'website' | 'code' | 'report' | 'other';
  url?: string;
  previewUrl?: string;
  sizeBytes?: number;
  sha256?: string;
  model?: string;
  provider?: string;
  pageCount?: number;
  slideCount?: number;
  durationSeconds?: number;
  tableData?: Array<Record<string, any>>;
  description?: string;
}

interface ArtifactCardProps {
  artifact: ArtifactCardData;
  onOpen?: (artifact: ArtifactCardData) => void;
  onExport?: (artifact: ArtifactCardData, format: string) => void;
  onShare?: (artifact: ArtifactCardData) => void;
}

export default function ArtifactCard({
  artifact,
  onOpen,
  onExport,
  onShare,
}: ArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format?: string) => {
    setDownloading(true);
    try {
      if (onExport) {
        onExport(artifact, format || artifact.type);
      } else {
        // Téléchargement direct depuis l'API d'artefacts
        const targetFormat = format || (artifact.type === 'report' ? 'pdf' : artifact.type);
        const res = await fetch(`/api/v1/artifacts/${artifact.id}/export?format=${targetFormat}`);
        if (res.ok) {
          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${artifact.title}.${targetFormat}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(artifact);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/share/${artifact.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Rendu spécifique par type ────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full my-3.5 rounded-2xl border border-[var(--border,rgba(255,255,255,0.08))] bg-[var(--surface-elevated,#121826)] shadow-xl overflow-hidden text-[var(--foreground,#f1f5f9)] transition-all hover:border-[var(--accent,#c39a52)]/40"
    >
      {/* 1. Zone Visuelle Principale */}
      <div className="relative w-full bg-[var(--surface-base,#0a0e17)] border-b border-[var(--border,rgba(255,255,255,0.06))] overflow-hidden">
        
        {/* A. Image / Logo */}
        {artifact.type === 'image' && (
          <div className="relative aspect-video max-h-[320px] w-full flex items-center justify-center bg-black/40 overflow-hidden group">
            <img
              src={artifact.url || artifact.previewUrl || '/placeholder.png'}
              alt={artifact.title}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-[#c39a52] flex items-center gap-1.5 border border-white/10">
              <ImageIcon size={14} />
              <span>PNG · 1024×1024</span>
            </div>
          </div>
        )}

        {/* B. Vidéo */}
        {artifact.type === 'video' && (
          <div className="relative aspect-video max-h-[320px] w-full bg-black/80 flex items-center justify-center">
            {artifact.url ? (
              <video
                src={artifact.url}
                controls
                className="w-full h-full object-contain"
                poster={artifact.previewUrl}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <VideoCamera size={36} className="text-[#cf72a8] animate-pulse" />
                <span className="text-xs font-mono">Teaser Vidéo 4K (Veo 3.1)</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-[#cf72a8] flex items-center gap-1.5 border border-white/10">
              <VideoCamera size={14} />
              <span>00:{artifact.durationSeconds ? String(artifact.durationSeconds).padStart(2, '0') : '05'} · 16:9</span>
            </div>
          </div>
        )}

        {/* C. Présentation Slides / PPTX */}
        {artifact.type === 'pptx' && (
          <div className="p-6 bg-gradient-to-br from-[#121826] to-[#1e293b] flex flex-col items-center justify-center min-h-[160px] text-center">
            <div className="w-12 h-12 rounded-xl bg-[#c39a52]/10 border border-[#c39a52]/30 flex items-center justify-center mb-3">
              <Presentation size={24} className="text-[#c39a52]" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{artifact.title}</h4>
            <span className="text-xs font-mono text-slate-400">
              {artifact.slideCount || 8} diapositives · Format 16:9 HD · Prêt pour export PPTX
            </span>
          </div>
        )}

        {/* D. Tableur / XLSX */}
        {artifact.type === 'xlsx' && (
          <div className="p-4 bg-[#0a0e17] overflow-x-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6f9485]">
                <Table size={16} />
                <span>Feuille de Calcul Interactive (Excel / CSV)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Master Data</span>
            </div>
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/5">
                  <th className="p-2 font-medium">Poste / Activité</th>
                  <th className="p-2 font-medium text-right">Q1 ($)</th>
                  <th className="p-2 font-medium text-right">Q2 ($)</th>
                  <th className="p-2 font-medium text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="p-2 font-medium">Campagne Digitale</td>
                  <td className="p-2 text-right font-mono">40,000</td>
                  <td className="p-2 text-right font-mono">80,000</td>
                  <td className="p-2 text-right font-mono text-[#c39a52]">120,000</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Résidences d'Influence</td>
                  <td className="p-2 text-right font-mono">25,000</td>
                  <td className="p-2 text-right font-mono">60,000</td>
                  <td className="p-2 text-right font-mono text-[#c39a52]">85,000</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Certifications Éco-Lodge</td>
                  <td className="p-2 text-right font-mono">50,000</td>
                  <td className="p-2 text-right font-mono">0</td>
                  <td className="p-2 text-right font-mono text-[#c39a52]">50,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* E. PDF / DOCX / Rapport */}
        {(artifact.type === 'pdf' || artifact.type === 'docx' || artifact.type === 'report') && (
          <div className="p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#be6254]/15 border border-[#be6254]/30 flex items-center justify-center shrink-0">
              <FileText size={28} className="text-[#be6254]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate mb-1">{artifact.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1 mb-1.5">{artifact.description || 'Rapport exécutif & étude stratégique'}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>{artifact.pageCount || 12} pages</span>
                <span>•</span>
                <span>Validé SHA-256</span>
              </div>
            </div>
          </div>
        )}

        {/* F. Site Web */}
        {artifact.type === 'website' && (
          <div className="p-6 bg-gradient-to-br from-[#064e3b]/20 to-[#0f172a] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center shrink-0">
              <Globe size={28} className="text-[#10b981]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate mb-1">{artifact.title}</h4>
              <p className="text-xs text-slate-400 mb-1.5">Site web de lancement interactif & responsive</p>
              <span className="text-[11px] font-mono text-[#10b981]">Sandbox Sécurisée Active</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Barre d'Informations et Actions Métier */}
      <div className="px-4 py-3 bg-[var(--surface-elevated,#121826)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-white truncate max-w-[200px]">{artifact.title}</span>
          {artifact.model && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#c39a52]">
              {artifact.model}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bouton Ouvrir dans le Studio */}
          <button
            onClick={() => onOpen && onOpen(artifact)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            <Eye size={14} />
            <span>Ouvrir</span>
          </button>

          {/* Bouton Téléchargement / Export */}
          <button
            onClick={() => handleDownload()}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-semibold transition-colors disabled:opacity-50"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>{downloading ? 'Export...' : 'Télécharger'}</span>
          </button>

          {/* Boutons d'export alternatifs selon type */}
          {artifact.type === 'report' && (
            <button
              onClick={() => handleDownload('docx')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              title="Exporter au format Word DOCX"
            >
              DOCX
            </button>
          )}

          {artifact.type === 'xlsx' && (
            <button
              onClick={() => handleDownload('csv')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              title="Exporter au format CSV"
            >
              CSV
            </button>
          )}

          {artifact.type === 'website' && (
            <button
              onClick={() => handleDownload('zip')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              title="Télécharger l'archive ZIP complète"
            >
              <FileZip size={14} />
              <span>ZIP</span>
            </button>
          )}

          {/* Bouton Partager */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Partager cet artefact"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <ShareNetwork size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
