'use client';

import { create } from 'zustand';

export type NkyelEngineId = 'auto' | 'chui' | 'radi' | 'research' | 'tai';
export type IntelligenceModeId = NkyelEngineId;

export interface NkyelEngine {
  id: NkyelEngineId;
  name: string;
  label: string;
  labelFr: string;
  labelEn: string;
  desc: string;
  descFr: string;
  descEn: string;
  badge?: string;
  apiModel: string;
}

export const ENGINES: Record<NkyelEngineId, NkyelEngine> = {
  auto: {
    id: 'auto',
    name: 'Ñkyel',
    label: 'Ñkyel',
    labelFr: 'Ñkyel',
    labelEn: 'Ñkyel',
    desc: 'Routage intelligent autonome',
    descFr: 'Routage intelligent autonome',
    descEn: 'Intelligent autonomous routing',
    apiModel: 'auto',
  },
  chui: {
    id: 'chui',
    name: 'Ñkyel Chui',
    label: 'Ñkyel Chui',
    labelFr: 'Ñkyel Chui',
    labelEn: 'Ñkyel Chui',
    desc: 'Raisonnement profond et code complexe',
    descFr: 'Raisonnement profond et code complexe',
    descEn: 'Deep reasoning & complex code',
    badge: 'Pro',
    apiModel: 'chui',
  },
  radi: {
    id: 'radi',
    name: 'Ñkyel Radi',
    label: 'Ñkyel Radi',
    labelFr: 'Ñkyel Radi',
    labelEn: 'Ñkyel Radi',
    desc: 'Ultra-rapide, concis et langues locales',
    descFr: 'Ultra-rapide, concis et langues locales',
    descEn: 'Ultra-fast, concise & local languages',
    apiModel: 'radi',
  },
  research: {
    id: 'research',
    name: 'Ñkyel Research',
    label: 'Ñkyel Research',
    labelFr: 'Ñkyel Research',
    labelEn: 'Ñkyel Research',
    desc: 'Recherche web et veille en direct',
    descFr: 'Recherche web et veille en direct',
    descEn: 'Live web search & deep grounding',
    apiModel: 'research',
  },
  tai: {
    id: 'tai',
    name: 'Ñkyel Tai',
    label: 'Ñkyel Tai',
    labelFr: 'Ñkyel Tai',
    labelEn: 'Ñkyel Tai',
    desc: 'Raisonnement multimodal & créativité',
    descFr: 'Raisonnement multimodal & créativité',
    descEn: 'Multimodal reasoning & creativity',
    badge: 'Plus',
    apiModel: 'tai',
  },
};

export const getNkyelEngine = (id: string): NkyelEngine => {
  if (id === 'fast') return ENGINES.radi;
  if (id === 'deep') return ENGINES.chui;
  return ENGINES[id as NkyelEngineId] ?? ENGINES.auto;
};

export const getIntelligenceMode = getNkyelEngine;

interface NkyelModelState {
  engineId: NkyelEngineId;
  modeId: NkyelEngineId;
  setEngineId: (engineId: NkyelEngineId) => void;
  setModeId: (modeId: NkyelEngineId) => void;
}

export const useNkyelModel = create<NkyelModelState>((set) => ({
  engineId: 'auto',
  modeId: 'auto',
  setEngineId: (engineId) => set({ engineId, modeId: engineId }),
  setModeId: (modeId) => set({ engineId: modeId, modeId }),
}));
