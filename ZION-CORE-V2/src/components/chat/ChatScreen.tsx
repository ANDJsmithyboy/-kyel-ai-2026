'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Send, Plus, Search } from 'lucide-react';
import ChatNavbar from './ChatNavbar';
import ChatMessages from './ChatMessages';
import ChatPlaceholder from './ChatPlaceholder';
import MessageInput from './MessageInput';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: string;
  thinkingMode?: 'default' | 'search' | 'legal' | 'panther' | 'payment' | 'language' | 'image' | 'analytics';
}

interface ConversationState {
  id: string;
  title: string;
  messages: Message[];
  currentId: string;
}

export default function ChatScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversation, setConversation] = useState<ConversationState>({
    id: 'new',
    title: 'Nouvelle Conversation',
    messages: [],
    currentId: 'placeholder'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, scrollToBottom]);

  const handleNewChat = () => {
    setConversation({
      id: 'new',
      title: 'Nouvelle Conversation',
      messages: [],
      currentId: 'placeholder'
    });
    setError(null);
  };

  const handleSendMessage = async (text: string, files?: File[]) => {
    if (!text.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentId: userMessage.id
    }));

    setIsLoading(true);
    setError(null);

    try {
      // Appel API (à implémenter avec votre backend)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: conversation.id })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Ajouter la réponse assistant
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        thinkingMode: data.thinkingMode || 'default',
        thinking: data.thinking
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }));
    } catch (err) {
      setError({
        code: 500,
        message: err instanceof Error ? err.message : 'Une erreur est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--zc-background)]">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border)] bg-[var(--zc-surface)] transition-transform duration-300 sm:relative sm:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <img src="/gabomagpt-logo.jpeg" alt="GabomaGPT" className="h-8 rounded" />
            <button className="p-2 hover:bg-[var(--accent-10)] rounded-lg transition-colors md:hidden">
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 m-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            <span>Nouvelle conversation</span>
          </button>

          {/* Search */}
          <div className="mx-4 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-surface)]">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent text-sm text-[var(--text-primary)] outline-none flex-1 placeholder-[var(--text-tertiary)]"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2">
            {/* Placeholder for conversation list */}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border)] p-4 space-y-2">
            <div className="text-xs text-[var(--text-secondary)] text-center">
              © 2026 SmartANDJ AI Technologies
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <ChatNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {conversation.messages.length === 0 ? (
            <ChatPlaceholder userName={user?.name} />
          ) : (
            <>
              <ChatMessages
                messages={conversation.messages}
                isLoading={isLoading}
                error={error}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <MessageInput
          onSubmit={handleSendMessage}
          disabled={isLoading}
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
