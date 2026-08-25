/**
 * Ñkyel AI — Adaptive Central Intelligence Workspace · SmartANDJ AI Technologies
 * Visual Agentic Operating Experience :
 * - Left Sidebar (Navigation & Missions)
 * - Central Intelligence Workspace (Reading Column centré, In-line Artifact Cards, Approvals, Flow)
 * - Right Context Inspector (5 onglets calmes : Run, Sources, Tools, Artifacts, MCP)
 * - Navigation continue entre modes : [CHAT], [WORKGRAPH], [ARTIFACT], [FLOW]
 * - Auto-scroll intelligent avec bouton [Dernier message]
 * - Zéro faux état ni simulation
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GeistSidebar,
  GeistSearch,
  GeistSparkle,
  GeistPlus,
  GeistArrowUp,
  GeistMic,
  GeistCheck,
  GeistCopy,
  GeistRefresh,
  GeistActivity,
  GeistGlobe,
  GeistWrench,
  GeistCpu,
  GeistPlugs,
  GeistFile,
  GeistCross,
} from '@/components/icons/GeistIcons';
import {
  Graph,
  Sparkle,
  ChatCircleText,
  FileText,
  ArrowsClockwise,
  ShieldCheck,
  ArrowDown,
} from '@phosphor-icons/react';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';
import RightContextInspector, { SourceItem, ToolItem, SkillItem, McpConnectorItem } from '@/components/inspector/RightContextInspector';
import ArtifactCard, { ArtifactCardData } from './cards/ArtifactCard';
import ApprovalCard, { ApprovalRequestData } from './cards/ApprovalCard';
import ToolActivityBlock, { ToolActivityData } from './cards/ToolActivityBlock';
import SourceEvidenceBlock, { SourceItemData } from './cards/SourceEvidenceBlock';
import UniversalArtifactViewer from '@/components/rendu/viewers/UniversalArtifactViewer';
import VIECanvas from '@/components/vie/VIECanvas';
import DeerFlowCanvas from '@/components/flow/DeerFlowCanvas';
import type { NkyelRendu } from '@/lib/models';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceItemData[];
  toolActivity?: ToolActivityData;
  artifacts?: ArtifactCardData[];
  approvalRequest?: ApprovalRequestData;
}

interface AdaptiveChatWorkspaceProps {
  initialMessages?: ChatMessage[];
  missionTitle?: string;
  onSendMessage?: (content: string) => Promise<void>;
  isStreaming?: boolean;
}

// ── Données Démo WOW Gabon Écotourisme 2026 ─────────────────
const SAMPLE_WOW_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Prépare le lancement international d\'une entreprise d\'écotourisme au Gabon. Analyse le marché, compare les opportunités, crée le budget, produis un rapport professionnel, crée la présentation, les visuels de campagne et le teaser vidéo.',
    timestamp: '14:20',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Bienvenue dans le workspace souverain Ñkyel AI. Les agents autonomes ont orchestré l'ensemble de votre stratégie de lancement international pour le Gabon :

### 1. Synthèse Exécutive & Opportunités de Marché
Le marché mondial de l'écotourisme croît de **14.8% par an**. Le Gabon offre un avantage compétitif unique grâce à ses sanctuaires côtiers intacts (**Loango**, **Pongara**) et ses forêts primaires classées UNESCO (**Ivindo**).

### 2. Livrables et Actifs Produits
Tous vos documents opérationnels, modèles financiers et actifs multimédias sont générés et prêts pour diffusion internationale :`,
    timestamp: '14:21',
    toolActivity: {
      id: 'tool-1',
      name: 'Google Search Grounding & Maps',
      server: 'google_workspace',
      status: 'completed',
      durationMs: 420,
      parameters: { query: 'Gabon ecotourism Loango Pongara Ivindo', depth: 'deep' },
      resultSummary: '3 parcs nationaux identifiés avec coordonnées spatiales et routes d\'accès vérifiées.',
    },
    sources: [
      { id: 'src-1', title: 'Loango National Park Marine Safari', domain: 'parcsgabon.org', url: 'https://parcsgabon.org/loango' },
      { id: 'src-2', title: 'Ecotourism Global Trends 2026', domain: 'unwto.org', url: 'https://unwto.org/ecotourism-report-2026' },
      { id: 'src-3', title: 'Central Africa Biodiversity Reserves', domain: 'unesco.org', url: 'https://whc.unesco.org/en/list/1653' },
    ],
    artifacts: [
      {
        id: 'art-doc-1',
        title: 'Stratégie de Lancement Écotourisme Gabon 2026',
        type: 'report',
        pageCount: 14,
        model: 'gemini-3.1-pro-preview',
        description: 'Dossier complet de positionnement international, démographie cible et feuille de route opérationnelle.',
      },
      {
        id: 'art-xlsx-1',
        title: 'Budget Opérationnel & Modèle Prévisionnel ($305k)',
        type: 'xlsx',
        model: 'google-workspace-v1',
        description: 'Répartition budgétaire Q1-Q2 et projections de retour sur investissement touristique.',
      },
      {
        id: 'art-pptx-1',
        title: 'Présentation Investisseurs & Partenaires (Deck 8 Slides)',
        type: 'pptx',
        slideCount: 8,
        model: 'gemini-3.7-flash',
        description: 'Diaporama 16:9 haute résolution pour roadshows institutionnels.',
      },
      {
        id: 'art-img-1',
        title: 'Visuel Phare Campagne — Plage & Faune de Loango',
        type: 'image',
        url: '/placeholder.png',
        model: 'gemini-3.1-flash-image',
        description: 'Photographie 8k 1024×1024 validée par hash SHA-256.',
      },
      {
        id: 'art-vid-1',
        title: 'Teaser Vidéo 4K — Vue Aérienne Côte Équatoriale (Veo 3.1)',
        type: 'video',
        durationSeconds: 5,
        model: 'veo-3.1-generate-preview',
        description: 'Plan aérien cinématique 5s à 60fps prêt pour diffusion publicitaire.',
      },
    ],
  },
];

export default function AdaptiveChatWorkspace({
  initialMessages = SAMPLE_WOW_MESSAGES,
  missionTitle = 'Lancement Écotourisme Gabon 2026',
  onSendMessage,
  isStreaming = false,
}: AdaptiveChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Mode du centre de travail : CHAT, WORKGRAPH, ARTIFACT, FLOW
  const [centerMode, setCenterMode] = useState<'chat' | 'workgraph' | 'artifact' | 'flow'>('chat');
  const [selectedArtifact, setSelectedArtifact] = useState<NkyelRendu | null>(null);

  const {
    isLeftOpen,
    toggleLeft,
    isRightOpen,
    toggleRight,
    rightTab,
    setRightTab,
    openSource,
    isFocusMode,
    toggleFocusMode,
  } = useWorkspaceLayout();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isStreaming, autoScroll, centerMode]);

  // Détection du scroll utilisateur pour désactiver l'auto-follow
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isAtBottom);
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setAutoScroll(true);
      setShowScrollBottom(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText;
    setInputText('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);

    if (onSendMessage) {
      await onSendMessage(text);
    }
  };

  const handleOpenArtifact = (cardData: ArtifactCardData) => {
    const rendu: NkyelRendu = {
      id: cardData.id,
      type: cardData.type === 'report' ? 'report' : (cardData.type as any),
      title: cardData.title,
      url: cardData.url,
      created_at: Date.now(),
      provenance: { model: cardData.model },
    };
    setSelectedArtifact(rendu);
    setCenterMode('artifact');
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[var(--background,#060911)] text-[var(--foreground,#f1f5f9)] font-sans antialiased">
      {/* ── 1. Top Bar de Navigation Multimode ── */}
      <header className="h-13 px-4 sm:px-6 border-b border-[var(--border,rgba(255,255,255,0.08))] bg-[var(--surface-elevated,#0e1626)]/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        {/* Titre de Mission & Sélecteur de Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLeft}
            className="p-1.5 rounded-lg border border-[var(--border,rgba(255,255,255,0.1))] hover:bg-white/5 text-slate-300 transition-colors"
            title="Basculer le panneau latéral"
          >
            <GeistSidebar size={16} />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[320px]">
              {missionTitle}
            </h1>
          </div>

          {/* Mode Switcher : Chat | WorkGraph | Artifact | Flow */}
          <div className="hidden md:flex items-center bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
            <button
              onClick={() => setCenterMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                centerMode === 'chat' ? 'bg-[#c39a52] text-[#0a0e17] font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChatCircleText size={14} weight="bold" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setCenterMode('workgraph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                centerMode === 'workgraph' ? 'bg-[#c39a52] text-[#0a0e17] font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Graph size={14} weight="bold" />
              <span>WorkGraph</span>
            </button>

            <button
              onClick={() => setCenterMode('flow')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                centerMode === 'flow' ? 'bg-[#c39a52] text-[#0a0e17] font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkle size={14} weight="bold" />
              <span>Visual Flow</span>
            </button>

            {selectedArtifact && (
              <button
                onClick={() => setCenterMode('artifact')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                  centerMode === 'artifact' ? 'bg-[#c39a52] text-[#0a0e17] font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} weight="bold" />
                <span>Studio Artefact</span>
              </button>
            )}
          </div>
        </div>

        {/* Contrôles Droit : Focus & Inspecteur */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFocusMode}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isFocusMode ? 'bg-[#c39a52]/15 border-[#c39a52] text-[#c39a52]' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GeistSparkle size={13} />
            <span>Focus</span>
          </button>

          <button
            onClick={toggleRight}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition-colors"
          >
            <GeistActivity size={14} className="text-[#c39a52]" />
            <span className="hidden sm:inline">Inspecteur</span>
          </button>
        </div>
      </header>

      {/* ── 2. Corps Central ── */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* A. Mode Chat & Conversation (Primary) */}
        {centerMode === 'chat' && (
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin flex flex-col items-center"
          >
            <div className="w-full max-w-3xl space-y-6 pb-32">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col animate-in fade-in duration-150 ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Identité de l'agent */}
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <div className="w-5 h-5 rounded-md bg-[#c39a52] text-[#0a0e17] flex items-center justify-center font-black text-[10px]">
                          Ñ
                        </div>
                        <span className="text-xs font-bold text-white">Ñkyel Autonomous Agent</span>
                        <span className="text-[10px] text-slate-500 font-mono">· {msg.timestamp}</span>
                      </div>
                    )}

                    {/* Surface du message */}
                    {isUser ? (
                      <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl bg-[#1a2333] border border-white/10 text-sm leading-relaxed text-slate-100 shadow-lg font-sans">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="w-full space-y-3.5 text-[15px] leading-relaxed text-slate-200">
                        {/* Bloc d'exécution d'outil */}
                        {msg.toolActivity && (
                          <ToolActivityBlock tool={msg.toolActivity} />
                        )}

                        {/* Contenu textuel Markdown */}
                        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Pilules de Sources et Preuves */}
                        {msg.sources && (
                          <SourceEvidenceBlock
                            sources={msg.sources}
                            onOpenInspectorSources={() => {
                              setRightTab('sources');
                              if (!isRightOpen) toggleRight();
                            }}
                          />
                        )}

                        {/* Cartes d'Approbation Humaine si requise */}
                        {msg.approvalRequest && (
                          <ApprovalCard
                            data={msg.approvalRequest}
                            onApprove={async () => {}}
                            onModify={async () => {}}
                            onDeny={async () => {}}
                          />
                        )}

                        {/* Cartes de Livrables et Artefacts Universels */}
                        {msg.artifacts && msg.artifacts.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#c39a52] flex items-center gap-1.5">
                              <Sparkle size={14} weight="bold" />
                              <span>Livrables Vérifiés Générés ({msg.artifacts.length})</span>
                            </div>
                            {msg.artifacts.map((art) => (
                              <ArtifactRendererRegistry
                                key={art.id}
                                artifact={art}
                                onOpen={handleOpenArtifact}
                                onExport={(a, fmt) => {
                                  window.open(`/api/v1/artifacts/${a.id}/export?format=${fmt}`, '_blank');
                                }}
                                onOpenProvenance={(prov) => {
                                  setRightTab('run');
                                  if (!isRightOpen) toggleRight();
                                }}
                                onOpenWorkGraphNode={(nodeId) => {
                                  setCenterMode('workgraph');
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B. Mode WorkGraph (Grand écran interactif) */}
        {centerMode === 'workgraph' && (
          <div className="w-full h-full flex flex-col">
            <VIECanvas />
          </div>
        )}

        {/* C. Mode Visual Flow (Progression en temps réel) */}
        {centerMode === 'flow' && (
          <div className="w-full h-full flex flex-col">
            <DeerFlowCanvas />
          </div>
        )}

        {/* D. Mode Studio Artefact Universel */}
        {centerMode === 'artifact' && selectedArtifact && (
          <div className="w-full h-full flex flex-col">
            <UniversalArtifactViewer
              artifact={selectedArtifact}
              onExport={(fmt) => {
                window.open(`/api/v1/artifacts/${selectedArtifact.id}/export?format=${fmt}`, '_blank');
              }}
            />
          </div>
        )}

        {/* Bouton pour revenir en bas si l'utilisateur a scrollé */}
        {showScrollBottom && centerMode === 'chat' && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c39a52] text-[#0a0e17] font-bold text-xs shadow-2xl hover:scale-105 transition-all"
          >
            <ArrowDown size={14} weight="bold" />
            <span>Dernier message</span>
          </button>
        )}
      </div>

      {/* ── 3. Composer Adaptatif Flottant ── */}
      {centerMode === 'chat' && (
        <div className="p-4 bg-gradient-to-t from-[#060911] via-[#060911]/90 to-transparent flex flex-col items-center shrink-0 z-20">
          {/* Bannière de contexte d'artefact actif */}
          {selectedArtifact && (
            <div className="w-full max-w-3xl mb-2 px-3 py-1.5 rounded-xl bg-[#c39a52]/10 border border-[#c39a52]/30 flex items-center justify-between text-xs font-mono text-[#c39a52]">
              <div className="flex items-center gap-2 truncate">
                <Sparkle size={13} weight="bold" />
                <span>Contexte actif : <strong>{selectedArtifact.title}</strong></span>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="text-[10px] text-slate-400 hover:text-white underline ml-2"
              >
                Détacher
              </button>
            </div>
          )}

          <div className="w-full max-w-3xl rounded-2xl bg-[#0e1626] border border-white/10 p-2.5 shadow-2xl flex items-center gap-2">
            <button
              onClick={() => setPlusMenuOpen(!plusMenuOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Ajouter pièces jointes ou capacités"
            >
              <GeistPlus size={16} />
            </button>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Donnez une vision à Ñkyel (Recherche, budget, présentation, visuels, vidéo)..."
              rows={1}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none resize-none py-1.5"
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isStreaming}
              className="p-2 rounded-xl bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold disabled:opacity-40 transition-all shadow-md"
            >
              <GeistArrowUp size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
