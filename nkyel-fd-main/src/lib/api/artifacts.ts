import { api, getApiBaseUrl } from './client';

export interface ArtifactData {
  id: string;
  workspace_id?: string;
  mission_id?: string;
  title: string;
  artifact_type: string;
  description?: string;
  content_url?: string;
  content_size_bytes?: number;
  status: 'REQUESTED' | 'GENERATING' | 'READY' | 'FAILED';
  version: number;
  created_at: string;
}

export const artifactsApi = {
  list: (workspaceId?: string, missionId?: string) => {
    const params = new URLSearchParams();
    if (workspaceId) params.set('workspace_id', workspaceId);
    if (missionId) params.set('mission_id', missionId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<ArtifactData[]>(`/api/v1/artifacts${query}`);
  },

  get: (artifactId: string) =>
    api.get<ArtifactData>(`/api/v1/artifacts/${artifactId}`),

  getDownloadUrl: (artifactId: string, format = 'pdf') =>
    `${getApiBaseUrl()}/api/v1/artifacts/${artifactId}/download?format=${format}`,
};
