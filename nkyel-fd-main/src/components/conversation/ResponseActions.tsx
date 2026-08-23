/**
 * Ñkyel AI · ResponseActions
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Barre d'actions fluide sous chaque réponse d'agent :
 * - Copier, Utile, Pas utile, Régénérer, Continuer, Lire (TTS), Partager, Sources,
 *   Mémoire, Ajouter à un Espace, Inspecter dans WorkGraph, Ouvrir dans VIE, Ouvrir l’artefact.
 * - Actions de code : Copier, Exécuter en Sandbox, Créer un fichier, Télécharger, Déployer.
 * - Zéro layout shift, transition d'opacité naturelle.
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
  Code,
  FolderSimplePlus,
  PlayCircle,
  FileArrowDown,
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

  // 1. Copie
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

  // 4. Mémoire
  const handleSaveMemory = () => {
    setIsSavedMemory(!isSavedMemory);
    protocolEventBus.emit('agui.state.updated', 'agui', `Enregistrement dans la Mémoire Ñkyel`, { messageId });
  };

  return (
    <div className="relative min-h-[32px] mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[#7E8795] text-[12px] select-none opacity-85 hover:opacity-100 transition-opacity">
      {/* Groupe de gauche : Actions Principales */}
      <div className="flex items-center flex-wrap gap-1">
        {/* Copier */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06] hover:text-[#F1EEE7] transition-colors"
          title="Copier la réponse"
        >
          {copied ? <Check size={14} className="text-[#6F9485]" weight="bold" /> : <Copy size={14} />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>

        {/* Feedback Utile / Pas Utile */}
        <button
          type="button"
          onClick={() => handleFeedback('up')}
          className={`p-1 rounded-lg hover:bg-white/[0.06] transition-colors ${
            feedback === 'up' ? 'text-[#6F9485] bg-[#6F9485]/10' : 'hover:text-[#F1EEE7]'
          }`}
          title="Utile"
        >
          <ThumbsUp size={14} weight={feedback === 'up' ? 'fill' : 'regular'} />
        </button>

        <button
          type="button"
          onClick={() => handleFeedback('down')}
          className={`p-1 rounded-lg hover:bg-white/[0.06] transition-colors ${
            feedback === 'down' ? 'text-[#BE6254] bg-[#BE6254]/10' : 'hover:text-[#F1EEE7]'
          }`}
          title="Pas utile"
        >
          <ThumbsDown size={14} weight={feedback === 'down' ? 'fill' : 'regular'} />
        </button>

        {/* TTS Voix */}
        <button
          type="button"
          onClick={handleTTS}
          className={`p-1 rounded-lg hover:bg-white/[0.06] transition-colors ${
            isPlayingAudio ? 'text-[#C39A52] animate-pulse' : 'hover:text-[#F1EEE7]'
          }`}
          title={isPlayingAudio ? 'Arrêter la lecture' : 'Lire à voix haute'}
        >
          <SpeakerHigh size={14} weight={isPlayingAudio ? 'fill' : 'regular'} />
        </button>

        {/* Régénérer */}
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06] hover:text-[#F1EEE7] transition-colors"
            title="Régénérer la réponse"
          >
            <ArrowClockwise size={14} />
            <span>Régénérer</span>
          </button>
        )}

        {/* Continuer */}
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06] hover:text-[#F1EEE7] transition-colors text-[#6F9485]"
            title="Poursuivre la mission"
          >
            <Play size={13} weight="fill" />
            <span>Continuer</span>
          </button>
        )}

        {/* Sources Vérifiées */}
        {sourcesCount > 0 && (
          <button
            type="button"
            onClick={onOpenSources}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#315A70]/20 text-[#6F9485] border border-[#6F9485]/30 hover:brightness-110 transition-all text-[11px] font-mono"
            title="Inspecter les sources primaires"
          >
            <span>{sourcesCount} sources</span>
          </button>
        )}

        {/* Mémoire Souveraine */}
        <button
          type="button"
          onClick={handleSaveMemory}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-colors ${
            isSavedMemory ? 'text-[#C39A52]' : 'hover:text-[#F1EEE7]'
          }`}
          title="Conserver dans la Mémoire Ñkyel"
        >
          <BookmarkSimple size={14} weight={isSavedMemory ? 'fill' : 'regular'} />
          <span>Mémoire</span>
        </button>
      </div>

      {/* Groupe de droite : Inspections & Artefacts */}
      <div className="flex items-center gap-1">
        {/* Ouvrir dans VIE */}
        <button
          type="button"
          onClick={() => router.push('/workspace')}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#665F9E]/15 border border-[#665F9E]/30 text-[#AAA2C8] hover:bg-[#665F9E]/30 transition-colors text-[11px] font-medium"
          title="Ouvrir dans l'espace visuel Ñkyel VIE"
        >
          <TreeStructure size={13} />
          <span>Ouvrir dans VIE</span>
        </button>

        {/* Ouvrir l'Artefact */}
        {hasArtifact && (
          <button
            type="button"
            onClick={() => open()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C39A52]/20 border border-[#C39A52]/40 text-[#C39A52] hover:bg-[#C39A52]/30 transition-colors text-[11px] font-medium"
            title="Consulter le livrable dans Artifact Studio"
          >
            <ArrowsOutSimple size={13} />
            <span>Ouvrir l'artefact</span>
          </button>
        )}

        {/* Menu Plus */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1 rounded-lg hover:bg-white/[0.06] hover:text-[#F1EEE7] transition-colors"
            title="Plus d'actions"
          >
            <DotsThree size={16} weight="bold" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-xl bg-[#151922] border border-white/[0.1] shadow-2xl p-1 z-40 text-[12px] space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    router.push('/spaces');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] text-left"
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
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] text-left"
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
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] text-left"
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
