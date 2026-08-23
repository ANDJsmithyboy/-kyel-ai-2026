export type NkyelMissionState =
  | 'idle'
  | 'submitting'
  | 'connecting'
  | 'planning'
  | 'working'
  | 'waiting_user'
  | 'reconnecting'
  | 'recovering'
  | 'verifying'
  | 'delivering'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type NkyelVisualEventType =
  | 'mission.started'
  | 'plan.created'
  | 'message.delta'
  | 'task.started'
  | 'tool.started'
  | 'tool.completed'
  | 'source.found'
  | 'artifact.created'
  | 'mission.completed'
  | 'mission.failed';

export interface NkyelVisualEvent {
  id: string;
  type: NkyelVisualEventType;
  timestamp: string;
  thread_id: string | null;
  run_id: string;
  request_id: string | null;
  task_id: string | null;
  source_protocol: 'ag-ui' | 'a2a' | 'mcp' | 'deerflow';
  source_event_type: string | null;
  agent: { id: string; label: string } | null;
  payload: Record<string, unknown>;
}

export interface NkyelVisualState {
  status: NkyelMissionState;
  events: NkyelVisualEvent[];
  lastEventAt: string | null;
}

interface NormalizeContext {
  runId: string;
  threadId?: string | null;
  requestId?: string | null;
}

const eventMap: Record<string, NkyelVisualEventType> = {
  token: 'message.delta',
  message: 'message.delta',
  source: 'source.found',
  rendu: 'artifact.created',
  'tool.started': 'tool.started',
  'tool.completed': 'tool.completed',
  'task.started': 'task.started',
  'plan.created': 'plan.created',
  done: 'mission.completed',
  completed: 'mission.completed',
  error: 'mission.failed',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback: string | null = null): string | null {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function normalizeSseEvent(raw: Record<string, unknown>, context: NormalizeContext): NkyelVisualEvent | null {
  const rawType = stringValue(raw.type);
  if (!rawType) return null;

  const type = eventMap[rawType];
  if (!type) return null;

  const payload = asRecord(raw.payload ?? raw.artifact ?? raw);
  const agentRecord = asRecord(raw.agent);
  const agentId = stringValue(raw.agent_id ?? agentRecord.id);
  const agentLabel = stringValue(raw.agent_label ?? agentRecord.label);

  return {
    id: stringValue(raw.id ?? raw.event_id, `${context.runId}:${rawType}:${Date.now()}`) as string,
    type,
    timestamp: stringValue(raw.timestamp, new Date().toISOString()) as string,
    thread_id: stringValue(raw.thread_id, context.threadId ?? null),
    run_id: stringValue(raw.run_id, context.runId) as string,
    request_id: stringValue(raw.request_id, context.requestId ?? null),
    task_id: stringValue(raw.task_id),
    source_protocol: raw.source_protocol === 'ag-ui' || raw.source_protocol === 'a2a' || raw.source_protocol === 'mcp' ? raw.source_protocol : 'deerflow',
    source_event_type: stringValue(raw.source_event_type, rawType),
    agent: agentId && agentLabel ? { id: agentId, label: agentLabel } : null,
    payload,
  };
}

export function createMissionStartedEvent(runId: string, threadId: string | null, requestId: string): NkyelVisualEvent {
  return {
    id: `${runId}:mission.started`,
    type: 'mission.started',
    timestamp: new Date().toISOString(),
    thread_id: threadId,
    run_id: runId,
    request_id: requestId,
    task_id: null,
    source_protocol: 'deerflow',
    source_event_type: 'client.send',
    agent: null,
    payload: { status: 'submitting' },
  };
}

export function reduceVisualState(previous: NkyelVisualState, event: NkyelVisualEvent): NkyelVisualState {
  const statusByEvent: Partial<Record<NkyelVisualEventType, NkyelMissionState>> = {
    'mission.started': 'connecting',
    'plan.created': 'planning',
    'task.started': 'working',
    'tool.started': 'working',
    'tool.completed': 'verifying',
    'source.found': 'verifying',
    'artifact.created': 'delivering',
    'mission.completed': 'completed',
    'mission.failed': 'failed',
  };

  return {
    status: statusByEvent[event.type] ?? previous.status,
    events: [...previous.events, event].slice(-100),
    lastEventAt: event.timestamp,
  };
}

export const initialVisualState: NkyelVisualState = {
  status: 'idle',
  events: [],
  lastEventAt: null,
};
