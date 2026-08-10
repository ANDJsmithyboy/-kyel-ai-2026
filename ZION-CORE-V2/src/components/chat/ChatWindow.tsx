/* GabomaGPT · ChatWindow.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Fenêtre de chat complète — messages, streaming SSE, suggestions, état vide */
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import ThinkingAnimation from './ThinkingAnimation';
import { useChatStore, type Message } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { streamChatCompletion, type ChatMessage } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

/* ── Salutations gabonaises ── */
function getTimeGreeting(name: string): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return `Mbolo ! Bonjour ${name}`;
  if (h >= 12 && h < 18) return `Akeva ! Bon après-midi ${name}`;
  if (h >= 18 && h < 21) return `Bonsoir ${name}, on gère quoi ?`;
  return `C'est tard ${name}, mais Gaboma AI veille`;
}

/* ── Messages d'erreur gabonais ── */
function getErrorMessage(error: string): string {
  if (error.includes('network') || error.includes('fetch')) return 'Wolo wolo, connexion perdue. On réessaie ?';
  if (error.includes('500') || error.includes('server')) return 'Le serveur fait la sieste. Patience frère.';
  if (error.includes('429') || error.includes('rate')) return 'Doucement ! Trop de requêtes. On souf le gaz.';
  if (error.includes('empty')) return 'Gaboma AI réfléchit encore... c\'est chaud.';
  return `Erreur : ${error}`;
}

/* ── Suggestions de démarrage ── */
const SUGGESTIONS = [
  { icon: '🇬🇦', text: "Parle-moi de l'histoire du Gabon" },
  { icon: '💻', text: 'Écris un script Python pour analyser des données' },
  { icon: '📝', text: 'Aide-moi à rédiger un email professionnel' },
  { icon: '🧠', text: "Explique-moi l'intelligence artificielle simplement" },
];

interface ChatWindowProps {
  conversationId: string | null;
  model: string;
}

export default function ChatWindow({ conversationId, model }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const user = useAuthStore((s) => s.user);
  const streamResponses = useSettingsStore((s) => s.streamResponses);

  const conversations = useChatStore((s) => s.conversations);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateLastAssistantMessage = useChatStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const isGenerating = useChatStore((s) => s.isGenerating);
  const setIsGenerating = useChatStore((s) => s.setIsGenerating);
  const addConversation = useChatStore((s) => s.addConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const updateConversationTitle = useChatStore((s) => s.updateConversationTitle);

  const conversation = conversations.find((c) => c.id === conversationId);
  const messages = conversation?.messages ?? [];

  /* Salutation calculee cote client uniquement (evite hydration mismatch Date) */
  const [timeGreeting, setTimeGreeting] = useState('Mbolo !');
  useEffect(() => {
    if (user) setTimeGreeting(getTimeGreeting(user.name.split(' ')[0]));
  }, [user]);

  /* ── useChat Integration ── */
  const { messages: aiMessages, append, stop, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: (conversation?.messages || []).map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  });

  const displayMessages = aiMessages;
  const isGeneratingLocal = isLoading;

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  /* Stop generation */
  const handleStop = useCallback(() => {
    stop();
    setIsGenerating(false);
  }, [stop, setIsGenerating]);

  /* Envoyer un message */
  const handleSend = useCallback(async (text: string, selectedModel?: any, wandana?: boolean) => {
    let convId = conversationId;

    /* Créer conversation si inexistante */
    if (!convId) {
      const newConv = {
        id: uuidv4(),
        title: text.slice(0, 60),
        messages: [],
        model,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addConversation(newConv);
      setActiveConversation(newConv.id);
      convId = newConv.id;
    }

    const currentConvId = convId as string;

    /* Mettre à jour le titre si premier message */
    if (displayMessages.length === 0) {
      updateConversationTitle(currentConvId, text.slice(0, 60));
    }

    setIsGenerating(true);
    await append({ role: 'user', content: text });
    setIsGenerating(false);
  }, [conversationId, model, displayMessages.length, addConversation, setActiveConversation, updateConversationTitle, append, setIsGenerating]);

  /* Régénérer le dernier message */
  const handleRegenerate = useCallback(async () => {
    // Basic regenerate implementation (not fully supported by raw useChat without pop/append, but we keep the stub)
    // For now, if we want to regenerate, we can just log or implement later.
  }, []);

  /* ── État vide — écran d'accueil ── */
  if (!conversationId || displayMessages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="mb-6">
            <ThinkingAnimation size={80} showLogo />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
            {timeGreeting}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8 text-center max-w-md">
            Comment puis-je vous aider aujourd&apos;hui ?
          </p>

          {/* Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s.text)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 text-left group',
                  'border-white/[0.04] bg-[var(--bg-surface)]/40 backdrop-blur-md',
                  'hover:bg-[var(--bg-surface)]/60 hover:border-white/[0.08] active:scale-[0.98]'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-lg mt-0.5 group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">
                  {s.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        <InputBar
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGeneratingLocal}
        />
      </div>
    );
  }

  /* ── Chat avec messages ── */
  return (
    <div className="flex flex-col h-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-fade scrollbar-hidden">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {displayMessages.map((msg: any, i: number) => (
            <MessageBubble
              key={msg.id}
              role={msg.role as 'user' | 'assistant'}
              content={msg.content}
              isStreaming={isGeneratingLocal && msg.role === 'assistant' && i === displayMessages.length - 1}
              onRegenerate={
                msg.role === 'assistant' && i === displayMessages.length - 1
                  ? handleRegenerate
                  : undefined
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <InputBar
        onSend={handleSend}
        onStop={handleStop}
        isGenerating={isGeneratingLocal}
      />
    </div>
  );
}
