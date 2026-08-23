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
import DesktopPromoCarousel from './DesktopPromoCarousel';

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
  heroComposer?: React.ReactNode;
}

export default function ConversationStream({
  messages,
  isStreaming = false,
  onSelectAction,
  onRegenerate,
  heroComposer,
}: ConversationStreamProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Mode Hero (Accueil sans messages)
  if (messages.length === 0) {
    return (
      <div className="nkyel-home-stage flex-1 flex flex-col items-center justify-start overflow-y-auto text-center select-none">
        <div className="nkyel-home-column">
          <div className="nkyel-home-title-wrap">
            <h1 className="nkyel-home-title">
              Que puis-je faire pour vous ?
            </h1>
          </div>

          {heroComposer}

          {/* Pilules d'inspiration : même rythme et densité que la home Vue */}
          <QuickActions onSelect={onSelectAction} />
          <DesktopPromoCarousel />
        </div>
      </div>
    );
  }

  // Mode Discussion Active
  return (
    <div className="nkyel-conversation-stream flex-1 overflow-y-auto py-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
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
