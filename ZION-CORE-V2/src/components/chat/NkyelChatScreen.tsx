'use client';

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import Image from 'next/image';
import {
  Plus, ArrowUp, Mic, Square, X, ChevronDown, Lock, Check,
  Copy, Share2, Volume2, ThumbsUp, ThumbsDown, RotateCcw,
  Camera, FileText, Globe, Layers, Wrench, Plug,
  MoreVertical, Star, Trash2, Pencil, Eye, MessageSquare,
  BatteryCharging, Headphones
} from 'lucide-react';

import { useAudioSTT } from '@/hooks/useAudioSTT';

/* -----------------------------------------------------------------------
   TYPES & CONSTANTS
   ----------------------------------------------------------------------- */

/** User subscription tiers — ordered from lowest to highest */
const TIER_ORDER = ['aurata', 'nkyel', 'wandana', 'onyxgris', 'black-panther'] as const;
export type UserTier = (typeof TIER_ORDER)[number];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface NkyelModel {
  id: string;
  displayName: string;
  description: string;
  tier: UserTier;
  /** Accent colour CSS variable name, e.g. "var(--accent)" */
  accentVar: string;
}

const MODELS: NkyelModel[] = [
  { id: 'aurata', displayName: 'Aurata', description: 'Flash · Réponse rapide', tier: 'aurata', accentVar: 'var(--accent)' },
  { id: 'nkyel', displayName: 'Nkyel', description: 'Pro · Qualité élevée', tier: 'nkyel', accentVar: 'var(--color-info)' },
  { id: 'wandana', displayName: 'Wandana', description: 'Recherche · Deep Research', tier: 'wandana', accentVar: 'var(--color-success)' },
  { id: 'onyxgris', displayName: 'OnyxGris', description: 'Agent autonome', tier: 'onyxgris', accentVar: 'var(--accent)' },
  { id: 'black-panther', displayName: 'Black Panther', description: 'Super Agent multi-agents', tier: 'black-panther', accentVar: 'var(--color-error)' },
];

const DISCLAIMER = 'Nkyel AI peut faire des erreurs. Votre discernement reste souverain.';

const GREETING_QUESTION = 'Comment puis-je vous aider ?';

function getGreeting(name: string): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return `Bonjour, ${name}`;
  if (h >= 12 && h < 18) return `Bonne après-midi, ${name}`;
  return `Bonsoir, ${name}`;
}

function canAccess(userTier: UserTier, modelTier: UserTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(modelTier);
}

/* -----------------------------------------------------------------------
   ADD-TO-CHAT ITEMS
   ----------------------------------------------------------------------- */

interface AddToChatItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isPro?: boolean;
}

const ADD_TO_CHAT_ITEMS: AddToChatItem[] = [
  { id: 'camera', label: 'Caméra', icon: <Camera size={20} /> },
  { id: 'files', label: 'Relever un indice', icon: <FileText size={20} /> },
  { id: 'web-search', label: 'Radar Wandana', icon: <Globe size={20} /> },
  { id: 'project', label: 'Le Rendu (💎)', icon: <Layers size={20} />, isPro: true },
  { id: 'tools', label: 'Extensions de Traque', icon: <Wrench size={20} /> },
  { id: 'connectors', label: 'Coffre-Fort Souverain', icon: <Plug size={20} /> },
];

/* -----------------------------------------------------------------------
   PROPS
   ----------------------------------------------------------------------- */

export interface NkyelChatScreenProps {
  userName: string;
  userTier: UserTier;
  currentTheme?: string;
  messages: ChatMessage[];
  isGenerating?: boolean;
  onSend: (text: string, modelId: string) => void;
  onStop?: () => void;
  onUpsellRequested: (modelId: string) => void;
  onNewChat?: () => void;
  /** Conversations for sidebar */
  conversations?: { id: string; title: string; isFavorite?: boolean }[];
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onToggleEphemeral?: () => void;
  isEphemeral?: boolean;
  /** Callback items from "add to chat" sheet */
  onAddToChatAction?: (actionId: string) => void;
}

/* -----------------------------------------------------------------------
   HELPER COMPONENTS
   ----------------------------------------------------------------------- */

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-7 h-4 rounded-full relative transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--accent-20)]'}`}
  >
    <div className={`w-3 h-3 rounded-full bg-[var(--bg)] absolute top-0.5 transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5 shadow-sm'}`} />
  </button>
);

const SmartAndJTechIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9.5 2.5L5.5 6.5H9L4.5 11.5" />
    <path d="M1.5 6H3.5" />
    <path d="M1.5 9H3.5" />
    <path d="M11.5 6H13.5" />
    <path d="M11.5 9H13.5" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/* -----------------------------------------------------------------------
   COMPONENT: NkyelChatScreen
   ----------------------------------------------------------------------- */

export default function NkyelChatScreen({
  userName,
  userTier,
  messages,
  isGenerating = false,
  onSend,
  onStop,
  onUpsellRequested,
  onNewChat,
  conversations = [],
  onSelectConversation,
  onDeleteConversation,
  onToggleEphemeral,
  isEphemeral = false,
  onAddToChatAction,
}: NkyelChatScreenProps) {

  /* --- Local State --- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRecording, isTranscribing, transcript, startRecording, stopRecording, clearTranscript } = useAudioSTT();
  const [selectedModel, setSelectedModel] = useState<string>('aurata');
  const [text, setText] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showConvMenu, setShowConvMenu] = useState(false);
  
  // Antre states
  const [antreExpanded, setAntreExpanded] = useState(false);
  const [toggles, setToggles] = useState({ wandana: true, radar: true, ombre: false, coffre: true });
  const toggleSetting = (k: keyof typeof toggles) => setToggles(p => ({ ...p, [k]: !p[k] }));

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasText = text.trim().length > 0;
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (transcript) {
      setText(prev => (prev ? prev + ' ' : '') + transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  /* --- Scroll to bottom on new messages --- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* --- Close dropdown on outside click --- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* --- Keyboard shortcut --- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowAddSheet(false);
        setShowModelDropdown(false);
        setShowConvMenu(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSend = useCallback(() => {
    if (!hasText || isGenerating) return;
    onSend(text.trim(), selectedModel);
    setText('');
    textareaRef.current?.focus();
  }, [hasText, isGenerating, onSend, text, selectedModel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating && onStop) onStop();
      else handleSend();
    }
  }, [handleSend, isGenerating, onStop]);

  const handleModelSelect = useCallback((model: NkyelModel) => {
    // NOTE: Frontend gating is UX-only. The backend FastAPI MUST revalidate the tier on every real API call.
    if (!canAccess(userTier, model.tier)) {
      onUpsellRequested(model.id);
      return;
    }
    setSelectedModel(model.id);
    setShowModelDropdown(false);
  }, [userTier, onUpsellRequested]);

  const currentModel = useMemo(() => MODELS.find(m => m.id === selectedModel) ?? MODELS[0], [selectedModel]);

  /* -------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------- */

  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ---------- SIDEBAR SCRIM (mobile) ---------- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`
          fixed inset-0 z-50 flex flex-col
          md:relative md:inset-auto md:z-auto md:w-72
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 p-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors md:hidden"
            style={{ background: 'var(--accent-06)' }}
            aria-label="Fermer la sidebar"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <Image src="/nkyel-logo.png" alt="Nkyel AI" width={24} height={24} className="rounded-md hidden md:block" />
          <span
            className="font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--text-primary)' }}
          >
            Nkyel AI
          </span>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3">
          <button
            onClick={() => { onNewChat?.(); setSidebarOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            style={{ background: 'var(--accent)', color: 'var(--bg)', fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="text-sm">Nouvelle Piste</span>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-3 space-y-5 pb-4 scrollbar-hidden">
          
          {/* FAVORIS */}
          <div>
            <p className="text-[11px] uppercase tracking-wider px-2 pb-1" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
              FAVORIS
            </p>
            {conversations.filter(c => c.isFavorite).length === 0 && (
              <p className="text-xs px-2 py-2" style={{ color: 'var(--text-tertiary)' }}>
                Aucun favori
              </p>
            )}
            {conversations.filter(c => c.isFavorite).map(c => (
              <button
                key={c.id}
                onClick={() => { onSelectConversation?.(c.id); setSidebarOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-colors hover:bg-[var(--accent-06)]"
                style={{ color: 'var(--text-primary)' }}
              >
                ★ {c.title}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* EN PISTE (Conversations) */}
          <div>
            <p className="text-[11px] uppercase tracking-wider px-2 pb-1" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
              EN PISTE
            </p>
            {conversations.filter(c => !c.isFavorite).length === 0 && (
              <p className="text-xs px-2 py-2" style={{ color: 'var(--text-tertiary)' }}>
                Aucune piste en cours
              </p>
            )}
            {conversations.filter(c => !c.isFavorite).map(c => (
              <button
                key={c.id}
                onClick={() => { onSelectConversation?.(c.id); setSidebarOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-colors hover:bg-[var(--accent-06)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* ÉNERGIE QUOTIDIENNE */}
          <div className="px-2">
            <div className="flex items-center gap-2 mb-2">
              <BatteryCharging size={14} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Énergie Quotidienne</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: '35%', background: 'var(--accent)' }} />
            </div>
            <button className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm" style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
              ALIMENTER LA MEUTE
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* L'ANTRE */}
          <div className="px-2 space-y-1">
            <div className="w-full flex items-center justify-between mb-2">
              <button
                onClick={() => setAntreExpanded(!antreExpanded)}
                className="flex flex-1 items-center justify-between hover:bg-[var(--accent-06)] rounded px-1 py-1 transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>⚙️ L'Antre [Paramètres]</span>
                <ChevronDown size={14} style={{ transform: antreExpanded ? 'rotate(180deg)' : 'none', color: 'var(--text-tertiary)' }} className="transition-transform mr-1" />
              </button>
              <button className="p-1 rounded hover:bg-[var(--accent-06)] transition-colors" title="Mentions légales & Confidentialité">
                <MoreVertical size={14} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
            
            {antreExpanded && (
              <div className="space-y-3 pl-2 border-l border-[var(--border)] ml-2 pb-2">
                
                {/* Vecteur de Force */}
                <div>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Vecteur de Force</p>
                  <button onClick={() => setShowModelDropdown(true)} className="text-[11px] px-2 py-1 rounded bg-[var(--accent-06)] border border-[var(--border)] transition-colors hover:bg-[var(--accent-10)]" style={{ color: currentModel.accentVar }}>
                    {currentModel.displayName}
                  </button>
                </div>

                {/* Extensions de Traque */}
                <div>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Extensions de Traque</p>
                  <div className="space-y-2 pl-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Invoquer Wandana</span>
                      <Switch checked={toggles.wandana} onChange={() => toggleSetting('wandana')} />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Radar Wandana</span>
                      <Switch checked={toggles.radar} onChange={() => toggleSetting('radar')} />
                    </label>
                  </div>
                </div>

                {/* Souveraineté */}
                <div>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Souveraineté</p>
                  <div className="space-y-2 pl-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Mode Ombre</span>
                      <Switch checked={toggles.ombre} onChange={() => toggleSetting('ombre')} />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Coffre-Fort</span>
                      <Switch checked={toggles.coffre} onChange={() => toggleSetting('coffre')} />
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Pacte Politique</span>
                      <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: 'var(--color-success)', color: 'white', fontWeight: 'bold' }}>CONF</span>
                    </div>
                  </div>
                </div>

                {/* Administration */}
                <div>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Administration</p>
                  <div className="space-y-1 pl-2">
                    <button className="w-full text-left text-[11px] transition-colors hover:text-[var(--text-primary)]" style={{ color: 'var(--text-tertiary)' }}>Profil Cadre</button>
                    <button className="w-full text-left text-[11px] transition-colors hover:text-[var(--text-primary)]" style={{ color: 'var(--text-tertiary)' }}>Pacte de Chasse</button>
                  </div>
                </div>
                
              </div>
            )}
            
            <div className="px-2 pt-3 text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
              NODE: LIBREVILLE-S-01
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* REJOINDRE LA MEUTE */}
          <div className="px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Rejoindre la Meute</p>
            <div className="grid grid-cols-2 gap-2">
              {['Telegram', 'WhatsApp', 'X / Twitter', 'LinkedIn'].map(social => (
                <button key={social} className="flex items-center justify-center py-2 rounded-lg text-[11px] font-medium transition-colors hover:bg-[var(--accent-06)]" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-center text-[10px] tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
            Nkyel AI peut faire des erreurs. Votre discernement reste souverain.
          </p>
        </div>
      </aside>

      {/* ---------- MAIN CHAT AREA ---------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* --- TOP BAR --- */}
        <header
          className="shrink-0 flex items-center justify-between px-4 h-14 glass"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center gap-3">
            {/* Menu trigger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors md:hidden"
              style={{ background: 'var(--accent-06)' }}
              aria-label="Ouvrir le menu"
            >
              <Image src="/nkyel-logo.png" alt="Nkyel AI" width={22} height={22} className="rounded-md" />
            </button>
          </div>

          {/* Center: intentionally EMPTY during conversation */}
          <div className="flex-1 flex justify-center md:hidden">
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Ephemeral toggle */}
            <button
              onClick={onToggleEphemeral}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: isEphemeral ? 'var(--accent-20)' : 'transparent',
                color: isEphemeral ? 'var(--accent)' : 'var(--text-secondary)',
              }}
              title={isEphemeral ? 'Chat éphémère activé' : 'Chat éphémère désactivé'}
            >
              <MessageSquare size={16} />
            </button>

            {/* Conversation menu ⋮ */}
            <div className="relative">
              <button
                onClick={() => setShowConvMenu(!showConvMenu)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--accent-06)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <MoreVertical size={16} />
              </button>
              {showConvMenu && (
                <div
                  className="absolute right-0 top-10 w-48 rounded-xl py-1 z-50 glass"
                  style={{ border: '1px solid var(--glass-border)' }}
                >
                  {[
                    { icon: <Share2 size={14} />, label: 'Partager' },
                    { icon: <Pencil size={14} />, label: 'Renommer' },
                    { icon: <Star size={14} />, label: 'Ajouter aux favoris' },
                    { icon: <Eye size={14} />, label: 'Le Rendu (💎)' },
                    { icon: <Trash2 size={14} />, label: 'Supprimer', danger: true },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => setShowConvMenu(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-[var(--accent-06)]"
                      style={{ color: (item as { danger?: boolean }).danger ? 'var(--color-error)' : 'var(--text-primary)' }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- MESSAGES / EMPTY STATE --- */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {isEmpty ? (
            /* --- EMPTY STATE --- */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <Image
                src="/nkyel-logo.png"
                alt="Nkyel AI"
                width={108}
                height={108}
                className="mb-8"
                priority
              />
              <h1
                className="text-3xl font-semibold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                {getGreeting(userName)}
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                {GREETING_QUESTION}
              </p>
            </div>
          ) : (
            /* --- MESSAGES LIST --- */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? '' : ''}`}
                    style={{
                      background: msg.role === 'user' ? 'var(--surface)' : 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: `1px solid var(--border)`,
                    }}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
                      {msg.content}
                    </p>

                    {/* --- AI message actions --- */}
                    {msg.role === 'assistant' && !msg.isStreaming && (
                      <div className="flex items-center gap-1 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        {[
                          { icon: <Copy size={14} />, label: 'Copier' },
                          { icon: <Share2 size={14} />, label: 'Partager' },
                          { icon: <Volume2 size={14} />, label: 'Lire' },
                          { icon: <ThumbsUp size={14} />, label: "J'aime" },
                          { icon: <ThumbsDown size={14} />, label: "Je n'aime pas" },
                          { icon: <RotateCcw size={14} />, label: 'Relancer la Chasse' },
                        ].map(action => (
                          <button
                            key={action.label}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--accent-06)]"
                            style={{ color: 'var(--text-tertiary)' }}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming indicator */}
              {isGenerating && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)', animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)', animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* --- COMPOSER --- */}
        <div className="shrink-0 w-full max-w-3xl mx-auto px-4 pb-5 pt-1">
          <div
            className="relative flex flex-col rounded-2xl transition-all duration-200 glass"
            style={{ border: '1px solid var(--glass-border)' }}
          >
            {/* Textarea */}
            <div className="flex w-full px-4 pt-3 pb-1">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Directive…"
                rows={1}
                className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none border-none scrollbar-hidden"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-2">
                {/* + Button */}
                <button
                  onClick={() => setShowAddSheet(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--accent-06)]"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  title="Ajouter au chat"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>

                {/* Model Selector (Vecteur de Force) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="h-8 px-3 flex items-center gap-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: 'var(--accent-06)',
                      color: currentModel.accentVar,
                      border: `1.5px solid var(--accent-20)`,
                    }}
                  >
                    {currentModel.displayName}
                    <ChevronDown size={12} />
                  </button>

                  {/* Model Dropdown */}
                  {showModelDropdown && (
                    <div
                      className="absolute bottom-10 left-0 w-64 rounded-2xl py-2 z-50 glass"
                      style={{ border: '1px solid var(--glass-border)' }}
                    >
                      <p className="px-4 py-2 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
                        Vecteur de Force
                      </p>
                      {MODELS.map(model => {
                        const locked = !canAccess(userTier, model.tier);
                        const isSelected = model.id === selectedModel;
                        return (
                          <button
                            key={model.id}
                            onClick={() => handleModelSelect(model)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${locked ? 'opacity-60' : 'hover:bg-[var(--accent-06)]'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: isSelected ? model.accentVar : 'var(--text-primary)' }}
                                >
                                  {model.displayName}
                                </span>
                                {locked && <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />}
                              </div>
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                                {model.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check size={16} style={{ color: model.accentVar }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Mic + (Send / Live / Stop) */}
              <div className="flex items-center gap-1">
                {/* Bouton de dictée vocale (Mic) - Toujours là sauf en génération */}
                {!isGenerating && (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--accent-06)]"
                    style={{ 
                      color: isRecording ? 'var(--color-error)' : 'var(--text-secondary)',
                      background: isRecording ? 'var(--accent-10)' : 'transparent' 
                    }}
                    title={isRecording ? "Arrêter la dictée" : "Dictée vocale"}
                  >
                    {isTranscribing ? (
                      <div className="w-3 h-3 rounded-full animate-pulse bg-current" />
                    ) : (
                      <Mic size={16} className={isRecording ? "animate-pulse" : ""} />
                    )}
                  </button>
                )}

                {isGenerating ? (
                  <button
                    onClick={onStop}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--accent-10)', color: 'var(--text-primary)' }}
                    title="Arrêter"
                  >
                    <Square size={14} />
                  </button>
                ) : hasText ? (
                  <button
                    onClick={handleSend}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--accent-foreground)',
                    }}
                    title="Envoyer"
                  >
                    <ArrowUp size={16} strokeWidth={2.5} />
                  </button>
                ) : (
                  /* Live mode button (Headphones) */
                  <button
                    className="h-8 px-3 flex items-center gap-1.5 rounded-full transition-all relative overflow-hidden group ml-1"
                    style={{
                      background: 'var(--accent-06)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    title="Mode Live"
                  >
                    <Headphones size={14} className="relative z-10" />
                    <span className="text-[12px] font-semibold tracking-wide relative z-10 hidden sm:inline">Live</span>
                    <span
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ animation: 'pulse-luxe 2.4s ease-out infinite' }}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer always below composer */}
          <p className="text-center text-[10px] mt-3 pb-2 tracking-wide uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>
            {DISCLAIMER}
          </p>
        </div>
      </main>

      {/* ---------- ADD-TO-CHAT SHEET ---------- */}
      {showAddSheet && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowAddSheet(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-6 py-6 glass"
            style={{ border: '1px solid var(--glass-border)', maxHeight: '50vh' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--text-tertiary)' }} />
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Ajouter au chat
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ADD_TO_CHAT_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onAddToChatAction?.(item.id); setShowAddSheet(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors hover:bg-[var(--accent-06)]"
                  style={{ background: 'var(--accent-06)', color: 'var(--text-primary)' }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                  <span className="text-[11px] font-medium text-center">{item.label}</span>
                  {item.isPro && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-10)', color: 'var(--accent)' }}>
                      PRO
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
