/**
 * Ñkyel AI · Conversation & Mission Page
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Page conversationnelle principale intégrant :
 * - ConversationStream (Hero accueil ou flux actif)
 * - MissionComposer (Saisie d'objectifs, Action Launcher, Toggles, STT)
 * - Persistance et streaming des réponses
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import ConversationStream, { type MessageItem } from '@/components/conversation/ConversationStream';
import MissionComposer from '@/components/composer/MissionComposer';
import type { AgenticFeaturesState } from '@/components/composer/AgenticToggles';
import { fetchBetaStatus, type BetaStatusResponse } from '@/lib/betaStateMachine';

export default function ChatPage() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);

  useEffect(() => {
    fetchBetaStatus()
      .then((res) => setBetaStatus(res))
      .catch(() => {});
  }, []);

  const isClosed = betaStatus?.state === 'PUBLIC_CLOSED';

  const chat = useChat({
    conversationId,
    model: 'NKYEL_CHUI',
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  const handleSend = useCallback(
    async (content: string, engineId: string, features: AgenticFeaturesState) => {
      if (isClosed) {
        alert("La bêta privée est terminée. L'historique est disponible en lecture seule.");
        return;
      }
      setInitialPrompt('');


      // Créer une conversation persistée si nouveau thread
      if (!conversationId) {
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: content.slice(0, 60), model: engineId }),
          });
          if (res.ok) {
            const data = (await res.json()) as { id: string };
            setConversationId(data.id);
            window.history.replaceState(null, '', `/chat/${data.id}`);
          }
        } catch {
          // Poursuite gracieuse
        }
      }

      chat.sendMessage(content);
    },
    [conversationId, chat]
  );

  const messages: MessageItem[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    isStreaming: m.isStreaming,
    modelName: 'Ñkyel Auto',
    sourcesCount: 0,
    hasArtifact: false,
  }));

  const isHeroMode = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#08090D] relative overflow-hidden">
      {/* Background Subtle WorkGraph Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #F1EEE7 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Stream Area (Hero ou Discussion) */}
      <ConversationStream
        messages={messages}
        isStreaming={chat.isStreaming}
        onSelectAction={(prompt) => setInitialPrompt(prompt)}
        onRegenerate={() => chat.reload?.()}
      />

      {/* Bannière d'Erreur éventuelle */}
      {chat.error && (
        <div
          className="mx-auto max-w-3xl w-full px-4 py-2.5 mb-2 rounded-2xl text-[13px] flex items-center justify-between"
          style={{
            background: 'rgba(190, 98, 84, 0.12)',
            border: '1px solid rgba(190, 98, 84, 0.3)',
            color: '#BE6254',
          }}
        >
          <span>❌ {chat.error}</span>
          <button
            onClick={chat.clearError}
            className="underline text-[12px] text-[#F1EEE7]/80 hover:text-[#F1EEE7]"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Compositeur Principal */}
      <div className="shrink-0 z-20">
        <MissionComposer
          onSend={handleSend}
          onStop={chat.stop}
          isStreaming={chat.isStreaming}
          initialPrompt={initialPrompt}
          isHeroMode={isHeroMode}
        />
      </div>
    </div>
  );
}
