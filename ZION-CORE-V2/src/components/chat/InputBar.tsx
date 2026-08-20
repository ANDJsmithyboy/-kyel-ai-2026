import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera as CameraIcon,
  Folder as FolderIcon,
  Cloud as CloudIcon,
} from 'lucide-react';
import { IconAurata, IconNkyel, IconOnyxGris, IconBlackPanther } from '@/components/icons';
import { WandanaIcon, RenduIcon } from '@/components/icons/NkyelIcons';
import { saveDraft, getDraft } from '@/lib/indexedDB';

/* -- Types ------------------------------------------ */
type ModelKey = 'aurata' | 'nkyel' | 'onyx-gris' | 'black-panther' | 'wandana';

interface Model {
  key: ModelKey;
  label: string;
  description: string;
  status: 'online' | 'offline';
}

const MODELS: Model[] = [
  { key: 'aurata',        label: 'Aurata',        description: 'Mode Flash — exécution quotidienne', status: 'online' },
  { key: 'nkyel',         label: 'Ñkyel',         description: 'Mode Pro — raisonnement logique profond', status: 'online' },
  { key: 'onyx-gris',     label: 'OnyxGris',      description: 'Agent IA autonome', status: 'online' },
  { key: 'black-panther', label: 'Black Panther', description: 'Le GOAT — multi-agent autonome', status: 'online' },
  { key: 'wandana',       label: 'Wandana',       description: 'L\'Éléphant — recherche web profonde', status: 'online' },
];

interface InputBarProps {
  onSend: (message: string, model: ModelKey | null, wandana: boolean) => void;
  onStop?: () => void;
  isGenerating?: boolean;
}

/* -- Ñkyel Waves --------------------- */
function NkyelWaves({ isLive }: { isLive?: boolean }) {
  const bars = isLive ? Array.from({ length: 24 }) : [0, 1, 2, 3];
  return (
    <div className={`flex items-center gap-[3px] ${isLive ? 'flex-1 justify-center' : ''}`} aria-label="Ñkyel Waves">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: isLive ? 4 : 2.5,
            background: 'var(--accent)',
          }}
          animate={{ height: isLive ? [10, 20 + Math.random() * 20, 10] : [6, 14 + (i % 4) * 3, 6] }}
          transition={{
            duration: isLive ? 0.4 : 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

/* -- STT Mic Icon ----------------------------------- */
function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 10C5 12.8 7.2 15 10 15C12.8 15 15 12.8 15 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 15V18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* -- Send Arrow Icon -------------------------------- */
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 14V4M9 4L5 8M9 4L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -- Plus Icon -------------------------------------- */
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -- Main InputBar ---------------------------------- */
export default function InputBar({ onSend, onStop, isGenerating }: InputBarProps) {
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelKey | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasText = text.trim().length > 0;

  // Draft persistence on mount
  useEffect(() => {
    getDraft('inputDraft').then(saved => {
      if (saved) setText(saved);
    });
  }, []);

  // Save draft on change
  useEffect(() => {
    saveDraft('inputDraft', text);
  }, [text]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta && !isLiveMode) {
      ta.style.height = '0';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [text, isLiveMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  const handleSend = useCallback(() => {
    if (!hasText && !isLiveMode) return;
    onSend(text.trim(), selectedModel, false);
    setText('');
    saveDraft('inputDraft', '');
    setIsLiveMode(false);
  }, [text, selectedModel, hasText, isLiveMode, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Esc to stop generation if running
    if (e.key === 'Escape' && isGenerating && onStop) {
      e.preventDefault();
      onStop();
      return;
    }

    // Force-send (bypasses IME composition)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Normal Send
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return; // Prevent sending while IME is composing (except if forced above)
      e.preventDefault();
      handleSend();
      return;
    }

    // Edit last message
    if (e.key === 'ArrowUp' && text.trim() === '') {
      e.preventDefault();
      // Dispatch event or call a prop to edit last message
      window.dispatchEvent(new CustomEvent('edit-last-message'));
    }
  };

  const handleSelectModel = (model: ModelKey, status: string) => {
    if (status === 'offline') return;
    setSelectedModel(model);
    setPopoverOpen(false);
  };

  const selectedLabel = MODELS.find(m => m.key === selectedModel)?.label;

  return (
    <div className="w-full relative z-50 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto max-w-3xl" ref={popoverRef}>
        
        {/* Popover (opens UP) */}
        <AnimatePresence>
          {popoverOpen && !isLiveMode && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-4 overflow-hidden rounded-[24px] shadow-2xl backdrop-blur-3xl w-[320px]"
              style={{
                background: 'rgba(var(--bg-elevated-rgb), 0.75)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Modèles */}
              <div className="px-3 pb-2 pt-4">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Modèles Gaboma
                </p>
                {MODELS.map((model) => (
                  <button
                    key={model.key}
                    onClick={() => handleSelectModel(model.key, model.status)}
                    disabled={model.status === 'offline'}
                    className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-3 transition-colors ${model.status === 'offline' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ background: selectedModel === model.key ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent' }}
                    onMouseEnter={(e) => { if (selectedModel !== model.key && model.status !== 'offline') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (selectedModel !== model.key) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex-shrink-0" style={{ color: selectedModel === model.key ? 'var(--accent)' : 'rgba(255,255,255,0.6)' }}>
                      {(() => {
                        const props = { width: 18, height: 18 };
                        switch (model.key) {
                          case 'black-panther': return <IconBlackPanther {...props} />;
                          case 'aurata': return <IconAurata {...props} />;
                          case 'nkyel': return <IconNkyel {...props} />;
                          case 'onyx-gris': return <IconOnyxGris {...props} />;
                          case 'wandana': return <WandanaIcon {...props} />;
                          default: return <div className="h-2 w-2 rounded-full bg-current" />;
                        }
                      })()}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-white">{model.label}</p>
                        {model.status === 'offline' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Offline</span>}
                      </div>
                      <p className="text-[11px] text-white/50">{model.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="h-px mx-4 bg-white/10" />

              {/* Connectors */}
              <div className="px-3 pt-3 pb-4">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Connecteurs
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { icon: <FolderIcon size={18} />, label: 'Fichier Local' },
                    { icon: <CloudIcon size={18} />, label: 'Cloud MCP' },
                    { icon: <CameraIcon size={18} />, label: 'Caméra' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-2 transition-colors hover:bg-white/5"
                    >
                      <span className="text-white/60">{item.icon}</span>
                      <span className="text-[10px] font-medium text-white/50">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- The Pill (Haze Glassmorphism 2.0) ------------------------------- */}
        <motion.div
          layout
          className="flex items-center gap-2 rounded-full shadow-2xl backdrop-blur-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: isLiveMode ? '16px 24px' : '8px 12px 8px 8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {isLiveMode ? (
            /* Live Mode Layout */
            <div className="flex w-full items-center justify-between gap-4">
              <button 
                onClick={() => setIsLiveMode(false)}
                className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <NkyelWaves isLive />
              <button 
                onClick={handleSend}
                className="p-2 rounded-full text-white bg-red-500/80 hover:bg-red-500 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              </button>
            </div>
          ) : (
            /* Standard Layout */
            <>
              {/* LEFT: Mutant + Button → Pill */}
              <AnimatePresence mode="wait">
                {selectedModel ? (
                  <motion.button
                    key="pill"
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setPopoverOpen(!popoverOpen)}
                    className="flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 hover:bg-white/5 transition"
                    style={{ background: 'rgba(var(--accent-rgb), 0.1)', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}
                  >
                    <span style={{ color: 'var(--accent)' }}>
                      {(() => {
                        const props = { width: 16, height: 16 };
                        switch (selectedModel) {
                          case 'black-panther': return <IconBlackPanther {...props} />;
                          case 'aurata': return <IconAurata {...props} />;
                          case 'nkyel': return <IconNkyel {...props} />;
                          case 'onyx-gris': return <IconOnyxGris {...props} />;
                          case 'wandana': return <WandanaIcon {...props} />;
                          default: return <PlusIcon />;
                        }
                      })()}
                    </span>
                    <span className="whitespace-nowrap text-[14px] font-bold tracking-wide" style={{ color: 'var(--accent)' }}>
                      {selectedLabel}
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="plus"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setPopoverOpen(!popoverOpen)}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition bg-white/5 text-white/80"
                  >
                    <PlusIcon />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* CENTER: Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Demandez n'importe quoi à Gaboma..."
                rows={1}
                className="flex-1 resize-none border-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-white/30 text-white px-2 py-2"
                style={{ maxHeight: 200 }}
              />

              {/* RIGHT: Dynamic action block */}
              <div className="flex-shrink-0 flex items-center justify-end min-w-[80px]">
                <AnimatePresence mode="popLayout">
                  {isGenerating ? (
                    <motion.button
                      key="stop"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={onStop}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2"/></svg>
                    </motion.button>
                  ) : hasText ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={handleSend}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#020304] transition hover:opacity-90"
                      style={{ background: 'var(--accent)' }}
                    >
                      <SendIcon />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="voice"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <button
                        onClick={() => setIsTranscribing(!isTranscribing)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${isTranscribing ? 'bg-red-500/20 text-red-400' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}
                      >
                        <MicIcon />
                        {isTranscribing && (
                          <motion.div 
                            className="absolute rounded-full border border-red-400/50" 
                            style={{ width: 44, height: 44 }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setIsLiveMode(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:text-white/90 hover:bg-white/5 transition"
                      >
                        <NkyelWaves />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <p className="mt-3 text-center text-[11px] text-white/30 tracking-wide font-medium select-none">
        Ñkyel AI peut faire des erreurs. Votre discernement reste souverain.
      </p>
    </div>
  );
}
