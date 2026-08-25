/**
 * Ñkyel AI — Adaptive Central Intelligence Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Composition spatiale unifiée (Apple Liquid Glass × Geist × Luma AI) :
 * - Left Sidebar (Navigation, Projets & Sessions)
 * - Central Intelligence Workspace (Reading Column centré, Composer adaptatif)
 * - Top-Right Discreet Mission Toolbar (WorkGraph, VIE, Visual Flow, Contexte)
 * - Right Context Inspector (Run, Sources, Tools, Skills, MCP)
 * - Safe Areas, Contrast AA, Responsive Drawer & Subpixel Polish
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
  GeistSliders,
} from '@/components/icons/GeistIcons';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';
import RightContextInspector from '@/components/inspector/RightContextInspector';
import Surface from '@/components/ui/Surface';
import TierPicker, { TierKey } from '@/components/chat/TierPicker';
import MobileMissionModal from '@/components/chat/MobileMissionModal';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  toolActivity?: { name: string; status: 'running' | 'completed' | 'failed'; duration?: string };
}

interface AdaptiveChatWorkspaceProps {
  initialMessages?: ChatMessage[];
  missionTitle?: string;
  onSendMessage?: (content: string) => Promise<void>;
  onStopStreaming?: () => void;
  isStreaming?: boolean;
}

const SAMPLE_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Bonjour Ñkyel. Peux-tu analyser l\'architecture multimodale de Google Gemini et synthétiser les principes de design Apple Liquid Glass pour notre nouveau workspace ?',
    timestamp: '14:20',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Bienvenue dans l'espace central de Ñkyel AI. Voici la synthèse exécutive de votre demande :

### 1. Architecture Multimodale Google Gemini
Google Gemini (notamment **Gemini 2.5 Flash** et **Gemini 3.1 Pro**) repose sur une fenêtre de contexte allant jusqu'à **2 millions de tokens**. Cela permet une ingestion native et sans perte de larges bases de code, documents volumineux, flux audio et vidéos brutes [1].

### 2. Principes Apple Liquid Glass & Geist
L'architecture visuelle moderne sépare strictement deux plans fondamentaux :
* **Content Layer (Solide & Calme)** : Vos messages, documents et visualisations restent sur des surfaces à contraste élevé garantissant une lisibilité absolue (WCAG 2.2 AA) [2].
* **Functional Layer (Verre Liquide Régulier)** : La barre de navigation, le composer adaptatif et l'inspecteur contextuel flottent subtilement au-dessus de la toile avec réfraction et ombres multi-couches [3].

Comment souhaitez-vous structurer la prochaine étape de votre mission ?`,
    timestamp: '14:21',
    toolActivity: { name: 'Wandana Web Radar & Gemini 3.1 Pro', status: 'completed', duration: '1.4s' },
    sources: ['src-1', 'src-2', 'src-3'],
  },
];

export default function AdaptiveChatWorkspace({
  initialMessages = SAMPLE_INITIAL_MESSAGES,
  missionTitle = 'Synthèse Architecture Gemini & Design Apple',
  onSendMessage,
  onStopStreaming,
  isStreaming = false,
}: AdaptiveChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [tierPickerOpen, setTierPickerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierKey>('NKYEL_CHUI');
  const [activeSurface, setActiveSurface] = useState<'chat' | 'workgraph' | 'vie' | 'visual_flow'>('chat');
  const [mobileMissionOpen, setMobileMissionOpen] = useState(false);

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
    rightWidth,
  } = useWorkspaceLayout();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal messages if prop changes
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll on new messages if user is at bottom
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isStreaming, autoScroll]);

  // Detect user scroll to pause auto-follow
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = inputText.trim();
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (onSendMessage) {
      await onSendMessage(sentText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const tierLabels: Record<TierKey, string> = {
    NKYEL_CHUI: 'Rapide (Chui)',
    NKYEL_TAI: 'Profond (Tai)',
    RECHERCHE_WEB: 'Recherche Web',
    NKYEL_RADI: 'Polyvalent (Radi)',
    BLUE_PANTHER: 'Créateur',
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--material-canvas)] text-[var(--text-primary)]">
      {/* ─── CENTRE : ESPACE CENTRAL DE L'INTELLIGENCE ─── */}
      <section className="flex flex-1 flex-col min-w-0 h-full relative overflow-hidden">
        {/* ── Top Bar Minimale (Apple × Geist) ── */}
        <header className="h-12 px-4 border-b border-[var(--border)] bg-[var(--material-glass-regular)] backdrop-blur-xl flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={toggleLeft}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
              title={isLeftOpen ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
              aria-label="Toggle Sidebar"
            >
              <GeistSidebar size={16} />
            </button>

            <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
              {missionTitle}
            </span>
          </div>

          {/* ── Discrete Contextual Mission Controls ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Switcher Pills */}
            <div className="hidden md:flex items-center bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveSurface('chat')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeSurface === 'chat'
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] font-medium shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveSurface('workgraph')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeSurface === 'workgraph'
                    ? 'bg-[var(--surface)] text-[#D5AE57] font-medium shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Structure de la Mission (WorkGraph)"
              >
                <GeistCpu size={12} />
                <span>WorkGraph</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSurface('vie')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeSurface === 'vie'
                    ? 'bg-[var(--surface)] text-[#D5AE57] font-medium shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Validation & Décisions (VIE)"
              >
                <GeistSliders size={12} />
                <span>VIE</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSurface('visual_flow')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeSurface === 'visual_flow'
                    ? 'bg-[var(--surface)] text-[#D5AE57] font-medium shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title="Flux d'Exécution en Direct"
              >
                <GeistActivity size={12} />
                <span>Visual Flow</span>
              </button>
            </div>

            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
              className="hidden sm:flex h-7 items-center gap-1.5 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              <GeistSearch size={13} className="text-[#D5AE57]" />
              <span>⌘K</span>
            </button>

            {/* Focus Mode Trigger */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium transition-colors hidden md:flex items-center gap-1.5 ${
                isFocusMode
                  ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-[#D5AE57]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
              }`}
              title="Mode concentration (masque les panneaux latéraux)"
            >
              <GeistSparkle size={13} />
              <span>Focus</span>
            </button>

            {/* Mobile Mission Intelligence Trigger Button (Apple / Manus pattern) */}
            <button
              type="button"
              onClick={() => setMobileMissionOpen(true)}
              className="md:hidden h-7 px-2.5 rounded-lg border border-[#D5AE57]/40 bg-[#D5AE57]/15 text-[#D5AE57] text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
              title="Ouvrir l'intelligence de mission"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5AE57] animate-pulse" />
              <span>Mission</span>
            </button>

            {/* Right Inspector Trigger Button with Live Status Badge */}
            <button
              type="button"
              onClick={toggleRight}
              className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                isRightOpen
                  ? 'bg-[var(--surface-raised)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-sm'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
              }`}
              title="Afficher l'inspecteur contextuel (Run, Sources, Tools)"
            >
              <GeistActivity size={14} className={isStreaming ? 'animate-spin text-[#D5AE57]' : 'text-[var(--text-tertiary)]'} />
              <span className="hidden sm:inline">Contexte</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          </div>
        </header>

        {/* ── Surface Switcher Body ── */}
        {activeSurface === 'chat' ? (
          <>
            {/* ── Conversation Stream / Reading Column ── */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 scrollbar-thin space-y-6"
            >
              {/* Centered Reading Column Container */}
              <div className="max-w-[780px] mx-auto w-full space-y-7 pb-36">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group animate-in fade-in duration-150 ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Assistant Identity Pill */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">Ñkyel</span>
                          <span className="text-[11px] text-[var(--text-tertiary)] font-mono">· {msg.timestamp}</span>
                        </div>
                      )}

                      {/* Message Surface */}
                      {isUser ? (
                        /* User Message Surface: Raised Neutral Solid */
                        <div className="max-w-[85%] sm:max-w-[72%] p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-[15px] leading-relaxed text-[var(--text-primary)] shadow-[var(--shadow-key)] font-sans">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ) : (
                        /* AI Message: Full Readable Prose Column */
                        <div className="w-full space-y-3 text-[15.5px] leading-[1.64] text-[var(--text-primary)] font-sans">
                          {/* Tool Execution Pill (Compact) */}
                          {msg.toolActivity && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] shadow-sm">
                              <GeistWrench size={13} className="text-[#D5AE57]" />
                              <span>{msg.toolActivity.name}</span>
                              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">({msg.toolActivity.duration})</span>
                              <GeistCheck size={13} className="text-emerald-400" strokeWidth={2} />
                            </div>
                          )}

                          {/* AI Content */}
                          <div className="prose-nkyel space-y-3">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          {/* Citations Footer Pills */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2">
                              <span className="text-[11px] font-mono text-[var(--text-tertiary)] mr-1">Sources :</span>
                              {msg.sources.map((srcId, sIdx) => (
                                <button
                                  key={srcId}
                                  onClick={() => openSource(srcId)}
                                  className="px-2 py-0.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] font-mono font-bold text-[#D5AE57] transition-colors flex items-center gap-1"
                                  title="Inspecter la source dans le panneau latéral"
                                >
                                  <span>[{sIdx + 1}]</span>
                                  <span className="font-sans font-normal text-[10px] text-[var(--text-secondary)]">DeepMind / Apple</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Message Action Footer (Copy / Share) */}
                          <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors text-xs flex items-center gap-1"
                              title="Copier la réponse"
                            >
                              {copiedMsgId === msg.id ? <GeistCheck size={13} className="text-emerald-400" /> : <GeistCopy size={13} />}
                              <span>{copiedMsgId === msg.id ? 'Copié' : 'Copier'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Scroll to Latest Floating Action ── */}
            {!autoScroll && (
              <button
                onClick={() => {
                  setAutoScroll(true);
                  chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[var(--material-glass-floating)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] shadow-[var(--shadow-floating)] backdrop-blur-xl flex items-center gap-1.5 z-20 animate-in fade-in zoom-in-95 duration-150"
              >
                <span>↓ Derniers messages</span>
              </button>
            )}

            {/* ── Floating Adaptive Composer (Center Pane Only) ── */}
            <div
              className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pt-2 z-30 pointer-events-none"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="max-w-[780px] mx-auto w-full pointer-events-auto">
                <Surface
                  material="glass-floating"
                  className="p-2 sm:p-2.5 rounded-3xl backdrop-blur-3xl transition-all shadow-[var(--shadow-floating)] flex flex-col gap-2 border border-[var(--border-strong)]"
                >
                  {/* Textarea Input Area */}
                  <div className="flex items-center gap-2 px-2">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={handleTextareaInput}
                      onKeyDown={handleKeyDown}
                      placeholder="Demandez n'importe quoi à Ñkyel (Recherche approfondie, Analyse, Code)..."
                      rows={1}
                      className="w-full bg-transparent text-[15px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-secondary)] placeholder:opacity-60 focus:outline-none resize-none font-sans max-h-48 py-1.5"
                    />
                  </div>

                  {/* Toolbar Actions Bar */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-1.5 px-1">
                    {/* Left Cluster: Plus Button + Model Picker */}
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                        className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Ajouter des fichiers ou du contexte (+)"
                      >
                        <GeistPlus size={15} strokeWidth={2} />
                      </button>

                      {/* Tier / Intelligence Selector Pill */}
                      <button
                        type="button"
                        onClick={() => setTierPickerOpen(true)}
                        className="h-8 px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Changer de profil d'intelligence"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#D5AE57]" />
                        <span className="font-medium">{tierLabels[selectedTier] || 'Rapide'}</span>
                      </button>

                      {/* Plus Dropdown Menu */}
                      {plusMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-52 p-1 rounded-2xl bg-[var(--material-glass-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] backdrop-blur-2xl text-xs space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistFile size={15} className="text-[#D5AE57]" />
                            <span>Téléverser Document</span>
                          </button>
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistGlobe size={15} className="text-emerald-400" />
                            <span>Recherche Web Stratégique</span>
                          </button>
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistPlugs size={15} className="text-amber-300" />
                            <span>Connecteur MCP</span>
                          </button>
                        </div>
                      )}

                      {/* Tier Picker Modal / Popover */}
                      <TierPicker
                        isOpen={tierPickerOpen}
                        onClose={() => setTierPickerOpen(false)}
                        selectedTier={selectedTier}
                        onSelect={(t) => setSelectedTier(t)}
                      />
                    </div>

                    {/* Right Cluster: Mic / Send / Stop */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-xl hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
                        title="Dictée vocale"
                      >
                        <GeistMic size={16} />
                      </button>

                      {isStreaming ? (
                        <button
                          type="button"
                          onClick={onStopStreaming}
                          className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors border border-red-500/30"
                          title="Arrêter l'exécution de la mission"
                        >
                          <GeistCross size={13} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSend}
                          disabled={!inputText.trim()}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            inputText.trim()
                              ? 'bg-[#D5AE57] text-black font-bold shadow-md active:scale-95'
                              : 'bg-[var(--surface)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                          }`}
                          title="Envoyer la consigne"
                        >
                          <GeistArrowUp size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                </Surface>
              </div>
            </div>
          </>
        ) : (
          /* ── Alternative Active Surface Panels ── */
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-md p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D5AE57]/10 text-[#D5AE57] mx-auto flex items-center justify-center">
                {activeSurface === 'workgraph' && <GeistCpu size={20} />}
                {activeSurface === 'vie' && <GeistSliders size={20} />}
                {activeSurface === 'visual_flow' && <GeistActivity size={20} />}
              </div>
              <h3 className="font-semibold text-sm capitalize">{activeSurface.replace('_', ' ')}</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {activeSurface === 'workgraph' && 'Vue structurelle du graphe de mission (Agents, Tâches, Artefacts, Sources).'}
                {activeSurface === 'vie' && 'Environnement de contrôle et de validation humaine (VIE).'}
                {activeSurface === 'visual_flow' && 'Pipeline d\'exécution dynamique et transitions d\'états des agents en direct.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveSurface('chat')}
                className="px-4 py-2 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition-colors"
              >
                Retour à la conversation
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── DROITE : RIGHT CONTEXT INSPECTOR (320-380px) ─── */}
      <AnimatePresence>
        {isRightOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: rightWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block shrink-0 h-full overflow-hidden border-l border-[var(--border)]"
          >
            <RightContextInspector
              isStreaming={isStreaming}
              missionTitle={missionTitle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile / Tablet Context Sheet Overlay ─── */}
      {isRightOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm sm:max-w-md h-full bg-[var(--material-canvas)] border-l border-[var(--border)] shadow-2xl">
            <RightContextInspector
              isStreaming={isStreaming}
              missionTitle={missionTitle}
            />
          </div>
        </div>
      )}

      {/* ─── Mobile Full-Screen Mission Sheet (Overview, WorkGraph, VIE, Flow) ─── */}
      <MobileMissionModal
        isOpen={mobileMissionOpen}
        onClose={() => setMobileMissionOpen(false)}
        missionTitle={missionTitle}
        isStreaming={isStreaming}
      />
    </div>
  );
}
