/**
 * Ñkyel AI · useConversations Hook
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * PRODUCTION CONTRACT: Conversations + Messages persist in Neon.
 * After refresh: full chat history restored from PostgreSQL.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getWorkspaceId } from './useNeonSync';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface NeonConversation {
  id: string;
  workspace_id: string;
  title: string | null;
  conversation_type: string;
  model_profile: string | null;
  status: string;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NeonMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  model_id: string | null;
  token_count: number | null;
  parent_message_id: string | null;
  created_at: string;
}

export function useConversations() {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<NeonConversation[]>([]);
  const [messages, setMessages] = useState<NeonMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const headers = useCallback(async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [getToken]);

  // ── Load conversation list ──────────────────────────────
  const fetchConversations = useCallback(async () => {
    const wsId = getWorkspaceId();
    if (!wsId) return;

    try {
      setIsLoading(true);
      const h = await headers();
      const res = await fetch(
        `${API_BASE}/api/v1/conversations?workspace_id=${wsId}`,
        { headers: h }
      );
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('[Conversations] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  // ── Create new conversation ─────────────────────────────
  const createConversation = useCallback(async (
    title?: string,
    type: string = 'CHAT',
    modelProfile?: string,
  ): Promise<NeonConversation | null> => {
    const wsId = getWorkspaceId();
    if (!wsId) return null;

    try {
      const h = await headers();
      const res = await fetch(`${API_BASE}/api/v1/conversations`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({
          workspace_id: wsId,
          title,
          conversation_type: type,
          model_profile: modelProfile,
        }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations(prev => [conv, ...prev]);
        setCurrentConversationId(conv.id);
        setMessages([]);
        return conv;
      }
    } catch (err) {
      console.error('[Conversations] Create error:', err);
    }
    return null;
  }, [headers]);

  // ── Load messages for a conversation ────────────────────
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      const h = await headers();
      const res = await fetch(
        `${API_BASE}/api/v1/conversations/${conversationId}/messages`,
        { headers: h }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setCurrentConversationId(conversationId);
      }
    } catch (err) {
      console.error('[Conversations] Fetch messages error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  // ── Persist a message ───────────────────────────────────
  const persistMessage = useCallback(async (
    conversationId: string,
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string,
    modelId?: string,
    extras?: {
      parentMessageId?: string;
      toolCalls?: any;
      sources?: any[];
      artifacts?: any[];
    },
  ): Promise<NeonMessage | null> => {
    try {
      const h = await headers();
      const res = await fetch(
        `${API_BASE}/api/v1/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: h,
          body: JSON.stringify({
            role,
            content,
            model_id: modelId,
            parent_message_id: extras?.parentMessageId,
            tool_calls_json: extras?.toolCalls,
            sources_json: extras?.sources,
            artifacts_json: extras?.artifacts,
          }),
        }
      );
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        return msg;
      }
    } catch (err) {
      console.error('[Conversations] Persist message error:', err);
    }
    return null;
  }, [headers]);

  // ── Update conversation title ───────────────────────────
  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const h = await headers();
      await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({ title }),
      });
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, title } : c)
      );
    } catch (err) {
      console.error('[Conversations] Update title error:', err);
    }
  }, [headers]);

  // ── Delete conversation ─────────────────────────────────
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const h = await headers();
      await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: h,
      });
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('[Conversations] Delete error:', err);
    }
  }, [headers, currentConversationId]);

  return {
    conversations,
    messages,
    currentConversationId,
    isLoading,
    fetchConversations,
    createConversation,
    fetchMessages,
    persistMessage,
    updateTitle,
    deleteConversation,
    setCurrentConversationId,
  };
}
