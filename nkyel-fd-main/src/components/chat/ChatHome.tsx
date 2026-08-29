/**
 * Nkyel AI · ChatHome.tsx · Client Component
 * SmartANDJ AI Technologies
 * 
 * Home screen layout optimized for production:
 * - Premium serif hero title
 * - Fast suggestion chips
 * - Clean input composer at the bottom
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import InputBar from './InputBar';
import { useLanguageStore } from '@/stores/language.store';
import { PresentationChart, Globe, PencilCircle, GameController, Robot, Plus } from '@phosphor-icons/react';

const SUGGESTIONS = [
  { id: 'slides', label: 'Créer des diapositives', icon: PresentationChart },
  { id: 'web', label: 'Créer un site web', icon: Globe },
  { id: 'design', label: 'Conception', icon: PencilCircle },
  { id: 'game', label: 'Créer des jeux', icon: GameController },
  { id: 'agent', label: 'Personnaliser un agent', icon: Robot },
  { id: 'more', label: 'Plus', icon: Plus },
];

interface ChatHomeProps {
  firstName?: string;
}

export default function ChatHome({ firstName = 'Citoyen' }: ChatHomeProps) {
  const { t } = useLanguageStore();

  const handleSend = (message: string, model: string | null, wandana: boolean) => {
    console.log('Send:', { message, model, wandana });
  };

  return (
    <div className="flex h-full flex-1 flex-col items-center px-4 relative">
      
      {/* Top right commands / upgrades / sparkles */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Placeholder for top-right actions (Upgrade, Model Picker) handled globally in TopBar mostly, but keeping this space free for potential injections */}
      </div>

      {/* Center content wrapper */}
      <div className="flex w-full max-w-[760px] flex-1 flex-col justify-center pb-20 pt-10">
        
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 flex flex-col items-start w-full px-2"
        >
          <h1 className="text-[32px] sm:text-[40px] font-medium leading-tight tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Que puis-je faire pour vous ?
          </h1>
        </motion.div>

        {/* Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-8 px-2"
        >
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.id}
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:bg-[var(--hover)] hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm text-sm font-medium"
              >
                <Icon size={16} weight="duotone" className="text-[var(--text-tertiary)]" />
                {suggestion.label}
              </button>
            );
          })}
        </motion.div>
        
      </div>

      {/* InputBar fixed at the bottom center */}
      <div className="w-full max-w-[760px] pb-6 sticky bottom-0 bg-[var(--bg)]/90 backdrop-blur-md pt-4">
        <InputBar onSend={handleSend} />
      </div>
    </div>
  );
}
