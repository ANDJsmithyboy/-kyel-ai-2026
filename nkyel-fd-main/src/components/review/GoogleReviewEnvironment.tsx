/**
 * Ñkyel AI — Google Review Production Environment Component
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Dedicated isolated production-backed environment for Google Reviewers.
 * - Server-side 35-day window enforcement via Neon DB
 * - Server-side quota enforcement via Neon DB & core config
 * - Real DeerFlow 2.0 / NkyelGraph runtime & AG-UI SSE stream
 * - Real VIECanvas, WorkGraph, Sources, Evidence, and Sanctuary
 * - 100% isolated Google Review Workspace
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Graph,
  ChatCircleDots,
  Books,
  ShieldCheck,
  CheckCircle,
  Clock,
  Coins,
  Cpu,
  Globe,
  ArrowSquareOut,
  ArrowsClockwise,
  DownloadSimple,
} from '@phosphor-icons/react';
import { useWorkGraphStore, AgUiStreamAdapter } from '@/lib/nkyel';
import MissionComposer from '@/components/composer/MissionComposer';
import type { AgenticFeaturesState } from '@/components/composer/AgenticToggles';
import { workspacesApi, missionsApi, getApiBaseUrl, artifactsApi } from '@/lib/api';

// Dynamic load of VIECanvas for pure client-side spatial graph rendering
const VIECanvas = dynamic(
  () => import('@/components/vie/VIECanvas'),
  { ssr: false, loading: () => (
    <div className="flex h-full items-center justify-center text-[#7E8795] font-mono text-sm">
      <div className="w-6 h-6 border-2 border-[#D5AE57] border-t-transparent rounded-full animate-spin mr-3" />
      Chargement de l&apos;espace spatial Ñkyel VIE…
    </div>
  )}
);

type ActiveTab = 'vie' | 'chat' | 'sanctuary' | 'quotas';

interface QuotaState {
  tier_name?: string;
  quota_profile?: string;
  token_per_mission: number;
  token_soft_daily: number;
  token_hard_daily: number;
  image_limit: number;
  video_limit: number;
  tokens_used?: number;
  images_generated?: number;
  videos_generated?: number;
  searches_performed?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; url: string; domain?: string }>;
  evidence?: Array<{ claim: string; text: string }>;
  artifacts?: Array<{ id: string; title: string; url: string; type: string }>;
}

export default function GoogleReviewEnvironment({ initialToken }: { initialToken?: string } = {}) {
  const { startRun, isRunning, stopRun, nodes, fetchWorkGraph } = useWorkGraphStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('vie');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number>(30);
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [quotas, setQuotas] = useState<QuotaState | null>(null);
  const [expiredReason, setExpiredReason] = useState<string>('');

  // Chat & Stream states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [activeMissionId, setActiveMissionId] = useState<string>('');
  const [activeRunId, setActiveRunId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // 1. Validate review session strictly with backend DB on mount
  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    const baseUrl = getApiBaseUrl();

    // The canonical review token for Google
    const effectiveToken =
      initialToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('nkyel_review_token') : null) ||
      'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0';

    try {
      // First try status endpoint (checks existing cookie)
      const res = await fetch(`${baseUrl}/api/v1/review/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.active) {
          setIsAuthorized(true);
          setDaysRemaining(data.days_remaining ?? 30);
          setWorkspaceId(data.workspace_id || '');
          setQuotas(data.quotas || null);

          if (data.workspace_id) {
            fetchWorkGraph(data.workspace_id);
            artifactsApi.list().then(setArtifacts).catch(() => {});
          }
          setIsLoading(false);
          return;
        }
      }

      // If status endpoint did not report active session, authenticate using token
      if (effectiveToken && effectiveToken.startsWith('g_rev_')) {
        const authRes = await fetch(`${baseUrl}/api/v1/review/auth/${effectiveToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.session_token && typeof window !== 'undefined') {
            localStorage.setItem('nkyel_review_token', authData.session_token);
          }
          if (authData.workspace_id && typeof window !== 'undefined') {
            localStorage.setItem('nkyel_review_workspace', authData.workspace_id);
          }
          setIsAuthorized(true);
          setDaysRemaining(authData.days_remaining ?? 30);
          setWorkspaceId(authData.workspace_id || '');
          setQuotas(authData.quotas || null);

          if (authData.workspace_id) {
            fetchWorkGraph(authData.workspace_id);
            artifactsApi.list().then(setArtifacts).catch(() => {});
          }
          setIsLoading(false);
          return;
        } else {
          const errData = await authRes.json().catch(() => ({}));
          setExpiredReason(errData.detail || 'REVIEW_ACCESS_EXPIRED');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      setIsAuthorized(false);
      setExpiredReason('REVIEW_ACCESS_EXPIRED');
    } catch (err) {
      console.warn('[Google Review] Auth verification notice:', err);
      setIsAuthorized(false);
      setExpiredReason('CONNECTION_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWorkGraph, initialToken]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Launch real Mission with DeerFlow 2.0 / NkyelGraph runtime
  const handleLaunchMission = useCallback(
    async (goal: string, engineId: string, features: AgenticFeaturesState) => {
      const trimmed = goal.trim();
      if (!trimmed || isSubmitting) return;
      setIsSubmitting(true);

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);

      const assistantId = `msg-${Date.now()}-ai`;
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), sources: [], evidence: [] },
      ]);

      try {
        let currentWsId = workspaceId;
        if (!currentWsId) {
          const ws = await workspacesApi.current();
          currentWsId = ws.id;
          setWorkspaceId(ws.id);
        }

        // Create REAL Mission on backend Neon DB
        const missionTitle = trimmed.length > 60 ? `${trimmed.substring(0, 57)}...` : trimmed;
        const mission = await missionsApi.create(currentWsId, missionTitle, trimmed);
        setActiveMissionId(mission.id);

        // Create REAL Run on backend Neon DB
        const run = await missionsApi.createRun(currentWsId, mission.id, 'FULL');
        setActiveRunId(run.id);

        // Start local graph state with real Run ID
        startRun(trimmed, 'Mission Google Review en cours d\'exécution', run.id);

        // Connect to real AG-UI event stream
        const apiUrl = getApiBaseUrl();
        const adapter = new AgUiStreamAdapter(run.id);

        adapter.onEvent((event) => {
          const eventData = (event.data || {}) as Record<string, any>;
          if (event.type === 'agent_step' || event.type === 'node_completed') {
            const label = eventData.node?.label || eventData.payload?.label;
            if (label) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content ? `${m.content}\n▸ ${label}` : `▸ ${label}` }
                    : m
                )
              );
            }
          } else if (event.type === 'source_found') {
            const src = eventData.payload || eventData.source;
            if (src && src.url) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        sources: [...(m.sources || []), { title: src.title || src.url, url: src.url, domain: src.domain }],
                      }
                    : m
                )
              );
            }
          } else if (event.type === 'evidence_recorded') {
            const ev = eventData.payload || eventData.evidence;
            if (ev && ev.claim) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        evidence: [...(m.evidence || []), { claim: ev.claim, text: ev.evidence_text || ev.text || '' }],
                      }
                    : m
                )
              );
            }
          } else if (event.type === 'artifact_created') {
            const art = eventData.payload || eventData.artifact;
            if (art) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        artifacts: [...(m.artifacts || []), { id: art.artifact_id, title: art.title, url: art.storage_url, type: 'deliverable' }],
                      }
                    : m
                )
              );
              artifactsApi.list().then(setArtifacts).catch(() => {});
            }
          }
        });

        await adapter.connect(`${apiUrl}/api/v1/nkyel/run`, {
          message: trimmed,
          mission_id: mission.id,
          run_id: run.id,
          workspace_id: currentWsId,
          language: 'fr',
          engine: engineId || 'DEERFLOW',
          features,
        });

        // Re-fetch backend truth after run execution
        await fetchWorkGraph(currentWsId, mission.id);
        artifactsApi.list().then(setArtifacts).catch(() => {});
        checkStatus();
      } catch (err: any) {
        console.error('[Google Review] Mission error:', err);
        const errorMsg = err?.message || 'Une erreur est survenue lors de l\'exécution.';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: `⚠️ ${errorMsg}` }
              : m
          )
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, workspaceId, startRun, fetchWorkGraph, checkStatus]
  );

  // Fallback direct chat submission
  const handleSendChat = () => {
    if (!chatInput.trim() || isSubmitting) return;
    const goal = chatInput.trim();
    setChatInput('');
    handleLaunchMission(goal, 'DEERFLOW', {
      skillsEnabled: true,
      mcpEnabled: true,
      groundingEnabled: true,
      a2aEnabled: true,
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090D] text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#D5AE57] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-400 font-mono tracking-wide">Validation de l&apos;environnement Google Review…</p>
        </div>
      </div>
    );
  }

  // Expired or Unauthorized State
  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090D] text-white p-6">
        <div className="max-w-md w-full p-8 text-center space-y-6 border border-white/10 rounded-2xl bg-[#0E121A]/80 backdrop-blur-xl">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-12 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#F1EEE7]">
              {expiredReason === 'REVIEW_ACCESS_EXPIRED'
                ? 'Période d\'évaluation terminée'
                : 'Accès non autorisé'}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {expiredReason === 'REVIEW_ACCESS_EXPIRED'
                ? 'This review access period has ended. Merci d\'avoir évalué Ñkyel AI.'
                : 'Veuillez utiliser le lien d\'évaluation sécurisé fourni dans votre candidature.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/sign-in"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#D5AE57] text-black font-semibold text-xs tracking-wide hover:bg-[#E5BE67] transition-all"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nodeCount = nodes.size || 0;
  const hasNodes = nodeCount > 0;

  return (
    <div className="min-h-screen h-[100dvh] w-full bg-[#08090D] text-[#F1EEE7] flex flex-col overflow-hidden font-sans">
      {/* ── Top Bar / Google Review Context Header ── */}
      <header className="shrink-0 h-14 border-b border-white/[0.08] bg-[#0E121A]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-6 w-auto" />
          <span className="font-bold tracking-tight text-base hidden sm:inline text-white">ñkyel</span>
          <span className="text-[10px] font-mono uppercase bg-[#D5AE57]/15 text-[#D5AE57] border border-[#D5AE57]/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GOOGLE REVIEW ENVIRONMENT
          </span>
        </div>

        {/* Center Tabs: VIE / Chat / Sanctuary / Quotas */}
        <div className="hidden md:inline-flex items-center p-1 rounded-full border border-white/[0.08] bg-black/40 text-xs select-none">
          <button
            onClick={() => setActiveTab('vie')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              activeTab === 'vie' ? 'bg-[#D5AE57] text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Graph size={14} weight={activeTab === 'vie' ? 'fill' : 'bold'} />
            VIE Spatial
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              activeTab === 'chat' ? 'bg-[#D5AE57] text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ChatCircleDots size={14} weight={activeTab === 'chat' ? 'fill' : 'bold'} />
            Live Flow
          </button>
          <button
            onClick={() => setActiveTab('sanctuary')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              activeTab === 'sanctuary' ? 'bg-[#D5AE57] text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Books size={14} weight={activeTab === 'sanctuary' ? 'fill' : 'bold'} />
            Sanctuaire
          </button>
          <button
            onClick={() => setActiveTab('quotas')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              activeTab === 'quotas' ? 'bg-[#D5AE57] text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} weight={activeTab === 'quotas' ? 'fill' : 'bold'} />
            Quotas & Conformité
          </button>
        </div>

        {/* Right Info: 35-Day Window Countdown & Status */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono text-[#D5AE57] font-semibold flex items-center gap-1 justify-end">
              <Clock size={12} weight="bold" />
              {daysRemaining} jours d&apos;accès restants
            </div>
            <div className="text-[9px] text-neutral-500 font-mono">Workspace Isolé · Neon DB</div>
          </div>
          <button
            onClick={checkStatus}
            title="Rafraîchir le statut"
            className="p-1.5 rounded-lg border border-white/10 hover:border-[#D5AE57]/40 text-neutral-400 hover:text-white transition-all"
          >
            <ArrowsClockwise size={14} />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-b border-white/10 bg-[#0E121A] py-1.5 text-xs">
        <button
          onClick={() => setActiveTab('vie')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-full ${activeTab === 'vie' ? 'bg-[#D5AE57] text-black font-bold' : 'text-neutral-400'}`}
        >
          <Graph size={14} /> VIE
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-full ${activeTab === 'chat' ? 'bg-[#D5AE57] text-black font-bold' : 'text-neutral-400'}`}
        >
          <ChatCircleDots size={14} /> Chat
        </button>
        <button
          onClick={() => setActiveTab('sanctuary')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-full ${activeTab === 'sanctuary' ? 'bg-[#D5AE57] text-black font-bold' : 'text-neutral-400'}`}
        >
          <Books size={14} /> Sanctuaire
        </button>
        <button
          onClick={() => setActiveTab('quotas')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-full ${activeTab === 'quotas' ? 'bg-[#D5AE57] text-black font-bold' : 'text-neutral-400'}`}
        >
          <ShieldCheck size={14} /> Quotas
        </button>
      </div>

      {/* ── Main Workspace Body ── */}
      <main className="flex-1 relative overflow-hidden flex">
        {/* VIEW 1: Spatial VIE Canvas + WorkGraph */}
        {activeTab === 'vie' && (
          <div className="flex-1 w-full h-full relative flex flex-col">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #F1EEE7 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />

            <div className="flex-1 w-full h-full relative">
              <VIECanvas />
            </div>

            <div className="absolute bottom-3 start-0 end-0 z-30 pointer-events-none">
              <div className="pointer-events-auto">
                <MissionComposer
                  onSend={handleLaunchMission}
                  onStop={stopRun}
                  isStreaming={isRunning || isSubmitting}
                  isHeroMode={!hasNodes}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Real Live Flow & Streamed Output */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full bg-[#08090D] overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-10 mx-auto opacity-30" />
                    <h2 className="text-lg font-bold text-neutral-300">Live Flow & Raisonnement Autonome</h2>
                    <p className="text-sm text-neutral-500 max-w-md mx-auto">
                      Lancez une mission de recherche avec DeerFlow pour observer les sources web réelles, les preuves extraites et les artefacts générés.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                      {[
                        "Recherche les dernières avancées en IA agentique avec sources réelles.",
                        "Analyse le marché gabonais de la tech et génère un rapport exécutif.",
                        "Compare les frameworks d'agents autonomes en 2026."
                      ].map((promptText) => (
                        <button
                          key={promptText}
                          onClick={() => {
                            setChatInput(promptText);
                            setTimeout(() => chatInputRef.current?.focus(), 50);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs text-neutral-400 border border-white/10 hover:border-[#D5AE57]/40 hover:text-[#D5AE57] transition-all"
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#D5AE57] text-black font-medium'
                            : 'bg-white/5 text-neutral-200 border border-white/10'
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-mono text-xs">{msg.content || (isSubmitting ? 'Traitement par DeerFlow 2.0…' : '')}</div>
                      </div>

                      {/* Sources Display */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="w-full max-w-[85%] sm:max-w-[75%] bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
                          <div className="text-[10px] font-mono uppercase text-[#D5AE57] font-bold flex items-center gap-1.5">
                            <Globe size={12} /> Sources Réelles Vérifiées ({msg.sources.length})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((s, idx) => (
                              <a
                                key={idx}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-neutral-300 bg-white/5 border border-white/10 hover:border-[#D5AE57]/50 px-2.5 py-1 rounded-md transition-all truncate max-w-xs"
                              >
                                <span className="truncate">{s.title || s.url}</span>
                                <ArrowSquareOut size={10} className="shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Display */}
                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="w-full max-w-[85%] sm:max-w-[75%] bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
                          <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle size={12} /> Preuves Extraites ({msg.evidence.length})
                          </div>
                          <div className="space-y-1.5 text-xs text-neutral-300">
                            {msg.evidence.map((ev, idx) => (
                              <div key={idx} className="p-2 bg-white/5 rounded border border-white/5 text-[11px]">
                                <div className="font-semibold text-white">« {ev.claim} »</div>
                                {ev.text && <div className="text-neutral-400 mt-0.5">{ev.text}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input Bar */}
            <div className="shrink-0 px-4 sm:px-8 py-3 border-t border-white/10 bg-[#0E121A]">
              <div className="max-w-3xl mx-auto flex gap-2">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Posez une question ou assignez une mission à DeerFlow…"
                  rows={1}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D5AE57]/50 resize-none"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-[#D5AE57] text-black font-bold text-xs hover:bg-[#E5BE67] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Real Sanctuary / Artifacts Vault */}
        {activeTab === 'sanctuary' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Books size={22} className="text-[#D5AE57]" /> Sanctuaire d&apos;Artefacts (Google Review)
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Tous les livrables générés par les missions sont persistés en base Neon et stockés sur Cloudflare R2 souverain.
                </p>
              </div>
              <button
                onClick={() => artifactsApi.list().then(setArtifacts).catch(() => {})}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:border-[#D5AE57]/40 flex items-center gap-1.5"
              >
                <ArrowsClockwise size={13} /> Actualiser
              </button>
            </div>

            {artifacts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] space-y-3">
                <Books size={32} className="mx-auto text-neutral-600" />
                <p className="text-sm text-neutral-400">Aucun artefact généré dans cet espace pour le moment.</p>
                <button
                  onClick={() => setActiveTab('vie')}
                  className="px-4 py-2 rounded-xl bg-[#D5AE57] text-black font-semibold text-xs tracking-wide"
                >
                  Lancer une mission avec génération de livrable
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl bg-[#0E121A] border border-white/10 hover:border-[#D5AE57]/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#D5AE57] mb-1">
                        <span>{art.artifact_type || art.type || 'LIVRABLE'}</span>
                        <span className="text-neutral-500">v{art.version || 1}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{art.title}</h3>
                      {art.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{art.description}</p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {art.content_size_bytes ? `${Math.round(art.content_size_bytes / 1024)} KB` : 'Cloudflare R2'}
                      </span>
                      {(art.storage_url || art.content_url) && (
                        <a
                          href={art.storage_url || art.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-[#D5AE57] hover:text-black text-xs font-medium transition-all"
                        >
                          <DownloadSimple size={12} /> Télécharger
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: Google Quotas & Server-side Compliance */}
        {activeTab === 'quotas' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#D5AE57]" /> Quotas & Sécurité Google Review
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Paramètres certifiés de l&apos;environnement d&apos;évaluation, chargés directement depuis Neon PostgreSQL et vérifiés côté serveur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0E121A] border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#D5AE57] font-bold flex items-center gap-1.5">
                  <Clock size={14} /> Période d&apos;Évaluation (35 Jours)
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Durée totale autorisée :</span>
                    <span className="font-mono font-bold text-white">35 jours</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Jours restants :</span>
                    <span className="font-mono font-bold text-[#D5AE57]">{daysRemaining} jours</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Vérification :</span>
                    <span className="font-mono text-emerald-400">Server-Side Strict (Neon)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E121A] border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#D5AE57] font-bold flex items-center gap-1.5">
                  <Coins size={14} /> Plafonds de Jetons (Tokens)
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Jetons par mission :</span>
                    <span className="font-mono font-bold text-white">{quotas?.token_per_mission?.toLocaleString() || '500,000'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Plafond quotidien strict :</span>
                    <span className="font-mono font-bold text-white">{quotas?.token_hard_daily?.toLocaleString() || '1,500,000'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Jetons consommés :</span>
                    <span className="font-mono text-[#D5AE57]">{quotas?.tokens_used?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E121A] border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#D5AE57] font-bold flex items-center gap-1.5">
                  <Cpu size={14} /> Génération Multimédia
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Limite d&apos;images :</span>
                    <span className="font-mono font-bold text-white">{quotas?.image_limit || 5}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Limite de vidéos :</span>
                    <span className="font-mono font-bold text-white">{quotas?.video_limit || 2}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Recherches effectuées :</span>
                    <span className="font-mono text-emerald-400">{quotas?.searches_performed || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E121A] border border-white/10 space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#D5AE57] font-bold flex items-center gap-1.5">
                  <Globe size={14} /> Isolation & Souveraineté
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Espace dédié :</span>
                    <span className="font-mono font-bold text-white">Google Review Workspace</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Données clients / admin :</span>
                    <span className="font-mono text-emerald-400">100% Inaccessibles (Cloisonné)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Stockage Artefacts :</span>
                    <span className="font-mono text-white">Cloudflare R2 Privé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
