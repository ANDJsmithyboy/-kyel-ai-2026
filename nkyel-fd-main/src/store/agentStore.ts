/**
 * Nkyel AI · Agent Store (Zustand)
 * SmartANDJ AI Technologies
 * État global pour l'exécution des agents ONYX / BLACK PANTHER
 */

import { create } from 'zustand';

// -- Types ------------------------------------------
export type AgentPhase =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'browsing'
  | 'writing'
  | 'done'
  | 'error';

export type AgentMode = 'onyx' | 'black-panther';

export interface AgentTask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  timestamp: number;
}

export interface AgentArtifact {
  id: string;
  file: string;
  content: string;
  type: 'code' | 'markdown' | 'html' | 'docx' | 'xlsx' | 'image' | 'unknown';
  timestamp: number;
}

export interface AgentFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface AgentState {
  // Session
  sessionId: string | null;
  threadId: string | null;
  phase: AgentPhase;
  mode: AgentMode;

  // Données de streaming
  tasks: AgentTask[];
  artifacts: AgentArtifact[];
  files: AgentFile[];
  terminalLines: string[];
  currentUrl: string | null;
  currentFrame: Blob | null;
  fps: number;

  // Texte généré en streaming
  streamedText: string;

  // Erreur
  error: string | null;

  // Actions
  startSession: (sessionId: string, threadId: string) => void;
  setPhase: (phase: AgentPhase) => void;
  setMode: (mode: AgentMode) => void;
  addTask: (task: AgentTask) => void;
  updateTask: (id: string, updates: Partial<AgentTask>) => void;
  addArtifact: (artifact: AgentArtifact) => void;
  addFile: (file: AgentFile) => void;
  appendTerminalLine: (line: string) => void;
  setCurrentUrl: (url: string) => void;
  setCurrentFrame: (frame: Blob | null) => void;
  setFps: (fps: number) => void;
  appendStreamedText: (text: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// -- Initial State ----------------------------------
const initialState = {
  sessionId: null,
  threadId: null,
  phase: 'idle' as AgentPhase,
  mode: 'onyx' as AgentMode,
  tasks: [],
  artifacts: [],
  files: [],
  terminalLines: [],
  currentUrl: null,
  currentFrame: null,
  fps: 0,
  streamedText: '',
  error: null,
};

// -- Store ------------------------------------------
export const useAgentStore = create<AgentState>((set: any) => ({
  ...initialState,

  startSession: (sessionId: string, threadId: string) =>
    set({
      ...initialState,
      sessionId,
      threadId,
      phase: 'planning',
    }),

  setPhase: (phase: AgentPhase) => set({ phase }),
  setMode: (mode: AgentMode) => set({ mode }),

  addTask: (task: AgentTask) =>
    set((s: AgentState) => ({ tasks: [...s.tasks, task] })),

  updateTask: (id: string, updates: Partial<AgentTask>) =>
    set((s: AgentState) => ({
      tasks: s.tasks.map((t: AgentTask) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  addArtifact: (artifact: AgentArtifact) =>
    set((s: AgentState) => ({ artifacts: [...s.artifacts, artifact] })),

  addFile: (file: AgentFile) =>
    set((s: AgentState) => ({ files: [...s.files, file] })),

  appendTerminalLine: (line: string) =>
    set((s: AgentState) => ({
      terminalLines: [...s.terminalLines.slice(-200), line],
    })),

  setCurrentUrl: (url: string) => set({ currentUrl: url }),
  setCurrentFrame: (frame: string) => set({ currentFrame: frame }),
  setFps: (fps: number) => set({ fps }),

  appendStreamedText: (text: string) =>
    set((s: AgentState) => ({ streamedText: s.streamedText + text })),

  setError: (error: string | null) => set({ error, phase: error ? 'error' : 'idle' }),

  reset: () => set(initialState),
}));
