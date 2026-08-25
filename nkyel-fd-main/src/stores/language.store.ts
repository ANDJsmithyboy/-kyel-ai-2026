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

export const DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Shell
  'nav.newTask': { 'en-US': 'New task', 'fr-FR': 'Nouvelle tâche', 'fr-GA': 'Nouvelle tâche' },
  'nav.agent': { 'en-US': 'Agent', 'fr-FR': 'Agent', 'fr-GA': 'Agent' },
  'nav.plugins': { 'en-US': 'Plugins', 'fr-FR': 'Plugins', 'fr-GA': 'Plugins' },
  'nav.scheduled': { 'en-US': 'Scheduled', 'fr-FR': 'Programmé', 'fr-GA': 'Programmé' },
  'nav.library': { 'en-US': 'Library', 'fr-FR': 'Bibliothèque', 'fr-GA': 'Bibliothèque' },
  'nav.projects': { 'en-US': 'Projects', 'fr-FR': 'Projets', 'fr-GA': 'Projets' },
  'nav.newProject': { 'en-US': 'New project', 'fr-FR': 'Nouveau projet', 'fr-GA': 'Nouveau projet' },
  'nav.tasks': { 'en-US': 'Recent tasks', 'fr-FR': 'Tâches récentes', 'fr-GA': 'Tâches récentes' },
  
  // Profile & Popover
  'profile.personal': { 'en-US': 'Personal', 'fr-FR': 'Personnel', 'fr-GA': 'Personnel' },
  'profile.free': { 'en-US': 'Free', 'fr-FR': 'Gratuit', 'fr-GA': 'Gratuit' },
  'profile.upgrade': { 'en-US': 'Upgrade', 'fr-FR': 'Mise à niveau', 'fr-GA': 'Mise à niveau' },
  'profile.credits': { 'en-US': 'Credits', 'fr-FR': 'Crédits', 'fr-GA': 'Crédits' },
  'profile.account': { 'en-US': 'Account', 'fr-FR': 'Compte', 'fr-GA': 'Compte' },
  'profile.customization': { 'en-US': 'Customization', 'fr-FR': 'Personnalisation', 'fr-GA': 'Personnalisation' },
  'profile.settings': { 'en-US': 'Settings', 'fr-FR': 'Paramètres', 'fr-GA': 'Paramètres' },
  'profile.home': { 'en-US': 'Home page', 'fr-FR': "Page d'accueil", 'fr-GA': "Page d'accueil" },
  'profile.help': { 'en-US': 'Get help', 'fr-FR': "Obtenir de l'aide", 'fr-GA': "Obtenir de l'aide" },
  'profile.docs': { 'en-US': 'Docs', 'fr-FR': 'Docs', 'fr-GA': 'Docs' },
  'profile.logout': { 'en-US': 'Log out', 'fr-FR': 'Se déconnecter', 'fr-GA': 'Se déconnecter' },
  
  // Auth
  'auth.welcome': { 'en-US': 'Welcome', 'fr-FR': 'Accueillir', 'fr-GA': 'Accueillir' },
  'auth.continueTo': { 'en-US': 'Sign in to continue to Ñkyel', 'fr-FR': 'Connectez-vous pour continuer sur Ñkyel', 'fr-GA': 'Connectez-vous pour continuer sur Ñkyel' },
  'auth.email': { 'en-US': 'Email address', 'fr-FR': 'Adresse courriel', 'fr-GA': 'Adresse courriel' },
  'auth.continue': { 'en-US': 'Continue', 'fr-FR': 'Continuer', 'fr-GA': 'Continuer' },
  'auth.continueGoogle': { 'en-US': 'Continue with Google', 'fr-FR': 'Continuer avec Google', 'fr-GA': 'Continuer avec Google' },
  'auth.noAccount': { 'en-US': "Don't have an account?", 'fr-FR': "Vous n'avez pas de compte ?", 'fr-GA': "Vous n'avez pas de compte ?" },
  'auth.signUp': { 'en-US': 'Sign up', 'fr-FR': 'Inscrivez-vous', 'fr-GA': 'Inscrivez-vous' },
  'auth.alreadyAccount': { 'en-US': 'Already have an account?', 'fr-FR': 'Vous avez déjà un compte ?', 'fr-GA': 'Vous avez déjà un compte ?' },
  'auth.signIn': { 'en-US': 'Sign in', 'fr-FR': 'Connectez-vous', 'fr-GA': 'Connectez-vous' },
  'auth.or': { 'en-US': 'or', 'fr-FR': 'ou', 'fr-GA': 'ou' },
};

export function t(key: string, locale: string = 'en-US'): string {
  const entry = DICTIONARY[key];
  if (!entry) return key;
  return entry[locale] || entry['en-US'] || entry['fr-FR'] || key;
}

interface LanguageState {
  uiLocale: string;           // Default 'en-US' for international audience
  agentLanguage: string;      // Ex: 'auto', 'en', 'fr', 'fan', 'puu', 'ar', 'zh'
  isModalOpen: boolean;
  searchQuery: string;

  setUiLocale: (tag: string) => void;
  setAgentLanguage: (lang: string) => void;
  setModalOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  t: (key: string) => string;
  hydrate: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set: any, get: any) => ({
      uiLocale: 'en-US',
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

      t: (key: string) => {
        const locale = get().uiLocale || 'en-US';
        return t(key, locale);
      },

      hydrate: () => {
        const state = get();
        applyRTLToDOM(state.uiLocale || 'en-US');
      },
    }),
    {
      name: 'Nkyel_Language_Storage',
      onRehydrateStorage: () => (state: any) => {
        if (state) {
          applyRTLToDOM(state.uiLocale || 'en-US');
        }
      },
    }
  )
);
