import { create } from 'zustand';

export interface PersonalizationData {
  nickname: string;
  profession: string;
  about: string;
  preferredLanguage: string;
  responseStyle: string;
  timezone: string;
}

interface PersonalizationState {
  data: PersonalizationData | null;
  isLoading: boolean;
  error: string | null;
  
  isSaving: boolean;
  saveError: string | null;

  fetchPersonalization: () => Promise<void>;
  updatePersonalization: (updates: Partial<PersonalizationData>) => Promise<void>;
}

export const usePersonalizationStore = create<PersonalizationState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  
  isSaving: false,
  saveError: null,

  fetchPersonalization: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const res = await fetch('/api/v1/me/personalization').catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        set({ data: json.data, isLoading: false });
      } else {
        // Real Backend First: if 404, we assume no data is present yet. 
        // We set to empty string values, which is the REAL empty state.
        set({
          data: {
            nickname: '',
            profession: '',
            about: '',
            preferredLanguage: '',
            responseStyle: '',
            timezone: ''
          },
          isLoading: false
        });
      }
    } catch (err: any) {
      set({ error: 'Impossible de charger la personnalisation', isLoading: false });
    }
  },

  updatePersonalization: async (updates: Partial<PersonalizationData>) => {
    const currentData = get().data;
    if (!currentData) return;

    try {
      set({ isSaving: true, saveError: null });

      const res = await fetch('/api/v1/me/personalization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const json = await res.json();
        set({ data: { ...currentData, ...json.data }, isSaving: false });
      } else {
        // Enforce Rule 14: Never hide failures with fake success
        set({ saveError: 'Erreur lors de la sauvegarde côté serveur.', isSaving: false });
      }
    } catch (err: any) {
      set({ saveError: 'Impossible de joindre le serveur.', isSaving: false });
    }
  }
}));
