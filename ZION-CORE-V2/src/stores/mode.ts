/* GabomaGPT · mode.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Store React (Zustand) pour les 4 modes : Aurata / Sonar / Onyx (Black Panther) / Loxo */

import { create } from 'zustand';

/* ── Types ────────────────────────────────────────── */
export type Mode = 'flash' | 'pro' | 'research' | 'agent' | 'superagent' | 'vision';

export interface ModeConfig {
  label: string;
  image: string;
  model: string;
  provider: 'groq' | 'anthropic' | 'deepseek' | 'alibaba' | 'openai';
  color: string;
  colorGlow: string;
  description: string;
  tokenCost: number;
}

/* ── Mapping modèles → fournisseurs ─────────────── */
export const MODEL_MAP: Record<Mode, ModeConfig> = {
  flash: {
    label: 'Aurata (Flash)',
    image: '/flash-image.jpg',
    model: 'aurata-spark',
    provider: 'groq',
    color: '#F57F17',
    colorGlow: '#FFD54F',
    description: 'Inférence Locale · Légère · Rapide comme le guépard',
    tokenCost: 1,
  },
  pro: {
    label: 'Ñkyel (Pro)',
    image: '/dauphin-image.jpg',
    model: 'nyel-deep',
    provider: 'deepseek',
    color: '#01579B',
    colorGlow: '#29B6F6',
    description: 'Modèle intelligent · Raisonnement avancé',
    tokenCost: 3,
  },
  research: {
    label: 'Wandana (Research)',
    image: '/loxo-image.jpg',
    model: 'wandana-archive',
    provider: 'alibaba',
    color: '#7C3AED',
    colorGlow: '#A78BFA',
    description: 'Deep Research · Web search et structuration massive',
    tokenCost: 5,
  },
  agent: {
    label: 'OnyxGris (Agent)',
    image: '/onyx-image.jpg',
    model: 'onyxgris-apex',
    provider: 'anthropic',
    color: '#475569',
    colorGlow: '#94A3B8',
    description: 'Agent autonome · Exécution silencieuse et actions web',
    tokenCost: 10,
  },
  superagent: {
    label: 'Black Panther (Super Agent)',
    image: '/black-panther-image.jpg',
    model: 'bp-multi',
    provider: 'anthropic',
    color: '#FF2244',
    colorGlow: '#FF2244',
    description: 'Super agent absolu · Ordonnanceur Multi-Agent',
    tokenCost: 15,
  },
  vision: {
    label: 'GabomaSeer (Vision)',
    image: '/seer-image.jpg',
    model: 'gabomaseer-eye',
    provider: 'openai',
    color: '#10B981',
    colorGlow: '#34D399',
    description: 'Super mode Vision · Analyse d\'images et vidéos de pointe',
    tokenCost: 8,
  },
};

/* ── Store Zustand ─────────────────────────────── */
interface ModeState {
  activeMode: Mode;
  setMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  activeMode: 'flash',

  setMode: (mode: Mode) => {
    set({ activeMode: mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('gabomagpt-mode', mode);
      if (mode === 'superagent') {
        document.body.classList.add('mode-bp');
      } else {
        document.body.classList.remove('mode-bp');
      }
    }
  },
}));

// Initialize from localStorage on client side only
if (typeof window !== 'undefined') {
  const saved = (localStorage.getItem('gabomagpt-mode') as Mode) || 'flash';
  useModeStore.setState({ activeMode: saved });
}

/* ── Helpers ──────────────────────────────────────── */
export const getActiveConfig = (mode: Mode) => MODEL_MAP[mode];
export const isBPMode = (mode: Mode) => mode === 'superagent';
