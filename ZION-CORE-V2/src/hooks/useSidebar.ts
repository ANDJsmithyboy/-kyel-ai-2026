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
  isMobile: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapse: () => void;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

function readPersistedCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export const useSidebar = create<SidebarState>((set, get) => ({
  isOpen: false,
  isCollapsed: readPersistedCollapsed(),
  isMobile: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  toggleCollapse: () =>
    set((s) => {
      const next = !s.isCollapsed;
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
      return { isCollapsed: next };
    }),

  toggleSidebar: () => {
    get().toggleCollapse();
  },

  closeMobileSidebar: () => {
    get().close();
  },

  setCollapsed: (collapsed) => {
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed)); } catch {}
    set({ isCollapsed: collapsed });
  },
}));
