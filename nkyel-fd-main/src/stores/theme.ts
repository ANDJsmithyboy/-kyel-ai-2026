/* Nkyel AI · theme.ts · SmartANDJ AI Technologies
   Store thèmes (Dark/Light/System) + accents sémantiques japonais */

import { create } from 'zustand';

/* -- Types ------------------------------------------ */
export type ThemeKey = 'dark' | 'light' | 'system';

export type AccentKey = 'violet' | 'magenta' | 'blue' | 'cyan' | 'green' | 'gold';

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  color: string;
  description: string;
  isLight: boolean;
}

export interface AccentConfig {
  key: AccentKey;
  name: string;
  color: string;
}

/* -- 3 Themes (Locked Visual Reference) ------------- */
export const THEMES: ThemeConfig[] = [
  { key: 'dark',   name: 'Dark',   color: '#070B12', description: 'Sumi / Deep Ink', isLight: false },
  { key: 'light',  name: 'Light',  color: '#FDF9F9', description: 'Shiro / Warm Paper', isLight: true },
  { key: 'system', name: 'System', color: 'auto',    description: 'System Preference', isLight: false }, // Resolves dynamically
];

/* -- 5 Accents (Mapped to Japanese Dictionary) ------ */
export const ACCENTS: AccentConfig[] = [
  { key: 'violet',  name: 'Violet',   color: '#7C3AED' },
  { key: 'magenta', name: 'Magenta',  color: '#EC4899' },
  { key: 'blue',    name: 'Blue',     color: '#3B82F6' },
  { key: 'cyan',    name: 'Cyan',     color: '#06B6D4' },
  { key: 'green',   name: 'Green',    color: '#10B981' },
  { key: 'gold',    name: 'Gold',     color: '#D5AE57' },
];

/* -- Meta colors (theme-color per theme) ----------- */
const META_COLORS: Record<string, string> = {
  'dark':  '#070B12',
  'light': '#FDF9F9',
};

/* -- DOM helpers ----------------------------------- */
function applyTheme(theme: ThemeKey) {
  if (typeof window === 'undefined') return;
  
  let resolvedTheme = theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.className = resolvedTheme === 'light' ? 'light' : 'dark';
  
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLORS[resolvedTheme] || '#070B12');
}

function applyAccent(accent: AccentKey) {
  if (typeof window === 'undefined') return;
  const config = ACCENTS.find((item) => item.key === accent);
  document.documentElement.setAttribute('data-accent', accent);
  if (config) document.documentElement.style.setProperty('--accent-brand', config.color);
}

/* -- Validate theme key ---------------------------- */
function isValidTheme(t: string): t is ThemeKey {
  return THEMES.some((theme) => theme.key === t);
}

/* -- Store ------------------------------------------ */
interface ThemeState {
  theme: ThemeKey;
  accent: AccentKey;
  setTheme: (t: ThemeKey) => void;
  setAccent: (a: AccentKey) => void;
}

export const useThemeStore = create<ThemeState>((set: any) => ({
  theme: 'dark',
  accent: 'neutral',
  setTheme: (t: ThemeKey) => {
    applyTheme(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('Nkyel_AI_theme', t);
    }
    set({ theme: t });
  },
  setAccent: (a: AccentKey) => {
    applyAccent(a);
    if (typeof window !== 'undefined') {
      localStorage.setItem('Nkyel_AI_accent', a);
    }
    set({ accent: a });
  },
}));

/* -- Initialize from localStorage ------------------ */
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('Nkyel_AI_theme') || 'dark';
  const initial: ThemeKey = isValidTheme(storedTheme) ? (storedTheme as ThemeKey) : 'dark';
  const storedAccent = localStorage.getItem('Nkyel_AI_accent');
  const initialAccent: AccentKey = ACCENTS.some((item) => item.key === storedAccent) ? (storedAccent as AccentKey) : ('violet' as AccentKey);
  
  applyTheme(initial);
  applyAccent(initialAccent);
  useThemeStore.setState({ theme: initial, accent: initialAccent });
  
  // Listen for system theme changes if set to system
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
}
