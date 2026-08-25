'use client';

import { create } from 'zustand';

export type IntelligenceModeId = 'auto' | 'fast' | 'deep' | 'research';
// Backward compatibility alias
export type NkyelEngineId = IntelligenceModeId | 'chui' | 'radi';

export interface IntelligenceMode {
  id: IntelligenceModeId;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  apiModel: string;
}

const MODES: Record<IntelligenceModeId, IntelligenceMode> = {
  auto: {
    id: 'auto',
    labelFr: 'Auto',
    labelEn: 'Auto',
    descFr: 'Routage dynamique intelligent',
    descEn: 'Dynamic intelligent routing',
    apiModel: 'auto',
  },
  fast: {
    id: 'fast',
    labelFr: 'Rapide',
    labelEn: 'Fast',
    descFr: 'Réponse ultra-rapide et concise',
    descEn: 'Ultra-fast concise response',
    apiModel: 'fast',
  },
  deep: {
    id: 'deep',
    labelFr: 'Profond',
    labelEn: 'Deep',
    descFr: 'Raisonnement profond et synthèse complexe',
    descEn: 'Deep reasoning & complex synthesis',
    apiModel: 'deep',
  },
  research: {
    id: 'research',
    labelFr: 'Recherche',
    labelEn: 'Research',
    descFr: 'Veille multi-sources et web en direct',
    descEn: 'Live web groundings & multi-sources',
    apiModel: 'research',
  },
};

export const getIntelligenceMode = (id: string): IntelligenceMode => {
  if (id === 'radi') return MODES.fast;
  if (id === 'chui') return MODES.deep;
  return MODES[id as IntelligenceModeId] ?? MODES.auto;
};

// Backward-compatibility export
export const getNkyelEngine = getIntelligenceMode;

interface IntelligenceModelState {
  modeId: IntelligenceModeId;
  engineId: IntelligenceModeId;
  setModeId: (modeId: IntelligenceModeId) => void;
  setEngineId: (modeId: IntelligenceModeId) => void;
}

export const useNkyelModel = create<IntelligenceModelState>((set) => ({
  modeId: 'auto',
  engineId: 'auto',
  setModeId: (modeId) => set({ modeId, engineId: modeId }),
  setEngineId: (engineId) => set({ modeId: engineId, engineId }),
}));
