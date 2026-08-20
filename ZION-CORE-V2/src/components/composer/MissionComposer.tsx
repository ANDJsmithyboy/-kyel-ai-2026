/**
 * Ñkyel AI · MissionComposer
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Compositeur central souverain pour la saisie et le contrôle de missions :
 * - Titre d'accueil : « Quelle mission lançons-nous aujourd’hui ? »
 * - Placeholder : « Décrivez votre objectif à Ñkyel… »
 * - Bouton `+` pour l'Action Launcher
 * - Sélecteur dynamique de moteur (« Ñkyel Auto »)
 * - Toggles des capacités agentiques (Skills, MCP, Recherche, A2A)
 * - Dictée vocale STT
 * - Envoi, arrêt d'exécution et reprise
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowUp,
  Square,
  Microphone,
  Paperclip,
  Sparkle,
} from '@phosphor-icons/react';
import ActionLauncher from './ActionLauncher';
import ModelSelector from './ModelSelector';
import AgenticToggles, { type AgenticFeaturesState } from './AgenticToggles';
import { useAudioSTT } from '@/hooks/useAudioSTT';

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
  const [input, setInput] = useState(initialPrompt);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState('nkyel-auto');
  const [agenticState, setAgenticState] = useState<AgenticFeaturesState>({
    skillsEnabled: true,
    mcpEnabled: true,
    groundingEnabled: true,
    a2aEnabled: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, startRecording, stopRecording, transcript } = useAudioSTT();

  // Synchronise le prompt initial lorsqu'une pilule ou action est sélectionnée
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  // Synchronise le résultat STT
  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, selectedEngine, agenticState);
    setInput('');
  }, [input, isStreaming, selectedEngine, agenticState, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${isHeroMode ? 'py-4' : 'py-3'}`}>
      {/* Conteneur du Compositeur */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0E121A]/90 backdrop-blur-xl shadow-2xl transition-all focus-within:border-[#665F9E]/50 focus-within:shadow-[0_0_24px_rgba(102,95,158,0.12)]">
        {/* Ligne 1 : Zone de Saisie Principale */}
        <div className="px-4 pt-3.5 pb-2">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre objectif à Ñkyel…"
            minRows={isHeroMode ? 2 : 1}
            maxRows={8}
            className="w-full bg-transparent text-[#F1EEE7] placeholder-[#7E8795] text-[14px] leading-relaxed resize-none focus:outline-none scrollbar-none"
            aria-label="Décrivez votre objectif à Ñkyel"
          />
        </div>

        {/* Ligne 2 : Toggles Agentiques & Raccourcis */}
        <div className="px-3 py-1 flex items-center justify-between border-t border-white/[0.04]">
          <AgenticToggles state={agenticState} onChange={setAgenticState} />
        </div>

        {/* Ligne 3 : Barre d'Outils Inférieure */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] bg-[#08090D]/40 rounded-b-2xl">
          {/* Bouton `+` pour l'Action Launcher & Sélecteur de Moteur */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLauncherOpen(true)}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[#B8C0CC] hover:text-[#F1EEE7] transition-colors"
              title="Ouvrir l'Action Launcher (Studio, Build, Data, Protocoles)"
              aria-label="Action Launcher"
            >
              <Plus size={16} weight="bold" />
            </button>

            <ModelSelector
              selectedEngineId={selectedEngine}
              onSelectEngine={setSelectedEngine}
            />
          </div>

          {/* Boutons d'Envoi, Micro & Stop */}
          <div className="flex items-center gap-2">
            {/* Dictée Vocale STT */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isRecording
                  ? 'bg-[#BE6254] text-white animate-pulse'
                  : 'text-[#7E8795] hover:text-[#F1EEE7] hover:bg-white/[0.06]'
              }`}
              title={isRecording ? 'Arrêter la dictée' : 'Démarrer la dictée vocale'}
              aria-label="Dictée vocale"
            >
              <Microphone size={16} weight={isRecording ? 'fill' : 'regular'} />
            </button>

            {/* Envoi ou Arrêt */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-[#BE6254] text-white flex items-center justify-center hover:brightness-110 transition-transform active:scale-95"
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
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  input.trim()
                    ? 'bg-[#665F9E] text-[#F1EEE7] hover:brightness-110 shadow-sm active:scale-95'
                    : 'bg-white/[0.04] text-[#7E8795] cursor-not-allowed'
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
        onClose={() => setIsLauncherOpen(false)}
        onSelectAction={(prompt) => {
          setInput(prompt);
          textareaRef.current?.focus();
        }}
      />
    </div>
  );
}
