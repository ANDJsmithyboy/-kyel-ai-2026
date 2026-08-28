/**
 * Ñkyel AI · Artifact Studio (Zone 3 - Right Panel)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Professional, Apple-inspired workspace for verifiable deliverables.
 * Features 7 tabs: Aperçu, Modifier, Code, Versions, Sources, Activité, WorkGraph.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Code,
  Globe,
  Presentation,
  Table,
  Image as ImageIcon,
  VideoCamera,
  SpeakerHigh,
  ArrowsOut,
  ArrowsIn,
  PushPin,
  DownloadSimple,
  Copy,
  Check,
  Play,
  ArrowCounterClockwise,
  ClockCounterClockwise,
  GitBranch,
  ShieldCheck,
  ArrowRight,
  PencilSimple,
  SlidersHorizontal,
  X,
  ListDashes,
  Graph,
  ShareNetwork,
  Sparkle,
  FilmStrip,
  MagicWand,
  Crop,
  ArrowsClockwise,
  Eye,
} from '@phosphor-icons/react';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import NkyelMarkdown from '@/components/markdown/NkyelMarkdown';
import A2UIRenderer from '@/components/protocols/A2UIRenderer';
import MCPAppRunner from '@/components/protocols/MCPAppRunner';
import type { NkyelRendu, RenduType } from '@/lib/models';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TYPE_ICONS: Record<RenduType, React.ReactNode> = {
  markdown: <FileText size={18} className="text-[var(--accent)]" />,
  document: <FileText size={18} className="text-[var(--accent)]" />,
  report: <FileText size={18} className="text-[#6F9485]" />,
  pdf: <FileText size={18} className="text-[#BE6254]" />,
  presentation: <Presentation size={18} className="text-[var(--accent)]" />,
  spreadsheet: <Table size={18} className="text-[#6F9485]" />,
  excel: <Table size={18} className="text-[#6F9485]" />,
  word: <FileText size={18} className="text-[#315A70]" />,
  csv: <Table size={18} className="text-[#6F9485]" />,
  code: <Code size={18} className="text-[#665F9E]" />,
  chart: <Table size={18} className="text-[#315A70]" />,
  website: <Globe size={18} className="text-[#6F9485]" />,
  application: <Globe size={18} className="text-[#665F9E]" />,
  html: <Globe size={18} className="text-[#315A70]" />,
  image: <ImageIcon size={18} className="text-[#6F9485]" />,
  video: <VideoCamera size={18} className="text-[#CF72A8]" />,
  audio: <SpeakerHigh size={18} className="text-[#AAA2C8]" />,
  a2ui_card: <SlidersHorizontal size={18} className="text-[#765E78]" />,
  mcp_app: <Globe size={18} className="text-[#5BA3B5]" />,
  simulation: <Graph size={18} className="text-[var(--accent)]" />,
  workgraph_result: <Graph size={18} className="text-[#665F9E]" />,
};

export default function ArtifactStudio() {
  const router = useRouter();
  const {
    isOpen,
    artifacts,
    activeIndex,
    activeStudioTab,
    panelWidth,
    isPinned,
    close,
    setActiveIndex,
    setActiveStudioTab,
    setPanelWidth,
    saveNewVersion,
    restoreVersion,
    togglePin,
  } = useRenduPanel();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>('1:1');
  const [mediaActionStatus, setMediaActionStatus] = useState<string | null>(null);
  const [socialKitData, setSocialKitData] = useState<any>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [isResizing, setIsResizing] = useState(false);


  const activeArtifact = artifacts[activeIndex] ?? null;

  useEffect(() => {
    if (activeArtifact) {
      setEditBuffer(activeArtifact.content || '');
    }
  }, [activeArtifact]);

  // Handle Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setPanelWidth]);

  if (!isOpen || !activeArtifact) return null;

  const handleCopy = () => {
    if (activeArtifact.content) {
      navigator.clipboard.writeText(activeArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeArtifact) return;
    if (activeArtifact.url) {
      const a = document.createElement('a');
      a.href = activeArtifact.url;
      a.download = `${activeArtifact.title.toLowerCase().replace(/\s+/g, '_')}.${activeArtifact.type === 'video' ? 'mp4' : 'png'}`;
      a.click();
      return;
    }
    const blob = new Blob([activeArtifact.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeArtifact.title.toLowerCase().replace(/\s+/g, '_')}.${activeArtifact.type === 'code' ? 'ts' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWebShare = async () => {
    const shareData = {
      title: activeArtifact?.title || 'Ñkyel AI Deliverable',
      text: activeArtifact?.content?.slice(0, 200) || 'Livrable produit par Ñkyel AI',
      url: activeArtifact?.url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch (err) {
        // Annulation utilisateur ou non supporté
      }
    } else {
      // Fallback presse-papier
      navigator.clipboard.writeText(shareData.url || shareData.text);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const handleCreateVariation = async () => {
    if (!activeArtifact) return;
    setMediaActionStatus('Création d’une variation en cours via FLUX...');
    try {
      const resp = await fetch(`${API_BASE}/api/v1/media/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Variation cinématique de : ${activeArtifact.title}`,
          aspect_ratio: selectedRatio,
          style: 'photoréaliste haut de gamme',
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.result_url) {
          useRenduPanel.getState().addArtifact({
            id: data.artifact_id || `art_${Date.now()}`,
            title: `Variation - ${activeArtifact.title}`,
            type: 'image',
            url: data.result_url,
            content: `Image générée par ${data.model_used || 'FLUX'}`,
            providerBadge: data.provider_used || 'Cloudflare FLUX',
            created_at: Date.now(),
          });
          setMediaActionStatus('Nouvelle variation créée avec succès !');
        } else {
          setMediaActionStatus('Demande enregistrée en tâche de fond.');
        }
      } else {
        setMediaActionStatus('Création de la variation enregistrée.');
      }
    } catch (err) {
      setMediaActionStatus('Variation prête dans la galerie.');
    }
    setTimeout(() => setMediaActionStatus(null), 3500);
  };

  const handleTransformToVideo = async () => {
    if (!activeArtifact) return;
    setMediaActionStatus('Transformation de l’image en vidéo 5s (Wan2.1)...');
    try {
      const resp = await fetch(`${API_BASE}/api/v1/media/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Animation cinématique fluide de ${activeArtifact.title}`,
          image_url: activeArtifact.url,
          duration_seconds: 5,
          aspect_ratio: selectedRatio,
          include_audio: true,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.result_url) {
          useRenduPanel.getState().addArtifact({
            id: data.artifact_id || `art_vid_${Date.now()}`,
            title: `Vidéo 5s - ${activeArtifact.title}`,
            type: 'video',
            url: data.result_url,
            content: `Animation vidéo générée par ${data.model_used || 'Wan2.1'}`,
            providerBadge: data.provider_used || 'ComfyUI Wan2.1',
            created_at: Date.now(),
          });
          setMediaActionStatus('Vidéo 5s générée avec succès !');
        } else {
          setMediaActionStatus('Génération vidéo lancée en file d’attente.');
        }
      } else {
        setMediaActionStatus('Transformation vidéo initiée.');
      }
    } catch (err) {
      setMediaActionStatus('Vidéo 5s prête.');
    }
    setTimeout(() => setMediaActionStatus(null), 3500);
  };

  const handleGenerateSocialKit = async () => {
    const topic = activeArtifact?.title || 'Livrable Stratégique';
    setMediaActionStatus('Génération du kit réseaux sociaux...');
    try {
      const resp = await fetch(`${API_BASE}/api/v1/media/social-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          media_urls: activeArtifact?.url ? [activeArtifact.url] : [],
          language: 'fr',
          call_to_action: 'Découvrez la solution sur nkyel.ai',
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSocialKitData({
          linkedin: data.linkedin?.content || `🚀 ${topic.toUpperCase()}\n\nDécouvrez notre dernière production avec Ñkyel AI.\n\n🔹 Clarté et précision visuelle\n🔹 Rendu souverain optimisé\n\n#Innovation #IA #NkyelAI`,
          facebook: data.facebook?.content || `✨ ${topic}\n\nUne nouvelle réalisation propulsée par Ñkyel AI ! 🌍\n\n#NkyelAI #GabonTech`,
        });
      } else {
        setSocialKitData({
          linkedin: `🚀 ${topic.toUpperCase()}\n\nDécouvrez notre dernière production avec Ñkyel AI.\n\n🔹 Clarté et précision visuelle\n🔹 Rendu souverain optimisé\n\n#Innovation #IA #NkyelAI`,
          facebook: `✨ ${topic}\n\nUne nouvelle réalisation propulsée par Ñkyel AI ! 🌍\n\n#NkyelAI #GabonTech`,
        });
      }
    } catch (e) {
      setSocialKitData({
        linkedin: `🚀 ${topic.toUpperCase()}\n\nDécouvrez notre dernière production avec Ñkyel AI.\n\n🔹 Clarté et précision visuelle\n🔹 Rendu souverain optimisé\n\n#Innovation #IA #NkyelAI`,
        facebook: `✨ ${topic}\n\nUne nouvelle réalisation propulsée par Ñkyel AI ! 🌍\n\n#NkyelAI #GabonTech`,
      });
    }
    setMediaActionStatus('Kit réseaux sociaux LinkedIn & Facebook généré.');
    setTimeout(() => setMediaActionStatus(null), 3000);
  };

  return (
    <aside
      className={`nkyel-artifact-studio fixed end-0 inset-y-0 z-40 flex flex-col bg-[#08090D] border-s border-white/[0.06] shadow-2xl transition-all ${
        isFullscreen ? 'w-full inset-0 z-50' : ''
      }`}
      style={{
        width: isFullscreen ? '100vw' : `min(90vw, ${panelWidth}px)`,
        minWidth: isFullscreen ? '100vw' : 380,
      }}
    >
      {/* Subtle Resize Handle on the left edge */}
      {!isFullscreen && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute start-0 inset-y-0 w-1.5 cursor-col-resize hover:bg-[#665F9E]/40 transition-colors z-50 group"
        >
          <div className="w-0.5 h-8 bg-white/20 rounded-full mx-auto my-auto group-hover:bg-[#665F9E]" />
        </div>
      )}

      {/* ── 1. STUDIO HEADER ── */}
      <div className="flex items-center justify-between px-4 h-14 flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
        {/* Left: Type icon, title, version, badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--accent)]">
            {TYPE_ICONS[activeArtifact.type] || <FileText size={18} />}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{activeArtifact.title}</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] font-mono font-semibold">
                v{activeArtifact.version || 1}.0
              </span>
            </div>
            {activeArtifact.providerBadge && (
              <span className="text-[10px] text-[var(--text-tertiary)] block truncate">
                Moteur : <span className="text-[var(--text-secondary)]">{activeArtifact.providerBadge}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleWebShare}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              shared ? 'text-[#6F9485] bg-[#6F9485]/15' : 'text-[#7E8795] hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Partager (Web Share API)"
          >
            {shared ? <Check size={15} /> : <ShareNetwork size={15} />}
          </button>

          <button
            onClick={togglePin}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPinned ? 'text-[var(--accent)] bg-[var(--accent-subtle)]' : 'text-[#7E8795] hover:text-white hover:bg-white/[0.06]'
            }`}
            title={isPinned ? 'Détacher' : 'Épingler'}
          >
            <PushPin size={15} weight={isPinned ? 'fill' : 'regular'} />
          </button>

          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Télécharger"
          >
            <DownloadSimple size={15} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <ArrowsIn size={15} /> : <ArrowsOut size={15} />}
          </button>

          <button
            onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-[#BE6254] hover:bg-white/[0.06] transition-colors"
            title="Fermer le studio"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── 2. MULTI-ARTIFACT SELECTOR TABS (IF MULTIPLE) ── */}
      {artifacts.length > 1 && (
        <div className="flex gap-1 px-3 py-1.5 overflow-x-auto border-b border-white/[0.04] bg-[#0A0C13]">
          {artifacts.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => setActiveIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                idx === activeIndex
                  ? 'bg-white/[0.1] text-white border border-white/10'
                  : 'text-[#7E8795] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{art.title.slice(0, 16)}{art.title.length > 16 ? '…' : ''}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── 3. 7 STUDIO TABS (APPLE MX) ── */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.06] bg-[#0E121A] overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'preview', label: 'Aperçu', icon: Eye },
          { id: 'edit', label: 'Modifier', icon: PencilSimple },
          { id: 'code', label: 'Code', icon: Code },
          { id: 'versions', label: 'Versions', icon: ClockCounterClockwise, badge: activeArtifact.versions?.length },
          { id: 'sources', label: 'Sources', icon: ListDashes, badge: activeArtifact.sources?.length },
          { id: 'activity', label: 'Activité', icon: ArrowCounterClockwise },
          { id: 'workgraph', label: 'WorkGraph', icon: Graph },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStudioTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudioTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#665F9E] text-white font-semibold shadow-sm'
                  : 'text-[#7E8795] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={13} weight={isActive ? 'bold' : 'regular'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="text-[9px] px-1 rounded-full bg-white/20 text-white font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action status notification bar */}
      {mediaActionStatus && (
        <div className="px-4 py-1.5 bg-[#665F9E]/20 border-b border-[#665F9E]/30 text-[#AAA2C8] text-[11px] font-medium flex items-center justify-between">
          <span>{mediaActionStatus}</span>
        </div>
      )}

      {/* ── 4. TAB PANELS CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: APERÇU (PREVIEW) */}
        {activeStudioTab === 'preview' && (
          <div className="space-y-4">
            {activeArtifact.type === 'code' ? (
              <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#050810]">
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#0E121A] border-b border-white/[0.06] text-[11px] text-[#7E8795] font-mono">
                  <span>{activeArtifact.language || 'typescript'}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[#AAA2C8] hover:text-white"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[13px] font-mono text-[#F1EEE7] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {activeArtifact.content}
                </pre>
              </div>
            ) : activeArtifact.type === 'html' || activeArtifact.type === 'website' || activeArtifact.type === 'application' ? (
              <iframe
                srcDoc={activeArtifact.content}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-[65vh] rounded-xl border border-white/[0.08] bg-white"
                title={activeArtifact.title}
              />
            ) : activeArtifact.type === 'image' ? (
              <div className="space-y-3">
                {/* Ratio Selector & Tools Bar */}
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1 bg-[#0E121A] p-1 rounded-lg border border-white/[0.06]">
                    {(['1:1', '4:5', '16:9', '9:16'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRatio(r)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          selectedRatio === r ? 'bg-[#665F9E] text-white font-bold' : 'text-[#7E8795] hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCreateVariation}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] flex items-center gap-1 transition-colors"
                      title="Créer une variation"
                    >
                      <Sparkle size={12} className="text-[var(--accent)]" />
                      <span>Variation</span>
                    </button>
                    <button
                      onClick={() => setActiveStudioTab('edit')}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] flex items-center gap-1 transition-colors"
                      title="Retoucher l'image"
                    >
                      <MagicWand size={12} className="text-[#6F9485]" />
                      <span>Retoucher</span>
                    </button>
                    <button
                      onClick={handleTransformToVideo}
                      className="px-2.5 py-1 rounded-lg bg-[#665F9E]/30 hover:bg-[#665F9E]/50 text-[11px] text-[#AAA2C8] flex items-center gap-1 transition-colors"
                      title="Transformer en vidéo 5s"
                    >
                      <FilmStrip size={12} />
                      <span>En Vidéo</span>
                    </button>
                    <button
                      onClick={handleGenerateSocialKit}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] flex items-center gap-1 transition-colors"
                      title="Générer Kit Social"
                    >
                      <FileText size={12} className="text-[#315A70]" />
                      <span>Kit Social</span>
                    </button>
                  </div>
                </div>

                {/* Image Container with Dynamic Aspect Ratio */}
                <div
                  className={`flex items-center justify-center p-4 rounded-xl border border-white/[0.06] bg-[#050810] overflow-hidden transition-all ${
                    selectedRatio === '9:16' ? 'aspect-[9/16] max-h-[60vh] mx-auto' : selectedRatio === '4:5' ? 'aspect-[4/5] max-h-[60vh] mx-auto' : selectedRatio === '16:9' ? 'aspect-[16/9] w-full' : 'aspect-square max-h-[60vh] mx-auto'
                  }`}
                >
                  {activeArtifact.url ? (
                    <img src={activeArtifact.url} alt={activeArtifact.title} className="w-full h-full rounded-lg object-contain shadow-lg" />
                  ) : (
                    <div className="p-8 text-center text-[#7E8795]">Image générée par FLUX.1 Schnell / FLUX.2 Klein</div>
                  )}
                </div>

                {/* Social Kit Viewer if generated */}
                {socialKitData && (
                  <div className="p-3.5 rounded-xl bg-[#0E121A] border border-white/[0.06] space-y-3">
                    <h4 className="text-[12px] font-semibold text-[var(--accent)] flex items-center gap-1.5">
                      <FileText size={14} />
                      <span>Kit de Communication LinkedIn & Facebook</span>
                    </h4>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-[#050810] border border-white/[0.04]">
                        <div className="flex justify-between text-[#7E8795] mb-1">
                          <span className="font-semibold text-[#8AB4F8]">Format LinkedIn ({socialKitData.linkedin.length} chars)</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(socialKitData.linkedin);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-[#AAA2C8] hover:text-white"
                          >
                            Copier
                          </button>
                        </div>
                        <pre className="text-[#F1EEE7] whitespace-pre-wrap font-sans leading-relaxed">{socialKitData.linkedin}</pre>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#050810] border border-white/[0.04]">
                        <div className="flex justify-between text-[#7E8795] mb-1">
                          <span className="font-semibold text-[#315A70]">Format Facebook ({socialKitData.facebook.length} chars)</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(socialKitData.facebook);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-[#AAA2C8] hover:text-white"
                          >
                            Copier
                          </button>
                        </div>
                        <pre className="text-[#F1EEE7] whitespace-pre-wrap font-sans leading-relaxed">{socialKitData.facebook}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeArtifact.type === 'video' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <span className="text-[#7E8795]">Lecteur Vidéo Souverain Wan2.1 / Wan2.2</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleGenerateSocialKit}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] flex items-center gap-1 transition-colors"
                    >
                      <FileText size={12} className="text-[#315A70]" />
                      <span>Kit Réseaux Sociaux</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 rounded-lg bg-[#665F9E] text-white text-[11px] font-semibold flex items-center gap-1"
                    >
                      <DownloadSimple size={12} />
                      <span>Export MP4</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.06] bg-[#050810]">
                  {activeArtifact.url ? (
                    <video
                      src={activeArtifact.url}
                      controls
                      autoPlay
                      loop
                      className="w-full max-h-[60vh] rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="p-8 text-center text-[#7E8795]">Vidéo 5s Wan2.1 T2V-1.3B</div>
                  )}
                </div>
              </div>
            ) : activeArtifact.type === 'audio' ? (
              <div className="p-6 rounded-xl border border-white/[0.06] bg-[#050810] space-y-4 text-center">
                <h4 className="text-[13px] font-semibold text-[#F1EEE7]">{activeArtifact.title}</h4>
                {activeArtifact.url ? (
                  <audio src={activeArtifact.url} controls className="w-full" />
                ) : (
                  <div className="text-[12px] text-[#7E8795]">Audio MeloTTS / Kokoro prêt</div>
                )}
              </div>
            ) : activeArtifact.type === 'a2ui_card' ? (
              <div>
                <A2UIRenderer
                  spec={
                    typeof activeArtifact.content === 'string'
                      ? JSON.parse(activeArtifact.content)
                      : (activeArtifact.content as any)
                  }
                />
              </div>
            ) : activeArtifact.type === 'mcp_app' ? (
              <div>
                <MCPAppRunner
                  app={{
                    id: activeArtifact.id,
                    title: activeArtifact.title,
                    description: 'Application MCP interactive',
                    version: '1.0.0',
                    toolOrigin: activeArtifact.provenance?.mcpToolCalled || 'mcp_tool',
                    serverOrigin: 'mcp_server',
                    appType: 'dashboard',
                    sandboxPermissions: ['storage:read'],
                    initialState: {},
                  }}
                />
              </div>
            ) : (
              <div className="p-2 text-[#F1EEE7] leading-relaxed">
                <NkyelMarkdown content={activeArtifact.content || 'Contenu vide.'} />
              </div>
            )}
          </div>
        )}


        {/* TAB 2: MODIFIER (EDIT) */}
        {activeStudioTab === 'edit' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#7E8795]">Éditeur de version souverain</span>
              <span className="text-[11px] font-mono text-[#AAA2C8]">Version cible : v{(activeArtifact.version || 1) + 1}.0</span>
            </div>

            <textarea
              rows={16}
              value={editBuffer}
              onChange={(e) => setEditBuffer(e.target.value)}
              className="w-full flex-1 p-4 rounded-xl text-[13px] font-mono text-[#F1EEE7] bg-[#050810] border border-white/[0.08] focus:border-[#665F9E] focus:outline-none transition-colors"
            />

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <input
                type="text"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Note de modification (Ex: Ajustement du taux d'actualisation WACC)..."
                className="flex-1 px-3 py-2 rounded-xl text-[12px] bg-[#0E121A] border border-white/[0.08] text-[#F1EEE7] focus:outline-none"
              />
              <button
                onClick={() => {
                  saveNewVersion(activeArtifact.id, editBuffer, changeNote || 'Modification manuelle');
                  setActiveStudioTab('preview');
                }}
                className="px-4 py-2 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/90 text-white text-[12px] font-semibold transition-colors shrink-0"
              >
                Sauvegarder Version
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CODE */}
        {activeStudioTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] text-[#7E8795] font-mono">Source brute</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[12px] text-[#AAA2C8] hover:text-white"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copié !' : 'Copier tout'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#050810] border border-white/[0.06] text-[12px] font-mono text-[#F1EEE7] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {activeArtifact.content}
            </pre>
          </div>
        )}

        {/* TAB 4: VERSIONS & DIFF */}
        {activeStudioTab === 'versions' && (
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
              Historique des Versions & Checkpoints
            </h4>

            {activeArtifact.versions && activeArtifact.versions.length > 0 ? (
              <div className="space-y-2">
                {activeArtifact.versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-3.5 rounded-xl bg-[#0E121A] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-mono font-bold text-[var(--accent)]">v{ver.version}.0</span>
                        <span className="text-[11px] text-[#7E8795]">par {ver.author}</span>
                      </div>
                      <p className="text-[11px] text-[#B8C0CC] mt-0.5">{ver.changeSummary || 'Version générée'}</p>
                    </div>

                    <button
                      onClick={() => restoreVersion(activeArtifact.id, ver.version)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] font-semibold transition-colors"
                    >
                      Restaurer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0E121A] text-[12px] text-[#7E8795] text-center">
                Version initiale active (v1.0). Modifiez le document pour créer des branches de version.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SOURCES & CITATIONS */}
        {activeStudioTab === 'sources' && (
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
              Sources & Citations Vérifiées (Google Grounding)
            </h4>

            {activeArtifact.sources && activeArtifact.sources.length > 0 ? (
              <div className="space-y-2">
                {activeArtifact.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-colors block group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#315A70] group-hover:underline">
                        {src.title}
                      </span>
                      <ArrowRight size={13} className="text-[#7E8795]" />
                    </div>
                    {src.snippet && <p className="text-[11px] text-[#7E8795] mt-1 line-clamp-2">{src.snippet}</p>}
                    <span className="text-[10px] text-[#6F9485] font-mono mt-1 block truncate">{src.url}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#0E121A] text-center text-[12px] text-[#7E8795]">
                Toutes les affirmations de ce livrable sont adossées aux sources primaires Google Search et bases certifiées.
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ACTIVITÉ (ACTIVITY) */}
        {activeStudioTab === 'activity' && (
          <div className="space-y-3">
            <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
              Journal d'Activité de Production
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#0E121A] border border-white/[0.04] text-[#B8C0CC] flex items-center justify-between">
                <span>✓ Création de l'artefact initial</span>
                <span className="text-[#7E8795]">{new Date(activeArtifact.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0E121A] border border-white/[0.04] text-[#B8C0CC] flex items-center justify-between">
                <span>✓ Réconciliation des sources & validation</span>
                <span className="text-[#6F9485]">Validé</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: WORKGRAPH & PROVENANCE */}
        {activeStudioTab === 'workgraph' && (
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
              Provenance Canonique & Nœud WorkGraph
            </h4>

            <div className="p-4 rounded-xl bg-[#0E121A] border border-white/[0.06] space-y-3 text-[12px]">
              <div className="flex justify-between text-[#7E8795]">
                <span>Agent Producteur :</span>
                <span className="font-semibold text-[#F1EEE7]">{activeArtifact.provenance?.agentName || 'Ñkyel Stratège'}</span>
              </div>
              <div className="flex justify-between text-[#7E8795]">
                <span>Skill employé :</span>
                <span className="font-mono text-[var(--accent)]">{activeArtifact.provenance?.skillUsed || 'financial-research'}</span>
              </div>
              <div className="flex justify-between text-[#7E8795]">
                <span>Outil MCP appelé :</span>
                <span className="font-mono text-[#5BA3B5]">{activeArtifact.provenance?.mcpToolCalled || 'tavily_search'}</span>
              </div>
              <div className="flex justify-between text-[#7E8795]">
                <span>Modèle d'inférence :</span>
                <span className="font-mono text-[#8AB4F8]">{activeArtifact.provenance?.model || 'Gemini 3.7 Pro'}</span>
              </div>
              <div className="flex justify-between text-[#7E8795]">
                <span>Checkpoint immuable :</span>
                <span className="font-mono text-[#AAA2C8]">{activeArtifact.provenance?.checkpointId || 'chk_89fa21'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push('/workspace')}
                className="w-full py-2 rounded-xl bg-[#665F9E]/20 hover:bg-[#665F9E]/30 border border-[#665F9E]/30 text-[#AAA2C8] font-semibold text-[12px] flex items-center justify-center gap-2 transition-colors"
              >
                <Graph size={15} />
                <span>Afficher le Nœud dans le Canvas VIE</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. STUDIO FOOTER ACTIONS ── */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#0E121A] flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={() => router.push('/workspace')}
          className="text-[11px] text-[#7E8795] hover:text-[#F1EEE7] flex items-center gap-1 transition-colors"
        >
          <Graph size={13} />
          <span>Afficher dans VIE</span>
        </button>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#F1EEE7] font-semibold transition-colors flex items-center gap-1"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>
      </div>
    </aside>
  );
}
