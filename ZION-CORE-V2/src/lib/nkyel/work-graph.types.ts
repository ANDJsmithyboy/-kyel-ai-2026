/**
 * Ñkyel AI — Canonical Work Graph Types
 * 
 * The typed, versioned model representing all agent work,
 * independent of the visual interface.
 * 
 * @version 1.0.0
 */

// --- Node Types -----------------------------------------

export type WorkNodeType =
  | 'goal'
  | 'plan'
  | 'task'
  | 'agent'
  | 'tool_call'
  | 'source'
  | 'evidence'
  | 'claim'
  | 'hypothesis'
  | 'scenario'
  | 'decision'
  | 'artifact'
  | 'approval'
  | 'checkpoint'
  | 'error';

export type WorkNodeStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked'
  | 'waiting_approval';

export type ContentOrigin =
  | 'generated'
  | 'simulated'
  | 'retrieved'
  | 'calculated'
  | 'user_provided'
  | 'verified';

export interface WorkNode {
  /** Stable unique identifier */
  id: string;
  /** Node type from the Work Graph vocabulary */
  type: WorkNodeType;
  /** Schema version */
  version: string;
  /** Parent node ID (for hierarchy) */
  parentId?: string;
  /** Short public title */
  title: string;
  /** Public summary */
  summary?: string;
  /** Current status */
  status: WorkNodeStatus;
  /** How this content was produced */
  provenance: ContentOrigin;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Associated source URL or artifact path */
  sourceRef?: string;
  /** AI provider used (e.g. 'gemini', 'groq') */
  provider?: string;
  /** Model identifier */
  model?: string;
  /** Cost in USD (safe to expose) */
  cost?: number;
  /** Latency in ms */
  latencyMs?: number;
  /** Number of attempts */
  attempts?: number;
  /** Permissions scope */
  permissions?: string[];
  /** Confidence score (only when calculated by a documented method) */
  confidence?: number;
  /** Confidence method description */
  confidenceMethod?: string;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
}

// --- Edge Types -----------------------------------------

export type WorkEdgeType =
  | 'decomposes_into'
  | 'assigned_to'
  | 'depends_on'
  | 'uses'
  | 'produces'
  | 'supports'
  | 'contradicts'
  | 'derived_from'
  | 'compares_with'
  | 'selected'
  | 'rejected'
  | 'blocked_by'
  | 'resumes_from';

export interface WorkEdge {
  /** Stable unique identifier */
  id: string;
  /** Edge relationship type */
  type: WorkEdgeType;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Optional label */
  label?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

// --- Work Graph -----------------------------------------

export interface WorkGraph {
  /** Run/mission identifier */
  runId: string;
  /** Graph schema version */
  version: string;
  /** All nodes */
  nodes: Map<string, WorkNode>;
  /** All edges */
  edges: Map<string, WorkEdge>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// --- Event Types ----------------------------------------

export type NkyelEventType =
  | 'run.created'
  | 'goal.received'
  | 'plan.created'
  | 'plan.updated'
  | 'task.created'
  | 'task.started'
  | 'task.progressed'
  | 'task.completed'
  | 'task.failed'
  | 'agent.spawned'
  | 'agent.delegated'
  | 'tool.started'
  | 'tool.completed'
  | 'tool.failed'
  | 'source.added'
  | 'claim.created'
  | 'evidence.linked'
  | 'hypothesis.created'
  | 'hypothesis.rejected'
  | 'scenario.simulated'
  | 'artifact.created'
  | 'checkpoint.created'
  | 'approval.requested'
  | 'approval.resolved'
  | 'user.node_moved'
  | 'user.node_edited'
  | 'user.branch_created'
  | 'user.branch_rejected'
  | 'replan.requested'
  | 'replan.completed'
  | 'run.interrupted'
  | 'run.resumed'
  | 'run.cancelled'
  | 'final.delivered';

export interface NkyelEvent {
  /** Unique event ID */
  id: string;
  /** Event type */
  type: NkyelEventType;
  /** Schema version */
  version: string;
  /** Sequence number for ordering */
  sequenceNumber: number;
  /** Server timestamp */
  timestamp: string;
  /** Run correlation ID */
  runId: string;
  /** Task correlation ID */
  taskId?: string;
  /** Agent correlation ID */
  agentId?: string;
  /** Tool correlation ID */
  toolCallId?: string;
  /** The work node affected (created or updated) */
  node?: Partial<WorkNode>;
  /** The work edge affected */
  edge?: Partial<WorkEdge>;
  /** Event-specific payload */
  payload?: Record<string, unknown>;
  /** Whether secrets have been redacted */
  redacted?: boolean;
}

// --- Snapshot for Replay --------------------------------

export interface WorkGraphSnapshot {
  /** Snapshot identifier */
  id: string;
  /** Run ID */
  runId: string;
  /** Sequence number at snapshot time */
  atSequence: number;
  /** Timestamp */
  timestamp: string;
  /** Serialized nodes */
  nodes: WorkNode[];
  /** Serialized edges */
  edges: WorkEdge[];
}
