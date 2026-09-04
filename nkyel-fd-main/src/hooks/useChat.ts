/**
 * Nkyel AI · useChat Hook
 * SmartANDJ AI Technologies
 * Task 4 — SSE streaming chat avec reconnexion auto
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { NkyelMessage, NkyelModel, NkyelSource } from '@/lib/models';
import { useRenduPanel } from '@/hooks/useRenduPanel';
import {
  createMissionStartedEvent,
  initialVisualState,
  reduceVisualState,
  normalizeSseEvent,
  type NkyelVisualState,
} from '@/lib/visualEvents';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { mapAgUiEventToNkyelEvent } from '@/lib/nkyel/ag-ui-adapter';
import { getApiBaseUrl } from '@/lib/api/client';
import { useAuth } from '@clerk/nextjs';

interface UseChatParams {
  conversationId: string | null;
  model: NkyelModel | string;
  loxoEnabled: boolean;
  loxoRAGEnabled: boolean;
}

interface UseChatReturn {
  messages: NkyelMessage[];
  isStreaming: boolean;
  sources: NkyelSource[];
  error: string | null;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  stop: () => void;
  clearError: () => void;
  setMessages: React.Dispatch<React.SetStateAction<NkyelMessage[]>>;
  visualState: NkyelVisualState;
}

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

export function useChat({ conversationId, model, loxoEnabled, loxoRAGEnabled }: UseChatParams): UseChatReturn {
  const [messages, setMessages] = useState<NkyelMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState<NkyelSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visualState, setVisualState] = useState<NkyelVisualState>(initialVisualState);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const renduPanel = useRenduPanel();
  const { getToken, isSignedIn } = useAuth();

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

    if (!isSignedIn) {
      setError("Vous devez être connecté pour lancer une mission.");
      return;
    }

    setError(null);
    setSources([]);

    const runId = `run-${Date.now()}`;
    const requestId = `req-${Date.now()}`;
    const started = createMissionStartedEvent(runId, conversationId, requestId);
    setVisualState({ ...initialVisualState, status: 'submitting', events: [started], lastEventAt: started.timestamp });

    const userMsg: NkyelMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      created_at: Date.now(),
    };

    const assistantMsg: NkyelMessage = {
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
          mission_id: conversationId,
          run_id: runId,
          message: content.trim(),
          engine: 'DEERFLOW',
          features: { deepResearch: true, executiveArtifacts: true },
          language: 'fr',
        };

        if (attachments && attachments.length > 0) {
          const formData = new FormData();
          formData.append('payload', JSON.stringify(body));
          attachments.forEach((f) => formData.append('files', f));
        }

        // Extract clerk token properly via Next.js hook
        let token: string | null = null;
        try {
          token = await getToken();
        } catch (e) {
          console.warn('[useChat] Failed to get Clerk token', e);
        }
        
        if (!token) {
          throw new Error("Erreur d'authentification : Token manquant. Veuillez vous reconnecter.");
        }

        const headers: Record<string, string> = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/v1/nkyel/run`, {
          method: 'POST',
          signal: controller.signal,
          headers,
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
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('data: ')) continue;
            const jsonStr = trimmedLine.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr) as Record<string, unknown>;
              
              // Local visual state for backwards compatibility
              const visualEvent = normalizeSseEvent(event, { runId, threadId: conversationId, requestId });
              if (visualEvent) setVisualState((previous) => reduceVisualState(previous, visualEvent));

              // 1. Sync real events to WorkGraph
              const nkyelEvent = mapAgUiEventToNkyelEvent(event as any, runId);
              if (nkyelEvent) {
                useWorkGraphStore.getState().emitEvent(nkyelEvent);
              }

              const evtType = (event.event_type || event.type || event.ag_ui_type || '') as string;

              switch (evtType) {
                case 'token':
                case 'TEXT_MESSAGE_CHUNK': {
                  const tokenText = (event.content || (event.data as any)?.content || (event.delta as any)?.text || '') as string;
                  if (tokenText) {
                    setMessages((prev) => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last && last.role === 'assistant') {
                        updated[updated.length - 1] = {
                          ...last,
                          content: last.content + tokenText,
                        };
                      }
                      return updated;
                    });
                  }
                  break;
                }

                case 'messages-tuple':
                case 'TEXT_MESSAGE_CONTENT': {
                  const fullText = (event.content || (event.data as any)?.content || '') as string;
                  if (fullText) {
                    setMessages((prev) => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last && last.role === 'assistant') {
                        updated[updated.length - 1] = {
                          ...last,
                          content: fullText,
                        };
                      }
                      return updated;
                    });
                  }
                  break;
                }

                case 'source':
                case 'source_found': {
                  const rawSrc = (event.source || (event.data as any)?.source || event.payload || event) as any;
                  if (rawSrc && (rawSrc.url || rawSrc.title)) {
                    const src: NkyelSource = {
                      url: rawSrc.url || '',
                      title: rawSrc.title || rawSrc.domain || 'Source Web',
                      snippet: rawSrc.snippet || rawSrc.excerpt || undefined,
                      favicon: rawSrc.favicon || undefined,
                      type: (rawSrc.source_type as NkyelSource['type']) ?? 'loxo_web',
                    };
                    setSources((prev) => {
                      if (prev.some((s) => s.url === src.url)) return prev;
                      return [...prev, src];
                    });
                    setMessages((prev) => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last && last.role === 'assistant') {
                        const existing = last.sources ?? [];
                        if (!existing.some((s) => s.url === src.url)) {
                          updated[updated.length - 1] = {
                            ...last,
                            sources: [...existing, src],
                          };
                        }
                      }
                      return updated;
                    });
                  }
                  break;
                }

                case 'rendu':
                case 'artifact_created': {
                  const rawArt = (event.artifact || (event.data as any)?.artifact || event.payload || event) as any;
                  if (rawArt && (rawArt.id || rawArt.artifact_id)) {
                    const nkyelRendu = {
                      id: rawArt.artifact_id || rawArt.id,
                      type: (rawArt.type || rawArt.artifact_type || 'document') as NkyelSource['type'] extends string ? string : never,
                      title: rawArt.title || 'Livrable Souverain',
                      content: rawArt.content,
                      url: rawArt.storage_url || rawArt.url,
                      created_at: Date.now(),
                    };
                    try {
                      renduPanel.openRendu(nkyelRendu as never);
                    } catch {}
                  }
                  break;
                }

                case 'done':
                case 'run_completed':
                case 'RUN_FINISHED':
                  setIsStreaming(false);
                  break;

                case 'run_cancelled':
                  setIsStreaming(false);
                  break;

                case 'error':
                case 'RUN_ERROR':
                  setError((event.message || (event.data as any)?.message || 'Erreur d’exécution') as string);
                  setIsStreaming(false);
                  break;
              }
            } catch {
              // JSON chunk error - ignore
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
          // Si l'assistant n'a rien reçu, lui donner un message d'erreur clair
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              updated[updated.length - 1] = {
                ...last,
                content: "Désolé, une coupure de connexion est survenue. Veuillez renvoyer votre message.",
              };
            }
            return updated;
          });
        }
      }
    }
  }, [conversationId, model, loxoEnabled, loxoRAGEnabled, messages, renduPanel]);

  return { messages, isStreaming, sources, error, sendMessage, stop, clearError, setMessages, visualState };
}
