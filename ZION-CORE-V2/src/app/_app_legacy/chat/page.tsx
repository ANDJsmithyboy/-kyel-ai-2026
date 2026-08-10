'use client';

import { useSettingsStore } from '@/stores/settings.store';
import { useChat } from '@/hooks/useChat';
import type { GabomaModel } from '@/lib/models';
import InputBar from '@/components/input/InputBar';
import ConversationStream from '@/components/chat/ConversationStream';

export default function NewChatPage() {
  const isBlackPanther = useSettingsStore(s => s.blackPantherMode);
  
  // Note: For a new chat, we just start without an ID. The hook will get one on the first response.
  // In a real app, we might want to redirect to /chat/[id] once the first message is sent,
  // or manage the URL via shallow routing.
  const { messages, isStreaming, error, sendMessage, stop } = useChat({
    model: isBlackPanther ? 'BLACK_PANTHER' : 'AURATA',
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
          setModel={(m) => { /* TODO: Update local or global model preference */ }}
          onSend={handleSend} 
          onStop={stop} 
          isGenerating={isStreaming} 
        />
      </div>
    </div>
  );
}
