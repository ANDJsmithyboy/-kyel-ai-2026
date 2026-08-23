'use client';

import { create } from 'zustand';

export type NkyelEngineId = 'auto' | 'chui' | 'radi' | 'research';

export interface NkyelEngine {
  id: NkyelEngineId;
  label: string;
  apiModel: string;
}

const ENGINES: Record<NkyelEngineId, NkyelEngine> = {
  auto: { id: 'auto', label: 'Ñkyel', apiModel: 'auto' },
  chui: { id: 'chui', label: 'Chui', apiModel: 'chui' },
  radi: { id: 'radi', label: 'Radi', apiModel: 'radi' },
  research: { id: 'research', label: 'Research', apiModel: 'research' },
};

export const getNkyelEngine = (id: NkyelEngineId | string): NkyelEngine =>
  ENGINES[id as NkyelEngineId] ?? ENGINES.auto;

interface NkyelModelState {
  engineId: NkyelEngineId;
  setEngineId: (engineId: NkyelEngineId) => void;
}

export const useNkyelModel = create<NkyelModelState>((set) => ({
  engineId: 'auto',
  setEngineId: (engineId) => set({ engineId }),
}));
