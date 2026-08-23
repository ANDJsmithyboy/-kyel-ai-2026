/**
 * Ñkyel AI · Response Action Bar (Apple MX)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Lightweight, accessible action bar that smoothly appears under assistant responses.
 * Emits real canonical protocol events.
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
  ListDashes,
  Code,
  FileArrowDown,
} from '@phosphor-icons/react';
import { protocolEventBus } from '@/lib/protocols/protocol-events';
import { useRouter } from 'next/navigation';
import { useRenduPanel } from '@/hooks/useRenduPanel';

interface ResponseActionBarProps {
  content: string;
  messageId?: string;
  sourcesCount?: number;
  hasArtifact?: boolean;
  onRegenerate?: () => void;
  onOpenSources?: () => void;
}

export default function ResponseActionBar({
  content,
  messageId = 'msg_active',
  sourcesCount = 0,
  hasArtifact = false,
  onRegenerate,
  onOpenSources,
}: ResponseActionBarProps) {
  const router = useRouter();
  const { open } = useRenduPanel();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSavedMemory, setIsSavedMemory] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // 1. Copy Action
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    protocolEventBus.emit('agui.state.updated', 'agui', `Réponse copiée dans le presse-papier (${messageId})`, { messageId });
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. TTS Action (Text-to-Speech)
  const handleTTS = () => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content.slice(0, 800));
        utterance.lang = 'fr-FR';
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
        protocolEventBus.emit('provider.operation.started', 'provider', 'Lecture vocale Gemini TTS / Synthèse locale', { messageId });
      }
    }
  };

  // 3. Feedback Action
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    protocolEventBus.emit('agui.state.updated', 'agui', `Feedback soumis : ${type === 'up' ? 'Utile' : 'Pas utile'}`, { messageId, feedback: type });
  };

  // 4. Save to Sovereign Memory
  const handleSaveMemory = () => {
    setIsSavedMemory(!isSavedMemory);
    protocolEventBus.emit('agui.state.updated', 'agui', `Enregistrement dans la Mémoire Souveraine Ñkyel`, { messageId, title: content.slice(0, 50) });
  };

  return (
    <div className="flex items-center flex-wrap gap-1 mt-3 pt-2 border-t border-white/[0.04] text-[#7E8795] text-[12px] select-none opacity-80 hover:opacity-100 transition-opacity">
      {/* Copier */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
          copied ? 'text-[#6F9485] bg-[#6F9485]/15 font-semibold' : 'hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Copier la réponse"
      >
        {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
        <span>{copied ? 'Copié' : 'Copier'}</span>
      </button>

      {/* Utile */}
      <button
        onClick={() => handleFeedback('up')}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          feedback === 'up' ? 'text-[#6F9485] bg-[#6F9485]/15' : 'hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Réponse utile"
      >
        <ThumbsUp size={13} weight={feedback === 'up' ? 'fill' : 'regular'} />
      </button>

      {/* Pas Utile */}
      <button
        onClick={() => handleFeedback('down')}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          feedback === 'down' ? 'text-[#BE6254] bg-[#BE6254]/15' : 'hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Pas utile"
      >
        <ThumbsDown size={13} weight={feedback === 'down' ? 'fill' : 'regular'} />
      </button>

      {/* Lire à voix haute */}
      <button
        onClick={handleTTS}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
          isPlayingAudio ? 'text-[#C39A52] bg-[#C39A52]/15 font-semibold' : 'hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Lire à voix haute (Gemini TTS)"
      >
        <SpeakerHigh size={13} weight={isPlayingAudio ? 'fill' : 'regular'} />
        <span>{isPlayingAudio ? 'Lecture…' : 'Écouter'}</span>
      </button>

      {/* Régénérer */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Régénérer"
        >
          <ArrowClockwise size={13} />
          <span>Régénérer</span>
        </button>
      )}

      {/* Mémoire Souveraine */}
      <button
        onClick={handleSaveMemory}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          isSavedMemory ? 'text-[#C39A52] bg-[#C39A52]/15' : 'hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Enregistrer dans la Mémoire Ñkyel"
      >
        <BookmarkSimple size={13} weight={isSavedMemory ? 'fill' : 'regular'} />
      </button>

      {/* Inspecter dans WorkGraph / VIE */}
      <button
        onClick={() => router.push('/workspace')}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#665F9E] hover:text-[#AAA2C8] hover:bg-[#665F9E]/10 transition-colors font-medium"
        title="Inspecter dans le Canvas VIE"
      >
        <Graph size={13} weight="bold" />
        <span>Inspecter dans VIE</span>
      </button>

      {/* Ouvrir dans Artifact Studio */}
      {hasArtifact && (
        <button
          onClick={() => open()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#C39A52] hover:text-[#D5AE57] hover:bg-[#C39A52]/10 transition-colors font-medium"
          title="Ouvrir dans Artifact Studio"
        >
          <ArrowsOutSimple size={13} weight="bold" />
          <span>Ouvrir Studio 💎</span>
        </button>
      )}

      {/* Sources */}
      {sourcesCount > 0 && (
        <button
          onClick={onOpenSources}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#315A70] hover:text-[#8AB4F8] hover:bg-[#315A70]/10 transition-colors"
        >
          <ListDashes size={13} />
          <span>{sourcesCount} sources</span>
        </button>
      )}
    </div>
  );
}
