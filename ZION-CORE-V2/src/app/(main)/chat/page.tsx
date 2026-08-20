/**
 * Nkyel AI · Chat & Mission Page
 * SmartANDJ AI Technologies
 * Complete Manus / ChatGPT style Experience: Hero, Floating Composer, Capabilities Modal & Streaming Chat
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { NkyelModel } from '@/lib/models';
import { useChat } from '@/hooks/useChat';
import ConversationStream from '@/components/chat/ConversationStream';
import InputBar from '@/components/input/InputBar';
import CapabilitiesDrawer from '@/components/capabilities/CapabilitiesDrawer';

export default function ChatPage() {
  const router = useRouter();
  const [model, setModel] = useState<NkyelModel>('NKYEL_CHUI');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);

  const chat = useChat({
    conversationId,
    model,
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  const handleSend = useCallback(async (content: string) => {
    setInitialPrompt('');
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
          window.history.replaceState(null, '', `/chat/${data.id}`);
        }
      } catch {
        // Continue même sans persistance
      }
    }
    chat.sendMessage(content);
  }, [conversationId, model, chat]);

  const handleSelectHeroAction = (prompt: string) => {
    setInitialPrompt(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090F] relative overflow-hidden">
      {/* Background Subtle WorkGraph Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #EDEAE3 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Capabilities Full Drawer */}
      <CapabilitiesDrawer
        isOpen={isCapabilitiesOpen}
        onClose={() => setIsCapabilitiesOpen(false)}
        onSelectCapability={(prompt) => setInitialPrompt(prompt)}
      />

      {/* Conversation / Hero Stream Area */}
      <ConversationStream
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        onSelectAction={handleSelectHeroAction}
        onOpenMore={() => setIsCapabilitiesOpen(true)}
      />

      {/* Error Banner */}
      {chat.error && (
        <div
          className="mx-auto max-w-3xl w-full px-4 py-2.5 mb-2 rounded-2xl text-[13px] flex items-center justify-between"
          style={{ background: 'rgba(224,88,75,0.12)', border: '1px solid rgba(224,88,75,0.3)', color: '#E0584B' }}
        >
          <span>❌ {chat.error}</span>
          <button
            onClick={chat.clearError}
            className="underline text-[12px] text-white/80 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Floating Composer matching Manus */}
      <InputBar
        onSend={handleSend}
        onStop={chat.stop}
        isStreaming={chat.isStreaming}
        model={model}
        onModelChange={setModel}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}
