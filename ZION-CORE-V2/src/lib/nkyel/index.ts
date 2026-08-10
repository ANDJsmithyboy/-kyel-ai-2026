/**
 * Ñkyel AI — Module Index
 * Re-exports all core Ñkyel modules.
 */

// Types
export type {
  WorkNodeType,
  WorkNodeStatus,
  ContentOrigin,
  WorkNode,
  WorkEdgeType,
  WorkEdge,
  WorkGraph,
  NkyelEventType,
  NkyelEvent,
  WorkGraphSnapshot,
} from './work-graph.types';

// Event Store
export { NkyelEventStore, eventStore } from './event-store';

// Work Graph Store (Zustand)
export { useWorkGraphStore } from './work-graph-store';

// AG-UI Adapter
export { AgUiStreamAdapter, mapAgUiEventToNkyelEvent } from './ag-ui-adapter';
