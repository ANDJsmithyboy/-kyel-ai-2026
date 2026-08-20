/**
 * Ñkyel AI — Event Store
 * 
 * Append-only, deterministic event store that drives the
 * Canonical Work Graph and enables replay/reconstruction.
 * 
 * @version 1.0.0
 */

import type {
  NkyelEvent,
  NkyelEventType,
  WorkGraph,
  WorkNode,
  WorkEdge,
  WorkGraphSnapshot,
} from './work-graph.types';

// --- Event Store ----------------------------------------

type EventListener = (event: NkyelEvent) => void;

export class NkyelEventStore {
  private events: NkyelEvent[] = [];
  private sequenceCounter = 0;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private snapshots: WorkGraphSnapshot[] = [];
  private snapshotInterval = 50; // snapshot every N events

  /** Append an event (idempotent check via event.id) */
  append(event: Omit<NkyelEvent, 'sequenceNumber' | 'timestamp'>): NkyelEvent {
    // Idempotence: skip if event ID already exists
    if (this.events.some(e => e.id === event.id)) {
      return this.events.find(e => e.id === event.id)!;
    }

    const fullEvent: NkyelEvent = {
      ...event,
      sequenceNumber: ++this.sequenceCounter,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);

    // Notify listeners
    this.notifyListeners(fullEvent);

    // Auto-snapshot
    if (this.sequenceCounter % this.snapshotInterval === 0) {
      this.createSnapshot(event.runId);
    }

    return fullEvent;
  }

  /** Get all events for a run, optionally from a sequence number */
  getEvents(runId: string, fromSequence = 0): NkyelEvent[] {
    return this.events.filter(
      e => e.runId === runId && e.sequenceNumber > fromSequence
    );
  }

  /** Get event count */
  getEventCount(runId?: string): number {
    if (!runId) return this.events.length;
    return this.events.filter(e => e.runId === runId).length;
  }

  /** Subscribe to events */
  subscribe(eventType: NkyelEventType | '*', listener: EventListener): () => void {
    const key = eventType;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  /** Create a snapshot of the current graph state */
  createSnapshot(runId: string): WorkGraphSnapshot {
    const graph = this.reconstructGraph(runId);
    const snapshot: WorkGraphSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      runId,
      atSequence: this.sequenceCounter,
      timestamp: new Date().toISOString(),
      nodes: Array.from(graph.nodes.values()),
      edges: Array.from(graph.edges.values()),
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  /** Get latest snapshot for a run */
  getLatestSnapshot(runId: string): WorkGraphSnapshot | undefined {
    return [...this.snapshots]
      .filter(s => s.runId === runId)
      .sort((a, b) => b.atSequence - a.atSequence)[0];
  }

  /** Reconstruct the work graph from events (or from last snapshot + subsequent events) */
  reconstructGraph(runId: string, upToSequence?: number): WorkGraph {
    const graph: WorkGraph = {
      runId,
      version: '1.0.0',
      nodes: new Map(),
      edges: new Map(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Start from latest snapshot if available
    const snapshot = this.getLatestSnapshot(runId);
    let fromSequence = 0;

    if (snapshot && (!upToSequence || snapshot.atSequence <= upToSequence)) {
      // Restore from snapshot
      for (const node of snapshot.nodes) {
        graph.nodes.set(node.id, node);
      }
      for (const edge of snapshot.edges) {
        graph.edges.set(edge.id, edge);
      }
      fromSequence = snapshot.atSequence;
      graph.createdAt = snapshot.timestamp;
    }

    // Apply events after snapshot
    const events = this.events.filter(
      e =>
        e.runId === runId &&
        e.sequenceNumber > fromSequence &&
        (!upToSequence || e.sequenceNumber <= upToSequence)
    );

    for (const event of events) {
      this.applyEvent(graph, event);
    }

    graph.updatedAt = new Date().toISOString();
    return graph;
  }

  /** Apply a single event to the graph state */
  private applyEvent(graph: WorkGraph, event: NkyelEvent): void {
    // If the event carries a node, upsert it
    if (event.node && event.node.id) {
      const existing = graph.nodes.get(event.node.id);
      if (existing) {
        graph.nodes.set(event.node.id, { ...existing, ...event.node, updatedAt: event.timestamp });
      } else {
        graph.nodes.set(event.node.id, event.node as WorkNode);
      }
    }

    // If the event carries an edge, upsert it
    if (event.edge && event.edge.id) {
      const existing = graph.edges.get(event.edge.id);
      if (existing) {
        graph.edges.set(event.edge.id, { ...existing, ...event.edge });
      } else {
        graph.edges.set(event.edge.id, event.edge as WorkEdge);
      }
    }
  }

  /** Notify event listeners */
  private notifyListeners(event: NkyelEvent): void {
    // Notify specific listeners
    this.listeners.get(event.type)?.forEach(listener => {
      try { listener(event); } catch (e) { console.error('[NkyelEventStore] Listener error:', e); }
    });
    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(listener => {
      try { listener(event); } catch (e) { console.error('[NkyelEventStore] Wildcard listener error:', e); }
    });
  }

  /** Get replay iterator (events in order, with optional speed control) */
  *replay(runId: string, fromSequence = 0): Generator<NkyelEvent> {
    const events = this.getEvents(runId, fromSequence);
    for (const event of events) {
      yield event;
    }
  }

  /** Clear all events (for testing) */
  clear(): void {
    this.events = [];
    this.sequenceCounter = 0;
    this.snapshots = [];
  }
}

// --- Singleton instance ---------------------------------
export const eventStore = new NkyelEventStore();
