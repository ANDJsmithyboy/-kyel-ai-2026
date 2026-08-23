/**
 * Nkyel AI · useSidebar Hook (Zustand)
 * SmartANDJ AI Technologies
 * Collapsed state persisted to localStorage
 */

'use client';

import { create } from 'zustand';
import { SIDEBAR_STORAGE_KEY } from '@/constants/sidebar.constants';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

function readPersistedCollapsed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: readPersistedCollapsed(),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  toggleCollapse: () =>
    set((s) => {
      const next = !s.isCollapsed;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
      return { isCollapsed: next };
    }),

  setCollapsed: (collapsed) => {
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed)); } catch {}
    set({ isCollapsed: collapsed });
  },
}));
