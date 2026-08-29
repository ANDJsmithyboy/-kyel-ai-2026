'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSafeUser as useUser, useSafeClerk as useClerk } from '@/lib/auth-client';
import {
  X, Sun, Moon, CircleHalf, CaretDown, Check, List, 
  Bell, SpeakerHigh, PaperPlaneTilt, Cookie, CaretRight, 
  MagnifyingGlass,
  ArrowSquareOut, ShieldCheck, Browser, Desktop, Layout, Lightning, LockKey,
  Folder, BookBookmark, UserGear, UserCircle, CreditCard, Plug, PuzzlePiece,
  Keyboard, EyeSlash, FileCode, SlidersHorizontal, Info, ClockCounterClockwise
} from '@phosphor-icons/react';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLanguageStore } from '@/stores/language.store';
import { ACCENTS, useSettingsStore } from '@/stores/settings.store';
import type { ThemeKey, AccentKey } from '@/stores/theme';
import PersonalizationTab from '@/components/settings/PersonalizationTab';

type SettingsSection = 
  | 'general' | 'account' | 'usage' | 'connectors' | 'capabilities' 
  | 'personalization' | 'shortcuts' | 'notifications' | 'privacy' 
  | 'memory' | 'programs' | 'agents' | 'artifacts' | 'developer' 
  | 'advanced' | 'about';

type ThemeMode = 'light' | 'dark' | 'auto';

const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'es-ES', label: 'Español' },
];

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: any }> = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'auto', label: 'Auto', icon: CircleHalf },
];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'N';
}

function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange?: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={!disabled && onChange ? onChange : undefined}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-raised)] border border-[var(--border-strong)]'
      }`}
    >
      <span
        className={`absolute top-[1.5px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[20px]' : 'translate-x-[1px]'
        }`}
      />
    </button>
  );
}

function PhantomOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--surface)]/80 backdrop-blur-[2px] rounded-2xl border border-[var(--border-strong)]">
      <div className="px-3 py-1.5 rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--text-secondary)] shadow-sm">
        {label}
      </div>
    </div>
  );
}

export default function DesktopSettingsModal() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const isOpen = useSettingsModal((state: any) => state.isOpen);
  const close = useSettingsModal((state: any) => state.close);
  const modalSection = useSettingsModal((state: any) => state.activeSection);
  
  const { t, uiLocale, setUiLocale, setLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const {
    themeMode,
    accent,
    fontSize,
    textStyle,
    density,
    reducedMotion,
    highContrast,
    setTheme,
    setThemeMode,
    setAccent,
    setFontSize,
    setTextStyle,
    setDensity,
    setReducedMotion,
    setHighContrast,
    notifications,
    setNotificationsConfig,
    hydrate,
    uiPreferences,
    setUiPreferences,
    startupPreferences,
    setStartupPreferences,
  } = useSettingsStore();

  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [query, setQuery] = useState('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    if (modalSection) setActiveSection(modalSection as SettingsSection);
  }, [modalSection]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!languageDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [languageDropdownOpen]);

  useEffect(() => {
    if (themeMode !== 'auto' || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const applySystemTheme = () => setTheme(media.matches ? 'light' : 'dark');
    applySystemTheme();
    media.addEventListener?.('change', applySystemTheme);
    return () => media.removeEventListener?.('change', applySystemTheme);
  }, [setTheme, themeMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close, isOpen]);

  const handleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode === 'light') setTheme('light');
    else if (mode === 'dark') setTheme('dark');
    else {
      const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'light' : 'dark');
    }
  };

  const displayName = user?.fullName || user?.username || 'SmartANDJ AI Technologies';
  const email = user?.primaryEmailAddress?.emailAddress || 'founder@nkyel.ai';
  const initials = initialsFor(displayName);
  const currentLanguageLabel = LANGUAGES.find((l) => l.code === uiLocale || (uiLocale.startsWith('fr') && l.code === 'fr-FR'))?.label || 'Français';

  const TABS: Array<{ id: SettingsSection; label: string; icon: any }> = [
    { id: 'general', label: isFr ? 'Général' : 'General', icon: SlidersHorizontal },
    { id: 'account', label: isFr ? 'Compte' : 'Account', icon: UserCircle },
    { id: 'usage', label: isFr ? 'Utilisation et facturation' : 'Usage & Access', icon: CreditCard },
    { id: 'connectors', label: isFr ? 'Connecteurs' : 'Connectors', icon: Plug },
    { id: 'capabilities', label: isFr ? 'Capacités' : 'Capabilities', icon: PuzzlePiece },
    { id: 'personalization', label: isFr ? 'Personnalisation' : 'Personalization', icon: UserGear },
    { id: 'shortcuts', label: isFr ? 'Raccourcis' : 'Shortcuts', icon: Keyboard },
    { id: 'notifications', label: isFr ? 'Notifications' : 'Notifications', icon: Bell },
    { id: 'privacy', label: isFr ? 'Confidentialité & Sécurité' : 'Privacy & Security', icon: ShieldCheck },
    { id: 'memory', label: isFr ? 'Données & Mémoire' : 'Data & Memory', icon: BookBookmark },
    { id: 'programs', label: isFr ? 'Programmes' : 'Programs', icon: Lightning },
    { id: 'agents', label: isFr ? 'Agents' : 'Agents', icon: Layout },
    { id: 'artifacts', label: isFr ? 'Artéfacts & Sanctuaire' : 'Artifacts & Sanctuary', icon: Folder },
    { id: 'developer', label: isFr ? 'Développeur' : 'Developer', icon: FileCode },
    { id: 'advanced', label: isFr ? 'Avancé' : 'Advanced', icon: SlidersHorizontal },
    { id: 'about', label: isFr ? 'À propos' : 'About', icon: Info },
  ];

  const visibleTabs = useMemo(() => {
    if (!query) return TABS;
    return TABS.filter(tab => tab.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, isFr]);

  if (!isOpen) return null;

  // Helpers to get state safely
  const getUiPref = (key: string, fallback: boolean) => uiPreferences ? (uiPreferences as any)[key] : fallback;
  const getStartupPref = (key: string, fallback: boolean) => startupPreferences ? (startupPreferences as any)[key] : fallback;
  const getNotif = (key: string, fallback: boolean) => notifications ? (notifications as any)[key] : fallback;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={close}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[850px] h-[95vh] sm:h-[85vh] flex flex-col md:flex-row rounded-[26px] overflow-hidden bg-[var(--bg)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] animate-scale-in"
      >
        {/* DESKTOP SIDEBAR (Visible md+) */}
        <div className="hidden md:flex flex-col w-[260px] border-r border-[var(--border-strong)] bg-[var(--surface-raised)] shrink-0">
          <div className="flex items-center gap-3 px-6 pt-7 pb-4">
            <h1 className="text-[22px] font-semibold tracking-tight font-serif text-[var(--text-primary)]">
              {isFr ? 'Paramètres' : 'Settings'}
            </h1>
          </div>
          <div className="px-4 pb-4">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher...' : 'Search...'}
                className="w-full h-[36px] pl-9 pr-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-strong)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-0.5">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                    activeSection === tab.id
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} weight={activeSection === tab.id ? 'fill' : 'regular'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE HEADER (Visible < md) */}
        <div className="md:hidden flex flex-col border-b border-[var(--border-strong)] bg-[var(--surface-raised)]">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <h1 className="text-[26px] font-semibold tracking-tight font-serif text-[var(--text-primary)]">
              {isFr ? 'Paramètres' : 'Settings'}
            </h1>
            <button
              onClick={close}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 pb-3">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher...' : 'Search...'}
                className="w-full h-[44px] pl-11 pr-4 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-strong)] text-[14px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 overflow-x-auto custom-scrollbar no-scrollbar">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as SettingsSection)}
                className={`pb-3 text-[14px] font-medium whitespace-nowrap border-b-[2px] transition-colors ${
                  activeSection === tab.id
                    ? 'border-[var(--accent)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-tertiary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col bg-[var(--bg)] relative overflow-hidden">
          {/* Desktop Close Button */}
          <div className="hidden md:flex absolute top-4 right-4 z-50">
            <button
              onClick={close}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-8">
            
            {/* WORKSPACE ROW (Always visible at top on mobile, inside General on Desktop?) 
                Actually, Manus puts Workspace info inside Account or at the top of the menu. 
                Let's put it in Account to save vertical space on desktop content area. */}

            <div className="max-w-[600px] w-full mx-auto space-y-10 animate-in fade-in duration-150">
              
              {/* --- 1. GENERAL --- */}
              {activeSection === 'general' && (
                <>
                  <div className="space-y-6">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">{isFr ? 'Apparence' : 'Appearance'}</h2>
                    
                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Langue' : 'Language'}</label>
                      <div className="relative" ref={languageDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          className="w-full max-w-xs h-[44px] px-4 flex items-center justify-between rounded-xl bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                        >
                          <span>{currentLanguageLabel}</span>
                          <CaretDown size={14} className="text-[var(--text-tertiary)]" />
                        </button>
                        {languageDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-full max-w-xs rounded-xl bg-[var(--surface-raised)] border border-[var(--border-strong)] shadow-xl p-1.5 z-50">
                            {LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setUiLocale(lang.code);
                                  if (setLocale) setLocale(lang.code);
                                  setLanguageDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] hover:bg-[var(--hover)] ${
                                  uiLocale === lang.code ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-primary)]'
                                }`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Thème' : 'Theme'}</label>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => handleThemeMode(id)}
                            className={`h-[80px] flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${
                              themeMode === id
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]'
                                : 'border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:bg-[var(--hover)]'
                            }`}
                          >
                            <Icon size={24} weight={themeMode === id ? 'fill' : 'regular'} />
                            <span className="text-[13px] font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Accentuation' : 'Accentuation'}</label>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {ACCENTS.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setAccent(item.key)}
                            title={item.name}
                            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all ${
                              accent === item.key ? 'ring-2 ring-offset-4 ring-[var(--text-primary)] ring-offset-[var(--bg)] scale-105' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: item.color }}
                          >
                            {accent === item.key && <Check size={18} weight="bold" color="#fff" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Taille du texte' : 'Text Size'}</label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: 'small', label: 'Small' },
                          { id: 'default', label: 'Default' },
                          { id: 'large', label: 'Large' },
                          { id: 'xlarge', label: 'Extra Large' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setFontSize(opt.id as any)}
                            className={`h-[44px] rounded-xl border text-[13px] font-medium transition-colors ${
                              fontSize === opt.id
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                                : 'border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Style de texte' : 'Text Style'}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'compact', label: 'Compact' },
                          { id: 'balanced', label: 'Balanced' },
                          { id: 'comfortable', label: 'Comfortable' },
                          { id: 'editorial', label: 'Editorial' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setTextStyle(opt.id as any)}
                            className={`h-[44px] rounded-xl border text-[13px] font-medium transition-colors ${
                              textStyle === opt.id
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                                : 'border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Densité' : 'Interface Density'}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'compact', label: 'Compact' },
                          { id: 'comfortable', label: 'Standard' },
                          { id: 'spacious', label: 'Comfortable' },
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setDensity(opt.id as any)}
                            className={`h-[44px] rounded-xl border text-[13px] font-medium transition-colors ${
                              density === opt.id
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                                : 'border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{isFr ? 'Accessibilité' : 'Accessibility'}</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)]">
                          <span className="text-[14px] text-[var(--text-primary)] font-medium">Reduced Motion</span>
                          <Toggle checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} label="Reduced Motion" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)]">
                          <span className="text-[14px] text-[var(--text-primary)] font-medium">High Contrast</span>
                          <Toggle checked={highContrast} onChange={() => setHighContrast(!highContrast)} label="High Contrast" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[var(--border-strong)]" />

                  <div className="space-y-6">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">{isFr ? 'Interface' : 'Interface'}</h2>
                    <div className="space-y-1">
                      {[
                        { key: 'openLinksInNewTab', label: 'Open links in new tab' },
                        { key: 'compactSidebar', label: 'Compact sidebar' },
                        { key: 'showRecentMissions', label: 'Show recent missions' },
                        { key: 'showProjectPreviews', label: 'Show project previews' },
                        { key: 'showTooltips', label: 'Show tooltips' },
                        { key: 'showKeyboardHints', label: 'Show keyboard hints' },
                      ].map(pref => (
                        <div key={pref.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-raised)] transition-colors">
                          <span className="text-[14px] text-[var(--text-primary)] font-medium">{pref.label}</span>
                          <Toggle 
                            checked={getUiPref(pref.key, true)} 
                            onChange={() => setUiPreferences ? setUiPreferences({ [pref.key]: !getUiPref(pref.key, true) }) : null} 
                            label={pref.label} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <hr className="border-[var(--border-strong)]" />

                  <div className="space-y-6">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">{isFr ? 'Démarrage' : 'Startup'}</h2>
                    <div className="space-y-1">
                      {[
                        { key: 'restoreLastMission', label: 'Restore last Mission' },
                        { key: 'openLastWorkspace', label: 'Open last workspace' },
                        { key: 'startWithSidebarExpanded', label: 'Start with sidebar expanded' },
                      ].map(pref => (
                        <div key={pref.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-raised)] transition-colors">
                          <span className="text-[14px] text-[var(--text-primary)] font-medium">{pref.label}</span>
                          <Toggle 
                            checked={getStartupPref(pref.key, true)} 
                            onChange={() => setStartupPreferences ? setStartupPreferences({ [pref.key]: !getStartupPref(pref.key, true) }) : null} 
                            label={pref.label} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* --- 2. ACCOUNT --- */}
              {activeSection === 'account' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-5 p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-strong)]">
                    <div className="relative w-20 h-20 rounded-full border border-[var(--border-strong)] flex items-center justify-center overflow-hidden bg-[var(--bg-inset)] shrink-0">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[var(--text-secondary)]">{initials}</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-[20px] font-bold text-[var(--text-primary)]">{displayName}</div>
                      <div className="text-[14px] text-[var(--text-secondary)]">{email}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[#942BC9] uppercase tracking-wider">
                          Free Plan
                        </span>
                        <span className="text-[12px] text-[var(--text-tertiary)]">1 workspace member</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Authentication</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]">
                        <div className="space-y-1">
                          <div className="text-[14px] font-medium text-[var(--text-primary)]">Google OAuth</div>
                          <div className="text-[12px] text-[var(--text-tertiary)]">Connected via Clerk</div>
                        </div>
                        <span className="text-[13px] text-[var(--accent)] font-medium bg-[var(--accent-subtle)] px-2 py-1 rounded-md">Connected</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]">
                        <div className="space-y-1">
                          <div className="text-[14px] font-medium text-[var(--text-primary)]">User ID</div>
                          <div className="text-[12px] font-mono text-[var(--text-tertiary)]">{user?.id || 'usr_...'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button onClick={() => signOut && signOut()} className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium text-[14px] hover:bg-red-500/20 transition-colors">
                      Sign out
                    </button>
                  </div>
                </div>
              )}

              {/* --- 3. USAGE & ACCESS --- */}
              {activeSection === 'usage' && (
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-strong)] flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Free Plan</h3>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1">Access to core Ñkyel models and features.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-[13px] hover:brightness-110 transition-all shadow-md">
                      Upgrade
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 p-8 text-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)]">
                      <p className="text-[13px] text-[var(--text-tertiary)]">
                        {isFr ? 'Aucune donnée d\'utilisation récente.' : 'No recent usage data available.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 6. PERSONALIZATION --- */}
              {activeSection === 'personalization' && (
                <PersonalizationTab />
              )}

              {/* --- 4. CONNECTORS --- */}
              {activeSection === 'connectors' && (
                <div className="space-y-6 relative">
                  <PhantomOverlay label="Coming soon: Connector Registry" />
                  <div className="space-y-4 opacity-30">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">Connected Services</h2>
                    <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Browser size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-[14px]">GitHub</div>
                          <div className="text-[12px] text-[var(--text-tertiary)]">Authorized</div>
                        </div>
                      </div>
                      <Toggle checked={true} label="GitHub" disabled />
                    </div>
                  </div>
                </div>
              )}

              {/* --- 5. CAPABILITIES --- */}
              {activeSection === 'capabilities' && (
                <div className="space-y-6 relative">
                  <PhantomOverlay label="Coming soon: Capability Registry" />
                  <div className="space-y-4 opacity-30">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">AI Capabilities</h2>
                    {[
                      'Web Research', 'Code Execution', 'File Analysis', 'Computer Use'
                    ].map(cap => (
                      <div key={cap} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]">
                        <span className="text-[14px] font-medium">{cap}</span>
                        <Toggle checked={true} label={cap} disabled />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 6. PERSONALIZATION --- */}
              {activeSection === 'personalization' && (
                <div className="space-y-6 relative">
                  <PhantomOverlay label="Under construction" />
                  <div className="space-y-6 opacity-30">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">About You</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[13px] font-medium text-[var(--text-secondary)]">Profession</label>
                        <input type="text" disabled className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-strong)]" />
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-[var(--text-secondary)]">Response Style</label>
                        <select disabled className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-strong)]">
                          <option>Balanced</option>
                          <option>Concise</option>
                          <option>Technical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 7. SHORTCUTS --- */}
              {activeSection === 'shortcuts' && (
                <div className="space-y-6">
                  <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">{isFr ? 'Raccourcis clavier' : 'Keyboard Shortcuts'}</h2>
                  <div className="space-y-2">
                    {[
                      { key: '⌘ + K', desc: 'Command Palette' },
                      { key: '⌘ + N', desc: 'New Mission' },
                      { key: '⌘ + /', desc: 'Show Help' },
                      { key: 'Esc', desc: 'Close modals/menus' },
                    ].map(sc => (
                      <div key={sc.key} className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]">
                        <span className="text-[14px] text-[var(--text-secondary)]">{sc.desc}</span>
                        <kbd className="px-2 py-1 rounded bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[12px] font-mono font-medium text-[var(--text-primary)]">
                          {sc.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 8. NOTIFICATIONS --- */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">{isFr ? 'Notifications' : 'Notifications'}</h2>
                  
                  <div className="space-y-1">
                    {[
                      { key: 'browserNotifications', label: 'Browser Notifications', icon: Browser },
                      { key: 'soundAlerts', label: 'Sound Alerts', icon: SpeakerHigh },
                      { key: 'missionCompleted', label: 'Mission Completed', icon: Check },
                      { key: 'approvalRequired', label: 'Approval Required', icon: ShieldCheck },
                      { key: 'artifactReady', label: 'Artifact Ready', icon: Folder },
                      { key: 'productUpdates', label: 'Product Updates', icon: PaperPlaneTilt },
                    ].map(pref => (
                      <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-raised)] transition-colors">
                        <div className="flex items-center gap-3">
                          <pref.icon size={22} className="text-[var(--text-secondary)]" />
                          <span className="text-[14px] text-[var(--text-primary)] font-medium">{pref.label}</span>
                        </div>
                        <Toggle 
                          checked={getNotif(pref.key, true)} 
                          onChange={() => setNotificationsConfig ? setNotificationsConfig({ [pref.key]: !getNotif(pref.key, true) }) : null} 
                          label={pref.label} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 9. PRIVACY & SECURITY --- */}
              {activeSection === 'privacy' && (
                <div className="space-y-6 relative">
                  <PhantomOverlay label="Security Hub coming soon" />
                  <div className="space-y-4 opacity-30">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide">Privacy & Security</h2>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]">
                      <div className="flex items-center gap-3">
                        <LockKey size={22} />
                        <span className="text-[14px] font-medium">Multi-Factor Authentication</span>
                      </div>
                      <span className="text-[12px] text-[var(--text-tertiary)]">Managed in Clerk</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 10 to 15 (PHANTOM SECTIONS) --- */}
              {['memory', 'programs', 'agents', 'artifacts', 'developer', 'advanced'].includes(activeSection) && (
                <div className="space-y-6 relative">
                  <PhantomOverlay label="Unavailable in this workspace" />
                  <div className="space-y-6 opacity-30">
                    <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-wide capitalize">{activeSection}</h2>
                    <div className="p-6 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-center text-[var(--text-secondary)]">
                      Module structure initialized. Awaiting backend synchronization.
                    </div>
                  </div>
                </div>
              )}

              {/* --- 16. ABOUT --- */}
              {activeSection === 'about' && (
                <div className="space-y-8 text-center pt-8">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-fg)] shadow-lg">
                    <SlidersHorizontal size={40} weight="fill" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-[24px] font-bold tracking-tight">Ñkyel AI</h2>
                    <p className="text-[14px] text-[var(--text-secondary)]">Version 2.0.0-beta.1 (Build 8a9f3b)</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[13px] font-medium text-[var(--accent)] pt-4">
                    <a href="#" className="hover:underline">Terms</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Privacy</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Changelog</a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
