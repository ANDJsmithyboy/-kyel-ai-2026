import { api } from './client';

export interface ProgramItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'ACTIVE' | 'IDLE' | 'PAUSED';
  trigger: string;
  last_run: string;
  next_run: string;
}

export const programsApi = {
  list: async (): Promise<ProgramItem[]> => {
    const res = await api.get<{ success: boolean; programs: ProgramItem[] }>('/api/v1/programs');
    return res.programs || [];
  },

  create: async (title: string, category: string, description: string, trigger: string): Promise<ProgramItem> => {
    const res = await api.post<{ success: boolean; program: ProgramItem }>('/api/v1/programs', {
      title,
      category,
      description,
      trigger,
    });
    return res.program;
  },
};
