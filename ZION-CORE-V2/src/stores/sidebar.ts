/* GabomaGPT · sidebar.ts · SmartANDJ AI Technologies */
import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setMobile: (v: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: true,
  isMobile: false,

  toggle: () => {
    const next = !get().isOpen;
    set({ isOpen: next });
    if (typeof window !== 'undefined') localStorage.setItem('sidebar', String(next));
  },

  open: () => {
    set({ isOpen: true });
    if (typeof window !== 'undefined') localStorage.setItem('sidebar', 'true');
  },

  close: () => {
    set({ isOpen: false });
    if (typeof window !== 'undefined') localStorage.setItem('sidebar', 'false');
  },

  setMobile: (v: boolean) => {
    set({ isMobile: v });
    if (v) set({ isOpen: false });
  },
}));

// Initialize from localStorage on client side only
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('sidebar');
  if (saved !== null) {
    useSidebarStore.setState({ isOpen: saved === 'true' });
  }
}
