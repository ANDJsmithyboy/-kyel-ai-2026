/**
 * GabomaAI · useAgent Hook
 * SmartANDJ AI Technologies
 * Task 8 — SSE streaming agent (ONYX / BLACK PANTHER)
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { GabomaModel, GabomaRendu, AgentEvent, AgentFile, AgentPhase } from '@/lib/models';
import { resolveEventLabel } from '@/lib/agentEvents';
import { useRenduPanel } from '@/hooks/useRenduPanel';

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

interface UseAgentReturn {
  events: AgentEvent[];
  phase: AgentPhase;
  currentUrl: string;
  files: AgentFile[];
  artifacts: GabomaRendu[];
  streamedText: string;
  isStreaming: boolean;
  error: string | null;
  startAgent: (prompt: string, model: GabomaModel) => Promise<void>;
  stop: () => void;
}

export function useAgent(): UseAgentReturn {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [phase, setPhase] = useState<AgentPhase>('idle');
  const [currentUrl, setCurrentUrl] = useState('');
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [artifacts, setArtifacts] = useState<GabomaRendu[]>([]);
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const renduPanel = useRenduPanel();

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setPhase('done');
  }, []);

  const startAgent = useCallback(async (prompt: string, model: GabomaModel) => {
    setEvents([]);
    setPhase('planning');
    setCurrentUrl('');
    setFiles([]);
    setArtifacts([]);
    setStreamedText('');
    setError(null);
    setIsStreaming(true);

    const agentType = (model === 'BLACK_PANTHER' || model === 'BLUE_PANTHER') ? 'black-panther' : 'onyx';
    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const startRes = await fetch('/api/agent/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, agent: agentType }),
          signal: controller.signal,
        });

        if (!startRes.ok) throw new Error(`Erreur démarrage (${startRes.status})`);
        const { session_id, thread_id, agent_name } = await startRes.json() as {
          session_id: string;
          thread_id: string;
          agent_name: string;
        };

        const params = new URLSearchParams({
          prompt,
          thread_id,
          agent_name,
        });

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
        const sseRes = await fetch(`${backendUrl}/api/agent/stream/${session_id}?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'text/event-stream' },
        });

        if (!sseRes.ok) throw new Error(`SSE (${sseRes.status})`);
        const reader = sseRes.body?.getReader();
        if (!reader) throw new Error('Pas de flux');

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
            if (!jsonStr) continue;

            try {
              const evt = JSON.parse(jsonStr) as Record<string, unknown>;
              handleAgentEvent(evt);
            } catch {
              // skip
            }
          }
        }

        success = true;
        setIsStreaming(false);
        if (phase !== 'error') setPhase('done');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') { success = true; break; }
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, BACKOFF_MS[retries - 1]));
        } else {
          setError(err instanceof Error ? err.message : 'Erreur agent');
          setPhase('error');
          setIsStreaming(false);
        }
      }
    }

    function handleAgentEvent(evt: Record<string, unknown>) {
      switch (evt.type) {
        case 'phase':
          setPhase(evt.phase as AgentPhase);
          break;

        case 'task_start': {
          const resolved = resolveEventLabel(evt.event_type as string ?? 'unknown');
          const newEvent: AgentEvent = {
            id: evt.id as string ?? `evt-${Date.now()}`,
            type: evt.event_type as string ?? 'unknown',
            label: resolved.label,
            icon_key: resolved.icon_key,
            status: 'active',
            started_at: Date.now(),
          };
          setEvents((prev) => [...prev, newEvent]);
          setPhase('executing');
          break;
        }

        case 'task_done':
          setEvents((prev) =>
            prev.map((e) =>
              e.id === (evt.id as string)
                ? { ...e, status: 'done' as const, duration_ms: Date.now() - (e.started_at ?? Date.now()) }
                : e
            )
          );
          break;

        case 'task_error':
          setEvents((prev) =>
            prev.map((e) =>
              e.id === (evt.id as string) ? { ...e, status: 'error' as const } : e
            )
          );
          break;

        case 'token':
          setStreamedText((prev) => prev + (evt.content as string));
          break;

        case 'browser_navigate':
          setCurrentUrl(evt.url as string);
          setPhase('executing');
          break;

        case 'file_created':
          setFiles((prev) => [...prev, {
            name: evt.name as string,
            path: evt.path as string,
            size: (evt.size as number) ?? 0,
            type: evt.file_type as string ?? 'unknown',
          }]);
          break;

        case 'artifact': {
          const rendu: GabomaRendu = {
            id: `rendu-${Date.now()}`,
            type: (evt.artifact_type as GabomaRendu['type']) ?? 'code',
            title: evt.title as string ?? 'Le Rendu',
            content: evt.content as string,
            url: evt.url as string | undefined,
            created_at: Date.now(),
          };
          setArtifacts((prev) => [...prev, rendu]);
          renduPanel.openRendu(rendu);
          break;
        }

        case 'error':
          setError(evt.content as string ?? evt.message as string);
          setPhase('error');
          break;

        case 'done':
          setPhase('done');
          setIsStreaming(false);
          break;
      }
    }
  }, [renduPanel, phase]);

  return { events, phase, currentUrl, files, artifacts, streamedText, isStreaming, error, startAgent, stop };
}
