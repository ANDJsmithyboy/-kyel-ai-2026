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
import { useChat } from '@/hooks/useChat';
import ConversationStream, { type MessageItem } from '@/components/conversation/ConversationStream';
import MissionComposer from '@/components/composer/MissionComposer';
import type { AgenticFeaturesState } from '@/components/composer/AgenticToggles';
import { fetchBetaStatus, type BetaStatusResponse } from '@/lib/betaStateMachine';
import { getNkyelEngine, useNkyelModel } from '@/hooks/useNkyelModel';
import DesktopExecutionPane from '@/components/workspace/DesktopExecutionPane';
import DesktopMissionPreview from '@/components/conversation/DesktopMissionPreview';
import { useTerrainPanel } from '@/hooks/useTerrainPanel';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);
  const [isManusPreview, setIsManusPreview] = useState(false);
  const terrainOpen = useTerrainPanel((state) => state.isOpen);

  useEffect(() => {
    setIsManusPreview(new URLSearchParams(window.location.search).get('preview') === 'manus');
  }, []);

  useEffect(() => {
    fetchBetaStatus()
      .then((res) => setBetaStatus(res))
      .catch(() => {});
  }, []);

  const isClosed = betaStatus?.state === 'PUBLIC_CLOSED';

  const engineId = useNkyelModel((state) => state.engineId);
  const activeEngine = getNkyelEngine(engineId);

  const chat = useChat({
    conversationId,
    model: activeEngine.apiModel,
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

  const lastMessageId = chat.messages[chat.messages.length - 1]?.id;
  const messages: MessageItem[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    isStreaming: m.role === 'assistant' && chat.isStreaming && m.id === lastMessageId,
    modelName: 'Ñkyel',
    sourcesCount: 0,
    hasArtifact: false,
  }));

  const isHeroMode = messages.length === 0;
  const composer = (
    <MissionComposer
      onSend={handleSend}
      onStop={chat.stop}
      isStreaming={chat.isStreaming}
      initialPrompt={initialPrompt}
      isHeroMode={isHeroMode && !isManusPreview}
    />
  );

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-[#151515]">
      {/* Zone conversation / cerveau */}
      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#151515]">

        {isManusPreview ? (
          <DesktopMissionPreview composer={composer} />
        ) : (
          <ConversationStream
            messages={messages}
            isStreaming={chat.isStreaming}
            onSelectAction={(prompt) => setInitialPrompt(prompt)}
            heroComposer={isHeroMode ? composer : undefined}
          />
        )}

        {chat.error && (
          <div className="mx-auto mb-2 flex w-full max-w-3xl items-center justify-between rounded-xl border border-[#BE6254]/30 bg-[#BE6254]/[0.1] px-4 py-2.5 text-[12px] text-[#D7897D]">
            <span>{chat.error}</span>
            <button onClick={chat.clearError} className="text-[11px] text-[#F1EEE7]/70 underline hover:text-[#F1EEE7]">Fermer</button>
          </div>
        )}

        {!isManusPreview && !isHeroMode && <div className="relative z-20 shrink-0">{composer}</div>}
      </section>

      <DesktopExecutionPane
        isStreaming={chat.isStreaming}
        missionState={isManusPreview ? 'completed' : chat.visualState.status}
        visualEvents={chat.visualState.events}
        hasConversation={terrainOpen && (!isHeroMode || isManusPreview)}
      />
    </div>
  );
}
