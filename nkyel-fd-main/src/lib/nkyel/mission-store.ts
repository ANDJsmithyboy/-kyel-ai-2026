import { create } from 'zustand';
import { missionsApi, type Mission } from '@/lib/api';

export type { Mission };

interface MissionState {
  missions: Mission[];
  currentMission: Mission | null;
  isLoading: boolean;
  error: string | null;

  fetchMissions: (workspaceId: string) => Promise<void>;
  createMission: (workspaceId: string, title: string, objective: string, priority?: string, autonomyLevel?: string) => Promise<Mission | null>;
  getMission: (missionId: string) => Promise<Mission | null>;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  currentMission: null,
  isLoading: false,
  error: null,

  fetchMissions: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const missions = await missionsApi.list(workspaceId);
      set({ missions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createMission: async (workspaceId, title, objective, priority = 'normal', autonomyLevel = 'semi_autonomous') => {
    set({ isLoading: true, error: null });
    try {
      const data = await missionsApi.create(workspaceId, title, objective, priority, autonomyLevel);
      set((state) => ({
        missions: [data, ...state.missions],
        currentMission: data,
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
      const mission = await missionsApi.get(missionId);
      set({ currentMission: mission });
      return mission;
    } catch (err: any) {
      console.error('[Mission Store] getMission error:', err);
      return null;
    }
  },
}));
