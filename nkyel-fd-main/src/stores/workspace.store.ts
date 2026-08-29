import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  plan: 'gratuit' | 'pro' | 'enterprise';
  memberCount: number;
  avatarUrl?: string | null;
  credits: number | null;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: number;
}

interface WorkspaceState {
  workspace: Workspace | null;
  isWorkspaceLoading: boolean;
  workspaceError: string | null;

  projects: Project[];
  isProjectsLoading: boolean;
  projectsError: string | null;

  fetchWorkspace: () => Promise<void>;
  fetchProjects: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  isWorkspaceLoading: false,
  workspaceError: null,

  projects: [],
  isProjectsLoading: false,
  projectsError: null,

  fetchWorkspace: async () => {
    try {
      set({ isWorkspaceLoading: true, workspaceError: null });
      // Simulate real API fetch delay
      await new Promise(r => setTimeout(r, 600));
      
      const res = await fetch('/api/v1/workspaces/current').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        set({ workspace: data.workspace, isWorkspaceLoading: false });
      } else {
        // REAL BACKEND FIRST: Never fake the screenshot data. 
        // If the backend fails or doesn't exist, we must reflect reality (no data).
        set({
          workspace: null,
          workspaceError: 'Données non disponibles',
          isWorkspaceLoading: false
        });
      }
    } catch (err: any) {
      set({ workspaceError: 'Impossible de charger l\'espace de travail', isWorkspaceLoading: false });
    }
  },

  fetchProjects: async () => {
    try {
      set({ isProjectsLoading: true, projectsError: null });
      await new Promise(r => setTimeout(r, 500));
      
      const res = await fetch('/api/v1/projects').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        set({ projects: data.projects || [], isProjectsLoading: false });
      } else {
        // Fallback REAL empty state if no DB hook yet
        set({ projects: [], isProjectsLoading: false });
      }
    } catch (err: any) {
      set({ projectsError: 'Erreur de chargement des projets', isProjectsLoading: false });
    }
  }
}));
