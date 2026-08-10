/* GabomaGPT · MessageInput.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Zone de saisie du chat avec token gating
   Migré depuis MessageInput.svelte */
'use client';

import { useState, useRef, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { useModeStore, MODEL_MAP } from '@/stores/mode';
import { useGabomaStore } from '@/stores/gabomagpt';
import ModeSelector from './ModeSelector';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSubmit, disabled }: MessageInputProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeMode = useModeStore((s) => s.activeMode);
  const consumeTokens = useGabomaStore((s) => s.consumeTokens);

  /* Token gating — vérifie les jetons avant envoi */
  const guardedSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const cost = MODEL_MAP[activeMode].tokenCost;
      const ok = consumeTokens(cost);
      if (!ok) {
        toast.error('Jetons insuffisants', {
          description: `Le mode ${MODEL_MAP[activeMode].label} coûte ${cost} jeton(s). Rechargez votre compte.`,
        });
        return;
      }

      onSubmit(trimmed);
      setPrompt('');
      textareaRef.current?.focus();
    },
    [activeMode, consumeTokens, onSubmit]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      guardedSubmit(prompt);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div
        id="chat-input-container"
        className="relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--zc-input)] shadow-[var(--shadow-md)] transition-colors"
      >
        {/* Zone de texte */}
        <TextareaAutosize
          ref={textareaRef}
          className="w-full resize-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] px-4 pt-3 pb-2 text-[15px] leading-relaxed outline-none font-[var(--font-body)]"
          placeholder="Écrivez votre message..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          minRows={1}
          maxRows={8}
          dir="auto"
        />

        {/* Barre du bas : mode selector + envoi */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <ModeSelector />

          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] disabled:opacity-30 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            disabled={disabled || !prompt.trim()}
            onClick={() => guardedSubmit(prompt)}
            aria-label="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
