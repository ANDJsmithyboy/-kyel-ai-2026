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
import IntlMessageFormat from 'intl-messageformat';

export type BCP47Language = string;

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

const localeLoaders: Record<string, () => Promise<any>> = {
  'ar': () => import('@/locales/ar/common.json'),
  'de-DE': () => import('@/locales/de-DE/common.json'),
  'en-US': () => import('@/locales/en-US/common.json'),
  'es-ES': () => import('@/locales/es-ES/common.json'),
  'es-419': () => import('@/locales/es-419/common.json'),
  'fr-FR': () => import('@/locales/fr-FR/common.json'),
  'hi-IN': () => import('@/locales/hi-IN/common.json'),
  'it-IT': () => import('@/locales/it-IT/common.json'),
  'ja-JP': () => import('@/locales/ja-JP/common.json'),
  'ko-KR': () => import('@/locales/ko-KR/common.json'),
  'pt-BR': () => import('@/locales/pt-BR/common.json'),
  'pt-PT': () => import('@/locales/pt-PT/common.json'),
  'th-TH': () => import('@/locales/th-TH/common.json'),
  'tr-TR': () => import('@/locales/tr-TR/common.json'),
  'vi-VN': () => import('@/locales/vi-VN/common.json'),
  'zh-Hans': () => import('@/locales/zh-Hans/common.json'),
  'zh-Hant': () => import('@/locales/zh-Hant/common.json'),
};

interface LanguageState {
  uiLocale: string;           // Default 'en-US' for international audience
  locale?: string;
  agentLanguage: string;      // Ex: 'auto', 'en', 'fr', 'fan', 'puu', 'ar', 'zh'
  isModalOpen: boolean;
  searchQuery: string;
  translations: Record<string, string>;

  setUiLocale: (tag: string) => Promise<void>;
  setLocale?: (tag: string) => Promise<void>;
  setAgentLanguage: (lang: string) => void;
  setModalOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  loadTranslations: (locale: string) => Promise<void>;
  t: (key: string, values?: Record<string, any>) => string;
  hydrate: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set: any, get: any) => ({
      uiLocale: 'en-US',
      locale: 'en-US',
      agentLanguage: 'auto',
      isModalOpen: false,
      searchQuery: '',
      translations: {},

      loadTranslations: async (tag: string) => {
        try {
          // Extraire juste la partie BCP-47 de base pour les locales similaires si manquant
          const baseTag = tag.split('-')[0];
          let loader = localeLoaders[tag] || localeLoaders[baseTag];
          
          if (!loader) {
            // Fallbacks intelligents
            if (tag.startsWith('fr')) loader = localeLoaders['fr-FR'];
            else if (tag.startsWith('es')) loader = localeLoaders['es-ES'];
            else if (tag.startsWith('pt')) loader = localeLoaders['pt-PT'];
            else loader = localeLoaders['en-US'];
          }
          
          const module = await loader();
          set({ translations: module.default || module });
        } catch (e) {
          console.error(`[i18n] Failed to load translations for ${tag}`, e);
          if (tag !== 'en-US') {
            const fb = await localeLoaders['en-US']();
            set({ translations: fb.default || fb });
          }
        }
      },

      setUiLocale: async (tag: string) => {
        applyRTLToDOM(tag);
        set({ uiLocale: tag, locale: tag });
        await get().loadTranslations(tag);
      },

      setLocale: async (tag: string) => {
        applyRTLToDOM(tag);
        set({ uiLocale: tag, locale: tag });
        await get().loadTranslations(tag);
      },

      setAgentLanguage: (lang: string) => {
        set({ agentLanguage: lang });
      },

      setModalOpen: (open: boolean) => set({ isModalOpen: open }),
      setSearchQuery: (q: string) => set({ searchQuery: q }),

      t: (key: string, values?: Record<string, any>) => {
        const translations = get().translations;
        const locale = get().uiLocale || 'en-US';
        const rawString = translations[key] || key;
        
        if (!values) return rawString;
        
        try {
          const formatter = new IntlMessageFormat(rawString, locale);
          return formatter.format(values) as string;
        } catch (err) {
          console.warn(`[i18n] Error formatting key "${key}":`, err);
          return rawString;
        }
      },

      hydrate: async () => {
        const state = get();
        applyRTLToDOM(state.uiLocale || 'en-US');
        await get().loadTranslations(state.uiLocale || 'en-US');
      },
    }),
    {
      name: 'Nkyel_Language_Storage',
      onRehydrateStorage: () => (state: any) => {
        if (state) {
          applyRTLToDOM(state.uiLocale || 'en-US');
          if (state.loadTranslations) {
            state.loadTranslations(state.uiLocale || 'en-US');
          }
        }
      },
    }
  )
);

