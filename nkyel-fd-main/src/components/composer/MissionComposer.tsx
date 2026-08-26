/**
 * Ñkyel AI · MissionComposer
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Compositeur central souverain pour la saisie et le contrôle de missions :
 * - Titre d'accueil : « Quelle mission lançons-nous aujourd’hui ? »
 * - Placeholder : « Décrivez votre objectif à Ñkyel… »
 * - Bouton `+` pour l'Action Launcher
 * - Sélecteur dynamique de moteur (« Ñkyel »)
 * - Toggles des capacités agentiques (Skills, MCP, Recherche, A2A)
 * - Dictée vocale STT
 * - Envoi, arrêt d'exécution et reprise
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  Plus,
  ArrowUp,
  Square,
  Microphone,
  Monitor,
} from '@phosphor-icons/react';
import ActionLauncher from './ActionLauncher';
import { type AgenticFeaturesState } from './AgenticToggles';
import { getNkyelEngine, useNkyelModel } from '@/hooks/useNkyelModel';
import { useAudioSTT } from '@/hooks/useAudioSTT';
import { useLanguageStore } from '@/stores/language.store';

interface MissionComposerProps {
  onSend: (message: string, engineId: string, features: AgenticFeaturesState) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  initialPrompt?: string;
  isHeroMode?: boolean;
}

export default function MissionComposer({
  onSend,
  onStop,
  isStreaming = false,
  initialPrompt = '',
  isHeroMode = false,
}: MissionComposerProps) {
  const { t } = useLanguageStore();
  const [input, setInput] = useState(initialPrompt);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const selectedEngine = useNkyelModel((state) => state.engineId);
  const [agenticState, setAgenticState] = useState<AgenticFeaturesState>({
    skillsEnabled: true,
    mcpEnabled: true,
    groundingEnabled: true,
    a2aEnabled: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launcherTriggerRef = useRef<HTMLButtonElement>(null);
  const { isRecording, startRecording, stopRecording, transcript } = useAudioSTT();

  const closeLauncher = useCallback(() => {
    setIsLauncherOpen(false);
    requestAnimationFrame(() => launcherTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (transcript) setInput((previous) => (previous ? `${previous} ${transcript}` : transcript));
  }, [transcript]);

  // Synchronise le prompt initial lorsqu'une pilule ou action est sélectionnée
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, getNkyelEngine(selectedEngine).apiModel, agenticState);
    setInput('');
  }, [input, isStreaming, selectedEngine, agenticState, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`nkyel-composer-shell relative ${isHeroMode ? 'nkyel-composer-hero' : 'nkyel-composer-thread'}`}>
      {/* Conteneur du Compositeur */}
      <div className={`nkyel-composer-card ${isHeroMode ? 'nkyel-composer-card-hero' : ''}`} data-density-aware="true">
        {/* Ligne 1 : Zone de Saisie Principale */}
        <div className="nkyel-composer-input chat-input-editor">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('composer.placeholder') || 'Décrivez votre objectif à Ñkyel…'}
            minRows={2}
            maxRows={8}
            className="nkyel-composer-textarea w-full min-h-[50px] resize-none bg-transparent text-[15px] leading-[24px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none scrollbar-none"
            aria-label={t('composer.placeholder') || 'Décrivez votre objectif à Ñkyel'}
          />
        </div>

        {/* Panneau flottant des capacités, volontairement discret en mode bureau */}
        {/* Barre d'outils inférieure */}
        <div className="nkyel-composer-toolbar">
          {/* Action Launcher, capacités et moteur */}
          <div className="flex items-center gap-1.5">
            <button
              ref={launcherTriggerRef}
              type="button"
              onClick={() => setIsLauncherOpen(true)}
                className="nkyel-composer-action flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
              title="Ouvrir les sources et actions Ñkyel"
              aria-label="Action Launcher"
            >
              <Plus size={17} weight="regular" />
            </button>
            <button
              type="button"
              onClick={() => setIsLauncherOpen(true)}
              className="nkyel-composer-mode hidden h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-transparent px-3 text-[13px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text-primary)] sm:flex"
              title="Mode de travail Ñkyel Bureau"
            >
              <Monitor size={15} />
              <span>Ñkyel Bureau</span>
            </button>
          </div>

          {/* Boutons d'Envoi, Micro & Stop */}
          <div className="nkyel-composer-send-group">
            {!isStreaming && (
              <button
                type="button"
                onClick={() => (isRecording ? stopRecording() : startRecording())}
                className={`nkyel-composer-action flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isRecording ? 'bg-[var(--error)] text-white' : 'text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'}`}
                title={isRecording ? 'Arrêter la dictée' : 'Démarrer la dictée vocale'}
                aria-label="Dictée vocale"
              >
                <Microphone size={16} weight={isRecording ? 'fill' : 'regular'} />
              </button>
            )}
            {/* Envoi ou Arrêt */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="nkyel-composer-action w-8 h-8 rounded-full bg-[var(--error)] text-white flex items-center justify-center hover:brightness-110 transition-transform active:scale-95"
                title="Arrêter l'exécution"
                aria-label="Arrêter"
              >
                <Square size={14} weight="fill" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className={`nkyel-composer-send nkyel-composer-action w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  input.trim()
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 shadow-[var(--shadow-accent)] active:scale-95'
                    : 'bg-[var(--hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                }`}
                title="Lancer la mission"
                aria-label="Envoyer"
              >
                <ArrowUp size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Launcher Modal */}
      <ActionLauncher
        isOpen={isLauncherOpen}
        onClose={closeLauncher}
        onSelectAction={(prompt) => {
          setInput(prompt);
          textareaRef.current?.focus();
        }}
      />
    </div>
  );
}
