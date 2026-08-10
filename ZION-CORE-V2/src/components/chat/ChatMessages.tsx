'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import { WarningCircle, Path } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth.store';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelName?: string;
  tagline?: string;
  agentStep?: { type: string; label: string; status: 'running' | 'done' | 'warning' } | null;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: { code: number; message: string } | null;
  onRegenerate?: () => void;
}

export default function ChatMessages({ messages, isLoading, error, onRegenerate }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorateur';

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto overflow-x-hidden pt-24 pb-32 z-10 scroll-smooth">
      {/* AURORA BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
        {/* Violet Halo (Top Left) */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[var(--violet-fuji, #9B8BB3)] rounded-full blur-[120px] opacity-[0.06] transform rotate-12" />
        
        {/* Gold Halo (Center Right) */}
        <div className="absolute top-[30%] right-[5%] w-[40%] h-[40%] bg-[var(--accent, #C5A059)] rounded-full blur-[140px] opacity-[0.05] transform -rotate-12" />
        
        {/* Emerald Halo (Bottom Center) */}
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[50%] bg-[var(--emerald, #19C37D)] rounded-full blur-[150px] opacity-[0.04]" />
      </div>

      <div className="flex flex-col px-4 md:px-0 w-full md:max-w-3xl lg:max-w-4xl mx-auto z-10 relative">
        {messages.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-[var(--text-primary)] space-y-6">
            <img 
              src="/gabomagpt-logo.jpeg" 
              alt="GabomaGPT Logo" 
              className="w-28 h-28 rounded-3xl object-cover shadow-[var(--shadow-accent)] animate-pulse" 
            />
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Mbolo, {firstName} !</h2>
              <p className="text-[13px] font-medium text-[var(--text-muted)] tracking-wider uppercase">Comment puis-je t'aider aujourd'hui ?</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            agentStep={msg.agentStep}
            modelName={msg.modelName}
            tagline={msg.tagline}
            time={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            onRegenerate={msg.role === 'assistant' && msg.id === messages[messages.length - 1].id ? onRegenerate : undefined}
          />
        ))}

        {isLoading && (
          <MessageBubble
            role="assistant"
            content=""
            isStreaming={true}
          />
        )}

        {error && (
          <div className="flex justify-center my-6">
            <ErrorMessage code={error.code} message={error.message} />
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}

function ErrorMessage({ code, message }: { code: number; message: string }) {
  const errorConfigs: Record<number, { title: string }> = {
    500: { title: 'La piste s\'est brouillée (Erreur 500)' },
    408: { title: 'Délai d\'attente dépassé' },
    429: { title: 'Trop de requêtes dans la meute' },
    0: { title: 'Connexion perdue' }
  };

  const config = errorConfigs[code] || errorConfigs[500];

  return (
    <div className="flex items-center gap-4 p-4 rounded-[18px] bg-red-500/5 border border-red-500/20 shadow-sm max-w-sm w-full">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
        <WarningCircle size={20} weight="thin" className="text-red-400" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-red-400 tracking-tight">{config.title}</p>
        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{message}</p>
      </div>
    </div>
  );
}
