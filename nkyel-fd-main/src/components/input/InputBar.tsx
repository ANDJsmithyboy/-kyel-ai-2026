/**
 * Nkyel AI · InputBar
 * SmartANDJ AI Technologies
 * Responsive Floating Composer: + Menu, Web, Desktop, Mic, Send
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  Stop,
  Microphone,
  Plus,
  Desktop,
  Globe,
} from '@phosphor-icons/react';
import type { NkyelModel } from '@/lib/models';
import AttachmentMenu from './AttachmentMenu';

interface InputBarProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  model: NkyelModel;
  onModelChange: (m: NkyelModel) => void;
  initialPrompt?: string;
}

export default function InputBar({
  onSend,
  onStop,
  isStreaming,
  model,
  onModelChange,
  initialPrompt = '',
}: InputBarProps) {
  const [value, setValue] = useState(initialPrompt);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [desktopConnected, setDesktopConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setValue(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
      }
    }
  }, [initialPrompt]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  const handleSelectOption = (option: string) => {
    setValue((prev) => (prev ? `${prev}\n[${option}] ` : `[${option}] `));
    if (textareaRef.current) textareaRef.current.focus();
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La reconnaissance vocale n’est pas supportée sur ce navigateur.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
      recognition.stop();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-6 pt-1 relative z-30">
      {/* Outer Composer Container */}
      <div
        className="relative rounded-2xl sm:rounded-3xl bg-[#10141F] border border-white/[0.08] hover:border-white/[0.15] shadow-2xl transition-all flex flex-col p-2.5 sm:p-3.5 focus-within:border-[var(--accent)]/40 focus-within:shadow-[var(--shadow-accent)]"
        style={{
          boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Attachment Menu (Bottom sheet on mobile, cascaded on desktop) */}
        <AttachmentMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelectOption={handleSelectOption}
        />

        {/* Top: Auto-expanding Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
          placeholder="Posez une question ou décrivez votre mission à Ñkyel…"
          className="w-full bg-transparent outline-none resize-none text-[14px] sm:text-[15px] text-[#F5F6FA] placeholder-[#9199A8] leading-relaxed max-h-36 sm:max-h-44 px-1 py-0.5"
          style={{
            fontFamily: 'var(--font-body, "Sora", sans-serif)',
          }}
        />

        {/* Bottom Bar: Action buttons */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
          {/* Left Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Plus button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                isMenuOpen
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'text-[#9199A8] hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Ajouter des fichiers ou capacités"
            >
              <Plus size={16} weight="bold" />
            </button>

            {/* Web Search toggle */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl text-xs font-medium transition-colors ${
                webSearchEnabled
                  ? 'bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/30 font-semibold'
                  : 'text-[#9199A8] hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Recherche Web"
            >
              <Globe size={14} />
              <span className="text-[11px] sm:text-xs">Web</span>
            </button>

            {/* Ñkyel Desktop badge */}
            <button
              type="button"
              onClick={() => setDesktopConnected(!desktopConnected)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl text-xs font-medium transition-colors ${
                desktopConnected
                  ? 'bg-[#6757E8]/20 text-[#6757E8] border border-[#6757E8]/30 font-semibold'
                  : 'text-[#9199A8] hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Session Desktop"
            >
              <Desktop size={14} />
              <span className="hidden xs:inline text-[11px] sm:text-xs">Desktop</span>
            </button>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Microphone */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-[#E0584B] text-white animate-pulse'
                  : 'text-[#9199A8] hover:text-white hover:bg-white/[0.06]'
              }`}
              title="Dictée vocale"
            >
              <Microphone size={15} />
            </button>

            {/* Send / Stop */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-[#E0584B]/20 border border-[#E0584B]/40 text-[#E0584B] flex items-center gap-1 text-[11px] font-semibold hover:bg-[#E0584B]/30"
              >
                <Stop size={13} weight="fill" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!hasText}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                  hasText
                    ? 'bg-white text-black shadow-md hover:scale-105 active:scale-95'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
                title="Envoyer"
              >
                <ArrowUp size={15} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
