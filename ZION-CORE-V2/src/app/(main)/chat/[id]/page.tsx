/**
 * GabomaAI · Chat [id] Page (conversation existante)
 * SmartANDJ AI Technologies
 * Task 11 — Charge la conversation puis streaming
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { GabomaModel, GabomaMessage } from '@/lib/models';
import { useChat } from '@/hooks/useChat';
import ConversationStream from '@/components/chat/ConversationStream';
import InputBar from '@/components/input/InputBar';

export default function ChatIdPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const [model, setModel] = useState<GabomaModel>('AURATA');
  const [loading, setLoading] = useState(true);
  const chat = useChat({
    conversationId,
    model,
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  // Charger les messages existants
  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = await res.json() as { messages: GabomaMessage[]; model?: GabomaModel };
          chat.setMessages(data.messages ?? []);
          if (data.model) setModel(data.model);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);

  const handleSend = useCallback((content: string) => {
    chat.sendMessage(content);
  }, [chat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#020304' }}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#C5A059', animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#020304' }}>
      <ConversationStream messages={chat.messages} isStreaming={chat.isStreaming} />

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
