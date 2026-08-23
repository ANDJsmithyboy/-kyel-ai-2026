/**
 * Nkyel AI · useRenduPanel Hook
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * State management for Ñkyel Artifact Studio (Right Panel).
 */

'use client';

import { create } from 'zustand';
import type { NkyelRendu, ArtifactVersion } from '@/lib/models';
import { protocolEventBus } from '@/lib/protocols/protocol-events';

interface RenduPanelState {
  isOpen: boolean;
  artifacts: NkyelRendu[];
  activeIndex: number;
  activeStudioTab: 'preview' | 'edit' | 'code' | 'versions' | 'sources' | 'activity' | 'workgraph';
  panelWidth: number; // 420px to 560px
  isPinned: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setPanelWidth: (width: number) => void;
  setActiveStudioTab: (tab: RenduPanelState['activeStudioTab']) => void;
  openRendu: (rendu: NkyelRendu) => void;
  addArtifact: (rendu: NkyelRendu) => void;
  updateArtifactContent: (id: string, newContent: string) => void;
  saveNewVersion: (id: string, newContent: string, changeSummary?: string) => void;
  restoreVersion: (id: string, versionNumber: number) => void;
  togglePin: () => void;
  setActiveIndex: (index: number) => void;
  clear: () => void;
}

export const useRenduPanel = create<RenduPanelState>((set) => ({
  isOpen: false,
  artifacts: [],
  activeIndex: 0,
  activeStudioTab: 'preview',
  panelWidth: 480,
  isPinned: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setPanelWidth: (width) => set({ panelWidth: Math.min(580, Math.max(400, width)) }),
  setActiveStudioTab: (tab) => set({ activeStudioTab: tab }),

  openRendu: (rendu) =>
    set((s) => {
      const exists = s.artifacts.find((a) => a.id === rendu.id);
      if (exists) {
        const idx = s.artifacts.indexOf(exists);
        return { isOpen: true, activeIndex: idx };
      }
      return {
        isOpen: true,
        artifacts: [...s.artifacts, rendu],
        activeIndex: s.artifacts.length,
      };
    }),

  addArtifact: (rendu) =>
    set((s) => ({
      artifacts: [...s.artifacts, rendu],
      activeIndex: s.artifacts.length,
      isOpen: true,
    })),

  updateArtifactContent: (id, newContent) =>
    set((state) => ({
      artifacts: state.artifacts.map((a) =>
        a.id === id ? { ...a, content: newContent, updated_at: Date.now() } : a
      ),
    })),

  saveNewVersion: (id, newContent, changeSummary = 'Modification utilisateur') =>
    set((state) => ({
      artifacts: state.artifacts.map((a) => {
        if (a.id !== id) return a;
        const currentVersion = a.version || 1;
        const newVersionNum = currentVersion + 1;
        const previousVersion: ArtifactVersion = {
          version: currentVersion,
          content: a.content || '',
          createdAt: a.updated_at || a.created_at,
          author: a.provenance?.agentName || 'Ñkyel Agent',
        };
        const newVersions = [...(a.versions || [previousVersion]), {
          version: newVersionNum,
          content: newContent,
          createdAt: Date.now(),
          author: 'Utilisateur Souverain',
          changeSummary,
        }];

        protocolEventBus.emit('agui.state.updated', 'agui', `Nouvelle version d'artefact créée : v${newVersionNum} (${a.title})`, { artifactId: a.id, version: newVersionNum });

        return {
          ...a,
          content: newContent,
          version: newVersionNum,
          updated_at: Date.now(),
          versions: newVersions,
        };
      }),
    })),

  restoreVersion: (id, versionNumber) =>
    set((state) => ({
      artifacts: state.artifacts.map((a) => {
        if (a.id !== id) return a;
        const target = a.versions?.find((v) => v.version === versionNumber);
        if (!target) return a;
        return {
          ...a,
          content: target.content,
          version: versionNumber,
          updated_at: Date.now(),
        };
      }),
    })),

  togglePin: () => set((s) => ({ isPinned: !s.isPinned })),

  setActiveIndex: (index) => set({ activeIndex: index }),

  clear: () => set({ artifacts: [], activeIndex: 0, isOpen: false }),
}));
