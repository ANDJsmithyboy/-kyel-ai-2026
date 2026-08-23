/**
 * Ñkyel AI — Unified Workspace Layout Store
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Gère l'état spatial dynamique à 3 panneaux :
 * - Left Sidebar (Navigation & Sessions)
 * - Central Intelligence Workspace (Chat / VIE / Composer)
 * - Right Context Inspector (Run, Sources, Tools, Skills, MCP)
 * - Focus Mode (Mode concentration maximale : Chat centré sans distractions)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSidebar } from './useSidebar';

export type InspectorTab = 'run' | 'sources' | 'tools' | 'skills' | 'mcp';

interface WorkspaceLayoutState {
  isLeftOpen: boolean;
  isRightOpen: boolean;
  rightTab: InspectorTab;
  selectedSourceId: string | null;
  isFocusMode: boolean;
  rightWidth: number; // in pixels, default 360

  // Actions
  toggleLeft: () => void;
  setLeftOpen: (open: boolean) => void;
  toggleRight: () => void;
  setRightOpen: (open: boolean) => void;
  setRightTab: (tab: InspectorTab) => void;
  openSource: (sourceId: string) => void;
  toggleFocusMode: () => void;
  setRightWidth: (width: number) => void;
}

export const useWorkspaceLayout = create<WorkspaceLayoutState>()(
  persist(
    (set, get) => ({
      isLeftOpen: true,
      isRightOpen: false, // contextual, opens on run / inspection
      rightTab: 'run',
      selectedSourceId: null,
      isFocusMode: false,
      rightWidth: 360,

      toggleLeft: () => {
        try {
          useSidebar.getState().toggleCollapse();
        } catch {}
        set((s) => ({ isLeftOpen: !s.isLeftOpen, isFocusMode: false }));
      },
      setLeftOpen: (open: boolean) => {
        try {
          useSidebar.getState().setCollapsed(!open);
        } catch {}
        set({ isLeftOpen: open, isFocusMode: false });
      },
      toggleRight: () => set((s) => ({ isRightOpen: !s.isRightOpen, isFocusMode: false })),
      setRightOpen: (open: boolean) => set({ isRightOpen: open, isFocusMode: false }),
      setRightTab: (tab: InspectorTab) => set({ rightTab: tab, isRightOpen: true, isFocusMode: false }),

      openSource: (sourceId: string) =>
        set({
          rightTab: 'sources',
          selectedSourceId: sourceId,
          isRightOpen: true,
          isFocusMode: false,
        }),

      toggleFocusMode: () =>
        set((s) => {
          if (s.isFocusMode) {
            try {
              useSidebar.getState().setCollapsed(false);
            } catch {}
            return { isFocusMode: false, isLeftOpen: true, isRightOpen: false };
          }
          try {
            useSidebar.getState().setCollapsed(true);
          } catch {}
          return { isFocusMode: true, isLeftOpen: false, isRightOpen: false };
        }),

      setRightWidth: (width: number) =>
        set({ rightWidth: Math.min(460, Math.max(300, width)) }),
    }),
    {
      name: 'nkyel_workspace_layout_v2',
      partialize: (state) => ({
        rightWidth: state.rightWidth,
        rightTab: state.rightTab,
      }),
    }
  )
);
