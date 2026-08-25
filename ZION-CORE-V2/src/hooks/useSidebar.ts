/**
 * Ñkyel AI · useSidebar Hook (Zustand)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * State persistence with desktop collapse & mobile drawer synchronization
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
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

function readPersistedCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved === 'true';
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

  openMobileSidebar: () => set({ isOpen: true }),
  closeMobileSidebar: () => set({ isOpen: false }),

  toggleCollapse: () =>
    set((s) => {
      const next = !s.isCollapsed;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return { isCollapsed: next };
    }),

  toggleSidebar: () => {
    const state = get();
    if (state.isMobile) {
      set({ isOpen: !state.isOpen });
    } else {
      const next = !state.isCollapsed;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      set({ isCollapsed: next });
    }
  },

  setCollapsed: (collapsed) => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {}
    set({ isCollapsed: collapsed });
  },

  setIsMobile: (isMobile) => set({ isMobile }),
}));
