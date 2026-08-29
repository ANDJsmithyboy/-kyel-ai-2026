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
  isLoading: boolean;
  error: string | null;

  availableProfiles: any[];
  isProfilesLoading: boolean;

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
  fetchConversations: () => Promise<void>;
  fetchProfiles: () => Promise<void>;

  getActiveConversation: () => Conversation | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set: any, get: any) => ({
      conversations: [],
      activeConversationId: null,
      isGenerating: false,
      isLoading: false,
      error: null,
      availableProfiles: [],
      isProfilesLoading: false,

  fetchProfiles: async () => {
    try {
      set({ isProfilesLoading: true });
      // TODO: Replace with real Neon backend endpoint when ready
      const res = await fetch('/api/v1/profiles');
      if (!res.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await res.json();
      set({ availableProfiles: data.profiles || [], isProfilesLoading: false });
    } catch (err: any) {
      console.warn('[ChatStore] fetchProfiles error:', err);
      set({ 
        availableProfiles: [], 
        isProfilesLoading: false 
      });
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Replace with real Neon backend endpoint when ready
      const res = await fetch('/api/v1/missions');
      if (!res.ok) {
        throw new Error('Failed to fetch missions');
      }
      const data = await res.json();
      set({ conversations: data.missions || [], isLoading: false });
    } catch (err: any) {
      // If endpoint doesn't exist yet, we still resolve gracefully as EMPTY, not necessarily breaking the UI,
      // but we log the real error. We'll set error so UI can display real error state if needed.
      console.warn('[ChatStore] fetchConversations error:', err);
      set({ error: err.message || 'Error loading missions', isLoading: false });
    }
  },

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
