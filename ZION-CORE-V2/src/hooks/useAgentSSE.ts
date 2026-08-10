/**
 * GabomaAI · useAgentSSE Hook
 * SmartANDJ AI Technologies
 * Hook SSE via Fetch API — distribue les événements au agentStore.
 */

'use client';

import { useCallback, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';

interface StartSSEParams {
  prompt: string;
  sessionId: string;
  threadId: string;
  agentName?: string;
}

export function useAgentSSE() {
  const abortRef = useRef<AbortController | null>(null);

  const {
    setPhase,
    addTask,
    updateTask,
    addArtifact,
    appendTerminalLine,
    setCurrentUrl,
    appendStreamedText,
    setError,
  } = useAgentStore.getState();

  const startSSE = useCallback(async (params: StartSSEParams) => {
    // Abort précédent si actif
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const store = useAgentStore.getState();
    store.setPhase('executing');

    const searchParams = new URLSearchParams({
      prompt: params.prompt,
      thread_id: params.threadId,
      agent_name: params.agentName ?? 'lead_agent',
    });

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
    const url = `${backendUrl}/api/agent/stream/${params.sessionId}?${searchParams}`;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`SSE HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Pas de body reader');

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
            const event = JSON.parse(jsonStr);
            handleEvent(event);
          } catch {
            // JSON malformé, on ignore
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'Erreur SSE inconnue';
      setError(message);
    }
  }, []);

  const stopSSE = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    useAgentStore.getState().setPhase('idle');
  }, []);

  return { startSSE, stopSSE };
}

// ── Dispatch des événements SSE ──────────────────
function handleEvent(event: Record<string, unknown>) {
  const store = useAgentStore.getState();

  switch (event.type) {
    case 'token':
      store.appendStreamedText(event.content as string);
      break;

    case 'task_start': {
      const taskId = `task-${Date.now()}`;
      store.addTask({
        id: taskId,
        label: event.task as string,
        status: 'running',
        timestamp: Date.now(),
      });
      store.setPhase('executing');
      break;
    }

    case 'task_done':
      if (event.task_id) {
        store.updateTask(event.task_id as string, { status: 'done' });
      }
      break;

    case 'browser_navigate':
      store.setCurrentUrl(event.url as string);
      store.setPhase('browsing');
      break;

    case 'terminal':
      store.appendTerminalLine(event.content as string);
      break;

    case 'artifact':
      store.addArtifact({
        id: `art-${Date.now()}`,
        file: event.file as string,
        content: event.content as string,
        type: guessArtifactType(event.file as string),
        timestamp: Date.now(),
      });
      store.setPhase('writing');
      break;

    case 'error':
      store.setError(event.content as string);
      break;

    case 'done':
      store.setPhase('done');
      break;
  }
}

function guessArtifactType(filename: string): 'code' | 'markdown' | 'html' | 'docx' | 'xlsx' | 'image' | 'unknown' {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['py', 'ts', 'tsx', 'js', 'jsx', 'json', 'yaml', 'yml', 'css', 'sql'].includes(ext)) return 'code';
  if (['md', 'txt'].includes(ext)) return 'markdown';
  if (['html', 'htm'].includes(ext)) return 'html';
  if (ext === 'docx') return 'docx';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'xlsx';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  return 'unknown';
}
