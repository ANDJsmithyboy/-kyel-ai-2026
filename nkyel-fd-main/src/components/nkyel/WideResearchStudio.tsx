/**
 * Ñkyel AI — Studio Wide Research (Recherche Large & Navigation Web)
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 *
 * Interface de recherche approfondie à la manière de Manus :
 * - Définition de plan de recherche et requêtes multi-angles
 * - Écoute des événements réels Tavily & navigation web via SSE
 * - Inspection en temps réel de la page consultée (URL, domaine, extractions)
 * - Détection de contradictions et validation de sources
 * - Contrôles d'intervention humaine (Pause, Reprendre, Arrêter, Preuve)
 * - Assemblage automatique du livrable / rapport vérifié
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Globe,
  Browser,
  Compass,
  CheckCircle,
  WarningCircle,
  Pause,
  Play,
  Stop,
  Sparkle,
  ArrowSquareOut,
  FileText,
  Clock,
  ShieldCheck,
  Cpu,
  DownloadSimple,
  ShareNetwork,
  GitBranch,
} from '@phosphor-icons/react';
import { useRenduPanel } from '@/hooks/useRenduPanel';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
  score?: number;
  verified?: boolean;
}

interface ResearchEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, any>;
}

export default function WideResearchStudio() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'fast' | 'deep' | 'exhaustive'>('deep');
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // État temps réel issu du backend
  const [queries, setQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [currentPage, setCurrentPage] = useState<{ url: string; title: string; step: number } | null>(null);
  const [extractedSnippets, setExtractedSnippets] = useState<{ url: string; text: string }[]>([]);
  const [contradictions, setContradictions] = useState<any[]>([]);
  const [eventLogs, setEventLogs] = useState<ResearchEvent[]>([]);
  const [reportResult, setReportResult] = useState<{ title: string; url?: string; content?: string } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const { addArtifact, openRendu } = useRenduPanel();

  const handleStartResearch = async () => {
    if (!topic.trim()) return;
    setIsSearching(true);
    setIsPaused(false);
    setQueries([]);
    setSources([]);
    setCurrentPage(null);
    setExtractedSnippets([]);
    setContradictions([]);
    setEventLogs([]);
    setReportResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/v1/wide-research/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          depth,
          max_sources: depth === 'exhaustive' ? 12 : 6,
        }),
      });

      if (!resp.ok) throw new Error('Erreur de démarrage Wide Research');
      const data = await resp.json();
      setJobId(data.job_id);

      // Ouvrir le flux SSE
      listenToEvents(data.job_id);
    } catch (err) {
      console.error(err);
      setIsSearching(false);
    }
  };

  const listenToEvents = (jId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API_BASE}/api/v1/wide-research/stream/${jId}`);
    eventSourceRef.current = es;

    es.addEventListener('search.query_created', (e: any) => {
      const data = JSON.parse(e.data);
      setQueries((prev) => [...prev, data.payload.query]);
      logEvent('search.query_created', data.payload);
    });

    es.addEventListener('source.discovered', (e: any) => {
      const data = JSON.parse(e.data);
      setSources((prev) => [...prev, data.payload]);
      logEvent('source.discovered', data.payload);
    });

    es.addEventListener('browser.navigated', (e: any) => {
      const data = JSON.parse(e.data);
      setCurrentPage({
        url: data.payload.url,
        title: data.payload.title,
        step: data.payload.step,
      });
      logEvent('browser.navigated', data.payload);
    });

    es.addEventListener('browser.extracted', (e: any) => {
      const data = JSON.parse(e.data);
      setExtractedSnippets((prev) => [{ url: data.payload.url, text: data.payload.snippet }, ...prev]);
      logEvent('browser.extracted', data.payload);
    });

    es.addEventListener('contradiction.detected', (e: any) => {
      const data = JSON.parse(e.data);
      setContradictions((prev) => [...prev, data.payload]);
      logEvent('contradiction.detected', data.payload);
    });

    es.addEventListener('artifact.created', (e: any) => {
      const data = JSON.parse(e.data);
      setReportResult(data.payload);
      addArtifact({
        id: data.payload.id || `art_${Date.now()}`,
        title: data.payload.title,
        type: 'report',
        url: data.payload.url,
        content: data.payload.content,
        created_at: Date.now(),
      });
    });

    es.addEventListener('complete', () => {
      setIsSearching(false);
      es.close();
    });

    es.onerror = () => {
      setIsSearching(false);
      es.close();
    };
  };

  const logEvent = (type: string, payload: any) => {
    setEventLogs((prev) => [
      {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type,
        timestamp: new Date().toLocaleTimeString(),
        payload,
      },
      ...prev,
    ]);
  };

  const handleControlAction = async (action: 'pause' | 'resume' | 'stop') => {
    if (!jobId) return;
    try {
      await fetch(`${API_BASE}/api/v1/wide-research/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, action }),
      });
      if (action === 'pause') setIsPaused(true);
      if (action === 'resume') setIsPaused(false);
      if (action === 'stop') {
        setIsSearching(false);
        if (eventSourceRef.current) eventSourceRef.current.close();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#08090D] text-[#F1EEE7] p-6 overflow-y-auto">
      {/* ── HEADER DE COMMANDE WIDE RESEARCH ── */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#315A70]/20 border border-[#315A70]/40 flex items-center justify-center text-[#7695AF]">
            <Compass size={22} weight="bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              Ñkyel Wide Research
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#315A70]/30 text-[#7695AF] font-mono font-semibold">
                MOTEUR TAVILY × AIO SANDBOX
              </span>
            </h1>
            <p className="text-xs text-[#7E8795]">
              Recherche souveraine multi-sources, navigation Web active et détection de contradictions.
            </p>
          </div>
        </div>

        {/* Input Bar & Controls */}
        <div className="mt-4 p-3 bg-[#0E121A] border border-white/[0.08] rounded-2xl shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <MagnifyingGlass size={20} className="text-[#7E8795] ms-2 shrink-0" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Analyse comparative des modèles d'accélération numérique en Afrique Centrale..."
              className="w-full bg-transparent border-none outline-none text-sm text-[#F1EEE7] placeholder-[#7E8795]"
              onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleStartResearch()}
            />
            <button
              onClick={handleStartResearch}
              disabled={isSearching || !topic.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isSearching
                  ? 'bg-white/[0.06] text-[#7E8795] cursor-not-allowed'
                  : 'bg-[#315A70] hover:bg-[#315A70]/80 text-white shadow-lg'
              }`}
            >
              <Sparkle size={15} />
              {isSearching ? 'Recherche en cours...' : 'Lancer l’exploration'}
            </button>
          </div>

          {/* Depth selection & control buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#7E8795] text-[11px]">Profondeur :</span>
              {(['fast', 'deep', 'exhaustive'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    depth === d
                      ? 'bg-[#315A70]/40 text-[#F1EEE7] border border-[#315A70]'
                      : 'text-[#7E8795] hover:text-white bg-white/[0.02]'
                  }`}
                >
                  {d === 'fast' ? '⚡ Rapide' : d === 'deep' ? '🔍 Approfondie' : '🏛️ Exhaustive'}
                </button>
              ))}
            </div>

            {isSearching && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleControlAction(isPaused ? 'resume' : 'pause')}
                  className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] flex items-center gap-1.5"
                >
                  {isPaused ? <Play size={13} className="text-[#6F9485]" /> : <Pause size={13} className="text-[var(--accent)]" />}
                  {isPaused ? 'Reprendre' : 'Pause'}
                </button>
                <button
                  onClick={() => handleControlAction('stop')}
                  className="px-3 py-1 rounded-lg bg-[#BE6254]/20 hover:bg-[#BE6254]/30 text-[#BE6254] text-[11px] flex items-center gap-1.5"
                >
                  <Stop size={13} />
                  Arrêter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── WORKSPACE PRINCIPAL (3 COLONNES RESPONSIVES) ── */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* COLONNE 1 : Plan & Requêtes générées */}
        <div className="bg-[#0E121A] border border-white/[0.06] rounded-2xl p-4 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-semibold text-[#B8C0CC] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={15} className="text-[var(--accent)]" />
            1. Plan & Requêtes Tavily
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1 text-xs">
            {queries.length === 0 ? (
              <p className="text-[#7E8795] italic text-[11px]">En attente de lancement de mission...</p>
            ) : (
              queries.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-[#F1EEE7] font-mono text-[11px] leading-relaxed">{q}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLONNE 2 : Navigateur Web Actif & Extractions */}
        <div className="bg-[#0E121A] border border-white/[0.06] rounded-2xl p-4 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-semibold text-[#B8C0CC] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Browser size={15} className="text-[#315A70]" />
            2. Navigation & Extractions
          </h3>

          {currentPage ? (
            <div className="mb-3 p-2.5 rounded-xl bg-[#315A70]/15 border border-[#315A70]/30 text-xs">
              <span className="text-[10px] text-[#7695AF] uppercase block font-semibold">Page consultée</span>
              <p className="font-semibold text-[#F1EEE7] truncate">{currentPage.title}</p>
              <a
                href={currentPage.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#315A70] hover:underline flex items-center gap-1 mt-1 truncate"
              >
                {currentPage.url} <ArrowSquareOut size={10} />
              </a>
            </div>
          ) : (
            <div className="mb-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#7E8795]">
              Aucune page active en cours de lecture
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            <span className="text-[10px] text-[#7E8795] uppercase block font-semibold mb-1">Extraits collectés</span>
            {extractedSnippets.length === 0 ? (
              <p className="text-[#7E8795] italic text-[11px]">En attente d’extractions...</p>
            ) : (
              extractedSnippets.map((snip, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#B8C0CC]">
                  "{snip.text}"
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLONNE 3 : Sources Vérifiées, Contradictions & Rapport */}
        <div className="bg-[#0E121A] border border-white/[0.06] rounded-2xl p-4 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-semibold text-[#B8C0CC] uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#6F9485]" />
            3. Sources & Livrable
          </h3>

          {/* Contradiction Alert */}
          {contradictions.length > 0 && (
            <div className="mb-3 p-2.5 rounded-xl bg-[#BE6254]/15 border border-[#BE6254]/30 text-xs">
              <div className="flex items-center gap-1.5 text-[#BE6254] font-semibold text-[11px] mb-1">
                <WarningCircle size={14} /> Contradiction Détectée & Résolue
              </div>
              <p className="text-[11px] text-[#F1EEE7]">{contradictions[0].resolution}</p>
            </div>
          )}

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs">
            <span className="text-[10px] text-[#7E8795] uppercase block font-semibold mb-1">
              Sources analysées ({sources.length})
            </span>
            {sources.map((s, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span className="truncate text-[11px] text-[#F1EEE7] pe-2">{s.title}</span>
                <CheckCircle size={14} className="text-[#6F9485] shrink-0" />
              </div>
            ))}
          </div>

          {/* Final Report Deliverable */}
          {reportResult && (
            <div className="p-3 rounded-xl bg-[#6F9485]/15 border border-[#6F9485]/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6F9485]">Rapport Final Prêt</span>
                <button
                  onClick={() => openRendu({ id: reportResult.title, title: reportResult.title, type: 'report', content: reportResult.content, created_at: Date.now() })}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#6F9485] text-white font-medium hover:bg-[#6F9485]/80 transition-all"
                >
                  Ouvrir Studio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
