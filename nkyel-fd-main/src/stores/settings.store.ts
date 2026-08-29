/**
 * Ñkyel AI · Production Settings Store & Command Dispatcher
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Architecture "Settings are Commands" :
 * - Synchronisation bidirectionnelle avec Neon PostgreSQL (/api/v1/users/preferences)
 * - Persistance garantie après refresh, logout/login et changement de device
 * - Validation stricte des types et application immédiate au DOM sans flash blanc
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeKey, AccentKey } from './theme';
import { THEMES, ACCENTS } from './theme';
import { applyRTLToDOM } from './language.store';

export type { ThemeKey, AccentKey } from './theme';
export { THEMES, ACCENTS } from './theme';

export type FontSize = 'small' | 'default' | 'large' | 'xlarge';
export type TextStyle = 'balanced' | 'compact' | 'comfortable' | 'editorial';
export type Density = 'comfortable' | 'compact' | 'spacious';
export type ResponseDepth = 'fast' | 'balanced' | 'deep' | 'research';
export type ResearchDepth = 'quick' | 'balanced' | 'deep' | 'exhaustive';
export type CitationPreference = 'always' | 'inline' | 'end_of_message' | 'minimal';
export type AutonomyLevel = 'guided' | 'semi_autonomous' | 'fully_autonomous';
export type DataResidency = 'GLOBAL' | 'EU' | 'US' | 'AFRICA' | 'LOCAL' | 'CUSTOM';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '24h' | '12h';
export type NumberFormat = 'space_comma' | 'comma_dot';
export type CurrencyDisplay = 'XAF' | 'EUR' | 'USD' | 'GBP' | 'CNY' | 'JPY' | 'AED' | 'INR';

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gemini-3.1-pro': 'Ñkyel Vision & Research Pro',
  'gemini-2.5-flash': 'Ñkyel Flash Fast',
  'gemini-2.5-pro': 'Google Gemini 2.5 Pro',
  'mistral-large-latest': 'Mistral Large 2',
  'mistral-small-latest': 'Mistral Small',
  'claude-3-7-sonnet-latest': 'Claude 3.7 Sonnet',
  'gpt-4o': 'GPT-4o Omnimodal',
  'deepseek-reasoner': 'DeepSeek R1',
};

export interface UserPreferencesState {
  // 1. Général & Formats
  uiLocale: string;
  agentLanguage: string;
  region: string;
  timezone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  currencyDisplay: CurrencyDisplay;
  firstDayOfWeek: 'monday' | 'sunday' | 'saturday';

  // 2. Apparence & Thème
  theme: ThemeKey;
  themeMode: 'light' | 'dark' | 'auto';
  accent: AccentKey;
  fontSize: FontSize;
  textStyle: TextStyle;
  density: Density;
  reducedMotion: boolean;
  highContrast: boolean;

  // 2b. Interface
  uiPreferences: {
    openLinksInNewTab: boolean;
    compactSidebar: boolean;
    showRecentMissions: boolean;
    showProjectPreviews: boolean;
    showTooltips: boolean;
    showKeyboardHints: boolean;
    rememberSidebarState: boolean;
    defaultLandingPage: string;
  };

  // 2c. Startup
  startupPreferences: {
    defaultNkyelProfile: string;
    defaultProject: string;
    restoreLastMission: boolean;
    openLastWorkspace: boolean;
    startWithSidebarExpanded: boolean;
  };

  // 3. Personnalisation & Agent
  responseDepth: ResponseDepth;
  researchDepth: ResearchDepth;
  citationPreferences: CitationPreference;
  autonomyLevel: AutonomyLevel;
  askBeforeSensitiveActions: boolean;
  showThinking: boolean;
  streamResponses: boolean;
  codeSyntaxHighlight: boolean;
  visualIntelligenceLevel: 'standard' | 'enhanced' | 'sovereign_vision';
  workgraphVisibility: 'full' | 'simplified' | 'collapsed';

  // 4. Mémoire
  memoryEnabled: boolean;
  automaticMemory: boolean;
  askBeforeRemembering: boolean;
  memoryPolicy: 'never' | 'always_ask' | 'auto_preferences' | 'auto_all';

  // 5. Données & Confidentialité
  dataResidency: DataResidency;

  // 6. Notifications
  notifications: {
    browserNotifications: boolean;
    soundAlerts: boolean;
    missionCompleted: boolean;
    missionFailed: boolean;
    approvalRequired: boolean;
    programCompleted: boolean;
    programFailed: boolean;
    artifactReady: boolean;
    connectorDisconnected: boolean;
    securityAlert: boolean;
    productUpdates: boolean;
    emailDigest: boolean;
  };

  // 7. Outils par défaut
  defaultTools: string[];

  // 8. Statut de synchronisation
  isSyncing: boolean;
  lastSyncedAt: number | null;

  // Actions
  updatePreferences: (updates: Partial<UserPreferencesState>) => Promise<void>;
  setTheme: (t: ThemeKey) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  setAccent: (a: AccentKey) => void;
  setFontSize: (f: FontSize) => void;
  setTextStyle: (t: TextStyle) => void;
  setDensity: (d: Density) => void;
  setReducedMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setUiLocale: (locale: string) => void;
  setAgentLanguage: (lang: string) => void;
  setDateFormat: (f: DateFormat) => void;
  setTimeFormat: (f: TimeFormat) => void;
  setCurrencyDisplay: (c: CurrencyDisplay) => void;
  setResponseDepth: (d: ResponseDepth) => void;
  setResearchDepth: (r: ResearchDepth) => void;
  setMemoryPolicy: (p: 'never' | 'always_ask' | 'auto_preferences' | 'auto_all') => void;
  setDataResidency: (r: DataResidency) => void;
  setUiPreferences: (updates: Partial<UserPreferencesState['uiPreferences']>) => void;
  setStartupPreferences: (updates: Partial<UserPreferencesState['startupPreferences']>) => void;
  setNotificationsConfig: (updates: Partial<UserPreferencesState['notifications']>) => void;
  fetchFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
  hydrateDOM: () => void;
}

const LIGHT_THEMES = new Set<string>(['light']);

export function applyDOMTheme(theme: string): void {
  if (typeof window === 'undefined') return;
  let resolvedTheme = theme;
  if (theme === 'system' || theme === 'auto') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    resolvedTheme = prefersDark ? 'dark' : 'light';
  }
  const isLight = LIGHT_THEMES.has(resolvedTheme);
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.className = isLight ? 'light' : 'dark';
}

export function applyDOMScale(fontSize: FontSize): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-text-size', fontSize);
}

export function applyDOMTextStyle(style: TextStyle): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-text-style', style);
}

export function applyDOMAccent(accent: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent);
}

export function applyDOMDensity(density: Density): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-density', density);
}

export function applyDOMMotion(reducedMotion: boolean): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-motion', reducedMotion ? 'reduced' : 'normal');
}

export function applyDOMContrast(highContrast: boolean): void {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
}

export const useSettingsStore = create<UserPreferencesState>()(
  persist(
    (set: any, get: any) => ({
      // Defaults
      uiLocale: 'fr-FR',
      agentLanguage: 'auto',
      region: 'GA',
      timezone: 'Africa/Libreville',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: 'space_comma',
      currencyDisplay: 'XAF',
      firstDayOfWeek: 'monday',

      theme: 'dark',
      themeMode: 'auto',
      accent: 'gold',
      fontSize: 'default',
      textStyle: 'balanced',
      density: 'comfortable',
      reducedMotion: false,
      highContrast: false,

      responseDepth: 'balanced',
      researchDepth: 'deep',
      citationPreferences: 'always',
      autonomyLevel: 'semi_autonomous',
      askBeforeSensitiveActions: true,
      showThinking: true,
      streamResponses: true,
      codeSyntaxHighlight: true,
      visualIntelligenceLevel: 'enhanced',
      workgraphVisibility: 'full',

      memoryEnabled: true,
      automaticMemory: true,
      askBeforeRemembering: false,
      memoryPolicy: 'auto_preferences',

      dataResidency: 'GLOBAL',

      notifications: {
        missionUpdates: true,
        checkpointAlerts: true,
        costAlerts: true,
        emailDigest: false,
        browserNotifications: false,
        soundAlerts: true,
        productUpdates: true,
      },

      defaultTools: ['web_search', 'code_interpreter', 'doc_generation', 'workgraph', 'vision'],

      isSyncing: false,
      lastSyncedAt: null,

      hydrateDOM: () => {
        const state = get();
        applyDOMTheme(state.theme);
        applyDOMAccent(state.accent);
        applyDOMScale(state.fontSize);
        applyDOMTextStyle(state.textStyle);
        applyDOMDensity(state.density);
        applyDOMMotion(state.reducedMotion);
        applyDOMContrast(state.highContrast);
        applyRTLToDOM(state.uiLocale);
        applyRTLToDOM(state.uiLocale);
      },

      updatePreferences: async (updates: Partial<UserPreferencesState>) => {
        set((state: UserPreferencesState) => ({ ...state, ...updates }));
        get().hydrateDOM();
        await get().saveToServer();
      },

      setTheme: (t: ThemeKey) => {
        applyDOMTheme(t);
        set({ theme: t });
        get().saveToServer();
      },

      setThemeMode: (mode: 'light' | 'dark' | 'auto') => {
        set({ themeMode: mode });
        get().saveToServer();
      },

      setAccent: (a: AccentKey) => {
        applyDOMAccent(a);
        set({ accent: a });
        get().saveToServer();
      },

      setFontSize: (f: FontSize) => {
        applyDOMScale(f);
        set({ fontSize: f });
        get().saveToServer();
      },
      setTextStyle: (t: TextStyle) => {
        applyDOMTextStyle(t);
        set({ textStyle: t });
        get().saveToServer();
      },
      setDensity: (d: Density) => {
        applyDOMDensity(d);
        set({ density: d });
        get().saveToServer();
      },
      setReducedMotion: (v: boolean) => {
        applyDOMMotion(v);
        set({ reducedMotion: v });
        get().saveToServer();
      },
      setHighContrast: (v: boolean) => {
        applyDOMContrast(v);
        set({ highContrast: v });
        get().saveToServer();
      },

      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },
      greetingStyle: 'formal',
      setGreetingStyle: (s: string) => {
        set({ greetingStyle: s });
        get().saveToServer();
      },
      toggleThinking: () => {
        const next = !get().showThinking;
        set({ showThinking: next });
        get().saveToServer();
      },
      toggleStream: () => {
        const next = !get().streamResponses;
        set({ streamResponses: next });
        get().saveToServer();
      },
      toggleSyntax: () => {
        const next = !get().codeSyntaxHighlight;
        set({ codeSyntaxHighlight: next });
        get().saveToServer();
      },
      hydrate: () => {
        get().hydrateDOM();
      },
      updatePreference: async (key: string, val: any) => {
        const updates: any = {};
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        updates[camelKey] = val;
        updates[key] = val;
        await get().updatePreferences(updates);
      },

      setUiLocale: (locale: string) => {
        applyRTLToDOM(locale);
        set({ uiLocale: locale });
        get().saveToServer();
      },

      setAgentLanguage: (lang: string) => {
        set({ agentLanguage: lang });
        get().saveToServer();
      },

      setDateFormat: (f: DateFormat) => {
        set({ dateFormat: f });
        get().saveToServer();
      },

      setTimeFormat: (f: TimeFormat) => {
        set({ timeFormat: f });
        get().saveToServer();
      },

      setCurrencyDisplay: (c: CurrencyDisplay) => {
        set({ currencyDisplay: c });
        get().saveToServer();
      },

      setResponseDepth: (d: ResponseDepth) => {
        set({ responseDepth: d });
        get().saveToServer();
      },

      setResearchDepth: (r: ResearchDepth) => {
        set({ researchDepth: r });
        get().saveToServer();
      },

      setMemoryPolicy: (p: 'never' | 'always_ask' | 'auto_preferences' | 'auto_all') => {
        set({ memoryPolicy: p });
        get().saveToServer();
      },

      setDataResidency: (r: DataResidency) => {
        set({ dataResidency: r });
        get().saveToServer();
      },

      setNotificationsConfig: (updates: Partial<UserPreferencesState['notifications']>) => {
        set((state: UserPreferencesState) => ({
          notifications: { ...state.notifications, ...updates }
        }));
        get().saveToServer();
      },

      fetchFromServer: async () => {
        if (typeof window === 'undefined') return;
        try {
          set({ isSyncing: true });
          const res = await fetch('/api/v1/users/preferences');
          if (res.ok) {
            const data = await res.json();
            set({
              uiLocale: data.ui_locale || 'fr-FR',
              agentLanguage: data.agent_language || 'auto',
              region: data.region || 'GA',
              timezone: data.timezone || 'Africa/Libreville',
              dateFormat: data.date_format || 'DD/MM/YYYY',
              timeFormat: data.time_format || '24h',
              numberFormat: data.number_format || 'space_comma',
              currencyDisplay: data.currency_display || 'XAF',
              firstDayOfWeek: data.first_day_of_week || 'monday',
              theme: data.theme || 'dark',
              themeMode: data.themeMode || 'auto',
              reducedMotion: !!data.reduced_motion,
              density: data.density || 'comfortable',
              responseDepth: data.response_depth || 'balanced',
              researchDepth: data.research_depth || 'deep',
              citationPreferences: data.citation_preferences || 'always',
              autonomyLevel: data.autonomy_level || 'semi_autonomous',
              askBeforeSensitiveActions: data.ask_before_sensitive_actions !== false,
              memoryEnabled: data.memory_enabled !== false,
              automaticMemory: data.automatic_memory !== false,
              askBeforeRemembering: !!data.ask_before_remembering,
              memoryPolicy: data.memory_policy || 'auto_preferences',
              dataResidency: data.data_residency || 'GLOBAL',
              notifications: {
                missionUpdates: data.notifications?.missionUpdates ?? true,
                checkpointAlerts: data.notifications?.checkpointAlerts ?? true,
                costAlerts: data.notifications?.costAlerts ?? true,
                emailDigest: data.notifications?.emailDigest ?? false,
                browserNotifications: data.notifications?.browserNotifications ?? true,
                soundAlerts: data.notifications?.soundAlerts ?? true,
              },
              defaultTools: data.default_tools || ['web_search', 'code_interpreter', 'doc_generation', 'workgraph', 'vision'],
              visualIntelligenceLevel: data.visual_intelligence_level || 'enhanced',
              workgraphVisibility: data.workgraph_visibility || 'full',
              lastSyncedAt: Date.now(),
            });
            get().hydrateDOM();
          }
        } catch (e) {
          console.warn('[SettingsStore] fetchFromServer offline fallback:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      saveToServer: async () => {
        if (typeof window === 'undefined') return;
        try {
          const s = get();
          const payload = {
            ui_locale: s.uiLocale,
            agent_language: s.agentLanguage,
            region: s.region,
            timezone: s.timezone,
            date_format: s.dateFormat,
            time_format: s.timeFormat,
            number_format: s.numberFormat,
            currency_display: s.currencyDisplay,
            first_day_of_week: s.firstDayOfWeek,
            theme: s.theme,
            themeMode: s.themeMode,
            reduced_motion: s.reducedMotion,
            density: s.density,
            response_depth: s.responseDepth,
            research_depth: s.researchDepth,
            citation_preferences: s.citationPreferences,
            autonomy_level: s.autonomyLevel,
            ask_before_sensitive_actions: s.askBeforeSensitiveActions,
            memory_enabled: s.memoryEnabled,
            automatic_memory: s.automaticMemory,
            ask_before_remembering: s.askBeforeRemembering,
            memory_policy: s.memoryPolicy,
            data_residency: s.dataResidency,
            notifications: s.notifications,
            default_tools: s.defaultTools,
            visual_intelligence_level: s.visualIntelligenceLevel,
            workgraph_visibility: s.workgraphVisibility,
          };

          await fetch('/api/v1/users/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          set({ lastSyncedAt: Date.now() });
        } catch (e) {
          console.warn('[SettingsStore] saveToServer offline queue:', e);
        }
      },
    }),
    {
      name: 'Nkyel_Settings_Storage_V2',
      onRehydrateStorage: () => (state: UserPreferencesState | undefined) => {
        if (state) {
          state.hydrateDOM();
        }
      },
    }
  )
);
