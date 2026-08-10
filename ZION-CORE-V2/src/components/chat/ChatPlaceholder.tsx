'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatPlaceholderProps {
  userName?: string;
}

const SUGGESTIONS = [
  { icon: '📜', label: 'Explique-moi le droit OHADA', category: 'legal' },
  { icon: '🌍', label: "L'histoire du Gabon en résumé", category: 'default' },
  { icon: '💼', label: 'Rédige un business plan FCRA', category: 'default' },
  { icon: '🗣️', label: 'Apprends-moi le Fang basique', category: 'language' }
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
  const greeting = `Mbolo ! ${getGreeting()}${name ? `, ${name}` : ''}`;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      {/* Logo */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <img
          src="/gabomagpt-logo.jpeg"
          alt="GabomaGPT"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl shadow-lg ring-1 ring-white/10"
        />
      </div>

      {/* Greeting */}
      <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gabon-green,#1DB954)] via-[var(--gabon-yellow,#F5C518)] to-[var(--gabon-blue,#00A8E8)] pr-2">
            {greeting.split('!')[0]}!
          </span>
          <span className="text-[var(--text-primary)]">
            {greeting.split('!').slice(1).join('!')}
          </span>
        </div>
        <div className="text-sm sm:text-base text-[var(--text-secondary)] tracking-wide font-light opacity-80">
          Votre IA souveraine. Propulsée par l'intelligence gabonaise.
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3.5',
                'text-left text-sm font-medium',
                'transition-all duration-300',
                'hover:bg-[var(--bg-surface)]/60 hover:border-white/[0.08] active:scale-[0.98]',
                'border-white/[0.04] bg-[var(--bg-surface)]/40 backdrop-blur-md',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)] group'
              )}
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="line-clamp-2 leading-relaxed">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
