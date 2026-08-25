/**
 * Ñkyel AI — Adaptive Central Intelligence Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Composition spatiale unifiée :
 * - Central Intelligence Workspace (Reading Column centré, Composer adaptatif)
 * - Single Canonical Intelligence Mode Selector (Auto / Rapide / Profond / Recherche)
 * - Discreet Contextual Mission Trigger (Overview / WorkGraph / Studio VIE / Live Flow)
 * - Right Context Inspector (Run, Sources, Tools, Skills, MCP)
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GeistSidebar,
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
import { CaretDown, Check, ArrowLeft } from '@phosphor-icons/react';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';
import { useNkyelModel, getIntelligenceMode, type IntelligenceModeId } from '@/hooks/useNkyelModel';
import { useLanguageStore } from '@/stores/language.store';
import RightContextInspector from '@/components/inspector/RightContextInspector';
import Surface from '@/components/ui/Surface';
import TierPicker from '@/components/chat/TierPicker';

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
    content: 'Bonjour Ñkyel. Peux-tu analyser l\'architecture globale de notre mission et préparer le plan d\'exécution ?',
    timestamp: '14:20',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Bienvenue dans l'espace de mission Ñkyel AI.

Le routeur autonome d'inférence est actif. Toutes vos requêtes sont orchestrées avec vérification de sources en direct, traçabilité des preuves et génération d'artefacts souverains.

Que souhaitez-vous accomplir pour cette mission ?`,
    timestamp: '14:21',
    toolActivity: { name: 'Grounding multi-sources & Routeur autonome', status: 'completed', duration: '1.2s' },
    sources: ['src-1', 'src-2'],
  },
];

export default function AdaptiveChatWorkspace({
  initialMessages = SAMPLE_INITIAL_MESSAGES,
  missionTitle = 'Nouvelle mission',
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
  const [missionMenuOpen, setMissionMenuOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState<'chat' | 'workgraph' | 'vie' | 'live_flow'>('chat');

  const { modeId, setModeId } = useNkyelModel();
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const {
    isLeftOpen,
    toggleLeft,
    isRightOpen,
    toggleRight,
    isFocusMode,
    toggleFocusMode,
    rightWidth,
  } = useWorkspaceLayout();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const missionMenuRef = useRef<HTMLDivElement>(null);

  // Sync internal messages if prop changes
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Close mission menu on click outside
  useEffect(() => {
    if (!missionMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (missionMenuRef.current && !missionMenuRef.current.contains(e.target as Node)) {
        setMissionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [missionMenuOpen]);

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
    } else {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Reçu. Analyse en cours en mode **${isFr ? getIntelligenceMode(modeId).labelFr : getIntelligenceMode(modeId).labelEn}** pour la consigne : « ${sentText} ».\n\nLes sources et artefacts générés sont disponibles dans l'Inspecteur de Contexte.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolActivity: { name: 'Routeur Ñkyel & Exécution autonome', status: 'completed', duration: '0.8s' },
          sources: ['src-live-1', 'src-live-2'],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const activeModeConfig = getIntelligenceMode(modeId);
  const activeModeLabel = isFr ? activeModeConfig.labelFr : activeModeConfig.labelEn;

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
          <div className="flex items-center gap-2 shrink-0">
            {/* Contextual Mission Trigger Button */}
            <div className="relative" ref={missionMenuRef}>
              <button
                type="button"
                onClick={() => setMissionMenuOpen(!missionMenuOpen)}
                className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  activeSurface !== 'chat'
                    ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-[#D5AE57]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                }`}
                title={t('header.missionIntelligence')}
                aria-label={t('header.missionIntelligence')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D5AE57]" />
                <span className="capitalize">{activeSurface === 'chat' ? t('header.mission') : activeSurface.replace('_', ' ')}</span>
                <CaretDown size={11} />
              </button>

              {missionMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl z-50 animate-scale-in text-xs space-y-0.5">
                  {[
                    { id: 'chat', label: t('view.overview'), icon: GeistSparkle },
                    { id: 'workgraph', label: t('view.workgraph'), icon: GeistCpu },
                    { id: 'vie', label: t('view.vie'), icon: GeistSliders },
                    { id: 'live_flow', label: t('view.liveFlow'), icon: GeistActivity },
                  ].map((v) => {
                    const Icon = v.icon;
                    const isSelected = activeSurface === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setActiveSurface(v.id as any);
                          setMissionMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-[var(--selected)] text-[var(--text-primary)] font-semibold'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={isSelected ? 'text-[#D5AE57]' : 'opacity-60'} />
                          <span>{v.label}</span>
                        </div>
                        {isSelected && <Check size={12} weight="bold" className="text-[#D5AE57]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Focus Mode Trigger */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium transition-colors hidden md:flex items-center gap-1.5 ${
                isFocusMode
                  ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-[#D5AE57]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
              }`}
              title="Mode concentration"
            >
              <GeistSparkle size={13} />
              <span>Focus</span>
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
              title="Inspecteur de Contexte (Sources, Outils, Activité)"
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
                        <div className="w-full max-w-full space-y-3.5">
                          {/* Live Tool Activity Header (if any) */}
                          {msg.toolActivity && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
                              <GeistWrench size={13} className="text-[#D5AE57]" />
                              <span>{msg.toolActivity.name}</span>
                              {msg.toolActivity.duration && (
                                <span className="text-[var(--text-tertiary)] font-mono">({msg.toolActivity.duration})</span>
                              )}
                            </div>
                          )}

                          {/* Main Prose Text with Strict Typography */}
                          <div className="text-[15px] leading-[1.65] text-[var(--text-primary)] space-y-3 prose dark:prose-invert max-w-none font-sans font-normal">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          {/* Discrete Bottom Action Bar */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="h-7 px-2 rounded-lg bg-transparent hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[11px] flex items-center gap-1 transition-colors"
                              title="Copier la réponse"
                            >
                              {copiedMsgId === msg.id ? <GeistCheck size={13} className="text-emerald-400" /> : <GeistCopy size={13} />}
                              <span>{copiedMsgId === msg.id ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Fixed Bottom Adaptive Composer ── */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[var(--material-canvas)] via-[var(--material-canvas)]/80 to-transparent pointer-events-none flex justify-center z-20">
              <div className="max-w-[780px] w-full pointer-events-auto">
                <Surface
                  layer="glass-regular"
                  elevation="modal"
                  className="rounded-3xl p-3 sm:p-3.5 transition-all shadow-[var(--shadow-floating)] border border-[var(--border-strong)] flex flex-col gap-2.5 backdrop-blur-2xl"
                >
                  {/* Textarea Input Area */}
                  <div className="relative flex items-center">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={isFr ? "Demandez quelque chose à Ñkyel..." : "Ask Ñkyel anything..."}
                      rows={1}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-[15px] placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] max-h-44 px-1 py-1 font-sans"
                    />
                  </div>

                  {/* Toolbar Actions Bar */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-1.5 px-1">
                    {/* Left Cluster: Plus Button + Single Canonical Mode Picker */}
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                        className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={isFr ? "Ajouter des fichiers ou du contexte (+)" : "Add files or context (+)"}
                      >
                        <GeistPlus size={15} strokeWidth={2} />
                      </button>

                      {/* Single Canonical Mode Selector Pill */}
                      <button
                        type="button"
                        onClick={() => setTierPickerOpen(true)}
                        className="h-8 px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={isFr ? "Changer de mode d'intelligence" : "Change intelligence mode"}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#D5AE57]" />
                        <span className="font-medium">{activeModeLabel}</span>
                        <CaretDown size={11} className="opacity-60" />
                      </button>

                      {/* Plus Dropdown Menu */}
                      {plusMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-52 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl text-xs space-y-0.5 z-50 animate-scale-in">
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistFile size={15} className="text-[#D5AE57]" />
                            <span>{isFr ? 'Téléverser Document' : 'Upload Document'}</span>
                          </button>
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistGlobe size={15} className="text-emerald-400" />
                            <span>{isFr ? 'Recherche Multi-Sources' : 'Multi-Source Search'}</span>
                          </button>
                          <button
                            onClick={() => setPlusMenuOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <GeistPlugs size={15} className="text-amber-300" />
                            <span>{isFr ? 'Connecteur' : 'Connector'}</span>
                          </button>
                        </div>
                      )}

                      {/* Single Mode Picker Modal / Popover */}
                      <TierPicker
                        isOpen={tierPickerOpen}
                        onClose={() => setTierPickerOpen(false)}
                        selectedMode={modeId}
                        onSelect={(m) => setModeId(m)}
                      />
                    </div>

                    {/* Right Cluster: Mic / Send / Stop */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-xl hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
                        title={isFr ? "Dictée vocale" : "Voice dictation"}
                      >
                        <GeistMic size={16} />
                      </button>

                      {isStreaming ? (
                        <button
                          type="button"
                          onClick={onStopStreaming}
                          className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors border border-red-500/30"
                          title={isFr ? "Arrêter l'exécution de la mission" : "Stop mission execution"}
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
                          title={isFr ? "Envoyer la mission" : "Send mission"}
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
          /* ── Contextual Mission Workbench Surface (WorkGraph / Studio VIE / Live Flow) ── */
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="max-w-md p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D5AE57]/10 text-[#D5AE57] mx-auto flex items-center justify-center">
                {activeSurface === 'workgraph' && <GeistCpu size={24} />}
                {activeSurface === 'vie' && <GeistSliders size={24} />}
                {activeSurface === 'live_flow' && <GeistActivity size={24} />}
              </div>
              <div>
                <h3 className="font-semibold text-base capitalize">
                  {activeSurface === 'workgraph' && t('view.workgraph')}
                  {activeSurface === 'vie' && t('view.vie')}
                  {activeSurface === 'live_flow' && t('view.liveFlow')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {activeSurface === 'workgraph' && (isFr ? 'Arborescence des agents, tâches, preuves et artefacts générés au fil de la mission.' : 'Hierarchy of agents, tasks, evidence, and artifacts generated during the mission.')}
                  {activeSurface === 'vie' && (isFr ? 'Studio de validation, de contrôle et d\'édition humaine directe des artefacts.' : 'Verification, control, and user editing environment for artifacts.')}
                  {activeSurface === 'live_flow' && (isFr ? 'Flux d\'exécution en direct et transitions d\'états des agents autonomes.' : 'Live execution flow and state transitions of autonomous agents.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSurface('chat')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D5AE57] text-black font-semibold text-xs shadow-sm hover:bg-[#C59E47] transition-colors"
              >
                <ArrowLeft size={14} weight="bold" />
                <span>{isFr ? 'Retour à la conversation' : 'Back to Chat'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── DROITE : INSPECTEUR CONTEXTUEL (DÉDIÉ & RÉTRACTABLE) ─── */}
      <RightContextInspector isStreaming={isStreaming} />
    </div>
  );
}
