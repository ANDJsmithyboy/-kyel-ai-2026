/**
 * Ñkyel AI · MissionComposer
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Sovereign central composer for mission input and control:
 * — Placeholder: « Décrivez votre objectif à Ñkyel… »
 * — Action Launcher '+' trigger
 * — Dynamic engine selector (« Ñkyel Auto »)
 * — Agentic capability toggles (Skills, MCP, Recherche, A2A)
 * — Audio STT dictation
 * — Send, Stop, Stream states with tactile micro-interactions
 * — Mobile keyboard & safe-area aware
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  Plus,
  ArrowUp,
  Square,
  Microphone,
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

  // Synchronize initial prompt when selected from quick actions
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  // Synchronize STT voice transcript
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
    <div
      className="w-full mx-auto"
      style={{
        maxWidth: 'var(--composer-max)',
        paddingInline: 'var(--space-4)',
        paddingBlock: isHeroMode ? 'var(--space-4)' : 'var(--space-3)',
      }}
    >
      {/* Composer Surface */}
      <div
        className="relative transition-all"
        style={{
          borderRadius: 'var(--radius-composer)',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(32px)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Row 1: Text Input Area */}
        <div style={{ paddingInline: 'var(--space-4)', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-2)' }}>
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre objectif à Ñkyel…"
            minRows={isHeroMode ? 2 : 1}
            maxRows={8}
            className="w-full bg-transparent resize-none scrollbar-none"
            style={{
              color: 'var(--fg)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              outline: 'none',
            }}
            aria-label="Décrivez votre objectif à Ñkyel"
          />
        </div>

        {/* Row 2: Agentic Toggles */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingInline: 'var(--space-3)',
            paddingBlock: 'var(--space-1)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <AgenticToggles state={agenticState} onChange={setAgenticState} />
        </div>

        {/* Row 3: Bottom Toolbar */}
        <div
          className="flex items-center justify-between gap-2"
          style={{
            paddingInline: 'var(--space-3)',
            paddingBlock: 'var(--space-2)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--accent-subtle)',
            borderBottomLeftRadius: 'var(--radius-composer)',
            borderBottomRightRadius: 'var(--radius-composer)',
          }}
        >
          {/* Action Launcher '+' button & Engine Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLauncherOpen(true)}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 32,
                height: 32,
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-muted)',
                transition: `all var(--transition-fast)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fg)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fg-muted)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
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

          {/* Voice STT & Send/Stop Buttons */}
          <div className="flex items-center gap-2">
            {/* Audio Dictation */}
            <button
              type="button"
              onClick={toggleRecording}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 32,
                height: 32,
                background: isRecording ? 'var(--hue-danger)' : 'transparent',
                color: isRecording ? '#FFFFFF' : 'var(--fg-subtle)',
                transition: `all var(--transition-fast)`,
              }}
              onMouseEnter={(e) => {
                if (!isRecording) {
                  e.currentTarget.style.color = 'var(--fg)';
                  e.currentTarget.style.background = 'var(--accent-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRecording) {
                  e.currentTarget.style.color = 'var(--fg-subtle)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              title={isRecording ? 'Arrêter la dictée' : 'Démarrer la dictée vocale'}
              aria-label="Dictée vocale"
            >
              <Microphone size={16} weight={isRecording ? 'fill' : 'regular'} />
            </button>

            {/* Send or Stop */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center rounded-full active:scale-95"
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--hue-danger)',
                  color: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  transition: `all var(--transition-fast)`,
                }}
                title="Arrêter l'exécution"
                aria-label="Arrêter"
              >
                <Square size={13} weight="fill" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex items-center justify-center rounded-full active:scale-95"
                style={{
                  width: 32,
                  height: 32,
                  background: input.trim() ? 'var(--accent)' : 'var(--border-subtle)',
                  color: input.trim() ? 'var(--accent-fg)' : 'var(--fg-subtle)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: input.trim() ? 'var(--shadow-sm)' : 'none',
                  transition: `all var(--transition-fast)`,
                }}
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
