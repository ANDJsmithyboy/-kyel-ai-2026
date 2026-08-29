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
  ArrowDown,
  ArrowUp,
  Monitor,
  Terminal,
  Microphone,
} from '@phosphor-icons/react';
import { Plus as PhosphorPlus } from '@phosphor-icons/react';
import NkyelMessageItem from './NkyelMessageItem';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';
import { useNkyelModel, getIntelligenceMode, type IntelligenceModeId } from '@/hooks/useNkyelModel';
import { useLanguageStore } from '@/stores/language.store';
import { PantherMissionGlyph } from '@/components/icons';
import RightContextInspector from '@/components/inspector/RightContextInspector';
import Surface from '@/components/ui/Surface';
import PlusLauncherMenu from '@/components/chat/PlusLauncherMenu';
import TierPicker from '@/components/chat/TierPicker';
import VIECanvas from '@/components/vie/VIECanvas';
import VIEComprehensionView from '@/components/vie/VIEComprehensionView';
import LiveFlowTimelineView from '@/components/flow/LiveFlowTimelineView';
import SimulationScenarioView from '@/components/vie/SimulationScenarioView';
import ChatHero from './ChatHero';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here (would stop MediaRecorder and send to Groq API)
      return;
    }
    setIsRecording(true);
    try {
      // Placeholder for actual MediaRecorder + Backend STT logic
      setTimeout(() => {
        setIsRecording(false);
        const transcript = isFr ? 'Ceci est une transcription de test.' : 'This is a test transcript.';
        setInputText((prev) => prev + (prev ? ' ' : '') + transcript);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
          textareaRef.current.focus();
        }
      }, 1500);
    } catch (error) {
      console.error('STT Error:', error);
      setIsRecording(false);
    }
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
        // PRODUCTION NOTE: Always requires onSendMessage in production
        console.warn('AdaptiveChatWorkspace: onSendMessage not provided. Message not sent.');
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
                <div className="absolute end-0 top-full mt-1.5 w-48 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl z-50 animate-scale-in text-xs space-y-0.5">
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-start transition-colors ${
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
                  <ChatHero
                    onSelectAction={(prompt) => {
                      setInputText(prompt);
                      textareaRef.current?.focus();
                    }}
                  />
                ) : (
                  messages.map((msg, idx) => {
                    const isLast = idx === messages.length - 1;
                    // Contextual follow-up suggestions in conversation language
                    const isFrenchText = /[éèêàâôûîïç]|pourquoi|comment|qu'est|explique/i.test(msg.content);
                    const dynamicSuggestions =
                      msg.role === 'assistant' && isLast && !isStreaming
                        ? isFrenchText || isFr
                          ? ['Transformer en mission', 'Comparer avec d’autres options', 'Rédiger un résumé exécutif']
                          : ['Turn this into a mission', 'Compare with other options', 'Create an executive summary']
                        : [];

                    return (
                      <NkyelMessageItem
                        key={msg.id}
                        id={msg.id}
                        role={msg.role}
                        content={msg.content}
                        timestamp={msg.timestamp}
                        isStreaming={isLast && isStreaming && msg.role === 'assistant'}
                        toolActivity={msg.toolActivity}
                        suggestions={dynamicSuggestions}
                        onSelectSuggestion={(sugg) => {
                          setInputText(sugg);
                          textareaRef.current?.focus();
                        }}
                        onRegenerate={() => {
                          if (messages.length >= 2) {
                            const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                            if (lastUser && onSendMessage) {
                              onSendMessage(lastUser.content);
                            }
                          }
                        }}
                        onOpenVIE={() => setActiveSurface('vie')}
                      />
                    );
                  })
                )}
              </div>

              {/* Floating Jump to Latest Button */}
              {!autoScroll && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (chatContainerRef.current) {
                      chatContainerRef.current.scrollTo({
                        top: chatContainerRef.current.scrollHeight,
                        behavior: 'smooth',
                      });
                      setAutoScroll(true);
                    }
                  }}
                  className="fixed bottom-28 start-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--text-primary)] shadow-lg flex items-center gap-1.5 transition-all active:scale-95 z-30 animate-in fade-in slide-in-from-bottom-2"
                >
                  <ArrowDown size={13} weight="bold" className="text-[var(--accent)]" />
                  <span>{isFr ? 'Reprendre le défilement' : 'Jump to latest'}</span>
                </button>
              )}
            </div>

            {/* ── Fixed Bottom Adaptive Composer ── */}
            <div className="absolute bottom-0 start-0 end-0 p-3 sm:p-5 bg-gradient-to-t from-[var(--material-canvas)] via-[var(--material-canvas)]/80 to-transparent pointer-events-none flex flex-col items-center z-20">
              <div className="max-w-[780px] w-full pointer-events-auto flex flex-col gap-1.5">
                <Surface
                  material="glass-floating"
                  className="rounded-[28px] p-2.5 sm:p-3.5 transition-all shadow-[var(--shadow-composer)] border border-[var(--border)] flex flex-col gap-1.5 backdrop-blur-2xl bg-[var(--composer-bg)]"
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
                            className="ms-0.5 p-0.5 rounded-full hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
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
                      placeholder={t('composer.ask') || (isFr ? "assignez une mission ou tapez / pour plus" : "assign a mission or type / for more")}
                      rows={1}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-base placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] max-h-44 px-1 py-1 font-sans"
                    />
                  </div>

                  {/* Toolbar Actions Bar */}
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-1.5 px-1">
                    {/* Left Cluster: Plus Button + Github + Bureau */}
                    <div className="flex items-center gap-1.5 relative" ref={plusMenuRef}>
                      <button
                        type="button"
                        onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                        aria-expanded={plusMenuOpen}
                        className={`flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.97]
                          ${plusMenuOpen 
                            ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm' 
                            : 'bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--hover)] hover:border-[var(--accent-muted)]'
                          }`}
                        style={{
                          width: '42px',
                          height: '42px',
                          flexShrink: 0
                        }}
                      >
                        <PhosphorPlus 
                          weight="bold" 
                          size={isMobile ? 24 : 22} 
                          className={`transition-transform duration-200 ${plusMenuOpen ? 'rotate-45' : 'rotate-0'}`}
                        />
                      </button>

                      {plusMenuOpen && (
                        <PlusLauncherMenu 
                          isMobile={isMobile}
                          onClose={() => setPlusMenuOpen(false)}
                          onSelectAction={(actionId, payload) => {
                            console.log('Action selected:', actionId, payload);
                            setPlusMenuOpen(false);
                            // Real implementation would link to backend logic
                          }}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleActionSelect('connections')}
                        className="w-[42px] h-[42px] rounded-full bg-transparent border border-[var(--border-strong)] hover:border-[var(--accent-muted)] hover:bg-[var(--hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title="GitHub"
                      >
                        <PlugsConnected size={18} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleActionSelect('artifacts')}
                        className="w-[42px] h-[42px] rounded-full bg-transparent border border-[var(--border-strong)] hover:border-[var(--accent-muted)] hover:bg-[var(--hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={isFr ? "Bureau" : "Computer"}
                      >
                        <Monitor size={18} weight="fill" />
                      </button>


                    </div>

                    {/* Right Cluster: Commands / Mic / Send / Stop */}
                    <div className="flex items-center gap-1.5">

                      <button
                        type="button"
                        onClick={handleVoiceRecord}
                        className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors ${
                          isRecording 
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                            : 'bg-transparent hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                        }`}
                        title={isFr ? "Dictée vocale" : "Voice dictation"}
                      >
                        <Microphone size={20} weight={isRecording ? "fill" : "bold"} className={isRecording ? 'animate-pulse text-red-500' : ''} />
                      </button>

                      {isStreaming ? (
                        <button
                          type="button"
                          onClick={onStopStreaming}
                          className="w-[42px] h-[42px] rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-colors"
                          title={isFr ? "Arrêter l'exécution de la mission" : "Stop mission execution"}
                        >
                          <GeistCross size={13} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSend}
                          disabled={!inputText.trim() && attachedFiles.length === 0}
                          className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all ${
                            inputText.trim() || attachedFiles.length > 0
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-bold shadow-[0_0_12px_var(--accent-muted)] active:scale-95'
                              : 'bg-transparent text-[var(--text-tertiary)] border border-[var(--border-strong)] cursor-not-allowed opacity-60'
                          }`}
                          title={isFr ? "Envoyer la mission" : "Send mission"}
                        >
                          <ArrowUp size={20} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                </Surface>
                {/* Canonical Disclaimer (Section 29) */}
                <div className="text-center px-4 pt-1">
                  <span className="text-[11px] text-[var(--text-tertiary)] leading-tight tracking-tight">
                    {t('composer.disclaimer') || "Ñkyel AI is an AI agent and can make mistakes. Please verify important information."}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : activeSurface === 'workgraph' ? (
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute top-3 start-3 z-30">
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
