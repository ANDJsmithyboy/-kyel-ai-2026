/* Gaboma AI · adminTheme.ts · SmartANDJ AI Technologies
   Admin panel theme — aligned with 6-theme system */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminThemeName = 'BLACK_PANTHER' | 'NUIT_LOPE' | 'AURORE_OGOUE' | 'BLEU_NUIT' | 'VIOLETTE_MANDRILLE' | 'NEO_BLANC';

export interface AdminTheme {
  name: AdminThemeName;
  label: string;
  isDark: boolean;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentGlow: string;
}

export const adminThemes: Record<AdminThemeName, AdminTheme> = {
  BLACK_PANTHER: {
    name: 'BLACK_PANTHER', label: 'Black Panther', isDark: true,
    bg: 'bg-[#020304]', surface: 'bg-[#0A0908]', border: 'border-white/[0.04]',
    text: 'text-[#EDEAE3]', textMuted: 'text-[#8A8378]',
    accent: 'text-[#C5A059]', accentBg: 'bg-[#C5A059]', accentGlow: 'bg-[#C5A059]'
  },
  NUIT_LOPE: {
    name: 'NUIT_LOPE', label: 'Nuit Lopé', isDark: true,
    bg: 'bg-[#050507]', surface: 'bg-[#0D0D12]', border: 'border-white/[0.04]',
    text: 'text-[#EDECE6]', textMuted: 'text-[#888680]',
    accent: 'text-[#C9A84C]', accentBg: 'bg-[#C9A84C]', accentGlow: 'bg-[#00D4AA]'
  },
  AURORE_OGOUE: {
    name: 'AURORE_OGOUE', label: 'Aurore Ogooué', isDark: false,
    bg: 'bg-[#F8F8F4]', surface: 'bg-[#FFFFFF]', border: 'border-black/[0.06]',
    text: 'text-[#18181B]', textMuted: 'text-[#52525B]',
    accent: 'text-[#A67C2E]', accentBg: 'bg-[#A67C2E]', accentGlow: 'bg-[#00C896]'
  },
  BLEU_NUIT: {
    name: 'BLEU_NUIT', label: 'Bleu Nuit', isDark: true,
    bg: 'bg-[#060A14]', surface: 'bg-[#0A1020]', border: 'border-white/[0.04]',
    text: 'text-[#EFF6FF]', textMuted: 'text-[#94A3B8]',
    accent: 'text-[#C9A84C]', accentBg: 'bg-[#C9A84C]', accentGlow: 'bg-[#38BDF8]'
  },
  VIOLETTE_MANDRILLE: {
    name: 'VIOLETTE_MANDRILLE', label: 'Violette Mandrille', isDark: true,
    bg: 'bg-[#08060F]', surface: 'bg-[#100C1A]', border: 'border-white/[0.04]',
    text: 'text-[#F5F3FF]', textMuted: 'text-[#A78BFA]',
    accent: 'text-[#FFD600]', accentBg: 'bg-[#FFD600]', accentGlow: 'bg-[#E8333A]'
  },
  NEO_BLANC: {
    name: 'NEO_BLANC', label: 'Néo Blanc', isDark: false,
    bg: 'bg-[#FAFAF8]', surface: 'bg-[#FFFFFF]', border: 'border-black/[0.06]',
    text: 'text-[#09090B]', textMuted: 'text-[#52525B]',
    accent: 'text-[#B8922A]', accentBg: 'bg-[#B8922A]', accentGlow: 'bg-[#D4A843]'
  }
};

interface AdminThemeState {
  currentTheme: AdminThemeName;
  sidebarCollapsed: boolean;
  setTheme: (theme: AdminThemeName) => void;
  toggleSidebar: () => void;
}

export const useAdminTheme = create<AdminThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'BLACK_PANTHER',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ currentTheme: theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'admin-theme-storage',
    }
  )
);
