/**
 * Ñkyel AI · Intelligence Mode State & Engine Definition
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical source of truth for intelligence modes:
 * - Auto (FR: Auto / EN: Auto) -> Intelligent autonomous routing
 * - Fast (FR: Rapide / EN: Fast) -> Ultra-fast, concise & responsive
 * - Deep (FR: Profond / EN: Deep) -> Deep reasoning & complex code
 * - Research (FR: Recherche / EN: Research) -> Live web search & deep grounding
 */

'use client';

import { create } from 'zustand';

export type IntelligenceModeId = 'auto' | 'fast' | 'deep' | 'research';
export type NkyelEngineId = IntelligenceModeId | 'chui' | 'radi' | 'tai';

export interface IntelligenceMode {
  id: IntelligenceModeId;
  name: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  badge?: string;
  apiModel: string;
}

export type NkyelEngine = IntelligenceMode;

export const INTELLIGENCE_MODES: Record<IntelligenceModeId, IntelligenceMode> = {
  auto: {
    id: 'auto',
    name: 'Ñkyel',
    labelFr: 'Ñkyel',
    labelEn: 'Ñkyel',
    descFr: 'Intelligence autonome générale',
    descEn: 'General autonomous intelligence',
    apiModel: 'auto',
  },
  fast: {
    id: 'fast',
    name: 'Ñkyel Radi',
    labelFr: 'Ñkyel Radi',
    labelEn: 'Ñkyel Radi',
    descFr: 'Rapide & concis',
    descEn: 'Fast & concise',
    apiModel: 'radi',
  },
  deep: {
    id: 'deep',
    name: 'Ñkyel Chui',
    labelFr: 'Ñkyel Chui',
    labelEn: 'Ñkyel Chui',
    descFr: 'Raisonnement profond & code complexe',
    descEn: 'Deep reasoning & complex code',
    badge: 'Pro',
    apiModel: 'chui',
  },
  research: {
    id: 'research',
    name: 'Ñkyel Research',
    labelFr: 'Ñkyel Research',
    labelEn: 'Ñkyel Research',
    descFr: 'Recherche approfondie & preuves',
    descEn: 'Deep research & evidence',
    apiModel: 'research',
  },
};

// Backward compatibility alias for ENGINES
export const ENGINES: Record<string, IntelligenceMode> = {
  ...INTELLIGENCE_MODES,
  chui: INTELLIGENCE_MODES.deep,
  radi: INTELLIGENCE_MODES.fast,
  tai: INTELLIGENCE_MODES.deep,
};

export const getIntelligenceMode = (id: string): IntelligenceMode => {
  if (id === 'chui' || id === 'deep') return INTELLIGENCE_MODES.deep;
  if (id === 'radi' || id === 'fast') return INTELLIGENCE_MODES.fast;
  if (id === 'research') return INTELLIGENCE_MODES.research;
  return INTELLIGENCE_MODES.auto;
};

export const getNkyelEngine = getIntelligenceMode;

interface NkyelModelState {
  engineId: IntelligenceModeId;
  modeId: IntelligenceModeId;
  selectedIntelligenceMode: IntelligenceModeId;
  setEngineId: (engineId: IntelligenceModeId | string) => void;
  setModeId: (modeId: IntelligenceModeId | string) => void;
}

const normalizeMode = (id: string): IntelligenceModeId => {
  if (id === 'chui' || id === 'deep') return 'deep';
  if (id === 'radi' || id === 'fast') return 'fast';
  if (id === 'research') return 'research';
  return 'auto';
};

export const useNkyelModel = create<NkyelModelState>((set) => ({
  engineId: 'auto',
  modeId: 'auto',
  selectedIntelligenceMode: 'auto',
  setEngineId: (id) => {
    const normalized = normalizeMode(id);
    set({ engineId: normalized, modeId: normalized, selectedIntelligenceMode: normalized });
  },
  setModeId: (id) => {
    const normalized = normalizeMode(id);
    set({ engineId: normalized, modeId: normalized, selectedIntelligenceMode: normalized });
  },
}));
