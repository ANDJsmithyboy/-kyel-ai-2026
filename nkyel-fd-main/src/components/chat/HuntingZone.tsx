'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, SpeakerHigh, ArrowsClockwise, ThumbsUp, ThumbsDown, PencilSimple, Brain, Checks } from '@phosphor-icons/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string[]; // For Nkyel and Black Panther
  model?: string;
  versions?: string[]; // To track edited history
  currentVersionIndex?: number;
}

interface HuntingZoneProps {
  messages: Message[];
  isGenerating: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
}

export default function HuntingZone({ messages, isGenerating, onEditMessage, onRegenerate }: HuntingZoneProps) {
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');

  const handleTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (messages.length === 0) {
    const greetings = [
      "Mbolo, comment se passe la traque aujourd'hui",
      "Que l'Okoumé guide vos pas",
      "Prêt pour une nouvelle exploration",
      "L'esprit de la forêt est éveillé"
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const userName = "Daniel"; // Can be passed as prop later

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Glowing Nkyel Seal */}
          <motion.div 
            className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
          <div className="relative w-28 h-28 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-[32px] flex items-center justify-center shadow-2xl p-4">
            <img src="/nkyel-logo-transparent.svg" alt="Nkyel AI Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-medium tracking-tight mb-2 text-center text-white"
        >
          {`${randomGreeting}, ${userName} ?`}
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-center max-w-md text-sm"
        >
          Demandez n'importe quoi à Nkyel AI.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 py-8 pb-40 space-y-8 scroll-smooth">
      {messages.map((msg) => (
        <motion.div 
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          {/* User Message */}
          {msg.role === 'user' && (
            <div className="group relative max-w-[85%] md:max-w-[75%] bg-white/5 border border-white/10 rounded-2xl rounded-br-sm p-4 text-sm md:text-base leading-relaxed">
              {editingId === msg.id ? (
                <div className="flex flex-col gap-2 w-full min-w-[280px]">
                  <textarea 
                    className="w-full bg-transparent border-b border-primary/50 outline-none resize-none overflow-hidden focus:border-primary transition-colors text-white"
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value)}
                    autoFocus
                    onFocus={(e) => e.target.style.height = `${e.target.scrollHeight}px`}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => {
                        onEditMessage(msg.id, editBuffer);
                        setEditingId(null);
                      }}
                      className="px-3 py-1 rounded-lg text-xs bg-primary text-primary-foreground font-medium"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{msg.content}</p>
                  <button 
                    onClick={() => {
                      setEditingId(msg.id);
                      setEditBuffer(msg.content);
                    }}
                    className="absolute -start-10 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/50 hover:text-white"
                    aria-label="Éditer"
                  >
                    <PencilSimple weight="duotone" size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Assistant Message */}
          {msg.role === 'assistant' && (
            <div className="w-full max-w-full md:max-w-[85%]">
              {/* Reasoning Panel (Retractable) */}
              {msg.reasoning && msg.reasoning.length > 0 && (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <button 
                    onClick={() => setExpandedReasoning(expandedReasoning === msg.id ? null : msg.id)}
                    className="w-full flex items-center justify-between p-3 text-xs font-medium text-white/60 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Brain weight="duotone" size={16} className="text-primary" />
                      <span>Processus de réflexion ({msg.reasoning.length} étapes)</span>
                    </div>
                    <motion.div animate={{ rotate: expandedReasoning === msg.id ? 180 : 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedReasoning === msg.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-[#0a0a0a]"
                      >
                        <div className="p-4 space-y-3">
                          {msg.reasoning.map((step, idx) => (
                            <div key={idx} className="flex gap-3 text-xs text-white/60">
                              <Checks weight="bold" size={14} className="mt-0.5 text-primary/70 shrink-0" />
                              <p className="leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Main Content */}
              <div className="prose prose-invert max-w-none text-sm md:text-base text-white/90 leading-relaxed">
                <p>{msg.content}</p>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Copier">
                    <Copy weight="duotone" size={16} />
                  </button>
                  <button onClick={() => handleTTS(msg.content)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Lecture audio">
                    <SpeakerHigh weight="duotone" size={16} />
                  </button>
                  <button onClick={() => onRegenerate(msg.id)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Régénérer">
                    <ArrowsClockwise weight="duotone" size={16} />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-2" />
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="J'aime">
                    <ThumbsUp weight="duotone" size={16} />
                  </button>
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" aria-label="Je n'aime pas">
                    <ThumbsDown weight="duotone" size={16} />
                  </button>
                </div>

                {/* Nkyel Seal for end of turn */}
                <div className="flex items-center gap-2 opacity-30 select-none">
                  <span className="text-[10px] uppercase font-bold tracking-widest">{msg.model || 'Nkyel AI'}</span>
                  <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">G</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
      
      {isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start max-w-[85%]">
          <div className="flex gap-1 items-center h-6">
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
