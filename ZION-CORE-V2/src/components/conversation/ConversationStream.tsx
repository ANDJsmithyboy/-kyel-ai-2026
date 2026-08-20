/**
 * Ñkyel AI · ConversationStream
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Flux conversationnel unifié :
 * - Mode Hero d'accueil : Titre souverain « Quelle mission lançons-nous aujourd’hui ? »
 * - Pilules d'actions rapides (QuickActions)
 * - Défilement fluide et rendu progressif des bulles de messages
 */

'use client';

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import QuickActions from '../composer/QuickActions';
import NkyelSeptBranchLogo from '@/components/icons/NkyelSeptBranchLogo';
import { Sparkle } from '@phosphor-icons/react';

export interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  modelName?: string;
  sourcesCount?: number;
  hasArtifact?: boolean;
}

interface ConversationStreamProps {
  messages: MessageItem[];
  isStreaming?: boolean;
  onSelectAction: (prompt: string) => void;
  onRegenerate?: () => void;
}

export default function ConversationStream({
  messages,
  isStreaming = false,
  onSelectAction,
  onRegenerate,
}: ConversationStreamProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Mode Hero (Accueil sans messages)
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-6 animate-fade-in">
          {/* Logo Souverain */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#665F9E]/20 to-[#C39A52]/20 border border-white/[0.1] flex items-center justify-center shadow-lg">
            <NkyelSeptBranchLogo size={40} glow={true} />
          </div>

          {/* Titre Principal Souverain */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F1EEE7]">
              Quelle mission lançons-nous aujourd’hui ?
            </h1>
            <p className="text-[14px] text-[#B8C0CC] max-w-lg mx-auto leading-relaxed">
              Ñkyel orchestre vos objectifs, recherche des preuves, charge des compétences spécialisées et produit des livrables vérifiables.
            </p>
          </div>

          {/* Pilules d'inspiration */}
          <QuickActions onSelect={onSelectAction} />
        </div>
      </div>
    );
  }

  // Mode Discussion Active
  return (
    <div className="flex-1 overflow-y-auto py-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          id={msg.id}
          role={msg.role}
          content={msg.content}
          isStreaming={msg.isStreaming}
          modelName={msg.modelName}
          sourcesCount={msg.sourcesCount}
          hasArtifact={msg.hasArtifact}
          onRegenerate={onRegenerate}
        />
      ))}
      <div ref={scrollEndRef} className="h-4" />
    </div>
  );
}
