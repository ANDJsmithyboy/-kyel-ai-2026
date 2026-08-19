/**
 * Ñkyel AI — AG-UI Adapter
 *
 * Adapts backend SSE events into the Canonical Event format,
 * bridging the Agent Runtime ↔ Visual Workspace.
 *
 * Maps the AG-UI protocol lifecycle events:
 * - Run lifecycle (created, running, completed, cancelled)
 * - Text messages
 * - Tool calls and results
 * - State snapshots and deltas
 * - Activity/progress updates
 * - Errors, interruptions
 * - Human approvals
 *
 * @version 1.0.0
 */

import type { NkyelEvent, NkyelEventType, WorkNode } from './work-graph.types';
import { eventStore } from './event-store';

// ─── AG-UI Event Types (mapped from backend SSE) ────────

interface AgUiRawEvent {
  type: string;
  data?: Record<string, unknown>;
  step?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── ID Generator ───────────────────────────────────────

let agUiIdCounter = 0;
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++agUiIdCounter}`;
}

// ─── AG-UI to Ñkyel Event Mapper ────────────────────────

function mapAgUiEventToNkyelEvent(raw: AgUiRawEvent, runId: string): NkyelEvent | null {
  const baseEvent = {
    id: genId('evt'),
    version: '1.0.0',
    runId,
  };

  switch (raw.type) {
    // ── Native NkyelEvents (Pass-through) ──
    case 'goal.received':
    case 'plan.created':
    case 'plan.updated':
    case 'task.created':
    case 'task.started':
    case 'task.completed':
    case 'task.failed':
    case 'agent.spawned':
    case 'tool.requested':
    case 'tool.started':
    case 'tool.completed':
    case 'tool.failed':
    case 'source.added':
    case 'claim.created':
    case 'evidence.linked':
    case 'hypothesis.created':
    case 'hypothesis.rejected':
    case 'artifact.created':
    case 'checkpoint.created':
    case 'run.interrupted':
    case 'run.resumed':
    case 'run.cancelled':
    case 'replan.requested':
    case 'replan.completed':
    case 'final.delivered':
      return {
        ...baseEvent,
        type: raw.type as NkyelEventType,
        sequenceNumber: 0,
        timestamp: '',
        node: raw.data?.node as any,
        edge: raw.data?.edge as any,
        payload: raw.data?.payload as any,
      };

    // ── Run Lifecycle ──
    case 'run_started':
    case 'lifecycle':
      if (raw.data?.status === 'started' || raw.data?.phase === 'start') {
        return {
          ...baseEvent,
          type: 'run.created',
          sequenceNumber: 0,
          timestamp: '',
          payload: raw.data,
        };
      }
      return null;

    // ── Planning ──
    case 'plan_created':
    case 'coordinator':
      return {
        ...baseEvent,
        type: 'plan.created',
        sequenceNumber: 0,
        timestamp: '',
        node: {
          id: genId('plan'),
          type: 'plan',
          version: '1.0.0',
          title: (raw.data?.title as string) || 'Plan',
          summary: raw.data?.summary as string,
          status: 'active',
          provenance: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    // ── Task Events ──
    case 'task_started':
    case 'agent_step':
      return {
        ...baseEvent,
        type: 'task.started',
        sequenceNumber: 0,
        timestamp: '',
        node: {
          id: genId('task'),
          type: 'task',
          version: '1.0.0',
          title: (raw.step?.type as string) || (raw.data?.task_name as string) || 'Task',
          summary: raw.step?.description as string,
          status: 'active',
          provenance: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    // ── Tool Calls ──
    case 'tool_call':
    case 'tool_started':
      return {
        ...baseEvent,
        type: 'tool.started',
        sequenceNumber: 0,
        timestamp: '',
        toolCallId: raw.data?.toolCallId as string,
        node: {
          id: genId('tool'),
          type: 'tool_call',
          version: '1.0.0',
          title: (raw.data?.toolName as string) || 'Tool',
          status: 'active',
          provenance: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'tool_result':
    case 'tool_completed':
      return {
        ...baseEvent,
        type: 'tool.completed',
        sequenceNumber: 0,
        timestamp: '',
        toolCallId: raw.data?.toolCallId as string,
        payload: { result: raw.data?.result },
      };

    // ── Web Search / Source ──
    case 'wandana_search':
    case 'web_search':
    case 'tavily_search':
      return {
        ...baseEvent,
        type: 'source.added',
        sequenceNumber: 0,
        timestamp: '',
        node: {
          id: genId('source'),
          type: 'source',
          version: '1.0.0',
          title: (raw.data?.query as string) || 'Web Search',
          summary: raw.data?.snippet as string,
          sourceRef: raw.data?.url as string,
          status: 'completed',
          provenance: 'retrieved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    // ── Text Message (AI Response) ──
    case 'messages-tuple':
    case 'text_message':
      if (raw.data?.type === 'ai' && raw.data?.content) {
        return {
          ...baseEvent,
          type: 'artifact.created',
          sequenceNumber: 0,
          timestamp: '',
          node: {
            id: genId('artifact'),
            type: 'artifact',
            version: '1.0.0',
            title: 'Response',
            summary: (raw.data.content as string).substring(0, 200),
            status: 'completed',
            provenance: 'generated',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return null;

    // ── Approval Requests ──
    case 'approval_request':
      return {
        ...baseEvent,
        type: 'approval.requested',
        sequenceNumber: 0,
        timestamp: '',
        node: {
          id: genId('approval'),
          type: 'approval',
          version: '1.0.0',
          title: (raw.data?.action as string) || 'Approval Required',
          summary: raw.data?.description as string,
          status: 'waiting_approval',
          provenance: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    // ── Errors ──
    case 'error':
      return {
        ...baseEvent,
        type: 'task.failed',
        sequenceNumber: 0,
        timestamp: '',
        node: {
          id: genId('error'),
          type: 'error',
          version: '1.0.0',
          title: 'Error',
          summary: (raw.data?.message as string) || 'Unknown error',
          status: 'failed',
          provenance: 'generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

    // ── Run End ──
    case 'run_completed':
    case 'final':
      return {
        ...baseEvent,
        type: 'final.delivered',
        sequenceNumber: 0,
        timestamp: '',
        payload: raw.data,
      };

    default:
      // Unknown event types are logged but not emitted
      console.debug(`[AG-UI Adapter] Unknown event type: ${raw.type}`, raw);
      return null;
  }
}

// ─── SSE Stream Processor ───────────────────────────────

export class AgUiStreamAdapter {
  private runId: string;
  private abortController: AbortController | null = null;

  constructor(runId: string) {
    this.runId = runId;
  }

  /**
   * Connect to the backend SSE endpoint and pipe events
   * into the Ñkyel Event Store.
   */
  async connect(url: string, body: Record<string, unknown>): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`AG-UI stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;

          try {
            const raw: AgUiRawEvent = JSON.parse(dataStr);
            const nkyelEvent = mapAgUiEventToNkyelEvent(raw, this.runId);
            if (nkyelEvent) {
              eventStore.append(nkyelEvent);
            }
          } catch (e) {
            console.error('[AG-UI Adapter] Parse error:', e);
          }
        }
      }

      // Emit final.delivered if not already done
      eventStore.append({
        id: genId('evt'),
        type: 'final.delivered',
        version: '1.0.0',
        runId: this.runId,
        sequenceNumber: 0,
        timestamp: '',
      });

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[AG-UI Adapter] Stream error:', error);
        eventStore.append({
          id: genId('evt'),
          type: 'run.cancelled',
          version: '1.0.0',
          runId: this.runId,
          sequenceNumber: 0,
          timestamp: '',
          payload: { error: (error as Error).message },
        });
      }
    }
  }

  /** Disconnect the stream */
  disconnect(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}

export { mapAgUiEventToNkyelEvent };
