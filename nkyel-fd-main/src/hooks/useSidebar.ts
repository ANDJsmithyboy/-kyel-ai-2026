/**
 * Ñkyel AI · useSidebar Hook (Zustand)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * State persistence with desktop collapse & mobile drawer synchronization
 * SSR-safe: deterministic initial state (isCollapsed: false) to prevent hydration mismatches
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
  hydrateFromStorage: () => void;
}

export const useSidebar = create<SidebarState>((set, get) => ({
  isOpen: false,
  isCollapsed: false, // Deterministic initial state for SSR and initial hydration
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

  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === 'true') {
        set({ isCollapsed: true });
      }
    } catch {}
  },
}));
