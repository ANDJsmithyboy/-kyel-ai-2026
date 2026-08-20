/**
 * Ñkyel AI — Canonical Protocol Events Bus
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Implements typed protocol events:
 * - mcp.*
 * - skill.*
 * - a2a.*
 * - agui.*
 * - a2ui.*
 * - ap2.* / ucp.*
 * - provider.*
 */

import type {
  MCPServerConfig,
  NkyelSkill,
  A2AAgentCard,
  A2ADelegation,
  AGUIApprovalRequest,
  A2UISurfaceSpec,
  AP2PaymentMandate,
} from './protocols.types';

export type CanonicalProtocolEventType =
  | 'mcp.server.connected'
  | 'mcp.tool.called'
  | 'mcp.resource.read'
  | 'mcp.prompt.loaded'
  | 'mcp.app.rendered'
  | 'skill.discovered'
  | 'skill.loaded'
  | 'skill.executed'
  | 'a2a.agent.discovered'
  | 'a2a.task.delegated'
  | 'a2a.message.received'
  | 'a2a.artifact.received'
  | 'agui.state.updated'
  | 'agui.approval.required'
  | 'a2ui.surface.created'
  | 'a2ui.surface.updated'
  | 'ap2.mandate.requested'
  | 'ap2.mandate.approved'
  | 'ucp.checkout.started'
  | 'provider.operation.started'
  | 'provider.operation.progress'
  | 'provider.operation.completed'
  | 'provider.operation.failed';

export interface ProtocolLogEvent {
  id: string;
  type: CanonicalProtocolEventType;
  protocol: 'mcp' | 'skill' | 'a2a' | 'agui' | 'a2ui' | 'ap2' | 'ucp' | 'provider';
  timestamp: string;
  runId?: string;
  summary: string;
  latencyMs?: number;
  status: 'success' | 'warning' | 'error' | 'pending';
  payload: Record<string, unknown>;
}

type EventListener = (event: ProtocolLogEvent) => void;

class ProtocolEventBus {
  private listeners: Set<EventListener> = new Set();
  private history: ProtocolLogEvent[] = [];
  private maxHistory = 300;

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(
    type: CanonicalProtocolEventType,
    protocol: ProtocolLogEvent['protocol'],
    summary: string,
    payload: Record<string, unknown> = {},
    status: ProtocolLogEvent['status'] = 'success',
    latencyMs?: number,
    runId?: string
  ): ProtocolLogEvent {
    const event: ProtocolLogEvent = {
      id: `pevt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      protocol,
      timestamp: new Date().toISOString(),
      runId,
      summary,
      latencyMs,
      status,
      payload,
    };

    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in protocol event listener:', err);
      }
    });

    return event;
  }

  getHistory(filterProtocol?: ProtocolLogEvent['protocol']): ProtocolLogEvent[] {
    if (!filterProtocol) return [...this.history];
    return this.history.filter((e) => e.protocol === filterProtocol);
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const protocolEventBus = new ProtocolEventBus();
