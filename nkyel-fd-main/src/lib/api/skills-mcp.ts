import { api } from './client';

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  required_tools: string[];
  parameters?: Record<string, any>;
  enabled: boolean;
  installed?: boolean;
}

export interface MCPServerInfo {
  id: string;
  name: string;
  transport: string;
  endpoint?: string;
  status: 'connected' | 'available' | 'error';
  tools_count: number;
  tools: Array<{
    name: string;
    description: string;
    category: string;
    parameters: any;
  }>;
}

export const skillsMcpApi = {
  listSkills: async (): Promise<SkillMetadata[]> => {
    const res = await api.get<{ success: boolean; skills: SkillMetadata[] }>('/api/v1/skills');
    return res.skills || [];
  },

  toggleSkill: (skillId: string) =>
    api.post<{ id: string; enabled: boolean }>(`/api/v1/skills/${skillId}/toggle`),

  listMcpServers: async (): Promise<MCPServerInfo[]> => {
    const res = await api.get<{ success: boolean; servers: MCPServerInfo[] }>('/api/v1/mcp/servers');
    return res.servers || [];
  },

  executeTool: (toolName: string, args: Record<string, any> = {}) =>
    api.post('/api/v1/mcp/execute', { tool_name: toolName, arguments: args }),
};
