import { api } from './client';

export interface SourceItem {
  id: string;
  mission_id?: string;
  workspace_id?: string;
  source_type: string;
  url?: string;
  canonical_url?: string;
  title?: string;
  domain?: string;
  author?: string;
  search_provider?: string;
  excerpt?: string;
  retrieved_at?: string;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  mission_id?: string;
  source_id?: string;
  claim?: string;
  relationship: string;
  evidence_text?: string;
  confidence?: string;
  created_at: string;
}

export const sourcesEvidenceApi = {
  listSources: (missionId?: string, workspaceId?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (missionId) params.set('mission_id', missionId);
    if (workspaceId) params.set('workspace_id', workspaceId);
    params.set('limit', String(limit));
    return api.get<SourceItem[]>(`/api/v1/sources?${params.toString()}`);
  },

  getSource: (sourceId: string) =>
    api.get<SourceItem>(`/api/v1/sources/${sourceId}`),

  listEvidence: (missionId?: string, sourceId?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (missionId) params.set('mission_id', missionId);
    if (sourceId) params.set('source_id', sourceId);
    params.set('limit', String(limit));
    return api.get<EvidenceItem[]>(`/api/v1/evidence?${params.toString()}`);
  },
};
