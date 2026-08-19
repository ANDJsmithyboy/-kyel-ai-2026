/**
 * Ñkyel AI — Work Graph Zustand Store
 * 
 * Central state management for the Canonical Work Graph.
 * Connects the Event Store to the React UI layer.
 * 
 * @version 1.0.0
 */

import { create } from 'zustand';
import type { WorkNode, WorkEdge, NkyelEvent, NkyelEventType } from './work-graph.types';
import { eventStore } from './event-store';
import { AgUiStreamAdapter } from './ag-ui-adapter';

// ─── Store State ────────────────────────────────────────

interface WorkGraphState {
  /** Current run ID */
  runId: string | null;
  /** All nodes in the current graph */
  nodes: Map<string, WorkNode>;
  /** All edges in the current graph */
  edges: Map<string, WorkEdge>;
  /** Event log (for timeline/replay) */
  eventLog: NkyelEvent[];
  /** Whether the run is active */
  isRunning: boolean;
  /** Whether replay mode is active */
  isReplaying: boolean;
  /** Current replay position */
  replayPosition: number;
  /** Selected node ID */
  selectedNodeId: string | null;

  // ── Actions ─────────────────────────────────────────
  /** Start a new mission/run */
  startRun: (goalTitle: string, goalSummary?: string) => string;
  /** Emit an event and update the graph */
  emitEvent: (event: Omit<NkyelEvent, 'sequenceNumber' | 'timestamp'>) => void;
  /** Select a node */
  selectNode: (nodeId: string | null) => void;
  /** User edits a node (triggers replan event) */
  userEditNode: (nodeId: string, updates: Partial<WorkNode>) => void;
  /** User creates a branch */
  userCreateBranch: (fromNodeId: string, branchTitle: string) => string;
  /** User rejects a hypothesis */
  userRejectHypothesis: (nodeId: string) => void;
  /** Stop the current run */
  stopRun: () => void;
  /** Start replay from a sequence */
  startReplay: (runId: string) => void;
  /** Step replay forward */
  replayStep: () => void;
  /** Reset store */
  reset: () => void;
}

// ─── ID Generator ───────────────────────────────────────

let idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++idCounter}`;
}

// ─── Store ──────────────────────────────────────────────

export const useWorkGraphStore = create<WorkGraphState>((set, get) => {
  // Subscribe to all events from the event store
  eventStore.subscribe('*', (event: NkyelEvent) => {
    const state = get();
    if (event.runId !== state.runId) return;

    // Reconstruct graph from events
    const graph = eventStore.reconstructGraph(event.runId);
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      eventLog: [...state.eventLog, event],
    });
  });

  return {
    runId: null,
    nodes: new Map(),
    edges: new Map(),
    eventLog: [],
    isRunning: false,
    isReplaying: false,
    replayPosition: 0,
    selectedNodeId: null,

    startRun: (goalTitle: string, goalSummary?: string) => {
      const runId = generateId('run');
      const goalId = generateId('goal');

      set({ runId, isRunning: true, nodes: new Map(), edges: new Map(), eventLog: [] });

      // Emit run.created
      eventStore.append({
        id: generateId('evt'),
        type: 'run.created',
        version: '1.0.0',
        runId,
        payload: { goalTitle },
      });

      // Emit goal.received
      eventStore.append({
        id: generateId('evt'),
        type: 'goal.received',
        version: '1.0.0',
        runId,
        node: {
          id: goalId,
          type: 'goal',
          version: '1.0.0',
          title: goalTitle,
          summary: goalSummary,
          status: 'active',
          provenance: 'user_provided',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      return runId;
    },

    emitEvent: (event) => {
      eventStore.append(event);
    },

    selectNode: (nodeId: string | null) => {
      set({ selectedNodeId: nodeId });
    },

    userEditNode: (nodeId: string, updates: Partial<WorkNode>) => {
      const state = get();
      if (!state.runId) return;

      // Emit user edit event
      eventStore.append({
        id: generateId('evt'),
        type: 'user.node_edited',
        version: '1.0.0',
        runId: state.runId,
        node: { id: nodeId, ...updates, updatedAt: new Date().toISOString() },
      });

      // Request replan if the edit is semantic (not just cosmetic)
      if (updates.title || updates.summary || updates.status) {
        eventStore.append({
          id: generateId('evt'),
          type: 'replan.requested',
          version: '1.0.0',
          runId: state.runId,
          payload: { reason: 'user_edit', editedNodeId: nodeId, updates },
        });
        
        // Trigger the backend via the adapter to process SSE
        const adapter = new AgUiStreamAdapter(state.runId);
        adapter.connect('http://localhost:8000/api/v1/nkyel/replan', {
          run_id: state.runId,
          edited_node_id: nodeId,
          reason: 'user_edit',
          updates
        }).catch(err => console.error('[WorkGraph Store] Replan stream failed:', err));
      }
    },

    userCreateBranch: (fromNodeId: string, branchTitle: string) => {
      const state = get();
      if (!state.runId) return '';

      const branchId = generateId('hyp');

      eventStore.append({
        id: generateId('evt'),
        type: 'user.branch_created',
        version: '1.0.0',
        runId: state.runId,
        node: {
          id: branchId,
          type: 'hypothesis',
          version: '1.0.0',
          parentId: fromNodeId,
          title: branchTitle,
          status: 'pending',
          provenance: 'user_provided',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        edge: {
          id: generateId('edge'),
          type: 'derived_from',
          sourceId: branchId,
          targetId: fromNodeId,
          createdAt: new Date().toISOString(),
        },
      });

      return branchId;
    },

    userRejectHypothesis: (nodeId: string) => {
      const state = get();
      if (!state.runId) return;

      eventStore.append({
        id: generateId('evt'),
        type: 'user.branch_rejected',
        version: '1.0.0',
        runId: state.runId,
        node: { id: nodeId, status: 'cancelled', updatedAt: new Date().toISOString() },
      });
    },

    stopRun: () => {
      const state = get();
      if (!state.runId) return;

      eventStore.append({
        id: generateId('evt'),
        type: 'run.interrupted',
        version: '1.0.0',
        runId: state.runId,
      });

      // Create checkpoint
      eventStore.createSnapshot(state.runId);
      set({ isRunning: false });
    },

    startReplay: (runId: string) => {
      const events = eventStore.getEvents(runId);
      set({
        runId,
        isReplaying: true,
        replayPosition: 0,
        eventLog: [],
        nodes: new Map(),
        edges: new Map(),
      });

      // Apply first event
      if (events.length > 0) {
        const graph = eventStore.reconstructGraph(runId, events[0].sequenceNumber);
        set({
          nodes: graph.nodes,
          edges: graph.edges,
          eventLog: [events[0]],
          replayPosition: 1,
        });
      }
    },

    replayStep: () => {
      const state = get();
      if (!state.runId || !state.isReplaying) return;

      const allEvents = eventStore.getEvents(state.runId);
      if (state.replayPosition >= allEvents.length) {
        set({ isReplaying: false });
        return;
      }

      const nextEvent = allEvents[state.replayPosition];
      const graph = eventStore.reconstructGraph(state.runId, nextEvent.sequenceNumber);
      set({
        nodes: graph.nodes,
        edges: graph.edges,
        eventLog: [...state.eventLog, nextEvent],
        replayPosition: state.replayPosition + 1,
      });
    },

    reset: () => {
      set({
        runId: null,
        nodes: new Map(),
        edges: new Map(),
        eventLog: [],
        isRunning: false,
        isReplaying: false,
        replayPosition: 0,
        selectedNodeId: null,
      });
    },
  };
});
