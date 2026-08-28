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
import { useRouter } from 'next/navigation';
import {
  CaretDown,
  Check,
  ArrowLeft,
  FileText,
  Globe,
  PlugsConnected,
  Eye,
  Presentation,
  Table,
  Cpu,
  X,
  Paperclip,
  Sparkle,
} from '@phosphor-icons/react';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';
import { useNkyelModel, getIntelligenceMode, type IntelligenceModeId } from '@/hooks/useNkyelModel';
import { useLanguageStore } from '@/stores/language.store';
import { PantherMissionGlyph } from '@/components/icons';
import RightContextInspector from '@/components/inspector/RightContextInspector';
import Surface from '@/components/ui/Surface';
import TierPicker from '@/components/chat/TierPicker';
import VIECanvas from '@/components/vie/VIECanvas';
import VIEComprehensionView from '@/components/vie/VIEComprehensionView';
import LiveFlowTimelineView from '@/components/flow/LiveFlowTimelineView';
import SimulationScenarioView from '@/components/vie/SimulationScenarioView';

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

export default function AdaptiveChatWorkspace({
  initialMessages = [],
  missionTitle = 'Nouvelle mission',
  onSendMessage,
  onStopStreaming,
  isStreaming = false,
}: AdaptiveChatWorkspaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [tierPickerOpen, setTierPickerOpen] = useState(false);
  const [missionMenuOpen, setMissionMenuOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState<'chat' | 'workgraph' | 'vie' | 'live_flow'>('chat');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string }[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { modeId, setModeId } = useNkyelModel();
  const currentEngine = getIntelligenceMode(modeId);
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');
  const activeModeLabel = isFr ? currentEngine.labelFr : currentEngine.labelEn;

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
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close plus menu on outside click or Escape
  useEffect(() => {
    if (!plusMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlusMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [plusMenuOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setPlusMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleActionSelect = (action: string) => {
    setPlusMenuOpen(false);
    switch (action) {
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'research':
        setModeId('research');
        if (textareaRef.current) textareaRef.current.focus();
        break;
      case 'connections':
        router.push('/connectors');
        break;
      case 'image':
        setInputText((prev) =>
          prev
            ? `${prev}\n\n${isFr ? 'Générer une image : ' : 'Generate an image: '}`
            : isFr
            ? 'Génère une maquette visuelle haute fidélité pour : '
            : 'Generate a high-fidelity visual mock for: '
        );
        textareaRef.current?.focus();
        break;
      case 'document':
        setInputText((prev) =>
          prev
            ? `${prev}\n\n${isFr ? 'Rédiger un document : ' : 'Write a document: '}`
            : isFr
            ? 'Rédige un document structuré et complet sur : '
            : 'Write a comprehensive document about: '
        );
        textareaRef.current?.focus();
        break;
      case 'slides':
        setInputText((prev) =>
          prev
            ? `${prev}\n\n${isFr ? 'Créer des diapositives : ' : 'Create slides: '}`
            : isFr
            ? 'Conçois une présentation de diapositives professionnelle pour : '
            : 'Design a professional slide presentation for: '
        );
        textareaRef.current?.focus();
        break;
      case 'spreadsheet':
        setInputText((prev) =>
          prev
            ? `${prev}\n\n${isFr ? 'Tableur & données : ' : 'Spreadsheet & data: '}`
            : isFr
            ? 'Analyse et modélise une feuille de calcul financière pour : '
            : 'Analyze and model a financial spreadsheet for: '
        );
        textareaRef.current?.focus();
        break;
      case 'artifacts':
        if (!isRightOpen) toggleRight();
        break;
    }
  };

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
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
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

    try {
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
    } finally {
      setIsSending(false);
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



  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--material-canvas)] text-[var(--text-primary)]">
      {/* ─── CENTRE : ESPACE CENTRAL DE L'INTELLIGENCE ─── */}
      <section className="flex flex-1 flex-col min-w-0 h-full relative overflow-hidden">
        {/* ── Top Bar Minimale (Apple × Geist) ── */}
        <header className="h-10 px-4 border-b border-[var(--border-subtle)] bg-[var(--material-canvas)] flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[220px] sm:max-w-xs md:max-w-sm font-sans">
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
                    ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                }`}
                title={t('header.missionIntelligence')}
                aria-label={t('header.missionIntelligence')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
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
                          <Icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'opacity-60'} />
                          <span>{v.label}</span>
                        </div>
                        {isSelected && <Check size={12} weight="bold" className="text-[var(--accent)]" />}
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
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
              }`}
              title={t('header.focus')}
            >
              <GeistSparkle size={13} />
              <span>{t('header.focus')}</span>
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
              title={t('header.context')}
            >
              <GeistActivity size={14} className={isStreaming ? 'animate-spin text-[var(--accent)]' : 'text-[var(--text-tertiary)]'} />
              <span className="hidden sm:inline">{t('header.context')}</span>
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
              aria-live="polite"
            >
              {/* Centered Reading Column Container */}
              <div className="max-w-[780px] mx-auto w-full space-y-7 pb-36">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 pt-8 select-none animate-in fade-in duration-300">
                    {/* Apple Frosted Brand Emblem */}
                    <div className="w-13 h-13 p-3.5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)] shadow-xl mb-4 backdrop-blur-xl">
                      <PantherMissionGlyph size={26} />
                    </div>

                    <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
                      {t('composer.accomplish')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1.5 max-w-md leading-relaxed">
                      {t('composer.accomplishSubtitle')}
                    </p>

                    {/* Suggestion Starter Cards (Apple Squircles) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl mt-8 text-left">
                      {[
                        {
                          icon: Globe,
                          title: isFr ? "Recherche & Synthèse" : "Deep Research",
                          prompt: isFr ? "Effectue une recherche approfondie et documentée sur : " : "Perform deep research on: ",
                          engine: "Ñkyel Research · Tavily & Grounding",
                        },
                        {
                          icon: Cpu,
                          title: isFr ? "Architecture & Code" : "Engineering & Code",
                          prompt: isFr ? "Développe et déploie un composant Next.js moderne pour : " : "Build and deploy a modern Next.js component for: ",
                          engine: "Ñkyel Code · Vercel Labs fx",
                        },
                        {
                          icon: Table,
                          title: isFr ? "Analyse de Données" : "Data Analysis",
                          prompt: isFr ? "Analyse ces données chiffrées et dresse un tableau avec graphiques pour : " : "Analyze these data points and generate a table with charts for: ",
                          engine: "Ñkyel Data · Python Sheets",
                        },
                        {
                          icon: FileText,
                          title: isFr ? "Rapport & Document" : "Formal Document",
                          prompt: isFr ? "Rédige un document officiel et structuré sur : " : "Draft a formal structured document on: ",
                          engine: "Ñkyel Documents · PDF & Docs",
                        },
                      ].map((card, idx) => {
                        const CardIcon = card.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInputText(card.prompt);
                              textareaRef.current?.focus();
                            }}
                            className="p-3.5 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent)]/40 text-left transition-all duration-150 group shadow-xs active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] shrink-0">
                                <CardIcon size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                  {card.title}
                                </p>
                                <p className="text-[10.5px] text-[var(--text-tertiary)] truncate mt-0.5">
                                  {card.engine}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
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
                              <GeistWrench size={13} className="text-[var(--accent)]" />
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
                })
              )}
              </div>
            </div>

            {/* ── Fixed Bottom Adaptive Composer ── */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[var(--material-canvas)] via-[var(--material-canvas)]/80 to-transparent pointer-events-none flex justify-center z-20">
              <div className="max-w-[780px] w-full pointer-events-auto">
                <Surface
                  material="glass-floating"
                  className="rounded-3xl p-3 sm:p-3.5 transition-all shadow-[var(--shadow-floating)] border border-[var(--border-strong)] flex flex-col gap-2 backdrop-blur-2xl"
                >
                  {/* Hidden File Input for Real Attachments */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Attached Files Chips (if any) */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1 pt-0.5">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)] shadow-xs animate-scale-in"
                        >
                          <Paperclip size={13} className="text-[var(--accent)] shrink-0" />
                          <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">({file.size})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="ml-0.5 p-0.5 rounded-full hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                            title={isFr ? "Supprimer le fichier" : "Remove file"}
                          >
                            <X size={11} weight="bold" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

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
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-base placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] max-h-44 px-1 py-1 font-sans"
                    />
                  </div>

                  {/* Toolbar Actions Bar */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-1.5 px-1">
                    {/* Left Cluster: Plus Button + Mobile-Only Mode Selector */}
                    <div className="flex items-center gap-1.5 relative" ref={plusMenuRef}>
                      <button
                        type="button"
                        onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                        aria-expanded={plusMenuOpen}
                        className="w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-xs"
                        title={isFr ? "Actions et capacités (+)" : "Actions & capabilities (+)"}
                      >
                        <GeistPlus size={15} strokeWidth={2} />
                      </button>

                      {/* Mobile-Only Mode Selector Pill (Never rendered on Desktop where TopBar is canonical) */}
                      <button
                        type="button"
                        onClick={() => setTierPickerOpen(true)}
                        className="flex md:hidden h-8 min-h-[36px] px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border)] items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors active:scale-95 touch-manipulation shadow-xs select-none"
                        title={isFr ? "Changer de mode d'intelligence" : "Change intelligence mode"}
                        aria-label={isFr ? "Changer de mode d'intelligence" : "Change intelligence mode"}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                        <span className="font-semibold text-xs text-[var(--text-primary)] max-w-[105px] truncate">{activeModeLabel}</span>
                        <CaretDown size={11} weight="bold" className="opacity-60 shrink-0 text-[var(--text-tertiary)]" />
                      </button>

                      {/* Functional Action Launcher Popover */}
                      {plusMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-2xl text-xs space-y-0.5 z-50 animate-scale-in">
                          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
                            {isFr ? "Actions & Capacités" : "Actions & Capabilities"}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('upload')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <FileText size={16} className="text-[var(--accent)] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Téléverser un document' : 'Upload file'}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)] truncate">{isFr ? 'PDF, texte, données ou code' : 'PDF, text, data or code'}</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('research')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <Globe size={16} className="text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Recherche approfondie' : 'Deep Research'}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)] truncate">{isFr ? 'Veille et sources en direct' : 'Live web grounding & citations'}</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('connections')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <PlugsConnected size={16} className="text-amber-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Connecteurs & MCP' : 'Connectors & MCP'}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)] truncate">{isFr ? 'Google Workspace, GitHub, Slack' : 'Google Workspace, GitHub, Slack'}</p>
                            </div>
                          </button>

                          <div className="h-px bg-[var(--border-subtle)] my-1" />

                          <button
                            type="button"
                            onClick={() => handleActionSelect('image')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <Eye size={16} className="text-purple-400 shrink-0" />
                            <span className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Générer une image' : 'Generate image'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('document')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <FileText size={16} className="text-blue-400 shrink-0" />
                            <span className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Rédiger un document' : 'Write document'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('slides')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <Presentation size={16} className="text-amber-300 shrink-0" />
                            <span className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Créer des diapositives' : 'Create slides'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('spreadsheet')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <Table size={16} className="text-emerald-400 shrink-0" />
                            <span className="font-medium text-xs text-[var(--text-primary)]">{isFr ? 'Tableur & analyse de données' : 'Data & spreadsheet'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleActionSelect('artifacts')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors"
                          >
                            <Cpu size={16} className="text-cyan-400 shrink-0" />
                            <span className="font-medium text-xs text-[var(--text-primary)]">{isFr ? "Ouvrir l'inspecteur d'artefacts" : 'Open artifact inspector'}</span>
                          </button>
                        </div>
                      )}

                      {/* Mobile-Only Mode Picker Modal */}
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
                          disabled={!inputText.trim() && attachedFiles.length === 0}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            inputText.trim() || attachedFiles.length > 0
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-bold shadow-md active:scale-95'
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
        ) : activeSurface === 'workgraph' ? (
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-3 left-3 z-30">
              <button
                type="button"
                onClick={() => setActiveSurface('chat')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--active)] border border-[var(--border)] text-xs text-[var(--text-primary)] shadow-md transition-colors"
              >
                <ArrowLeft size={13} weight="bold" />
                <span>{isFr ? 'Retour à la conversation' : 'Back to Chat'}</span>
              </button>
            </div>
            <VIECanvas />
          </div>
        ) : activeSurface === 'vie' ? (
          <VIEComprehensionView
            onBackToChat={() => setActiveSurface('chat')}
            missionTitle={missionTitle}
          />
        ) : activeSurface === 'live_flow' ? (
          <LiveFlowTimelineView
            onBackToChat={() => setActiveSurface('chat')}
            missionTitle={missionTitle}
          />
        ) : (
          <SimulationScenarioView
            onAcceptAndRun={() => {
              setActiveSurface('chat');
              handleSend();
            }}
            onBackToChat={() => setActiveSurface('chat')}
            missionPrompt={inputText || missionTitle}
          />
        )}
      </section>

      {/* ─── DROITE : INSPECTEUR CONTEXTUEL (DÉDIÉ & RÉTRACTABLE) ─── */}
      <RightContextInspector isStreaming={isStreaming} />
    </div>
  );
}
