/**
 * GabomaAI · Chat Page (nouvelle conversation)
 * SmartANDJ AI Technologies
 * Task 11 — Redirige vers /chat/[id] après création
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GabomaModel } from '@/lib/models';
import { useChat } from '@/hooks/useChat';
import ConversationStream from '@/components/chat/ConversationStream';
import InputBar from '@/components/input/InputBar';

export default function ChatPage() {
  const router = useRouter();
  const [model, setModel] = useState<GabomaModel>('AURATA');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chat = useChat({
    conversationId,
    model,
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  const handleSend = useCallback(async (content: string) => {
    // Créer une conversation si c'est le premier message
    if (!conversationId) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.slice(0, 60), model }),
        });
        if (res.ok) {
          const data = await res.json() as { id: string };
          setConversationId(data.id);
          // Mettre à jour l'URL sans recharger
          window.history.replaceState(null, '', `/chat/${data.id}`);
        }
      } catch {
        // Continue même sans persistance
      }
    }
    chat.sendMessage(content);
  }, [conversationId, model, chat]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#020304' }}>
      <ConversationStream messages={chat.messages} isStreaming={chat.isStreaming} />

      {/* Error banner */}
      {chat.error && (
        <div
          className="mx-4 mb-2 px-4 py-3 rounded-xl text-[13px]"
          style={{ background: 'rgba(192,57,45,0.08)', border: '1px solid rgba(192,57,45,0.2)', color: '#C0392D' }}
        >
          ❌ {chat.error}
          <button
            onClick={chat.clearError}
            className="ml-3 underline text-[12px]"
            style={{ color: '#8A8A92', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Fermer
          </button>
        </div>
      )}

      <InputBar
        onSend={handleSend}
        onStop={chat.stop}
        isStreaming={chat.isStreaming}
        model={model}
        onModelChange={setModel}
      />
    </div>
  );
}
