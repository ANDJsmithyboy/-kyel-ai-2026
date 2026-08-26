import { create } from 'zustand';

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

interface MissionState {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;

  fetchMissions: (workspaceId: string) => Promise<void>;
  createMission: (workspaceId: string, title: string, objective: string, priority?: string, autonomyLevel?: string) => Promise<Mission | null>;
  getMission: (missionId: string) => Promise<Mission | null>;
}

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('nkyel_access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  isLoading: false,
  error: null,

  fetchMissions: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiUrl()}/missions?workspace_id=${workspaceId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch missions');
      const data = await res.json();
      set({ missions: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createMission: async (workspaceId, title, objective, priority = 'normal', autonomyLevel = 'semi_autonomous') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiUrl()}/missions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          workspace_id: workspaceId,
          title,
          objective,
          priority,
          autonomy_level: autonomyLevel,
        }),
      });
      if (!res.ok) throw new Error('Failed to create mission');
      const data = await res.json();
      set((state) => ({
        missions: [data, ...state.missions],
        isLoading: false,
      }));
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  getMission: async (missionId: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/missions/${missionId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch mission');
      return await res.json();
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },
}));
