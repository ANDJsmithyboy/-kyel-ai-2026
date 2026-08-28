import { create } from 'zustand';

interface SettingsModalState {
  isOpen: boolean;
  activeSection: string;
  open: (section?: string) => void;
  close: () => void;
}

export const useSettingsModal = create<SettingsModalState>((set) => ({
  isOpen: false,
  activeSection: 'general',
  open: (section?: string) => set({ isOpen: true, activeSection: section || 'general' }),
  close: () => set({ isOpen: false }),
}));
