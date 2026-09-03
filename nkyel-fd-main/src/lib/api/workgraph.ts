import { api } from './client';

export interface WorkgraphNodeData {
  id: string;
  workspace_id: string;
  mission_id?: string;
  node_type: string;
  label: string;
  payload?: any;
  created_at: string;
  updated_at: string;
}

export interface WorkgraphEdgeData {
  id: string;
  workspace_id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: string;
  created_at: string;
}

export const workgraphApi = {
  listNodes: (workspaceId: string, missionId?: string) => {
    const url = missionId
      ? `/api/v1/workgraph/nodes?workspace_id=${workspaceId}&mission_id=${missionId}`
      : `/api/v1/workgraph/nodes?workspace_id=${workspaceId}`;
    return api.get<WorkgraphNodeData[]>(url);
  },

  createNode: (workspaceId: string, nodeType: string, label: string, payload?: any, missionId?: string) =>
    api.post<WorkgraphNodeData>('/api/v1/workgraph/nodes', {
      workspace_id: workspaceId,
      node_type: nodeType,
      label,
      payload,
      mission_id: missionId,
    }),

  listEdges: (workspaceId: string) =>
    api.get<WorkgraphEdgeData[]>(`/api/v1/workgraph/edges?workspace_id=${workspaceId}`),

  createEdge: (workspaceId: string, sourceNodeId: string, targetNodeId: string, relationType: string) =>
    api.post<WorkgraphEdgeData>('/api/v1/workgraph/edges', {
      workspace_id: workspaceId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      relation_type: relationType,
    }),
};
