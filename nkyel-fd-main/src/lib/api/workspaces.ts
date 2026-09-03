import { api } from './client';

export interface Workspace {
  id: string;
  name: string;
  tier: string;
  role: string;
}

export const workspacesApi = {
  list: () => api.get<Workspace[]>('/api/v1/workspaces'),
  current: () => api.get<Workspace>('/api/v1/workspaces/current'),
  create: (name: string, tier = 'free') =>
    api.post<Workspace>('/api/v1/workspaces', { name, tier }),
};
