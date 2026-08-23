/**
 * Ñkyel AI · Dynamic Language, BCP-47 & RTL Architecture Store
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Principes fondamentaux :
 * 1. Distinction stricte entre UI LOCALE et AGENT PREFERRED LANGUAGE
 * 2. Support complet BCP-47 et noms natifs (Français, English, Fang, Punu, Myènè, 中文, 日本語, 한국어, العربية...)
 * 3. Support RTL complet et instantané (Arabe, Hébreu, Ourdou, Persan)
 * 4. Gestion des statuts réels d'interface et de modèles pour chaque langue
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LanguageItem {
  tag: string;              // BCP-47 tag (ex: 'fr-FR', 'fr-GA', 'en-US', 'en-GB', 'ar-SA', 'zh-CN', 'fan', 'puu')
  name: string;             // Nom d'affichage international
  nativeName: string;       // Nom NATIF dans la langue elle-même
  region?: string;          // Région / Pays
  script: string;           // Latn, Arab, Hans, Hant, Ethi, Deva, etc.
  direction: 'ltr' | 'rtl'; // Direction de lecture
  uiStatus: 'stable' | 'beta' | 'partial' | 'unavailable';
  llmStatus: 'stable' | 'beta' | 'experimental' | 'unavailable';
  isAfricanPriority: boolean;
  notes?: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  // ─── LANGUES GABONAISES & AFRICAINES PRIORITAIRES ─────────────
  {
    tag: 'fr-GA',
    name: 'Français (Gabon)',
    nativeName: 'Français (Gabon)',
    region: 'Gabon',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: true,
    notes: 'Français avec vocabulaire, contextes administratifs et monnaie XAF gabonais.',
  },
  {
    tag: 'fan',
    name: 'Fang',
    nativeName: 'Faŋ (Ekang)',
    region: 'Gabon, Cameroun, Guinée Équatoriale',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
    notes: 'Variantes Ekang, Ntumu et Atsi supportées avec conservation diacritique.',
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
    isAfricanPriority: true,
  },
  {
    tag: 'nzb',
    name: 'Nzebi (Bandjabi)',
    nativeName: 'Inzebi',
    region: 'Gabon (Haut-Ogooué, Ogooué-Lolo), Congo',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    region: 'Kenya, Tanzanie, RDC, Ouganda',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'stable',
    isAfricanPriority: true,
  },
  {
    tag: 'ln',
    name: 'Lingala',
    nativeName: 'Lingála',
    region: 'RDC, Congo-Brazzaville',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'wo',
    name: 'Wolof',
    nativeName: 'Wolof',
    region: 'Sénégal, Gambie',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'ha',
    name: 'Hausa',
    nativeName: 'Harshen Hausa',
    region: 'Nigéria, Niger',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'yo',
    name: 'Yoruba',
    nativeName: 'Èdè Yorùbá',
    region: 'Nigéria, Bénin',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'beta',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },
  {
    tag: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    region: 'Éthiopie',
    script: 'Ethi',
    direction: 'ltr',
    uiStatus: 'partial',
    llmStatus: 'beta',
    isAfricanPriority: true,
  },

  // ─── LANGUES MONDIALES (BCP-47) ───────────────────────────────
  {
    tag: 'fr-FR',
    name: 'Français (France)',
    nativeName: 'Français',
    region: 'France, Europe',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'fr-CA',
    name: 'Français (Canada)',
    nativeName: 'Français (Canada)',
    region: 'Canada, Québec',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'en-US',
    name: 'English (United States)',
    nativeName: 'English (US)',
    region: 'United States',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'en-GB',
    name: 'English (United Kingdom)',
    nativeName: 'English (UK)',
    region: 'United Kingdom',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'en-ZA',
    name: 'English (South Africa)',
    nativeName: 'English (South Africa)',
    region: 'South Africa',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'es-ES',
    name: 'Español (España)',
    nativeName: 'Español',
    region: 'España',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'es-MX',
    name: 'Español (México)',
    nativeName: 'Español (México)',
    region: 'México',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'pt-BR',
    name: 'Português (Brasil)',
    nativeName: 'Português (Brasil)',
    region: 'Brasil',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'pt-PT',
    name: 'Português (Portugal)',
    nativeName: 'Português (Portugal)',
    region: 'Portugal',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'de-DE',
    name: 'Deutsch',
    nativeName: 'Deutsch',
    region: 'Deutschland, Österreich, Schweiz',
    script: 'Latn',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'zh-CN',
    name: 'Chinois (Simplifié)',
    nativeName: '中文 (简体)',
    region: 'Chine',
    script: 'Hans',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ja-JP',
    name: 'Japonais',
    nativeName: '日本語',
    region: 'Japon',
    script: 'Jpan',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ko-KR',
    name: 'Coréen',
    nativeName: '한국어',
    region: 'Corée du Sud',
    script: 'Kore',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'Inde',
    script: 'Deva',
    direction: 'ltr',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
  },
  {
    tag: 'ar-SA',
    name: 'Arabe (Arabie Saoudite)',
    nativeName: 'العربية',
    region: 'Moyen-Orient, Afrique du Nord',
    script: 'Arab',
    direction: 'rtl',
    uiStatus: 'stable',
    llmStatus: 'stable',
    isAfricanPriority: false,
    notes: 'Support RTL intégral de tous les composants d’interface.',
  },
];

export const RTL_TAGS = new Set(['ar', 'ar-SA', 'ar-AE', 'ar-EG', 'he', 'he-IL', 'fa', 'fa-IR', 'ur', 'ur-PK']);

export function isRTL(tag: string): boolean {
  if (RTL_TAGS.has(tag)) return true;
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.tag === tag);
  return langObj?.direction === 'rtl';
}

export function applyRTLToDOM(tag: string) {
  if (typeof window === 'undefined') return;
  const rtl = isRTL(tag);
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', tag);
  if (rtl) {
    document.documentElement.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('rtl-mode');
  }
}

interface LanguageState {
  uiLocale: string;           // Ex: 'fr-FR', 'fr-GA', 'en-US', 'ar-SA'
  agentLanguage: string;      // Ex: 'auto', 'fr', 'en', 'fan', 'puu', 'ar', 'zh'
  isModalOpen: boolean;
  searchQuery: string;

  setUiLocale: (tag: string) => void;
  setAgentLanguage: (lang: string) => void;
  setModalOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  hydrate: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      uiLocale: 'fr-FR',
      agentLanguage: 'auto',
      isModalOpen: false,
      searchQuery: '',

      setUiLocale: (tag: string) => {
        applyRTLToDOM(tag);
        set({ uiLocale: tag });
      },

      setAgentLanguage: (lang: string) => {
        set({ agentLanguage: lang });
      },

      setModalOpen: (open: boolean) => set({ isModalOpen: open }),
      setSearchQuery: (q: string) => set({ searchQuery: q }),

      hydrate: () => {
        const state = get();
        applyRTLToDOM(state.uiLocale || 'fr-FR');
      },
    }),
    {
      name: 'Nkyel_Language_Storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyRTLToDOM(state.uiLocale || 'fr-FR');
        }
      },
    }
  )
);
