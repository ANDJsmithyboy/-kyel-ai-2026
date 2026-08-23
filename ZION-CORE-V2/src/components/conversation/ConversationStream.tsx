/**
 * Ñkyel AI · ConversationStream
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Unified conversation stream:
 * — Hero home mode: Sovereign greeting « Quelle mission lançons-nous aujourd’hui ? »
 * — Quick action inspiration pills (QuickActions)
 * — Smooth scrolling and progressive rendering of message bubbles
 */

'use client';

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import QuickActions from '../composer/QuickActions';
import NkyelSeptBranchLogo from '@/components/icons/NkyelSeptBranchLogo';

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

  // Hero Mode (Empty conversation state)
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in" style={{ gap: 'var(--space-6)' }}>
          {/* Sovereign Logo */}
          <div
            className="flex items-center justify-center shadow-lg"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
            }}
          >
            <NkyelSeptBranchLogo size={40} glow={true} />
          </div>

          {/* Sovereign Header Title */}
          <div className="space-y-2">
            <h1
              className="font-semibold tracking-tight"
              style={{ fontSize: 'var(--text-2xl)', color: 'var(--fg)' }}
            >
              Quelle mission lançons-nous aujourd’hui ?
            </h1>
            <p
              className="max-w-lg mx-auto leading-relaxed"
              style={{ fontSize: 'var(--text-base)', color: 'var(--fg-muted)' }}
            >
              Ñkyel orchestre vos objectifs, recherche des preuves, charge des compétences spécialisées et produit des livrables vérifiables.
            </p>
          </div>

          {/* Quick inspiration actions */}
          <QuickActions onSelect={onSelectAction} />
        </div>
      </div>
    );
  }

  // Active Discussion Mode
  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-thin"
      style={{ paddingBlock: 'var(--space-6)' }}
    >
      <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
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
      </div>
      <div ref={scrollEndRef} style={{ height: 'var(--space-4)' }} />
    </div>
  );
}
