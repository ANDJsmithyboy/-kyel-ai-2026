'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeUser as useUser, useSafeClerk as useClerk } from '@/lib/auth-client';
import {
  User,
  SlidersHorizontal,
  PuzzlePiece,
  PlugsConnected,
  EnvelopeSimple,
  Monitor,
  MagnifyingGlass,
  X,
  Moon,
  Sun,
  CircleHalf,
  CreditCard,
  SignOut,
  Sparkle,
  TextT,
  Check,
  CaretDown,
  CaretUp,
  Key,
  ShieldCheck,
  HardDrives,
  Robot,
} from '@phosphor-icons/react';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLanguageStore } from '@/stores/language.store';
import { getUserTier } from '@/lib/userTiers';
import {
  ACCENTS,
  useSettingsStore,
  type Density,
  type FontSize,
} from '@/stores/settings.store';

type SettingsSection =
  | 'general'
  | 'account'
  | 'usage'
  | 'shortcuts'
  | 'personalization'
  | 'connectors'
  | 'skills'
  | 'mail'
  | 'computer';

type ThemeMode = 'light' | 'dark' | 'auto';

const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'es-419', label: 'Español (Latinoamérica)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'tr-TR', label: 'Türkçe' },
];

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: any }> = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'auto', label: 'Auto', icon: CircleHalf },
];

const FONT_OPTIONS: Array<{ id: FontSize; label: string; sample: string }> = [
  { id: 'small', label: 'Petit', sample: 'A' },
  { id: 'normal', label: 'Standard', sample: 'A' },
  { id: 'large', label: 'Grand', sample: 'A' },
];

const DENSITY_OPTIONS: Array<{ id: Density; label: string; detail: string }> = [
  { id: 'comfortable', label: 'Confort', detail: 'Espacée' },
  { id: 'compact', label: 'Compact', detail: 'Dense' },
];

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: SettingsSection; label: string; icon: any }>;
}> = [
  {
    label: 'Paramètres',
    items: [
      { id: 'general', label: 'Général', icon: SlidersHorizontal },
      { id: 'account', label: 'Compte', icon: User },
      { id: 'usage', label: 'Utilisation et facturation', icon: CreditCard },
      { id: 'shortcuts', label: 'Raccourcis', icon: Monitor },
    ],
  },
  {
    label: 'Fonctionnalités',
    items: [
      { id: 'personalization', label: 'Personnalisation', icon: TextT },
      { id: 'connectors', label: 'Connecteurs', icon: PlugsConnected },
      { id: 'skills', label: 'Compétences', icon: PuzzlePiece },
      { id: 'mail', label: 'Mail Ñkyel', icon: EnvelopeSimple },
      { id: 'computer', label: 'My Computer', icon: Monitor },
    ],
  },
];

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'N'
  );
}

function readBool(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored === 'true';
}

function persistBool(key: string, value: boolean) {
  if (typeof window !== 'undefined') localStorage.setItem(key, String(value));
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? 'bg-[#0070F3]' : 'bg-[var(--surface-raised)] border border-[var(--border)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function DesktopSettingsModal() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userTier = getUserTier(userEmail, (user?.publicMetadata?.role as string) || null);
  const isSuperAdmin = userTier.isGodMode;
  const { signOut } = useClerk();
  const isOpen = useSettingsModal((state: any) => state.isOpen);
  const close = useSettingsModal((state: any) => state.close);
  const modalSection = useSettingsModal((state: any) => state.activeSection);
  const { t, uiLocale, setUiLocale, setLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  useEffect(() => {
    if (modalSection) setActiveSection(modalSection as SettingsSection);
  }, [modalSection]);
  const [query, setQuery] = useState('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const [browserNotifications, setBrowserNotifications] = useState(() =>
    readBool('Nkyel AI_browserNotifications', true)
  );
  const [soundAlerts, setSoundAlerts] = useState(() => readBool('Nkyel AI_soundAlerts', true));

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('Nkyel AI_themeMode');
    return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'light';
  });

  const accent = useSettingsStore((state: any) => state.accent);
  const fontSize = useSettingsStore((state: any) => state.fontSize);
  const density = useSettingsStore((state: any) => state.density);
  const greetingStyle = useSettingsStore((state: any) => state.greetingStyle);
  const showThinking = useSettingsStore((state: any) => state.showThinking);
  const streamResponses = useSettingsStore((state: any) => state.streamResponses);
  const codeSyntaxHighlight = useSettingsStore((state: any) => state.codeSyntaxHighlight);
  const hydrateSettings = useSettingsStore((state: any) => state.hydrate);

  const setTheme = useSettingsStore((state: any) => state.setTheme);
  const setAccent = useSettingsStore((state: any) => state.setAccent);
  const setFontSize = useSettingsStore((state: any) => state.setFontSize);
  const setDensity = useSettingsStore((state: any) => state.setDensity);
  const setGreetingStyle = useSettingsStore((state: any) => state.setGreetingStyle);
  const toggleThinking = useSettingsStore((state: any) => state.toggleThinking);
  const toggleStream = useSettingsStore((state: any) => state.toggleStream);
  const toggleSyntax = useSettingsStore((state: any) => state.toggleSyntax);

  const dialogRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  // Focus trap & body scroll lock
  useFocusTrap(dialogRef, isOpen);

  // Close language dropdown on outside click
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

  // Theme synchronization
  useEffect(() => {
    if (themeMode !== 'auto' || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const applySystemTheme = () => setTheme(media.matches ? 'neo-blanc' : 'black-panther');
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
    if (typeof window !== 'undefined') localStorage.setItem('Nkyel AI_themeMode', mode);
    if (mode === 'light') setTheme('neo-blanc');
    else if (mode === 'dark') setTheme('black-panther');
    else {
      const prefersLight =
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'neo-blanc' : 'black-panther');
    }
  };

  const handleToggleNotifications = () => {
    const next = !browserNotifications;
    setBrowserNotifications(next);
    persistBool('Nkyel AI_browserNotifications', next);
  };

  const handleToggleSound = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    persistBool('Nkyel AI_soundAlerts', next);
  };

  const displayName = user?.fullName || user?.username || 'Christ pour la VOP';
  const email = user?.primaryEmailAddress?.emailAddress || 'fondateur@nkyel.ai';
  const initials = initialsFor(displayName);

  const currentLanguageLabel =
    LANGUAGES.find((l) => l.code === uiLocale || (uiLocale.startsWith('fr') && l.code === 'fr-FR'))
      ?.label || 'Français';

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
      })).filter((group) => group.items.length),
    [query]
  );

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] font-sans">{t('settings.general')}</h1>
            </div>

            {/* Section: Apparence */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
                {t('settings.appearance')}
              </h2>

              {/* Langue Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)] block">
                  {t('settings.language')}
                </label>
                <div className="relative max-w-sm" ref={languageDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setLanguageDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-sm font-medium text-[var(--text-primary)] transition-colors shadow-xs"
                    aria-expanded={languageDropdownOpen}
                  >
                    <span>{currentLanguageLabel}</span>
                    {languageDropdownOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>

                  {/* Dropdown Menu matching Screenshot 2 */}
                  {languageDropdownOpen && (
                    <div className="absolute start-0 top-full mt-1.5 w-64 max-h-80 overflow-y-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl z-50 animate-scale-in text-xs space-y-0.5">
                      {LANGUAGES.map((lang) => {
                        const isSelected =
                          uiLocale === lang.code || (uiLocale.startsWith('fr') && lang.code === 'fr-FR');
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setUiLocale(lang.code);
                              if (setLocale) setLocale(lang.code);
                              setLanguageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-start transition-colors ${
                              isSelected
                                ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                            }`}
                          >
                            <span>{lang.label}</span>
                            {isSelected && (
                              <Check size={14} weight="bold" className="text-[#0070F3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Thème Cards matching Screenshot 1 */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-[var(--text-primary)] block">
                  {uiLocale?.startsWith('fr') ? "Thème" : "Theme"}
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
                    const isSelected = themeMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleThemeMode(id)}
                        className={`flex h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all text-xs font-semibold ${
                          isSelected
                            ? 'border-[var(--text-primary)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--text-primary)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon size={18} weight={isSelected ? 'fill' : 'regular'} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section: Préférences de communication matching Screenshot 1 */}
            <div className="space-y-6 pt-6 border-t border-[var(--border)]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
                Préférences de communication
              </h2>

              {/* Notifications du navigateur */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Notifications du navigateur
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                    Recevez des notifications dans votre navigateur lorsqu'il y a de nouvelles avancées ou qu'une tâche est terminée.
                  </p>
                </div>
                <Toggle
                  checked={browserNotifications}
                  onChange={handleToggleNotifications}
                  label="Notifications du navigateur"
                />
              </div>

              {/* Alerte sonore */}
              <div className="flex items-start justify-between gap-6 pt-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {isFr ? 'Alerte sonore' : 'Sound alert'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                    {isFr ? 'Jouer un son une fois lorsqu’une tâche est terminée pendant votre absence.' : 'Play a sound once when a task completes while you are away.'}
                  </p>
                </div>
                <Toggle
                  checked={soundAlerts}
                  onChange={handleToggleSound}
                  label="Alerte sonore"
                />
              </div>

              {/* Recevez les mises à jour du produit (Screenshot 1 & 2) */}
              <div className="flex items-start justify-between gap-6 pt-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {isFr ? 'Recevez les mises à jour du produit' : 'Receive product updates'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                    {isFr ? 'Accédez tôt aux nouvelles fonctionnalités et aux études de cas pour optimiser votre flux de travail.' : 'Get early access to new features and case studies to optimize your workflow.'}
                  </p>
                </div>
                <Toggle
                  checked={readBool('Nkyel AI_productUpdates', true)}
                  onChange={() => {
                    const next = !readBool('Nkyel AI_productUpdates', true);
                    persistBool('Nkyel AI_productUpdates', next);
                  }}
                  label="Recevez les mises à jour du produit"
                />
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Compte</h1>
            <div className="flex items-center gap-5 pt-2">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-xl font-bold text-[var(--text-primary)] shadow-sm">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[var(--text-tertiary)]">Nom d'utilisateur</p>
                <div className="text-base font-bold text-[var(--text-primary)]">
                  {displayName}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{email}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  {isSuperAdmin ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-[20px] font-bold text-[var(--accent)]">∞</span>
                        <h3 className="text-base font-semibold text-[var(--accent)]">Mode God</h3>
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mt-1">Créateur de Ñkyel</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">Free</h3>
                      <p className="text-xs text-[var(--text-tertiary)]">Accès bêta</p>
                    </>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                  Actif
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <InfoLine label="E-mail principal" value={email} action="Modifier" />
              <InfoLine label="Identifiant Session" value={user?.id || 'usr_smartandj_01'} action="Copier" />
              <InfoLine label="Fournisseur d'authentification" value="Google OAuth / Clerk Pro" action="Gérer" />
            </div>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Utilisation et facturation</h1>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-1">
                <span className="text-xs text-[var(--text-tertiary)]">Crédits restants</span>
                <p className="text-2xl font-bold font-mono text-[var(--accent)]">300</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-1">
                <span className="text-xs text-[var(--text-tertiary)]">Missions exécutées</span>
                <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">14</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-1">
                <span className="text-xs text-[var(--text-tertiary)]">Livrables générés</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">8</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Passage à Ñkyel Pro Entreprise</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Débloquez le parallélisme d'agents illimité, le chiffrement dédié en cloud privé et la priorité GPU H100.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs shadow-sm hover:bg-[var(--accent-hover)] transition-colors"
              >
                Mettre à niveau mon forfait
              </button>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Raccourcis clavier</h1>
            <div className="space-y-2">
              {[
                { key: '⌘ + K', desc: 'Ouvrir la palette universelle de commandes' },
                { key: '⌘ + N', desc: 'Créer une nouvelle mission' },
                { key: '⌘ + /', desc: 'Afficher la documentation & l\'aide' },
                { key: 'Esc', desc: 'Fermer les modals et tiroirs actifs' },
                { key: 'Enter', desc: 'Envoyer la consigne au routeur d\'inférence' },
              ].map((sc) => (
                <div key={sc.key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-secondary)]">{sc.desc}</span>
                  <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono font-bold text-[var(--text-primary)] border border-white/10">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        );

      case 'personalization':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Personnalisation & Styles</h1>
            {/* Font & Density */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 space-y-3">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Taille de police</span>
                <div className="flex gap-2">
                  {FONT_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFontSize(item.id)}
                      className={`flex-1 h-9 rounded-xl border text-xs font-semibold transition-all ${
                        fontSize === item.id
                          ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                          : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 space-y-3">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Densité d'affichage</span>
                <div className="flex gap-2">
                  {DENSITY_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDensity(item.id)}
                      className={`flex-1 h-9 rounded-xl border text-xs font-semibold transition-all ${
                        density === item.id
                          ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                          : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Accents */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Couleur d'accentuation</span>
              <div className="grid grid-cols-5 gap-3">
                {ACCENTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setAccent(item.key)}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      accent === item.key
                        ? 'border-[var(--text-primary)] bg-[var(--surface-raised)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-medium text-[var(--text-secondary)]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reasoning switches */}
            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <SettingRow
                label="Afficher la chaîne de réflexion (Thinking / CoT)"
                detail="Inspecter les étapes intermédiaires de raisonnement de l'agent en temps réel."
                checked={showThinking}
                onChange={toggleThinking}
              />
              <SettingRow
                label="Streaming dynamique des mots"
                detail="Afficher le flux de texte au fur et à mesure de l'inférence."
                checked={streamResponses}
                onChange={toggleStream}
              />
            </div>
          </div>
        );

      case 'connectors':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Connecteurs</h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Gérez les connexions externes autorisées pour vos agents (Google Workspace, GitHub, Qdrant, R2).
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Google Drive', desc: 'Indexation de vos documents PDF et rapports', status: 'Disponible' },
                { name: 'Gmail', desc: 'Synthèse des courriels et préparation de brouillons', status: 'Disponible' },
                { name: 'GitHub', desc: 'Audit de code et création de branches', status: 'Disponible' },
                { name: 'PostgreSQL Neon', desc: 'Persistance transactionnelle sécurisée', status: 'Disponible' },
              ].map((c) => (
                <div key={c.name} className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{c.name}</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{c.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/[0.06] text-[var(--text-secondary)]">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Compétences Agentiques</h1>
            <div className="space-y-2.5">
              {[
                { name: 'Recherche Web Multi-Sources', desc: 'Veille en temps réel via Tavily & grounding souverain' },
                { name: 'Génération de Présentations PPTX', desc: 'Création automatique de diapositives exécutives haute densité' },
                { name: 'Modélisation Financière XLSX', desc: 'Formules comptables, DCF et analyses prévisionnelles' },
                { name: 'Vision & Analyse Graphique', desc: 'Inspection vectorielle et extraction de tableaux complexes' },
              ].map((s) => (
                <div key={s.name} className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">{s.name}</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{s.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">ACTIF</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mail':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mail Ñkyel</h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Votre adresse d'agent dédiée pour recevoir et traiter des synthèses directes : <span className="font-mono text-[var(--accent)]">agent@nkyel.ai</span>
            </p>
            <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Traitement automatique des pièces jointes</h4>
              <p className="text-xs text-[var(--text-tertiary)]">
                Lorsqu'un e-mail contient un PDF ou XLSX, l'agent génère automatiquement une synthèse de décision.
              </p>
              <Toggle checked={true} onChange={() => {}} label="Traitement automatique" />
            </div>
          </div>
        );

      case 'computer':
        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Computer / Ñkyel Bureau</h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Exécution locale sécurisée de commandes de terminal et de conteneurs Docker pour les missions complexes.
            </p>
            <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Sandbox d'exécution isolée</h4>
                <p className="text-[11px] text-[var(--text-tertiary)]">Sécurité gVisor / Firecracker</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Prêt</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="nkyel-settings-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Paramètres Ñkyel"
      onMouseDown={close}
    >
      <style>{`
        .nkyel-settings-content::-webkit-scrollbar {
          width: 5px;
        }
        .nkyel-settings-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .nkyel-settings-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.2);
          border-radius: 10px;
        }
        .nkyel-settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4);
        }
      `}</style>
      <div
        ref={dialogRef}
        className="flex h-[95vh] md:h-[80vh] md:max-h-[700px] w-full max-w-5xl flex-col md:flex-row overflow-hidden rounded-t-[32px] md:rounded-[32px] bg-[var(--surface)] shadow-2xl transition-all duration-300 md:scale-100 slide-in-from-bottom-full md:slide-in-from-bottom-0 mt-auto md:mt-0"
        style={{ border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Navigation Sidebar matching Screenshot 1 */}
        <aside className="nkyel-settings-nav flex md:w-[260px] w-full shrink-0 flex-col border-b md:border-e md:border-b-0 border-[var(--border)] bg-[var(--surface)] px-3 py-2 md:py-4 select-none">
          {/* User Profile Header & Mobile Close */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] text-xs font-bold text-[var(--text-primary)]">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={displayName} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[var(--text-primary)]">{displayName}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Personnel</p>
              </div>
            </div>
            
            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={close}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Search Box - Hidden on mobile */}
          <div className="relative my-2 hidden md:block">
            <MagnifyingGlass size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher"
              className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] ps-8 pe-3 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
            />
          </div>

          {/* Grouped Tabs */}
          <nav 
            className="flex md:flex-col flex-row overflow-x-auto md:overflow-y-auto md:space-y-4 pt-2 pb-2 md:pb-0 gap-2 md:gap-0 scrollbar-hidden touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
          >
            {visibleGroups.map((group) => (
              <div key={group.label} className="flex md:block gap-2 items-center shrink-0">
                <p className="hidden md:block mb-1.5 px-2 text-[10px] font-semibold text-[var(--text-tertiary)]">
                  {group.label}
                </p>
                <div className="flex md:block flex-row md:space-y-0.5 gap-2 md:gap-0">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`flex h-8 shrink-0 items-center gap-2.5 rounded-xl px-2.5 md:w-full text-start text-xs font-medium transition-colors ${
                        activeSection === id
                          ? 'bg-[var(--surface-raised)] font-semibold text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                          : 'text-[var(--text-secondary)] bg-[var(--surface-raised)] md:bg-transparent hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon size={16} weight={activeSection === id ? 'fill' : 'regular'} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sign Out Button - Hidden on mobile to save space, but let's keep it accessible via Account tab if they want */}
          <button
            type="button"
            onClick={() => {
              close();
              signOut();
            }}
            className="hidden md:flex mt-auto items-center gap-2 border-t border-[var(--border)] px-2 pt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <SignOut size={16} />
            <span>Se déconnecter</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="nkyel-settings-content relative flex-1 overflow-y-auto p-5 sm:p-10 bg-[var(--bg)]">
          {/* Close 'X' Button matching Screenshot 1 - Desktop only */}
          <button
            type="button"
            onClick={close}
            aria-label="Fermer les paramètres"
            className="hidden md:flex absolute end-6 top-6 h-8 w-8 items-center justify-center rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors z-50"
          >
            <X size={18} weight="bold" />
          </button>

          <div className="max-w-2xl pb-12">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-4">
      <div className="pe-6">
        <p className="text-xs font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">{detail}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function InfoLine({ label, value, action }: { label: string; value: string; action: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
      <div>
        <p className="text-xs font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{value}</p>
      </div>
      <button
        type="button"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
      >
        {action}
      </button>
    </div>
  );
}
