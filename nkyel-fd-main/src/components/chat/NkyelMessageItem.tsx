/**
 * Ñkyel AI — Canonical Message Item (Google-Grade Clarity × Apple Luxury)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * User: Compact end-aligned elevated bubble.
 * Assistant: Natural centered reading column, full Markdown, citations,
 *            artifact deliverable card, follow-up suggestions, action bar.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  SpeakerHigh,
  ArrowClockwise,
  ShareNetwork,
  Graph,
  ArrowsOutSimple,
  DownloadSimple,
  FileCode,
  FilePdf,
  FileText,
  VideoCamera,
  Image as ImageIcon,
  Sparkle,
  PencilSimple,
} from '@phosphor-icons/react';
import NkyelMarkdownRenderer from './NkyelMarkdownRenderer';
import MissionStatusCard from './MissionStatusCard';
import type { NkyelVisualEvent } from '@/lib/visualEvents';
import { useLanguageStore } from '@/stores/language.store';

export interface ArtifactPreview {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'image' | 'video' | 'sheet' | 'doc';
  status: 'QUEUED' | 'GENERATING' | 'READY' | 'FAILED';
  url?: string;
  size?: string;
}

export interface NkyelMessageItemProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  toolActivity?: { name: string; status: 'running' | 'completed' | 'failed'; duration?: string };
  sources?: { id: string; title: string; domain: string; url?: string }[];
  artifact?: ArtifactPreview;
  suggestions?: string[];
  onRegenerate?: () => void;
  onSelectSuggestion?: (suggestion: string) => void;
  onOpenVIE?: () => void;
  onOpenArtifact?: (artifact: ArtifactPreview) => void;
  missionState?: {
    status: 'idle' | 'analyzing' | 'planning' | 'researching' | 'executing' | 'completed' | 'failed';
    events?: NkyelVisualEvent[];
    deliverables?: ArtifactPreview[];
    progress?: number;
  };
}

export default function NkyelMessageItem({
  id,
  role,
  content,
  timestamp,
  isStreaming = false,
  toolActivity,
  sources = [],
  artifact,
  suggestions = [],
  onRegenerate,
  onSelectSuggestion,
  onOpenVIE,
  onOpenArtifact,
  missionState,
}: NkyelMessageItemProps) {
  const isUser = role === 'user';
  const { uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 1. Copy Handler (Clean text)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [content]);

  // 2. TTS Handler
  const handleTTS = useCallback(() => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content.slice(0, 1000));
        utterance.lang = isFr ? 'fr-FR' : 'en-US';
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [content, isFr, isPlayingAudio]);

  // 3. Native / Web Share Handler
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Ñkyel Intelligence',
          text: content.slice(0, 300) + '...',
          url: window.location.href,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [content, handleCopy]);

  // ── USER MESSAGE ────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex flex-col items-end w-full group animate-in fade-in duration-150">
        <div className="relative max-w-[88%] sm:max-w-[78%] md:max-w-[72%] p-3.5 sm:p-4 rounded-[22px] rounded-br-[6px] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[15px] sm:text-[15.5px] leading-relaxed text-[var(--text-primary)] shadow-xs font-sans">
          <p className="whitespace-pre-wrap break-words">{content}</p>

          {/* Discreet hover copy button */}
          <div className="absolute -start-9 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-xs"
              title={isFr ? 'Copier le message' : 'Copy message'}
              aria-label="Copy message"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ASSISTANT / ÑKYEL RESPONSE ─────────────────────────────────
  return (
    <div className="flex flex-col items-start w-full group animate-in fade-in duration-150 space-y-3.5">
      {/* Assistant Identity Eyebrow */}
      <div className="flex items-center gap-2 px-0.5">
        <div className="w-5 h-5 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-bold text-[10px] shadow-xs">
          Ñ
        </div>
        <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight font-sans">
          Ñkyel
        </span>
        {timestamp && (
          <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
            · {timestamp}
          </span>
        )}
      </div>

      {/* Tool Activity Badge (if applicable) */}
      {toolActivity && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[11.5px] text-[var(--text-secondary)]">
          <Sparkle size={13} className="text-[var(--accent)] animate-pulse" />
          <span>{toolActivity.name}</span>
          {toolActivity.duration && (
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
              ({toolActivity.duration})
            </span>
          )}
        </div>
      )}

      {/* Main Markdown Prose Content (Reading Column) */}
      <div className="w-full">
        <NkyelMarkdownRenderer content={content} />
      </div>

      {/* Real Backend First: Mission Status / Timeline (Screen C) */}
      {missionState && (
        <MissionStatusCard 
          status={missionState.status}
          events={missionState.events}
          deliverables={missionState.deliverables}
          progress={missionState.progress}
        />
      )}

      {/* Streaming Active Pulse Indicator */}
      {isStreaming && (
        <div className="flex items-center gap-1.5 pt-1 text-[var(--accent)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
          <span className="text-xs font-mono text-[var(--text-tertiary)]">
            {isFr ? 'Génération souveraine…' : 'Generating…'}
          </span>
        </div>
      )}

      {/* Deliverable Artifact Card (when present) */}
      {artifact && (
        <div className="w-full max-w-md my-3 p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-md flex items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] shrink-0">
              {artifact.type === 'pdf' ? (
                <FilePdf size={20} />
              ) : artifact.type === 'video' ? (
                <VideoCamera size={20} />
              ) : artifact.type === 'image' ? (
                <ImageIcon size={20} />
              ) : artifact.type === 'code' ? (
                <FileCode size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                {artifact.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-[var(--text-tertiary)] font-mono">
                <span className="uppercase">{artifact.type}</span>
                {artifact.size && <span>· {artifact.size}</span>}
                <span className="text-emerald-400 font-semibold uppercase">{artifact.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenArtifact?.(artifact)}
              className="h-8 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-semibold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <ArrowsOutSimple size={13} weight="bold" />
              <span>{isFr ? 'Ouvrir' : 'Open'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Response Action Bar (Only shown on completed responses) */}
      {!isStreaming && (
        <div className="flex items-center flex-wrap gap-1 pt-2 text-[var(--text-tertiary)] text-[12px] select-none border-t border-[var(--border-subtle)] w-full">
          {/* Copy Response */}
          <button
            type="button"
            onClick={handleCopy}
            className={`min-h-[36px] sm:min-h-[32px] px-2.5 rounded-lg flex items-center gap-1.5 transition-colors active:scale-95 touch-manipulation ${
              copied
                ? 'text-emerald-400 bg-emerald-400/10 font-semibold'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
            title={isFr ? 'Copier la réponse' : 'Copy response'}
            aria-label="Copy response"
          >
            {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
            <span>{copied ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
          </button>

          {/* Useful Feedback 👍 */}
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`min-h-[36px] sm:min-h-[32px] w-9 rounded-lg flex items-center justify-center transition-colors active:scale-95 touch-manipulation ${
              feedback === 'up'
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
            title={isFr ? 'Réponse utile' : 'Helpful response'}
            aria-label="Mark useful"
          >
            <ThumbsUp size={14} weight={feedback === 'up' ? 'fill' : 'regular'} />
          </button>

          {/* Not Useful Feedback 👎 */}
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`min-h-[36px] sm:min-h-[32px] w-9 rounded-lg flex items-center justify-center transition-colors active:scale-95 touch-manipulation ${
              feedback === 'down'
                ? 'text-rose-400 bg-rose-400/10'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
            title={isFr ? 'Pas utile' : 'Not helpful'}
            aria-label="Mark not useful"
          >
            <ThumbsDown size={14} weight={feedback === 'down' ? 'fill' : 'regular'} />
          </button>

          {/* Read Aloud (TTS) */}
          <button
            type="button"
            onClick={handleTTS}
            className={`min-h-[36px] sm:min-h-[32px] px-2.5 rounded-lg flex items-center gap-1.5 transition-colors active:scale-95 touch-manipulation ${
              isPlayingAudio
                ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-semibold'
                : 'hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
            title={isFr ? 'Écouter la réponse' : 'Read aloud'}
            aria-label="Read aloud"
          >
            <SpeakerHigh size={14} weight={isPlayingAudio ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">{isPlayingAudio ? (isFr ? 'Lecture…' : 'Playing…') : (isFr ? 'Écouter' : 'Listen')}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[36px] sm:min-h-[32px] px-2.5 rounded-lg flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors active:scale-95 touch-manipulation"
            title={isFr ? 'Partager la réponse' : 'Share response'}
            aria-label="Share response"
          >
            <ShareNetwork size={14} />
            <span className="hidden sm:inline">{isFr ? 'Partager' : 'Share'}</span>
          </button>

          {/* Regenerate / Retry ↻ */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="min-h-[36px] sm:min-h-[32px] px-2.5 rounded-lg flex items-center gap-1.5 hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors active:scale-95 touch-manipulation ms-auto"
              title={isFr ? 'Régénérer la réponse' : 'Regenerate response'}
              aria-label="Regenerate response"
            >
              <ArrowClockwise size={14} />
              <span>{isFr ? 'Régénérer' : 'Retry'}</span>
            </button>
          )}
        </div>
      )}

      {/* Contextual Follow-Up Suggestions (in conversation language) */}
      {!isStreaming && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 w-full">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion?.(suggestion)}
              className="px-3.5 py-1.5 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent)]/40 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-[0.98] shadow-2xs touch-manipulation"
            >
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
