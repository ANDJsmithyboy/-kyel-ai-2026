/**
 * Ñkyel AI · InputBar.tsx
 * Professional, auto-growing input composer.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GithubLogo, Monitor, Microphone, ArrowUp, StopCircle } from '@phosphor-icons/react';
import { useNkyelModel, type IntelligenceModeId } from '@/hooks/useNkyelModel';

interface InputBarProps {
  onSend: (message: string, model: IntelligenceModeId | null, wandana: boolean) => void;
  onStop?: () => void;
  isGenerating?: boolean;
}

export default function InputBar({ onSend, onStop, isGenerating }: InputBarProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { engineId: selectedModel } = useNkyelModel();

  const hasText = text.trim().length > 0;

  // Auto-grow logic
  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    handleInput();
  }, [text, handleInput]);

  const handleSend = useCallback(() => {
    if (!hasText || isGenerating) return;
    onSend(text, selectedModel as IntelligenceModeId, false);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [hasText, isGenerating, onSend, text, selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-sm transition-all focus-within:border-[var(--border)] focus-within:shadow-md">
      
      {/* Top: Auto-growing Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Que puis-je faire pour vous ?"
        rows={1}
        className="w-full resize-none border-none bg-transparent text-[15px] leading-relaxed outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-sans max-h-[200px] overflow-y-auto px-1"
        style={{ minHeight: '24px' }}
      />

      {/* Bottom: Action Row */}
      <div className="flex items-center justify-between mt-1">
        {/* Left Actions */}
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <button type="button" className="p-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors" title="Ajouter un fichier">
            <Plus size={18} weight="bold" />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors" title="Dépôt GitHub">
            <GithubLogo size={18} weight="fill" />
          </button>
          <button type="button" className="p-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors" title="Application de bureau">
            <Monitor size={18} weight="fill" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors" title="Dictée vocale">
            <Microphone size={18} weight="fill" />
          </button>
          
          {isGenerating ? (
            <button
              onClick={onStop}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              title="Arrêter"
            >
              <StopCircle size={20} weight="fill" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!hasText}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                hasText 
                  ? 'bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 active:scale-95 shadow-md' 
                  : 'bg-[var(--hover)] text-[var(--text-disabled)] cursor-not-allowed'
              }`}
              title="Envoyer"
            >
              <ArrowUp size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
