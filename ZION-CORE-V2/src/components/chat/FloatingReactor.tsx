'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightning, Brain, Robot, Cat, MagnifyingGlass, Plus, Paperclip, Microphone, Waveform, Stop, ArrowUp } from '@phosphor-icons/react';

// Ñkyel Lexicon Models
const MODELS = [
  { id: 'aurata', name: 'Aurata', description: 'Mode Flash — rapide, exécution quotidienne', icon: <Lightning weight="duotone" size={20} className="text-primary" /> },
  { id: 'nkyel', name: 'Ñkyel', description: 'Mode Pro — raisonnement logique profond', icon: <Brain weight="duotone" size={20} className="text-primary" /> },
  { id: 'onyxgris', name: 'OnyxGris', description: 'Agent Perroquet Gris — tâches simples', icon: <Robot weight="duotone" size={20} className="text-primary" /> },
  { id: 'blackpanther', name: 'Black Panther', description: 'Le GOAT — multi-agent autonome', icon: <Cat weight="fill" size={20} className="text-primary" /> },
  { id: 'wandana', name: 'Wandana', description: 'L\'Éléphant — recherche web profonde', icon: <MagnifyingGlass weight="duotone" size={20} className="text-primary" /> },
];

export default function FloatingReactor({
  onSubmit,
  isGenerating = false,
  onStop
}: {
  onSubmit: (text: string, modelId: string) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [activeModel, setActiveModel] = useState(MODELS[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Cinematic deployment state
  const hasInput = inputValue.trim().length > 0;

  const handleSend = () => {
    if (hasInput && !isGenerating) {
      onSubmit(inputValue, activeModel.id);
      setInputValue('');
    } else if (isGenerating && onStop) {
      onStop();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
      {/* The Floating Pill */}
      <motion.div
        className="relative flex items-end p-2 bg-background/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl"
        layout
      >
        {/* Left Axis: The Master Button (+) / Model Pill */}
        <div className="flex-shrink-0 flex items-center pr-2">
          {activeModel && !isMenuOpen ? (
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {activeModel.icon}
              <span className="hidden sm:inline">{activeModel.name}</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={20} />
            </motion.button>
          )}
        </div>

        {/* Cinematic Menu Deploy */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: -80, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="absolute left-0 bottom-full mb-4 w-72 bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setActiveModel(model);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${activeModel.id === model.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
                      {model.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{model.name}</span>
                      <span className="text-xs opacity-70">{model.description}</span>
                    </div>
                  </button>
                ))}

                <div className="h-px bg-white/10 my-2" />

                {/* Secondary attachments */}
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm opacity-80">
                  <Paperclip weight="duotone" size={20} className="text-white/80" />
                  <span className="text-sm font-medium opacity-80">Pièces jointes locales</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Input Area */}
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${activeModel.name}...`}
            className="w-full bg-transparent border-none outline-none resize-none max-h-48 py-3 px-2 text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Right Axis: Mic/Wave or Send Button */}
        <div className="flex-shrink-0 flex items-center pl-2 gap-1 pb-1">
          <AnimatePresence mode="popLayout">
            {!hasInput && !isGenerating ? (
              <motion.div
                key="idle-tools"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex gap-1"
              >
                <button className="p-2 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity">
                  <Microphone weight="duotone" size={20} className="text-white/80" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                >
                  <motion.div
                    animate={isLiveMode ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Waveform weight="duotone" size={20} className="text-white/80" />
                  </motion.div>
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="send-btn"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={handleSend}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              >
                {isGenerating ? (
                  <Stop weight="fill" size={20} />
                ) : (
                  <ArrowUp weight="bold" size={20} />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
