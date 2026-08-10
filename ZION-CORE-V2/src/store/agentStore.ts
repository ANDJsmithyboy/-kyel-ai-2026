/**
 * GabomaAI · Agent Store (Zustand)
 * SmartANDJ AI Technologies
 * État global pour l'exécution des agents ONYX / BLACK PANTHER
 */

import { create } from 'zustand';

// ── Types ──────────────────────────────────────────
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

// ── Initial State ──────────────────────────────────
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

// ── Store ──────────────────────────────────────────
export const useAgentStore = create<AgentState>((set) => ({
  ...initialState,

  startSession: (sessionId, threadId) =>
    set({
      ...initialState,
      sessionId,
      threadId,
      phase: 'planning',
    }),

  setPhase: (phase) => set({ phase }),
  setMode: (mode) => set({ mode }),

  addTask: (task) =>
    set((s) => ({ tasks: [...s.tasks, task] })),

  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  addArtifact: (artifact) =>
    set((s) => ({ artifacts: [...s.artifacts, artifact] })),

  addFile: (file) =>
    set((s) => ({ files: [...s.files, file] })),

  appendTerminalLine: (line) =>
    set((s) => ({
      terminalLines: [...s.terminalLines.slice(-200), line],
    })),

  setCurrentUrl: (url) => set({ currentUrl: url }),
  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setFps: (fps) => set({ fps }),

  appendStreamedText: (text) =>
    set((s) => ({ streamedText: s.streamedText + text })),

  setError: (error) => set({ error, phase: error ? 'error' : 'idle' }),

  reset: () => set(initialState),
}));
