/* Gaboma AI · theme.ts · SmartANDJ AI Technologies
   Store thèmes (6 thèmes) + accents (5 pétales du logo) */

import { create } from 'zustand';

/* ── Types ────────────────────────────────────────── */
export type ThemeKey =
  | 'black-panther'
  | 'nuit-lope'
  | 'aurore-ogoue'
  | 'bleu-nuit'
  | 'violette-mandrille'
  | 'neo-blanc';

export type AccentKey = 'foret' | 'ocean' | 'soleil' | 'flamme' | 'nuit';

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

/* ── 6 Themes ────────────────────────────────────── */
export const THEMES: ThemeConfig[] = [
  { key: 'black-panther',      name: 'Black Panther',      color: '#C5A059', description: 'Mode agent autonome par défaut', isLight: false },
  { key: 'nuit-lope',          name: 'Nuit Lopé',          color: '#C9A84C', description: 'Forêt équatoriale la nuit — OLED', isLight: false },
  { key: 'aurore-ogoue',       name: 'Aurore Ogooué',      color: '#A67C2E', description: 'Fleuve Ogooué à l\'aube', isLight: true },
  { key: 'bleu-nuit',          name: 'Bleu Nuit',          color: '#C9A84C', description: 'Océan Atlantique à minuit', isLight: false },
  { key: 'violette-mandrille', name: 'Violette Mandrille', color: '#FFD600', description: 'Mandrill du Gabon + SmartandJ', isLight: false },
  { key: 'neo-blanc',          name: 'Néo Blanc',          color: '#B8922A', description: 'Marbre de Libreville', isLight: true },
];

/* ── 5 Accents (pétales du logo) ─────────────────── */
export const ACCENTS: AccentConfig[] = [
  { key: 'foret',  name: 'Forêt Gabonaise',     color: '#22C55E' },
  { key: 'ocean',  name: 'Océan Atlantique',     color: '#38BDF8' },
  { key: 'soleil', name: "Soleil d'Afrique",     color: '#FACC15' },
  { key: 'flamme', name: 'Flamme Équatoriale',   color: '#EF4444' },
  { key: 'nuit',   name: 'Nuit Tropicale',       color: '#7C3AED' },
];

/* ── Meta colors (theme-color per theme) ─────────── */
const META_COLORS: Record<ThemeKey, string> = {
  'black-panther':      '#020304',
  'nuit-lope':          '#050507',
  'aurore-ogoue':       '#F8F8F4',
  'bleu-nuit':          '#060A14',
  'violette-mandrille': '#08060F',
  'neo-blanc':          '#FAFAF8',
};

/* ── Light themes set ────────────────────────────── */
const LIGHT_THEMES = new Set<ThemeKey>(['aurore-ogoue', 'neo-blanc']);

/* ── DOM helpers ─────────────────────────────────── */
function applyTheme(theme: ThemeKey) {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.className = LIGHT_THEMES.has(theme) ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLORS[theme] || '#020304');
}

function applyAccent(accent: AccentKey) {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent);
}

/* ── Validate theme key ──────────────────────────── */
function isValidTheme(t: string): t is ThemeKey {
  return THEMES.some((theme) => theme.key === t);
}

/* ── Store ────────────────────────────────────────── */
interface ThemeState {
  theme: ThemeKey;
  accent: AccentKey;
  setTheme: (t: ThemeKey) => void;
  setAccent: (a: AccentKey) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'black-panther',
  accent: 'foret',
  setTheme: (t: ThemeKey) => {
    applyTheme(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gabomagpt_theme', t);
    }
    set({ theme: t });
  },
  setAccent: (a: AccentKey) => {
    applyAccent(a);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gabomagpt_accent', a);
    }
    set({ accent: a });
  },
}));

/* ── Initialize from localStorage ────────────────── */
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('gabomagpt_theme') || 'black-panther';
  const initial: ThemeKey = isValidTheme(storedTheme) ? storedTheme : 'black-panther';
  const initialAccent = (localStorage.getItem('gabomagpt_accent') as AccentKey) || 'foret';
  applyTheme(initial);
  applyAccent(initialAccent);
  useThemeStore.setState({ theme: initial, accent: initialAccent });
}
