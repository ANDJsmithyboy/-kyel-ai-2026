import { api } from './client';

export interface Mission {
  id: string;
  workspace_id: string;
  title: string;
  objective: string;
  status: string;
  priority: string;
  autonomy_level: string;
  created_at: string;
}

export interface Run {
  id: string;
  mission_id: string;
  workspace_id: string;
  run_type: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MissionEventItem {
  id: string;
  run_id: string;
  event_type: string;
  version: string;
  sequence: number;
  payload?: any;
  node_id?: string;
  created_at: string;
}

export const missionsApi = {
  create: (workspaceId: string, title: string, objective: string, priority = 'normal', autonomyLevel = 'semi_autonomous') =>
    api.post<Mission>('/api/v1/missions', {
      workspace_id: workspaceId,
      title,
      objective,
      priority,
      autonomy_level: autonomyLevel,
    }),

  get: (missionId: string) =>
    api.get<Mission>(`/api/v1/missions/${missionId}`),

  list: (workspaceId: string) =>
    api.get<Mission[]>(`/api/v1/missions?workspace_id=${workspaceId}`),

  createRun: (workspaceId: string, missionId: string, runType = 'FULL') =>
    api.post<Run>('/api/v1/events/runs', {
      workspace_id: workspaceId,
      mission_id: missionId,
      run_type: runType,
    }),

  getRun: (runId: string) =>
    api.get<Run>(`/api/v1/events/runs/${runId}`),

  cancelRun: (runId: string) =>
    api.post<Run>(`/api/v1/events/runs/${runId}/cancel`),

  listEvents: (runId: string, afterSequence = 0, limit = 200) =>
    api.get<MissionEventItem[]>(`/api/v1/events?run_id=${runId}&after_sequence=${afterSequence}&limit=${limit}`),
};
