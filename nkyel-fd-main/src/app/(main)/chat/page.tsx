/**
 * Ñkyel AI · Conversation & Central Intelligence Workspace Page
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Intégration complète :
 * - AdaptiveChatWorkspace (Left Sidebar, Central Reading Column, Right Context Inspector)
 * - Persistance et streaming des réponses
 * - Connexion réelle au moteur d'inférence
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { getNkyelEngine, useNkyelModel } from '@/hooks/useNkyelModel';
import { useConversations } from '@/hooks/useConversations';
import AdaptiveChatWorkspace, { ChatMessage } from '@/components/chat/AdaptiveChatWorkspace';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const { createConversation } = useConversations();

  const engineId = useNkyelModel((state) => state.engineId);
  const activeEngine = getNkyelEngine(engineId);

  const chat = useChat({
    conversationId,
    model: activeEngine.apiModel,
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Créer une conversation persistée si nouveau thread
      if (!conversationId) {
        try {
          const conv = await createConversation(content.slice(0, 60), 'CHAT', engineId);
          if (conv) {
            setConversationId(conv.id);
            window.history.replaceState(null, '', `/chat/${conv.id}`);
          }
        } catch {
          // Poursuite gracieuse
        }
      }

      chat.sendMessage(content);
    },
    [conversationId, chat, engineId, createConversation]
  );

  const messages: ChatMessage[] = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sources: m.sources as unknown as string[] || undefined,
    toolActivity: (m as any).toolActivity || undefined,
  }));

  return (
    <div className="h-full w-full overflow-hidden bg-[var(--material-canvas)]">
      <AdaptiveChatWorkspace
        initialMessages={messages.length > 0 ? messages : undefined}
        missionTitle={chat.messages[0]?.content ? chat.messages[0].content.slice(0, 48) + '...' : 'Nouvelle Mission Ñkyel'}
        onSendMessage={handleSendMessage}
        onStopStreaming={chat.stop}
        isStreaming={chat.isStreaming}
      />
    </div>
  );
}
