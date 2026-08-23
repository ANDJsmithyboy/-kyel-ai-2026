'use client';

import React, { useEffect, useState } from 'react';
import { Sparkle, Code, Brain, Image, Globe, Lightning } from '@phosphor-icons/react';

interface ChatPlaceholderProps {
  userName?: string;
}

const GLOBAL_SUGGESTIONS = [
  { icon: Code, label: 'Développer une application React & FastAPI complète', category: 'code' },
  { icon: Brain, label: 'Analyser un rapport massif avec le contexte 2M de Gemini', category: 'research' },
  { icon: Image, label: 'Générer une interface UI interactive dans le studio VIE', category: 'design' },
  { icon: Globe, label: 'Synthétiser un dossier multilingue en 5 langues mondiales', category: 'multilingual' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bonjour';
  if (hour >= 12 && hour < 18) return 'Bon après-midi';
  if (hour >= 18 && hour < 22) return 'Bonsoir';
  return 'Bonne nuit';
}

export default function ChatPlaceholder({ userName }: ChatPlaceholderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const name = userName?.split(' ')[0] || '';
  const greeting = `${getGreeting()}${name ? `, ${name}` : ''}`;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 max-w-2xl mx-auto text-center">
      {/* Apple-Grade Luminous Logo */}
      <div className="mb-6 relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#D5AE57] to-[#6F9485] rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500" />
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-black text-2xl sm:text-3xl shadow-[0_0_35px_rgba(213,174,87,0.4)] border border-amber-300/40">
          Ñ
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#D5AE57] mb-2">
          <Sparkle size={13} weight="fill" />
          <span>Propulsé par Google Gemini Ecosystem</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {greeting}
        </h1>
        <p className="text-xs sm:text-sm text-white/60 font-light max-w-md mx-auto">
          Comment puis-je orchestrer votre mission aujourd&apos;hui ?
        </p>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {GLOBAL_SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                const input = document.querySelector('textarea');
                if (input) {
                  input.value = item.label;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.focus();
                }
              }}
              className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.18] transition-all flex items-center gap-3 text-xs text-white/80 hover:text-white group active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D5AE57] group-hover:scale-110 transition-transform">
                <Icon size={16} weight="bold" />
              </div>
              <span className="leading-snug">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
