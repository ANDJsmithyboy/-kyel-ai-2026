/**
 * GabomaAI · useRenduPanel Hook
 * SmartANDJ AI Technologies
 */

'use client';

import { create } from 'zustand';
import type { GabomaRendu } from '@/lib/models';

interface RenduPanelState {
  isOpen: boolean;
  artifacts: GabomaRendu[];
  activeIndex: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  openRendu: (rendu: GabomaRendu) => void;
  addArtifact: (rendu: GabomaRendu) => void;
  setActiveIndex: (index: number) => void;
  clear: () => void;
}

export const useRenduPanel = create<RenduPanelState>((set) => ({
  isOpen: false,
  artifacts: [],
  activeIndex: 0,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

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
    })),

  setActiveIndex: (index) => set({ activeIndex: index }),

  clear: () => set({ artifacts: [], activeIndex: 0, isOpen: false }),
}));
