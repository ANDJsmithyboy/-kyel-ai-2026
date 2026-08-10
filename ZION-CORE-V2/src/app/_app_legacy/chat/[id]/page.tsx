'use client';

import { use, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { useChat } from '@/hooks/useChat';
import type { GabomaModel } from '@/lib/models';
import InputBar from '@/components/input/InputBar';
import ConversationStream from '@/components/chat/ConversationStream';

export default function ExistingChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const isBlackPanther = useSettingsStore(s => s.blackPantherMode);
  
  const { messages, isStreaming, error, sendMessage, stop } = useChat({
    conversationId: resolvedParams.id,
    model: isBlackPanther ? 'BLACK_PANTHER' : 'AURATA',
    initialMessages: [], // TODO: Load actual messages from backend based on ID
  });

  const handleSend = (text: string) => {
    sendMessage(text, true); // loxoEnabled = true by default
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 overflow-hidden relative">
        <ConversationStream 
          messages={messages} 
          isStreaming={isStreaming} 
          error={error} 
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--zc-background)] via-[var(--zc-background)] to-transparent pt-10 pb-4">
        <InputBar 
          model={isBlackPanther ? 'BLACK_PANTHER' : 'AURATA'}
          setModel={(m) => { /* TODO */ }}
          onSend={handleSend} 
          onStop={stop} 
          isGenerating={isStreaming} 
        />
      </div>
    </div>
  );
}
