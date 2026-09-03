import { api } from './client';

export interface ApprovalItem {
  id: string;
  mission_id?: string;
  action_type: string;
  payload?: any;
  status: string;
  created_at: string;
}

export const approvalsApi = {
  list: (missionId?: string) => {
    const url = missionId ? `/api/v1/approvals?mission_id=${missionId}` : '/api/v1/approvals';
    return api.get<ApprovalItem[]>(url);
  },

  respond: (approvalId: string, approved: boolean, comments?: string) =>
    api.post(`/api/v1/approvals/${approvalId}/respond`, {
      approved,
      comments,
    }),
};
