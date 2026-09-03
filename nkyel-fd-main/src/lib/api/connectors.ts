import { api } from './client';

export interface ConnectorItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: 'AVAILABLE' | 'CONNECTING' | 'CONNECTED' | 'DEGRADED' | 'ERROR';
  isGoogle: boolean;
  connectedAccount?: string;
  capabilities: string[];
  permissions: Array<{
    id: string;
    scope: string;
    humanLabel: string;
    requiresApproval: boolean;
  }>;
}

export const connectorsApi = {
  list: async (): Promise<ConnectorItem[]> => {
    const res = await api.get<{ success: boolean; connectors: ConnectorItem[] }>('/api/v1/connectors');
    return res.connectors || [];
  },

  connect: (connectorId: string) =>
    api.post<{ status: string; connector: ConnectorItem }>(`/api/v1/connectors/${connectorId}/connect`),

  disconnect: (connectorId: string) =>
    api.post<{ status: string; connector: ConnectorItem }>(`/api/v1/connectors/${connectorId}/disconnect`),
};
