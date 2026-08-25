import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isGenerating: boolean;

  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addConversation: (conv: Conversation) => void;
  removeConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;

  addMessage: (convId: string, msg: Message) => void;
  updateLastAssistantMessage: (convId: string, content: string) => void;
  setStreaming: (convId: string, msgId: string, streaming: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  clearMessages: (convId: string) => void;

  getActiveConversation: () => Conversation | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set: any, get: any) => ({
      conversations: [],
      activeConversationId: null,
      isGenerating: false,

  setConversations: (convs: Conversation[]) => set({ conversations: convs }),
  setActiveConversation: (id: string | null) => set({ activeConversationId: id }),

  addConversation: (conv: Conversation) =>
    set((s: ChatState) => ({ conversations: [conv, ...s.conversations] })),

  removeConversation: (id: string) =>
    set((s: ChatState) => ({
      conversations: s.conversations.filter((c: Conversation) => c.id !== id),
      activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
    })),

  updateConversationTitle: (id: string, title: string) =>
    set((s: ChatState) => ({
      conversations: s.conversations.map((c: Conversation) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c
      ),
    })),

  addMessage: (convId: string, msg: Message) =>
    set((s: ChatState) => ({
      conversations: s.conversations.map((c: Conversation) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
          : c
      ),
    })),

  updateLastAssistantMessage: (convId: string, content: string) =>
    set((s: ChatState) => ({
      conversations: s.conversations.map((c: Conversation) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
          msgs[lastIdx] = { ...msgs[lastIdx], content };
        }
        return { ...c, messages: msgs };
      }),
    })),

  setStreaming: (convId: string, msgId: string, streaming: boolean) =>
    set((s: ChatState) => ({
      conversations: s.conversations.map((c: Conversation) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map((m: Message) =>
            m.id === msgId ? { ...m, isStreaming: streaming } : m
          ),
        };
      }),
    })),

  setIsGenerating: (v: boolean) => set({ isGenerating: v }),

  clearMessages: (convId: string) =>
    set((s: ChatState) => ({
      conversations: s.conversations.map((c: Conversation) =>
        c.id === convId ? { ...c, messages: [] } : c
      ),
    })),

  getActiveConversation: () => {
    const s: ChatState = get();
    return s.conversations.find((c: Conversation) => c.id === s.activeConversationId);
  },
}),
    {
      name: 'Nkyel_Chat_Storage_V2',
    }
  )
);
