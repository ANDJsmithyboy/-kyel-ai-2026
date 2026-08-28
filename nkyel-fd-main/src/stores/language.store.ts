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

export const DICTIONARY: Record<string, Record<string, string>> = {
  // Navigation & Shell (Canonical Ñkyel IA)
  'nav.newMission': { 'en-US': 'New mission', 'fr-FR': 'Nouvelle mission', 'fr-GA': 'Nouvelle mission' },
  'nav.newTask': { 'en-US': 'New mission', 'fr-FR': 'Nouvelle mission', 'fr-GA': 'Nouvelle mission' },
  'nav.agent': { 'en-US': 'Agent', 'fr-FR': 'Agent', 'fr-GA': 'Agent' },
  'nav.connections': { 'en-US': 'Connectors', 'fr-FR': 'Connecteurs', 'fr-GA': 'Connecteurs' },
  'nav.connectors': { 'en-US': 'Connectors', 'fr-FR': 'Connecteurs', 'fr-GA': 'Connecteurs' },
  'nav.plugins': { 'en-US': 'Connectors', 'fr-FR': 'Connecteurs', 'fr-GA': 'Connecteurs' },
  'nav.automations': { 'en-US': 'Programs', 'fr-FR': 'Programmes', 'fr-GA': 'Programmes' },
  'nav.programs': { 'en-US': 'Programs', 'fr-FR': 'Programmes', 'fr-GA': 'Programmes' },
  'nav.scheduled': { 'en-US': 'Programs', 'fr-FR': 'Programmes', 'fr-GA': 'Programmes' },
  'nav.creations': { 'en-US': 'Sanctuary', 'fr-FR': 'Sanctuaire', 'fr-GA': 'Sanctuaire' },
  'nav.sanctuary': { 'en-US': 'Sanctuary', 'fr-FR': 'Sanctuaire', 'fr-GA': 'Sanctuaire' },
  'nav.library': { 'en-US': 'Sanctuary', 'fr-FR': 'Sanctuaire', 'fr-GA': 'Sanctuaire' },
  'nav.projects': { 'en-US': 'Projects', 'fr-FR': 'Projets', 'fr-GA': 'Projets' },
  'nav.newProject': { 'en-US': 'New project', 'fr-FR': 'Nouveau projet', 'fr-GA': 'Nouveau projet' },
  'nav.recentMissions': { 'en-US': 'Recent missions', 'fr-FR': 'Missions récentes', 'fr-GA': 'Missions récentes' },
  'nav.tasks': { 'en-US': 'Recent missions', 'fr-FR': 'Missions récentes', 'fr-GA': 'Missions récentes' },

  // Groupings by time
  'time.today': { 'en-US': 'Today', 'fr-FR': "Aujourd'hui", 'fr-GA': "Aujourd'hui" },
  'time.yesterday': { 'en-US': 'Yesterday', 'fr-FR': 'Hier', 'fr-GA': 'Hier' },
  'time.previous7Days': { 'en-US': 'Previous 7 days', 'fr-FR': '7 derniers jours', 'fr-GA': '7 derniers jours' },
  'time.last7Days': { 'en-US': 'Previous 7 days', 'fr-FR': '7 derniers jours', 'fr-GA': '7 derniers jours' },
  'time.last30Days': { 'en-US': 'Previous 30 days', 'fr-FR': '30 derniers jours', 'fr-GA': '30 derniers jours' },
  'time.older': { 'en-US': 'Older', 'fr-FR': 'Plus anciennes', 'fr-GA': 'Plus anciennes' },

  // Intelligence Modes
  'mode.auto': { 'en-US': 'Auto', 'fr-FR': 'Auto', 'fr-GA': 'Auto' },
  'mode.fast': { 'en-US': 'Fast', 'fr-FR': 'Rapide', 'fr-GA': 'Rapide' },
  'mode.deep': { 'en-US': 'Deep', 'fr-FR': 'Profond', 'fr-GA': 'Profond' },
  'mode.research': { 'en-US': 'Research', 'fr-FR': 'Recherche', 'fr-GA': 'Recherche' },
  'mode.autoDesc': { 'en-US': 'Intelligent dynamic routing', 'fr-FR': 'Routage dynamique intelligent', 'fr-GA': 'Routage dynamique intelligent' },
  'mode.fastDesc': { 'en-US': 'Ultra-fast concise response', 'fr-FR': 'Réponse ultra-rapide et concise', 'fr-GA': 'Réponse ultra-rapide et concise' },
  'mode.deepDesc': { 'en-US': 'Deep reasoning & complex synthesis', 'fr-FR': 'Raisonnement profond et synthèse complexe', 'fr-GA': 'Raisonnement profond et synthèse complexe' },
  'mode.researchDesc': { 'en-US': 'Live web groundings & multi-sources', 'fr-FR': 'Veille et recherche multi-sources en direct', 'fr-GA': 'Veille et recherche multi-sources en direct' },

  // Actions & Global Header
  'header.search': { 'en-US': 'Search', 'fr-FR': 'Recherche', 'fr-GA': 'Recherche' },
  'header.share': { 'en-US': 'Share', 'fr-FR': 'Partager', 'fr-GA': 'Partager' },
  'header.more': { 'en-US': 'More', 'fr-FR': 'Plus', 'fr-GA': 'Plus' },
  'header.commands': { 'en-US': 'Commands', 'fr-FR': 'Commandes', 'fr-GA': 'Commandes' },
  'header.mission': { 'en-US': 'Mission', 'fr-FR': 'Mission', 'fr-GA': 'Mission' },
  'header.missionIntelligence': { 'en-US': 'Mission Intelligence', 'fr-FR': 'Intelligence de Mission', 'fr-GA': 'Intelligence de Mission' },
  'header.focus': { 'en-US': 'Focus', 'fr-FR': 'Focus', 'fr-GA': 'Focus' },
  'header.context': { 'en-US': 'Context', 'fr-FR': 'Contexte', 'fr-GA': 'Contexte' },

  // Mission Views
  'view.overview': { 'en-US': 'Overview', 'fr-FR': 'Vue d’ensemble', 'fr-GA': 'Vue d’ensemble' },
  'view.workgraph': { 'en-US': 'WorkGraph', 'fr-FR': 'WorkGraph', 'fr-GA': 'WorkGraph' },
  'view.vie': { 'en-US': 'VIE', 'fr-FR': 'VIE', 'fr-GA': 'VIE' },
  'view.liveFlow': { 'en-US': 'Live Flow', 'fr-FR': 'Live Flow', 'fr-GA': 'Live Flow' },

  // Composer
  'composer.placeholder': { 'en-US': 'Send a message to Ñkyel...', 'fr-FR': 'Envoyez un message à Ñkyel...', 'fr-GA': 'Envoyez un message à Ñkyel...' },
  'composer.ask': { 'en-US': 'Ask Ñkyel anything...', 'fr-FR': 'Demandez quelque chose à Ñkyel...', 'fr-GA': 'Demandez quelque chose à Ñkyel...' },
  'composer.accomplish': { 'en-US': 'What would you like to accomplish?', 'fr-FR': 'Que souhaitez-vous accomplir ?', 'fr-GA': 'Que souhaitez-vous accomplir ?' },
  'composer.accomplishSubtitle': { 'en-US': 'Turn your intention into observable, structured, and executable work.', 'fr-FR': 'Transformez votre intention en travail observable, structuré et exécutable.', 'fr-GA': 'Transformez votre intention en travail observable, structuré et exécutable.' },
  'composer.addToMission': { 'en-US': 'Add to mission', 'fr-FR': 'Ajouter à la mission', 'fr-GA': 'Ajouter à la mission' },

  // Profile & Popover
  'profile.personal': { 'en-US': 'Personal', 'fr-FR': 'Personnel', 'fr-GA': 'Personnel' },
  'profile.free': { 'en-US': 'Free Plan', 'fr-FR': 'Forfait Gratuit', 'fr-GA': 'Forfait Gratuit' },
  'profile.upgrade': { 'en-US': 'Upgrade', 'fr-FR': 'Mise à niveau', 'fr-GA': 'Mise à niveau' },
  'profile.credits': { 'en-US': 'Credits', 'fr-FR': 'Crédits', 'fr-GA': 'Crédits' },
  'profile.account': { 'en-US': 'Account', 'fr-FR': 'Compte', 'fr-GA': 'Compte' },
  'profile.customization': { 'en-US': 'Personalization', 'fr-FR': 'Personnalisation', 'fr-GA': 'Personnalisation' },
  'profile.settings': { 'en-US': 'Settings', 'fr-FR': 'Paramètres', 'fr-GA': 'Paramètres' },
  'profile.home': { 'en-US': 'Home', 'fr-FR': "Accueil", 'fr-GA': "Accueil" },
  'profile.help': { 'en-US': 'Help & Support', 'fr-FR': "Aide & Assistance", 'fr-GA': "Aide & Assistance" },
  'profile.docs': { 'en-US': 'Documentation', 'fr-FR': 'Documentation', 'fr-GA': 'Documentation' },
  'profile.logout': { 'en-US': 'Log out', 'fr-FR': 'Se déconnecter', 'fr-GA': 'Se déconnecter' },
  'profile.defaultName': { 'en-US': 'User', 'fr-FR': 'Utilisateur', 'fr-GA': 'Utilisateur' },
  
  // Settings Tabs
  'settings.general': { 'en-US': 'General', 'fr-FR': 'Général', 'fr-GA': 'Général' },
  'settings.account': { 'en-US': 'Account', 'fr-FR': 'Compte', 'fr-GA': 'Compte' },
  'settings.appearance': { 'en-US': 'Appearance', 'fr-FR': 'Apparence', 'fr-GA': 'Apparence' },
  'settings.intelligence': { 'en-US': 'Intelligence', 'fr-FR': 'Intelligence', 'fr-GA': 'Intelligence' },
  'settings.memory': { 'en-US': 'Memory', 'fr-FR': 'Mémoire', 'fr-GA': 'Mémoire' },
  'settings.connectors': { 'en-US': 'Connectors', 'fr-FR': 'Connecteurs', 'fr-GA': 'Connecteurs' },
  'settings.usage': { 'en-US': 'Usage', 'fr-FR': 'Utilisation', 'fr-GA': 'Utilisation' },
  'settings.security': { 'en-US': 'Security', 'fr-FR': 'Sécurité', 'fr-GA': 'Sécurité' },
  'settings.language': { 'en-US': 'Language', 'fr-FR': 'Langue', 'fr-GA': 'Langue' },

  // Canonical Hero & Disclaimer (Section 25 & 29)
  'hero.title': { 'en-US': 'Turn your intention\ninto visible work.', 'fr-FR': 'Transformez votre intention\nen travail visible.', 'fr-GA': 'Transformez votre intention\nen travail visible.' },
  'hero.subtitle': { 'en-US': 'See the structure. Follow the flow.\nVerify the evidence. Stay in control.', 'fr-FR': 'Voyez la structure. Suivez le flux.\nVérifiez les preuves. Gardez le contrôle.', 'fr-GA': 'Voyez la structure. Suivez le flux.\nVérifiez les preuves. Gardez le contrôle.' },
  'composer.disclaimer': { 'en-US': 'Ñkyel AI is an AI agent and can make mistakes. Please verify important information.', 'fr-FR': 'Ñkyel AI est un agent IA et peut faire des erreurs. Veuillez vérifier les informations importantes.', 'fr-GA': 'Ñkyel AI est un agent IA et peut faire des erreurs. Veuillez vérifier les informations importantes.' },

  // Connectors
  'connectors.title': { 'en-US': 'Connectors', 'fr-FR': 'Connecteurs', 'fr-GA': 'Connecteurs' },
  'connectors.searchPlaceholder': { 'en-US': 'Search connectors...', 'fr-FR': 'Rechercher des connecteurs...', 'fr-GA': 'Rechercher des connecteurs...' },
  'connectors.applications': { 'en-US': 'Applications', 'fr-FR': 'Applications', 'fr-GA': 'Applications' },
  'connectors.customApi': { 'en-US': 'Custom API', 'fr-FR': 'API Personnalisée', 'fr-GA': 'API Personnalisée' },
  'connectors.mcpServers': { 'en-US': 'MCP Servers', 'fr-FR': 'Serveurs MCP', 'fr-GA': 'Serveurs MCP' },
  'connectors.projects': { 'en-US': 'Projects', 'fr-FR': 'Projets', 'fr-GA': 'Projets' },
  'connectors.create': { 'en-US': 'Create', 'fr-FR': 'Créer', 'fr-GA': 'Créer' },
  'connectors.missing': { 'en-US': "Can't find what you need?", 'fr-FR': 'Vous ne trouvez pas ce dont vous avez besoin ?', 'fr-GA': 'Vous ne trouvez pas ce dont vous avez besoin ?' },
  'connectors.suggest': { 'en-US': 'Suggest a connector', 'fr-FR': 'Suggérer un connecteur', 'fr-GA': 'Suggérer un connecteur' },
  'connectors.suggestSubmitted': { 'en-US': 'Thank you! Your request has been recorded.', 'fr-FR': 'Merci ! Votre demande a été enregistrée.', 'fr-GA': 'Merci ! Votre demande a été enregistrée.' },

  // Settings Master Translations
  'settings.title': { 'en-US': 'Settings & Preferences', 'fr-FR': 'Paramètres & Préférences', 'fr-GA': 'Paramètres & Préférences' },
  'settings.tab.general': { 'en-US': 'General & Language', 'fr-FR': 'Général & Langues', 'fr-GA': 'Général & Langues' },
  'settings.tab.profile': { 'en-US': 'Profile & Identity', 'fr-FR': 'Profil & Identité', 'fr-GA': 'Profil & Identité' },
  'settings.tab.appearance': { 'en-US': 'Appearance & Theme', 'fr-FR': 'Apparence & Thème', 'fr-GA': 'Apparence & Thème' },
  'settings.tab.agent': { 'en-US': 'Intelligence & Autonomy', 'fr-FR': 'Intelligence & Autonomie', 'fr-GA': 'Intelligence & Autonomie' },
  'settings.tab.memory': { 'en-US': 'Sovereign Memory', 'fr-FR': 'Mémoire Souveraine', 'fr-GA': 'Mémoire Souveraine' },
  'settings.tab.subscription': { 'en-US': 'Plans & Credits', 'fr-FR': 'Forfait & Crédits', 'fr-GA': 'Forfait & Crédits' },
  'settings.tab.security': { 'en-US': 'Security & Data', 'fr-FR': 'Sécurité & Données', 'fr-GA': 'Sécurité & Données' },
  'settings.tab.danger': { 'en-US': 'Critical Zone', 'fr-FR': 'Zone Critique', 'fr-GA': 'Zone Critique' },
  
  'settings.general.title': { 'en-US': 'General & Region', 'fr-FR': 'Général & Région', 'fr-GA': 'Général & Région' },
  'settings.general.desc': { 'en-US': 'Universal language preferences and display formats.', 'fr-FR': "Préférences linguistiques universelles et formats d'affichage.", 'fr-GA': "Préférences linguistiques universelles et formats d'affichage." },
  'settings.general.interfaceLanguage': { 'en-US': 'Interface Language (BCP-47)', 'fr-FR': "Langue de l'Interface (BCP-47)", 'fr-GA': "Langue de l'Interface (BCP-47)" },
  'settings.general.productLanguage': { 'en-US': 'Product Language', 'fr-FR': 'Langue du Produit', 'fr-GA': 'Langue du Produit' },
  'settings.general.productLanguageDesc': { 'en-US': 'Dictionary used across all buttons, navigations, and menus.', 'fr-FR': "Dictionnaire utilisé pour l'ensemble des boutons, navigations et menus.", 'fr-GA': "Dictionnaire utilisé pour l'ensemble des boutons, navigations et menus." },
  
  'settings.appearance.title': { 'en-US': 'Appearance & Theme', 'fr-FR': 'Apparence & Thème', 'fr-GA': 'Apparence & Thème' },
  'settings.appearance.subtitle': { 'en-US': 'Immediate toggle between Sumi Dark and Gofun Light with WCAG 2.2 AA contrast.', 'fr-FR': 'Bascule immédiate 100% Light et 100% Dark avec garantie WCAG 2.2 AA.', 'fr-GA': 'Bascule immédiate 100% Light et 100% Dark avec garantie WCAG 2.2 AA.' },
  'settings.appearance.mode': { 'en-US': 'Display Mode', 'fr-FR': "Mode d'Affichage", 'fr-GA': "Mode d'Affichage" },
  'settings.appearance.visualTheme': { 'en-US': 'Visual Theme', 'fr-FR': 'Thème Visuel', 'fr-GA': 'Thème Visuel' },
  'settings.appearance.visualThemeDesc': { 'en-US': 'Select the global appearance of the interface.', 'fr-FR': "Sélectionnez l'apparence globale de l'interface.", 'fr-GA': "Sélectionnez l'apparence globale de l'interface." },
  'settings.appearance.light': { 'en-US': 'Light', 'fr-FR': 'Clair', 'fr-GA': 'Clair' },
  'settings.appearance.system': { 'en-US': 'System', 'fr-FR': 'Système', 'fr-GA': 'Système' },
  'settings.appearance.dark': { 'en-US': 'Dark', 'fr-FR': 'Sombre', 'fr-GA': 'Sombre' },
  'settings.appearance.accent': { 'en-US': 'Accent Tones', 'fr-FR': "Nuances d'Accentuation", 'fr-GA': "Nuances d'Accentuation" },
  'settings.appearance.accentColor': { 'en-US': 'Accent Color', 'fr-FR': "Couleur d'Accent", 'fr-GA': "Couleur d'Accent" },
  'settings.appearance.accentDesc': { 'en-US': 'Applied with restraint to focus rings, selections, and prestige states.', 'fr-FR': 'Appliquée avec parcimonie aux anneaux de focus, sélections et états de prestige.', 'fr-GA': 'Appliquée avec parcimonie aux anneaux de focus, sélections et états de prestige.' },
  'settings.appearance.typography': { 'en-US': 'Geist Typographic Scale', 'fr-FR': 'Échelle Typographique Geist', 'fr-GA': 'Échelle Typographique Geist' },
  'settings.appearance.fontSize': { 'en-US': 'Font Size', 'fr-FR': 'Taille du Texte', 'fr-GA': 'Taille du Texte' },
  'settings.appearance.density': { 'en-US': 'Interface Density', 'fr-FR': "Densité de l'Interface", 'fr-GA': "Densité de l'Interface" },
  
  'settings.agent.title': { 'en-US': 'Intelligence & Autonomy', 'fr-FR': 'Intelligence & Autonomie', 'fr-GA': 'Intelligence & Autonomie' },
  'settings.agent.subtitle': { 'en-US': 'Configure inference engines, reasoning budgets, and tool execution boundaries.', 'fr-FR': "Configurez les moteurs d'inférence, budgets de réflexion et limites d'outils.", 'fr-GA': "Configurez les moteurs d'inférence, budgets de réflexion et limites d'outils." },
  'settings.agent.autonomy': { 'en-US': 'Autonomy Level', 'fr-FR': "Niveau d'Autonomie", 'fr-GA': "Niveau d'Autonomie" },
  'settings.agent.depth': { 'en-US': 'Analysis Depth', 'fr-FR': "Profondeur d'Analyse", 'fr-GA': "Profondeur d'Analyse" },
  'settings.agent.researchDepth': { 'en-US': 'Web & Grounding Depth', 'fr-FR': 'Profondeur de Recherche Web', 'fr-GA': 'Profondeur de Recherche Web' },
  
  'settings.memory.title': { 'en-US': 'Sovereign Memory', 'fr-FR': 'Mémoire Souveraine', 'fr-GA': 'Mémoire Souveraine' },
  'settings.memory.subtitle': { 'en-US': 'Contextual memory, personal knowledge vault, and zero-knowledge privacy.', 'fr-FR': 'Mémoire contextuelle, coffre de connaissances et confidentialité zéro-connaissance.', 'fr-GA': 'Mémoire contextuelle, coffre de connaissances et confidentialité zéro-connaissance.' },
  'settings.memory.toggle': { 'en-US': 'Sovereign Memory Engine', 'fr-FR': 'Moteur de Mémoire Souveraine', 'fr-GA': 'Moteur de Mémoire Souveraine' },
  
  'settings.security.title': { 'en-US': 'Security & Data Governance', 'fr-FR': 'Sécurité & Données', 'fr-GA': 'Sécurité & Données' },
  'settings.security.subtitle': { 'en-US': 'End-to-end client encryption, Neon DB persistence, and sovereignty guarantees.', 'fr-FR': 'Chiffrement de bout en bout, persistance Neon et garanties de souveraineté.', 'fr-GA': 'Chiffrement de bout en bout, persistance Neon et garanties de souveraineté.' },
  
  // Agent Page Translations
  'agent.myAgent': { 'en-US': 'My Agent', 'fr-FR': 'Mon agent', 'fr-GA': 'Mon agent' },
  'agent.statusActive': { 'en-US': 'Active · Sovereign Engine', 'fr-FR': 'Actif · Moteur Souverain', 'fr-GA': 'Actif · Moteur Souverain' },
  'agent.statusStandby': { 'en-US': 'Standby · Ready to work', 'fr-FR': 'En veille · Prêt à agir', 'fr-GA': 'En veille · Prêt à agir' },
  'agent.directivePlaceholder': { 'en-US': 'Give a complex mission directive to your agent...', 'fr-FR': 'Donnez une directive de mission complexe à votre agent...', 'fr-GA': 'Donnez une directive de mission complexe à votre agent...' },
  'agent.launchMission': { 'en-US': 'Execute Directive', 'fr-FR': 'Exécuter la directive', 'fr-GA': 'Exécuter la directive' },
  'agent.persona': { 'en-US': 'Working Persona', 'fr-FR': 'Style de Travail', 'fr-GA': 'Style de Travail' },
  'agent.capabilities': { 'en-US': 'Active Tool Integrations', 'fr-FR': 'Intégrations & Outils Actifs', 'fr-GA': 'Intégrations & Outils Actifs' },
  'agent.recentDispatches': { 'en-US': 'Recent Agent Dispatches', 'fr-FR': 'Dernières Missions de l’Agent', 'fr-GA': 'Dernières Missions de l’Agent' },
  
  // Sanctuary / Library Translations
  'sanctuary.heading': { 'en-US': 'Sanctuary', 'fr-FR': 'Sanctuaire', 'fr-GA': 'Sanctuaire' },
  'sanctuary.subheading': { 'en-US': 'Canonical Sovereign Artifact Vault & Creative Archive.', 'fr-FR': 'Coffre souverain des artefacts créatifs et archives exécutives.', 'fr-GA': 'Coffre souverain des artefacts créatifs et archives exécutives.' },
  'sanctuary.searchPlaceholder': { 'en-US': 'Search artifacts, decks, documents, models...', 'fr-FR': 'Rechercher des artefacts, présentations, rapports, modèles...', 'fr-GA': 'Rechercher des artefacts, présentations, rapports, modèles...' },
  'sanctuary.all': { 'en-US': 'All Artifacts', 'fr-FR': 'Tous les artefacts', 'fr-GA': 'Tous les artefacts' },
  'sanctuary.slides': { 'en-US': 'Presentations', 'fr-FR': 'Présentations', 'fr-GA': 'Présentations' },
  'sanctuary.docs': { 'en-US': 'Documents', 'fr-FR': 'Documents', 'fr-GA': 'Documents' },
  'sanctuary.spreadsheets': { 'en-US': 'Spreadsheets', 'fr-FR': 'Tableurs', 'fr-GA': 'Tableurs' },
  'sanctuary.media': { 'en-US': 'Media & Visuals', 'fr-FR': 'Médias & Visuels', 'fr-GA': 'Médias & Visuels' },
  'sanctuary.code': { 'en-US': 'Code & Sandboxes', 'fr-FR': 'Code & Sandboxes', 'fr-GA': 'Code & Sandboxes' },
  'sanctuary.download': { 'en-US': 'Download', 'fr-FR': 'Télécharger', 'fr-GA': 'Télécharger' },
  'sanctuary.share': { 'en-US': 'Share', 'fr-FR': 'Partager', 'fr-GA': 'Partager' },
  'sanctuary.open': { 'en-US': 'Open Artifact', 'fr-FR': 'Ouvrir l’artefact', 'fr-GA': 'Ouvrir l’artefact' },
  'sanctuary.vaultBanner': { 'en-US': 'Zero-Knowledge Sovereign Vault. All creative artifacts are encrypted and persisted locally.', 'fr-FR': 'Coffre souverain zéro-connaissance. Tous les artefacts sont chiffrés et persistés en toute sécurité.', 'fr-GA': 'Coffre souverain zéro-connaissance. Tous les artefacts sont chiffrés et persistés en toute sécurité.' },

  // Auth
  'auth.welcome': { 'en-US': 'Welcome to Ñkyel', 'fr-FR': 'Bienvenue sur Ñkyel', 'fr-GA': 'Bienvenue sur Ñkyel' },
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
  locale?: string;
  agentLanguage: string;      // Ex: 'auto', 'en', 'fr', 'fan', 'puu', 'ar', 'zh'
  isModalOpen: boolean;
  searchQuery: string;

  setUiLocale: (tag: string) => void;
  setLocale?: (tag: string) => void;
  setAgentLanguage: (lang: string) => void;
  setModalOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  t: (key: string, values?: Record<string, any>) => string;
  hydrate: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set: any, get: any) => ({
      uiLocale: 'en-US',
      locale: 'en-US',
      agentLanguage: 'auto',
      isModalOpen: false,
      searchQuery: '',

      setUiLocale: (tag: string) => {
        applyRTLToDOM(tag);
        set({ uiLocale: tag, locale: tag });
      },

      setLocale: (tag: string) => {
        applyRTLToDOM(tag);
        set({ uiLocale: tag, locale: tag });
      },

      setAgentLanguage: (lang: string) => {
        set({ agentLanguage: lang });
      },

      setModalOpen: (open: boolean) => set({ isModalOpen: open }),
      setSearchQuery: (q: string) => set({ searchQuery: q }),

      t: (key: string, values?: Record<string, any>) => {
        const locale = get().uiLocale || 'en-US';
        const rawString = t(key, locale);
        
        if (!values) return rawString;
        
        try {
          const formatter = new IntlMessageFormat(rawString, locale);
          return formatter.format(values) as string;
        } catch (err) {
          console.warn(`[i18n] Error formatting key "${key}":`, err);
          return rawString;
        }
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
