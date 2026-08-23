/**
 * Ñkyel AI · ResponseActions
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Fluid action bar under each assistant reply:
 * — Copy, TTS, Feedback, Regenerate, Continue, Sources count, Memory
 * — Open in VIE, Open Artifact, More actions
 * — Zero layout shift, smooth opacity transitions
 */

'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowClockwise,
  Play,
  SpeakerHigh,
  ShareNetwork,
  BookmarkSimple,
  Graph,
  ArrowsOutSimple,
  DotsThree,
  FolderSimplePlus,
  TreeStructure,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import { protocolEventBus } from '@/lib/protocols/protocol-events';

interface ResponseActionsProps {
  content: string;
  messageId?: string;
  sourcesCount?: number;
  hasArtifact?: boolean;
  isCode?: boolean;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onOpenSources?: () => void;
}

export default function ResponseActions({
  content,
  messageId = 'msg_active',
  sourcesCount = 0,
  hasArtifact = false,
  isCode = false,
  onRegenerate,
  onContinue,
  onOpenSources,
}: ResponseActionsProps) {
  const router = useRouter();
  const { open } = useRenduPanel();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSavedMemory, setIsSavedMemory] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 1. Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    protocolEventBus.emit('agui.state.updated', 'agui', `Réponse copiée (${messageId})`, { messageId });
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. TTS
  const handleTTS = () => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content.slice(0, 600));
        utterance.lang = 'fr-FR';
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // 3. Feedback
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    protocolEventBus.emit('agui.state.updated', 'agui', `Feedback : ${type === 'up' ? 'Utile' : 'Pas utile'}`, { messageId, feedback: type });
  };

  // 4. Memory
  const handleSaveMemory = () => {
    setIsSavedMemory(!isSavedMemory);
    protocolEventBus.emit('agui.state.updated', 'agui', `Enregistrement dans la Mémoire Ñkyel`, { messageId });
  };

  return (
    <div
      className="relative flex items-center justify-between select-none opacity-85 hover:opacity-100 transition-opacity"
      style={{
        minHeight: 32,
        marginTop: 'var(--space-2)',
        paddingTop: 'var(--space-2)',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 'var(--text-xs)',
        color: 'var(--fg-muted)',
      }}
    >
      {/* Left group: Main Actions */}
      <div className="flex items-center flex-wrap gap-1">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg"
          style={{
            paddingInline: 'var(--space-2)',
            paddingBlock: '4px',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-subtle)';
            e.currentTarget.style.color = 'var(--fg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--fg-muted)';
          }}
          title="Copier la réponse"
        >
          {copied ? <Check size={14} style={{ color: 'var(--hue-success)' }} weight="bold" /> : <Copy size={14} />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>

        {/* Thumbs Up */}
        <button
          type="button"
          onClick={() => handleFeedback('up')}
          className="p-1 rounded-lg"
          style={{
            color: feedback === 'up' ? 'var(--hue-success)' : 'var(--fg-subtle)',
            background: feedback === 'up' ? 'var(--accent-subtle)' : 'transparent',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            if (feedback !== 'up') e.currentTarget.style.color = 'var(--fg)';
          }}
          onMouseLeave={(e) => {
            if (feedback !== 'up') e.currentTarget.style.color = 'var(--fg-subtle)';
          }}
          title="Utile"
        >
          <ThumbsUp size={14} weight={feedback === 'up' ? 'fill' : 'regular'} />
        </button>

        {/* Thumbs Down */}
        <button
          type="button"
          onClick={() => handleFeedback('down')}
          className="p-1 rounded-lg"
          style={{
            color: feedback === 'down' ? 'var(--hue-danger)' : 'var(--fg-subtle)',
            background: feedback === 'down' ? 'var(--accent-subtle)' : 'transparent',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            if (feedback !== 'down') e.currentTarget.style.color = 'var(--fg)';
          }}
          onMouseLeave={(e) => {
            if (feedback !== 'down') e.currentTarget.style.color = 'var(--fg-subtle)';
          }}
          title="Pas utile"
        >
          <ThumbsDown size={14} weight={feedback === 'down' ? 'fill' : 'regular'} />
        </button>

        {/* Audio TTS */}
        <button
          type="button"
          onClick={handleTTS}
          className="p-1 rounded-lg"
          style={{
            color: isPlayingAudio ? 'var(--accent)' : 'var(--fg-subtle)',
            transition: `all var(--transition-fast)`,
          }}
          title={isPlayingAudio ? 'Arrêter la lecture' : 'Lire à voix haute'}
        >
          <SpeakerHigh size={14} weight={isPlayingAudio ? 'fill' : 'regular'} className={isPlayingAudio ? 'animate-pulse' : ''} />
        </button>

        {/* Regenerate */}
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 rounded-lg"
            style={{
              paddingInline: 'var(--space-2)',
              paddingBlock: '4px',
              transition: `all var(--transition-fast)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-subtle)';
              e.currentTarget.style.color = 'var(--fg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--fg-muted)';
            }}
            title="Régénérer la réponse"
          >
            <ArrowClockwise size={14} />
            <span>Régénérer</span>
          </button>
        )}

        {/* Continue */}
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-1 rounded-lg"
            style={{
              paddingInline: 'var(--space-2)',
              paddingBlock: '4px',
              color: 'var(--hue-success)',
              transition: `all var(--transition-fast)`,
            }}
            title="Poursuivre la mission"
          >
            <Play size={13} weight="fill" />
            <span>Continuer</span>
          </button>
        )}

        {/* Verified Sources Badge */}
        {sourcesCount > 0 && (
          <button
            type="button"
            onClick={onOpenSources}
            className="flex items-center gap-1 rounded-full font-mono"
            style={{
              paddingInline: 'var(--space-2)',
              paddingBlock: '2px',
              background: 'var(--accent-subtle)',
              color: 'var(--hue-success)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              transition: `all var(--transition-fast)`,
            }}
            title="Inspecter les sources primaires"
          >
            <span>{sourcesCount} sources</span>
          </button>
        )}

        {/* Sovereign Memory */}
        <button
          type="button"
          onClick={handleSaveMemory}
          className="flex items-center gap-1 rounded-lg"
          style={{
            paddingInline: 'var(--space-2)',
            paddingBlock: '4px',
            color: isSavedMemory ? 'var(--accent)' : 'var(--fg-subtle)',
            transition: `all var(--transition-fast)`,
          }}
          title="Conserver dans la Mémoire Ñkyel"
        >
          <BookmarkSimple size={14} weight={isSavedMemory ? 'fill' : 'regular'} />
          <span>Mémoire</span>
        </button>
      </div>

      {/* Right group: VIE & Artifact Actions */}
      <div className="flex items-center gap-1.5">
        {/* Open in VIE */}
        <button
          type="button"
          onClick={() => router.push('/workspace')}
          className="flex items-center gap-1 rounded-lg font-medium"
          style={{
            paddingInline: 'var(--space-2)',
            paddingBlock: '4px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent)',
            fontSize: '11px',
            transition: `all var(--transition-fast)`,
          }}
          title="Ouvrir dans l'espace visuel Ñkyel VIE"
        >
          <TreeStructure size={13} />
          <span>Ouvrir dans VIE</span>
        </button>

        {/* Open Artifact */}
        {hasArtifact && (
          <button
            type="button"
            onClick={() => open()}
            className="flex items-center gap-1 rounded-lg font-medium"
            style={{
              paddingInline: '10px',
              paddingBlock: '4px',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              fontSize: '11px',
              transition: `all var(--transition-fast)`,
            }}
            title="Consulter le livrable dans Artifact Studio"
          >
            <ArrowsOutSimple size={13} />
            <span>Ouvrir l'artefact</span>
          </button>
        )}

        {/* More Actions Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1 rounded-lg"
            style={{ color: 'var(--fg-subtle)', transition: `all var(--transition-fast)` }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-subtle)'; }}
            title="Plus d'actions"
          >
            <DotsThree size={16} weight="bold" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 'var(--z-sticky)' }}
                onClick={() => setShowMoreMenu(false)}
              />
              <div
                className="absolute right-0 bottom-full mb-1.5 rounded-xl shadow-xl"
                style={{
                  width: 210,
                  padding: 'var(--space-1)',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-default)',
                  zIndex: 'var(--z-dropdown)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    router.push('/spaces');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg text-left"
                  style={{
                    padding: '6px 10px',
                    color: 'var(--fg-muted)',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-subtle)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--fg-muted)';
                  }}
                >
                  <FolderSimplePlus size={15} />
                  <span>Ajouter à un Espace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.push('/workspace?tab=workgraph');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg text-left"
                  style={{
                    padding: '6px 10px',
                    color: 'var(--fg-muted)',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-subtle)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--fg-muted)';
                  }}
                >
                  <Graph size={15} />
                  <span>Inspecter dans WorkGraph</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'Ñkyel AI Mission', text: content.slice(0, 200) });
                    }
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg text-left"
                  style={{
                    padding: '6px 10px',
                    color: 'var(--fg-muted)',
                    transition: `all var(--transition-fast)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-subtle)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--fg-muted)';
                  }}
                >
                  <ShareNetwork size={15} />
                  <span>Partager la mission</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
