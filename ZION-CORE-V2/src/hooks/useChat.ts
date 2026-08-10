/**
 * GabomaAI · useChat Hook
 * SmartANDJ AI Technologies
 * Task 4 — SSE streaming chat avec reconnexion auto
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { GabomaMessage, GabomaModel, GabomaSource } from '@/lib/models';
import { useRenduPanel } from '@/hooks/useRenduPanel';

interface UseChatParams {
  conversationId: string | null;
  model: GabomaModel;
  loxoEnabled: boolean;
  loxoRAGEnabled: boolean;
}

interface UseChatReturn {
  messages: GabomaMessage[];
  isStreaming: boolean;
  sources: GabomaSource[];
  error: string | null;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  stop: () => void;
  clearError: () => void;
  setMessages: React.Dispatch<React.SetStateAction<GabomaMessage[]>>;
}

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

export function useChat({ conversationId, model, loxoEnabled, loxoRAGEnabled }: UseChatParams): UseChatReturn {
  const [messages, setMessages] = useState<GabomaMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState<GabomaSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const renduPanel = useRenduPanel();

  const clearError = useCallback(() => setError(null), []);

  const stop = useCallback(() => {
    readerRef.current?.cancel();
    readerRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim()) return;

    setError(null);
    setSources([]);

    const userMsg: GabomaMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      created_at: Date.now(),
    };

    const assistantMsg: GabomaMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      model,
      sources: [],
      created_at: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const body: Record<string, unknown> = {
          conversationId,
          model,
          content: content.trim(),
          loxoEnabled,
          loxoRAGEnabled,
        };

        if (attachments && attachments.length > 0) {
          const formData = new FormData();
          formData.append('payload', JSON.stringify(body));
          attachments.forEach((f) => formData.append('files', f));
        }

        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`Erreur serveur (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('Pas de flux de réponse');
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr) as Record<string, unknown>;

              switch (event.type) {
                case 'token':
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...last,
                        content: last.content + (event.content as string),
                      };
                    }
                    return updated;
                  });
                  break;

                case 'source': {
                  const src: GabomaSource = {
                    url: event.url as string,
                    title: event.title as string,
                    snippet: event.snippet as string | undefined,
                    favicon: event.favicon as string | undefined,
                    type: (event.source_type as GabomaSource['type']) ?? 'loxo_web',
                  };
                  setSources((prev) => [...prev, src]);
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...last,
                        sources: [...(last.sources ?? []), src],
                      };
                    }
                    return updated;
                  });
                  break;
                }

                case 'rendu':
                  if (event.artifact) {
                    const rendu = event.artifact as {
                      id: string;
                      type: string;
                      title: string;
                      content?: string;
                      url?: string;
                    };
                    const gabomaRendu = {
                      id: rendu.id,
                      type: rendu.type as GabomaSource['type'] extends string ? string : never,
                      title: rendu.title,
                      content: rendu.content,
                      url: rendu.url,
                      created_at: Date.now(),
                    };
                    renduPanel.openRendu(gabomaRendu as never);
                  }
                  break;

                case 'done':
                  setIsStreaming(false);
                  break;

                case 'error':
                  setError(event.message as string);
                  setIsStreaming(false);
                  break;
              }
            } catch {
              // JSON malformé, on ignore
            }
          }
        }

        success = true;
        setIsStreaming(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          success = true;
          break;
        }
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, BACKOFF_MS[retries - 1]));
        } else {
          const msg = err instanceof Error ? err.message : 'Erreur de connexion';
          setError(msg);
          setIsStreaming(false);
        }
      }
    }
  }, [conversationId, model, loxoEnabled, loxoRAGEnabled, renduPanel]);

  return { messages, isStreaming, sources, error, sendMessage, stop, clearError, setMessages };
}
