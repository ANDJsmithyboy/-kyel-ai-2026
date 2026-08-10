/**
 * GabomaAI · InputBar V3
 * SmartANDJ AI Technologies
 * Glassmorphism, GabomaSeer Live, placeholder rotatif
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Stop, Microphone, Plus } from '@phosphor-icons/react';
import type { GabomaModel } from '@/lib/models';
import { MODEL_META } from '@/lib/models';
import AttachmentSheet from './AttachmentSheet';
import ModelBadge from '../chat/ModelBadge';
import { IconAurata } from '../icons/IconAurata';
import { IconNkyel } from '../icons/IconNkyel';
import { IconOnyxGris } from '../icons/IconOnyxGris';
import { IconWandana } from '../icons/IconWandana';
import { IconBlackPanther } from '../icons/IconBlackPanther';

interface InputBarProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  model: GabomaModel;
  onModelChange: (m: GabomaModel) => void;
}

const getModelColor = (m: GabomaModel) => {
  switch (m) {
    case 'AURATA': return '#C9A84C';
    case 'WANDANA': return '#00D4AA';
    case 'ONYXGRIS': return '#7A42C8';
    case 'BLACK_PANTHER': return '#636573';
    case 'BLUE_PANTHER': return '#0070F3';
    case 'NKYEL': return '#E2E4E9';
    default: return '#C9A84C';
  }
};

const getModelIcon = (m: GabomaModel, size: string = 'w-4 h-4') => {
  const props = { className: size };
  switch (m) {
    case 'AURATA': return <IconAurata {...props} />;
    case 'NKYEL': return <IconNkyel {...props} />;
    case 'ONYXGRIS': return <IconOnyxGris {...props} />;
    case 'WANDANA': return <IconWandana {...props} />;
    case 'BLACK_PANTHER': return <IconBlackPanther {...props} />;
    case 'BLUE_PANTHER': return <IconBlackPanther {...props} style={{ color: '#0070F3' }} />;
    default: return <IconAurata {...props} />;
  }
};

const PLACEHOLDERS = [
  'Demande à Gaboma...',
  'Le Rendu attend tes instructions...',
  'WANDANA cherche pour toi...',
  'BLACK PANTHER est en veille...',
  'Que veux-tu faire aujourd\'hui ?',
];

export default function InputBar({
  onSend,
  onStop,
  isStreaming,
  model,
  onModelChange,
}: InputBarProps) {
  const [value, setValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [wandanaEnabled, setWandanaEnabled] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Placeholder rotatif */
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleModelChange = (m: GabomaModel) => {
    onModelChange(m);
    setShowBadge(true);
    setTimeout(() => setShowBadge(false), 4000);
  };

  const toggleLive = () => {
    setIsLiveActive((prev) => !prev);
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="px-4 pb-4 pt-2 relative">
      {/* Badge de changement de modèle */}
      <ModelBadge
        model={model}
        isVisible={showBadge}
        onDismiss={() => setShowBadge(false)}
      />

      {/* Overlay Live GabomaSeer */}
      <AnimatePresence>
        {isLiveActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-4 right-4 bottom-full mb-3 flex items-center justify-between px-4 py-3 rounded-2xl z-40"
            style={{
              background: 'rgba(20, 19, 15, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--accent-20, rgba(197,160,89,0.2))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className="absolute w-full h-full rounded-full bg-[#1F9D6B] opacity-30 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-[#1F9D6B]" />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary, #EDEAE3)' }}
              >
                GabomaSeer regarde…
              </span>
            </div>
            <button
              onClick={toggleLive}
              className="text-[#8A8378] hover:text-[#E0584B] transition-colors"
              aria-label="Arrêter GabomaSeer"
            >
              <Stop size={22} weight="fill" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre principale (Single Row Liquid Glass) */}
      <div
        className="flex items-center gap-2 rounded-full relative z-30 glass p-1.5 transition-all duration-500 ease-out"
        style={{
          boxShadow: isLiveActive
            ? '0 0 0 2px rgba(31,157,107,0.3), 0 24px 80px rgba(0,0,0,0.6)'
            : '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Bouton + (Attachment) */}
        <div className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            type="button"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-[var(--accent-06)] border hairline-border hover:bg-[var(--accent-10)]"
            style={{
              color: isSheetOpen ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            <Plus size={18} weight="thin" />
          </motion.button>
          
          <AttachmentSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            model={model}
            onModelSelect={handleModelChange}
            wandanaEnabled={wandanaEnabled}
            onToggleWandana={() => setWandanaEnabled(!wandanaEnabled)}
          />
        </div>

        {/* Vecteur de Force (Model Badge) */}
        <button
          onClick={() => setIsSheetOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 transition-all hover:bg-[var(--accent-10)] bg-[var(--accent-06)] border border-[var(--border)]"
        >
          <span style={{ color: getModelColor(model) }}>{getModelIcon(model)}</span>
          <span
            className="text-[12px] font-bold tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            {MODEL_META[model].label} <span className="text-[10px] text-[var(--text-tertiary)]">▾</span>
          </span>
        </button>

        {/* Textarea */}
        <div className="flex-1 relative flex items-center min-h-[32px]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
            aria-label="Directive..."
            className="w-full resize-none bg-transparent outline-none self-center focus:ring-0 placeholder-transparent"
            style={{
              color: 'var(--text-primary, #EDEAE3)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: '22px',
              maxHeight: '160px',
              padding: '6px 4px',
              letterSpacing: '0.01em',
            }}
          />
          {!value && (
            <AnimatePresence mode="wait">
              <motion.span
                key={placeholderIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.4, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1 pointer-events-none"
                style={{ 
                  color: 'var(--text-secondary, #8A8378)',
                  fontSize: '13px',
                }}
              >
                {PLACEHOLDERS[placeholderIdx]}
              </motion.span>
            </AnimatePresence>
          )}
        </div>

        {/* Mic / Live / Send Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Memo / Mic */}
          {!hasText && !isStreaming && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-[var(--accent-06)] hover:bg-[var(--accent-10)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Microphone size={18} weight="thin" />
            </motion.button>
          )}


          {/* Send / Stop */}
          {isStreaming ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              className="h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold"
              style={{
                background: 'rgba(255,107,122,0.15)', // Danger #FF6B7A
                border: '1px solid rgba(255,107,122,0.4)',
                color: '#FF6B7A',
              }}
            >
              <Stop size={14} weight="fill" /> Stop
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={hasText ? handleSubmit : toggleLive}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform"
              style={{
                background: hasText ? 'var(--text-primary)' : 'var(--color-success)', 
                color: hasText ? 'var(--bg)' : '#FFFFFF',
              }}
            >
              {hasText ? (
                <ArrowUp size={16} weight="bold" />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Animation pulse-luxe */}
      <style jsx global>{`
        @keyframes pulse-luxe {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(197, 160, 89, 0.35);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(197, 160, 89, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-luxe,
          [style*="pulse-luxe"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
