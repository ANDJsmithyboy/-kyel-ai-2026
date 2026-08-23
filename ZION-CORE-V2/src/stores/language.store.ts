/**
 * Ñkyel AI · Dynamic Language & Global Settings Store
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Gère les 5 dimensions linguistiques indépendantes :
 * 1. uiLanguage (Langue de l'interface)
 * 2. conversationLanguage (Langue du dialogue)
 * 3. documentLanguage (Langue des livrables)
 * 4. searchLanguage (Langue de recherche Web pivot)
 * 5. voiceLanguage (Langue de transcription et synthèse STT/TTS)
 * + Mode Bas Débit (Low Bandwidth) pour connexions limitées
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LanguageItem {
  tag: string;
  name: string;
  nativeName: string;
  region?: string;
  script: string;
  direction: 'ltr' | 'rtl';
  uiStatus: 'stable' | 'beta' | 'partial' | 'unavailable';
  llmStatus: 'stable' | 'beta' | 'experimental' | 'unavailable';
  sttStatus: 'stable' | 'beta' | 'experimental' | 'unavailable';
  ttsStatus: 'stable' | 'beta' | 'experimental' | 'unavailable';
  translationStatus: 'stable' | 'beta' | 'experimental' | 'unavailable';
  isAfricanPriority: boolean;
  notes?: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  // ─── LANGUES GABONAISES & AFRICAINES PRIORITAIRES ─────────────
  {
    tag: 'fan',
    name: 'Fang',
    nativeName: 'Faŋ',
    region: 'Gabon, Cameroun, Guinée Équatoriale',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    sttStatus: 'experimental',
    ttsStatus: 'experimental',
    translationStatus: 'beta',
    isAfricanPriority: true,
    notes: 'Variantes Ekang, Ntumu et Atsi supportées.',
  },
  {
    tag: 'puu',
    name: 'Punu',
    nativeName: 'Yipunu',
    region: 'Gabon (Ngounié, Nyanga), Congo',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    sttStatus: 'experimental',
    ttsStatus: 'experimental',
    translationStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'mye',
    name: 'Myènè (Pongwé / Mpongwè)',
    nativeName: 'Omyènè',
    region: 'Gabon (Estuaire, Ogooué-Maritime)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    sttStatus: 'experimental',
    ttsStatus: 'experimental',
    translationStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'nzb',
    name: 'Nzebi (Bandjabi)',
    nativeName: 'Inzebi',
    region: 'Gabon, Congo',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    sttStatus: 'experimental',
    ttsStatus: 'experimental',
    translationStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'toli',
    name: 'Tolibangado',
    nativeName: 'Tolibangando',
    region: 'Gabon (Argot Urbain)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    sttStatus: 'experimental',
    ttsStatus: 'unavailable',
    translationStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    region: 'Afrique de l’Est & Centrale',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'lin',
    name: 'Lingala',
    nativeName: 'Lingála',
    region: 'RDC, Congo-Brazzaville',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'beta',
    ttsStatus: 'beta',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'wol',
    name: 'Wolof',
    nativeName: 'Wolof',
    region: 'Sénégal, Gambie',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'beta',
    ttsStatus: 'beta',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'hau',
    name: 'Haoussa',
    nativeName: 'Harshen Hausa',
    region: 'Nigeria, Niger, Ghana',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'yor',
    name: 'Yoruba',
    nativeName: 'Èdè Yorùbá',
    region: 'Nigeria, Bénin, Togo',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'amh',
    name: 'Amharique',
    nativeName: 'አማርኛ',
    region: 'Éthiopie',
    script: 'Ethi',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'beta',
    ttsStatus: 'beta',
    translationStatus: 'stable',
    isAfricanPriority: true,
  },

  // ─── LANGUES INTERNATIONALES MAJEURES ─────────────────────────
  {
    tag: 'fr',
    name: 'Français',
    nativeName: 'Français',
    region: 'International',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'en',
    name: 'Anglais',
    nativeName: 'English',
    region: 'International',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'es',
    name: 'Espagnol',
    nativeName: 'Español',
    region: 'Monde Hispanophone',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'pt',
    name: 'Portugais',
    nativeName: 'Português',
    region: 'Monde Lusophone (Angola, Mozambique, Brésil)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ar',
    name: 'Arabe',
    nativeName: 'العربية',
    region: 'Afrique du Nord & Moyen-Orient',
    script: 'Arab',
    direction: 'rtl',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'zh',
    name: 'Chinois (Mandarin)',
    nativeName: '中文',
    region: 'Asie',
    script: 'Hans',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'de',
    name: 'Allemand',
    nativeName: 'Deutsch',
    region: 'Europe (Allemagne, Autriche, Suisse)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ja',
    name: 'Japonais',
    nativeName: '日本語',
    region: 'Asie (Japon)',
    script: 'Jpan',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ko',
    name: 'Coréen',
    nativeName: '한국어',
    region: 'Asie (Corée)',
    script: 'Kore',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'Asie du Sud (Inde)',
    script: 'Deva',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'Asie du Sud (Bangladesh, Inde)',
    script: 'Beng',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'tr',
    name: 'Turc',
    nativeName: 'Türkçe',
    region: 'Eurasie (Turquie)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ru',
    name: 'Russe',
    nativeName: 'Русский',
    region: 'Eurasie',
    script: 'Cyrl',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'uk',
    name: 'Ukrainien',
    nativeName: 'Українська',
    region: 'Europe (Ukraine)',
    script: 'Cyrl',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'id',
    name: 'Indonésien',
    nativeName: 'Bahasa Indonesia',
    region: 'Asie du Sud-Est (Indonésie)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'vi',
    name: 'Vietnamien',
    nativeName: 'Tiếng Việt',
    region: 'Asie du Sud-Est (Vietnam)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'it',
    name: 'Italien',
    nativeName: 'Italiano',
    region: 'Europe (Italie, Suisse)',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    sttStatus: 'stable',
    ttsStatus: 'stable',
    translationStatus: 'stable',
    isAfricanPriority: false,
  },
];

interface LanguageState {
  uiLanguage: string;
  conversationLanguage: string;
  documentLanguage: string;
  searchLanguage: string;
  voiceLanguage: string;
  enableCodeSwitching: boolean;
  preserveCitationsOriginal: boolean;
  lowBandwidthMode: boolean;
  isModalOpen: boolean;

  setUiLanguage: (tag: string) => void;
  setConversationLanguage: (tag: string) => void;
  setDocumentLanguage: (tag: string) => void;
  setSearchLanguage: (tag: string) => void;
  setVoiceLanguage: (tag: string) => void;
  toggleCodeSwitching: () => void;
  toggleLowBandwidthMode: () => void;
  setModalOpen: (open: boolean) => void;
  getDirection: () => 'ltr' | 'rtl';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      uiLanguage: 'fr',
      conversationLanguage: 'auto',
      documentLanguage: 'fr',
      searchLanguage: 'auto',
      voiceLanguage: 'fr',
      enableCodeSwitching: true,
      preserveCitationsOriginal: true,
      lowBandwidthMode: false,
      isModalOpen: false,

      setUiLanguage: (tag) => {
        set({ uiLanguage: tag });
        const lang = SUPPORTED_LANGUAGES.find((l) => l.tag === tag);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = tag;
          document.documentElement.dir = lang?.direction || 'ltr';
        }
      },
      setConversationLanguage: (tag) => set({ conversationLanguage: tag }),
      setDocumentLanguage: (tag) => set({ documentLanguage: tag }),
      setSearchLanguage: (tag) => set({ searchLanguage: tag }),
      setVoiceLanguage: (tag) => set({ voiceLanguage: tag }),
      toggleCodeSwitching: () => set((s) => ({ enableCodeSwitching: !s.enableCodeSwitching })),
      toggleLowBandwidthMode: () => set((s) => ({ lowBandwidthMode: !s.lowBandwidthMode })),
      setModalOpen: (open) => set({ isModalOpen: open }),
      getDirection: () => {
        const lang = SUPPORTED_LANGUAGES.find((l) => l.tag === get().uiLanguage);
        return lang?.direction || 'ltr';
      },
    }),
    {
      name: 'nkyel-language-preferences',
    }
  )
);
