/* Gaboma AI · settings.store.ts · SmartANDJ AI Technologies
   Paramètres utilisateur persistés en localStorage */

import { create } from 'zustand';

/* ── Re-export theme types from single source ────── */
export type { ThemeKey, AccentKey } from './theme';
export { THEMES, ACCENTS } from './theme';

import type { ThemeKey, AccentKey } from './theme';
import { THEMES } from './theme';

export type FontSize = 'small' | 'normal' | 'large';
export type GreetingStyle = 'formel' | 'gabonais' | 'argot';

/* ── Noms de modèles masqués (utilisateurs normaux) ── */
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'aurata-spark': 'Aurata (Flash)',
  'sonar-deep': 'Sonar (Pro)',
  'onyx-apex': 'Onyx (Agent)',
  'loxo-archive': 'Wandana (Research)',
  'black-panther-v4': 'Black Panther',
};

export function getDisplayModelName(realName: string, isAdmin: boolean): string {
  if (isAdmin) return realName;
  return MODEL_DISPLAY_NAMES[realName] || realName;
}

/* ── Light themes ────────────────────────────────── */
const LIGHT_THEMES = new Set<ThemeKey>(['aurore-ogoue', 'neo-blanc']);

/* ── State ───────────────────────────────────────── */
interface SettingsState {
  theme: ThemeKey;
  accent: AccentKey;
  fontSize: FontSize;
  greetingStyle: GreetingStyle;
  language: string;
  showThinking: boolean;
  streamResponses: boolean;
  showCopyButton: boolean;
  codeSyntaxHighlight: boolean;
  blackPantherMode: boolean;

  setTheme: (t: ThemeKey) => void;
  setAccent: (a: AccentKey) => void;
  setFontSize: (f: FontSize) => void;
  setGreetingStyle: (g: GreetingStyle) => void;
  setLanguage: (l: string) => void;
  toggleThinking: () => void;
  toggleStream: () => void;
  toggleCopy: () => void;
  toggleSyntax: () => void;
  toggleBlackPanther: () => void;
  hydrate: () => void;
}

/* ── Helpers ─────────────────────────────────────── */
function ls(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(key) || fallback;
}

function isValidTheme(t: string): t is ThemeKey {
  return THEMES.some((theme) => theme.key === t);
}

function applyThemeToDOM(theme: ThemeKey) {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.className = LIGHT_THEMES.has(theme) ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  const t = THEMES.find((x) => x.key === theme);
  if (meta && t) {
    const metaColors: Record<ThemeKey, string> = {
      'black-panther': '#020304', 'nuit-lope': '#050507', 'aurore-ogoue': '#F8F8F4',
      'bleu-nuit': '#060A14', 'violette-mandrille': '#08060F', 'neo-blanc': '#FAFAF8',
    };
    meta.setAttribute('content', metaColors[theme] || '#020304');
  }
}

function applyAccentToDOM(accent: AccentKey) {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent);
}

function applyFontSizeToDOM(fs: FontSize) {
  if (typeof window === 'undefined') return;
  const scale = fs === 'small' ? 0.9 : fs === 'large' ? 1.1 : 1;
  document.documentElement.style.setProperty('--app-text-scale', String(scale));
}

/* ── Store ────────────────────────────────────────── */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'black-panther' as ThemeKey,
  accent: 'foret' as AccentKey,
  fontSize: 'normal' as FontSize,
  greetingStyle: 'gabonais' as GreetingStyle,
  language: 'fr',
  showThinking: true,
  streamResponses: true,
  showCopyButton: true,
  codeSyntaxHighlight: true,
  blackPantherMode: false,

  hydrate: () => {
    const rawTheme = ls('gabomagpt_theme', 'black-panther');
    const theme: ThemeKey = isValidTheme(rawTheme) ? rawTheme : 'black-panther';
    const accent = ls('gabomagpt_accent', 'foret') as AccentKey;
    const fontSize = ls('gabomagpt_fontSize', 'normal') as FontSize;
    const greetingStyle = ls('gabomagpt_greetingStyle', 'gabonais') as GreetingStyle;
    const language = ls('gabomagpt_language', 'fr');
    const showThinking = ls('gabomagpt_showThinking', 'true') === 'true';
    const streamResponses = ls('gabomagpt_streamResponses', 'true') === 'true';
    const showCopyButton = ls('gabomagpt_showCopyButton', 'true') === 'true';
    const codeSyntaxHighlight = ls('gabomagpt_codeSyntax', 'true') === 'true';
    const blackPantherMode = ls('gabomagpt_bp', 'false') === 'true';

    applyThemeToDOM(blackPantherMode ? 'black-panther' : theme);
    applyAccentToDOM(accent);
    applyFontSizeToDOM(fontSize);

    set({ theme, accent, fontSize, greetingStyle, language, showThinking, streamResponses, showCopyButton, codeSyntaxHighlight, blackPantherMode });
  },

  setTheme: (t) => {
    applyThemeToDOM(t);
    localStorage.setItem('gabomagpt_theme', t);
    set({ theme: t });
  },

  setAccent: (a) => {
    applyAccentToDOM(a);
    localStorage.setItem('gabomagpt_accent', a);
    set({ accent: a });
  },

  setFontSize: (f) => {
    applyFontSizeToDOM(f);
    localStorage.setItem('gabomagpt_fontSize', f);
    set({ fontSize: f });
  },

  setGreetingStyle: (g) => {
    localStorage.setItem('gabomagpt_greetingStyle', g);
    set({ greetingStyle: g });
  },

  setLanguage: (l) => {
    localStorage.setItem('gabomagpt_language', l);
    set({ language: l });
  },

  toggleThinking: () => {
    const v = !get().showThinking;
    localStorage.setItem('gabomagpt_showThinking', String(v));
    set({ showThinking: v });
  },

  toggleStream: () => {
    const v = !get().streamResponses;
    localStorage.setItem('gabomagpt_streamResponses', String(v));
    set({ streamResponses: v });
  },

  toggleCopy: () => {
    const v = !get().showCopyButton;
    localStorage.setItem('gabomagpt_showCopyButton', String(v));
    set({ showCopyButton: v });
  },

  toggleSyntax: () => {
    const v = !get().codeSyntaxHighlight;
    localStorage.setItem('gabomagpt_codeSyntax', String(v));
    set({ codeSyntaxHighlight: v });
  },

  toggleBlackPanther: () => {
    const v = !get().blackPantherMode;
    localStorage.setItem('gabomagpt_bp', String(v));
    if (v) {
      applyThemeToDOM('black-panther');
    } else {
      applyThemeToDOM(get().theme);
    }
    set({ blackPantherMode: v });
  },
}));
