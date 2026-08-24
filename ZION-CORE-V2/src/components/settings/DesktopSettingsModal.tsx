'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeUser as useUser } from '@/lib/auth-client';
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
} from '@phosphor-icons/react';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import {
  ACCENTS,
  THEMES,
  useSettingsStore,
  type Density,
  type FontSize,
  type ThemeKey,
  type AccentKey,
} from '@/stores/settings.store';

type SettingsSection = 'general' | 'personalization' | 'account' | 'usage' | 'shortcuts' | 'connectors' | 'skills' | 'mail' | 'computer';
type ThemeMode = 'light' | 'dark' | 'auto';

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
      { id: 'personalization', label: 'Personnalisation & Textes', icon: TextT },
      { id: 'account', label: 'Compte', icon: User },
      { id: 'usage', label: 'Utilisation et facturation', icon: CreditCard },
      { id: 'shortcuts', label: 'Raccourcis', icon: Monitor },
    ],
  },
  {
    label: 'Fonctionnalités',
    items: [
      { id: 'connectors', label: 'Connecteurs', icon: PlugsConnected },
      { id: 'skills', label: 'Compétences', icon: PuzzlePiece },
      { id: 'mail', label: 'Messagerie Ñkyel', icon: EnvelopeSimple },
      { id: 'computer', label: 'Ñkyel Bureau', icon: Monitor },
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

function persistBool(key: string, current: boolean) {
  if (typeof window !== 'undefined') localStorage.setItem(key, String(!current));
  return !current;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-raised)] border border-[var(--border)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform ${
          checked ? 'translate-x-[18px] bg-[var(--accent-fg)]' : 'translate-x-0.5 bg-[var(--text-tertiary)]'
        }`}
      />
    </button>
  );
}

export default function DesktopSettingsModal() {
  const { user } = useUser();
  const isOpen = useSettingsModal((state: any) => state.isOpen);
  const close = useSettingsModal((state: any) => state.close);
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [query, setQuery] = useState('');
  const [browserNotifications, setBrowserNotifications] = useState(() =>
    readBool('Nkyel AI_browserNotifications', true)
  );
  const [soundAlerts, setSoundAlerts] = useState(() => readBool('Nkyel AI_soundAlerts', true));
  const [productUpdates, setProductUpdates] = useState(() => readBool('Nkyel AI_productUpdates', true));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('Nkyel AI_themeMode');
    return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'light';
  });

  const theme = useSettingsStore((state: any) => state.theme);
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

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

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

  const handlePreference = (
    key: string,
    current: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(!current);
    persistBool(key, current);
  };

  const displayName = user?.fullName || user?.username || 'Daniel Jonathan ANDJ';
  const email = user?.primaryEmailAddress?.emailAddress || 'founder@nkyel.ai';
  const initials = initialsFor(displayName);

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
      })).filter((group) => group.items.length),
    [query]
  );

  if (!isOpen) return null;

  const renderPersonalizationControls = () => (
    <>
      <section className="mt-6 border-t border-[var(--border)] pt-6">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Mode d’affichage</h2>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Choisis entre le mode clair, sombre ou automatique.</p>
        <div className="mt-4 grid max-w-[520px] grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleThemeMode(id)}
              aria-pressed={themeMode === id}
              className={`nkyel-preference-card flex h-[84px] flex-col items-center justify-center gap-2 rounded-xl border text-[13px] font-medium transition-all ${
                themeMode === id
                  ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--border)] pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Couleur d’accent</h2>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Les accents souverains SmartANDJ AI.</p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
            {ACCENTS.find((item) => item.key === accent)?.name || 'Or SmartANDJ'}
          </span>
        </div>
        <div className="mt-4 grid max-w-[620px] grid-cols-5 gap-3">
          {ACCENTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAccent(item.key)}
              aria-label={`Accent ${item.name}`}
              aria-pressed={accent === item.key}
              className={`nkyel-accent-swatch group flex h-[68px] flex-col items-center justify-center gap-2 rounded-xl border transition-all ${
                accent === item.key
                  ? 'border-[var(--text-primary)] bg-[var(--surface-raised)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)]'
              }`}
            >
              <span
                className="h-5 w-5 rounded-full border border-black/10 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="max-w-full truncate px-1 text-[10px] font-medium text-[var(--text-secondary)]">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--border)] pt-6">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Taille du texte et Densité</h2>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Ajuste la lisibilité et l’espacement des conversations.</p>
        <div className="mt-4 grid max-w-[620px] grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Taille de police
            </p>
            <div className="flex gap-2">
              {FONT_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFontSize(item.id)}
                  aria-pressed={fontSize === item.id}
                  className={`flex h-9 flex-1 items-center justify-center rounded-lg border text-[12px] font-medium transition-all ${
                    fontSize === item.id
                      ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-sm'
                      : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className={item.id === 'small' ? 'text-[11px]' : item.id === 'large' ? 'text-[15px]' : 'text-[13px]'}>
                    {item.sample}
                  </span>
                  <span className="ml-1.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Densité de l’espace
            </p>
            <div className="flex gap-2">
              {DENSITY_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDensity(item.id)}
                  aria-pressed={density === item.id}
                  className={`flex h-9 flex-1 flex-col items-center justify-center rounded-lg border text-[11px] font-medium transition-all ${
                    density === item.id
                      ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-sm'
                      : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[9px] text-[var(--text-tertiary)]">{item.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex max-w-[620px] gap-3">
          <button
            type="button"
            onClick={() => setGreetingStyle('formel')}
            aria-pressed={greetingStyle === 'formel'}
            className={`flex-1 rounded-xl border p-3.5 text-left text-[12px] transition-all ${
              greetingStyle === 'formel'
                ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="block font-medium text-[var(--text-primary)]">Formel</span>
            <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">Sobre et professionnel</span>
          </button>
          <button
            type="button"
            onClick={() => setGreetingStyle('gabonais')}
            aria-pressed={greetingStyle === 'gabonais'}
            className={`flex-1 rounded-xl border p-3.5 text-left text-[12px] transition-all ${
              greetingStyle === 'gabonais'
                ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="block font-medium text-[var(--text-primary)]">Chaleureux</span>
            <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">Humain et accessible</span>
          </button>
          <button
            type="button"
            onClick={() => setGreetingStyle('argot')}
            aria-pressed={greetingStyle === 'argot'}
            className={`flex-1 rounded-xl border p-3.5 text-left text-[12px] transition-all ${
              greetingStyle === 'argot'
                ? 'border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="block font-medium text-[var(--text-primary)]">Direct</span>
            <span className="mt-1 block text-[10px] text-[var(--text-tertiary)]">Court et sans détour</span>
          </button>
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--border)] pt-6">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Affichage des Réponses & Raisonnement</h2>
        <SettingRow
          label="Afficher les étapes de réflexion de l’agent"
          detail="Visualiser la chaîne de réflexion (CoT) et les plans d'actions en temps réel."
          checked={showThinking}
          onChange={toggleThinking}
        />
        <SettingRow
          label="Streaming en direct des réponses"
          detail="Afficher les mots au fur et à mesure de leur génération."
          checked={streamResponses}
          onChange={toggleStream}
        />
        <SettingRow
          label="Coloration syntaxique du code"
          detail="Mettre en valeur le code avec des contrastes optimisés."
          checked={codeSyntaxHighlight}
          onChange={toggleSyntax}
        />
      </section>
    </>
  );

  const renderContent = () => {
    if (activeSection === 'account') {
      return (
        <>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Compte</h1>
          <div className="mt-8 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-xl font-semibold text-[var(--text-primary)]">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="mb-1 text-[13px] text-[var(--text-tertiary)]">Nom complet</p>
              <div className="rounded-lg bg-[var(--surface-raised)] px-3.5 py-2.5 text-[15px] font-medium text-[var(--text-primary)] border border-[var(--border)]">
                {displayName}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="nkyel-plan-name text-[20px] font-semibold text-[var(--text-primary)]">
                  Pionnier Bêta (100 sièges)
                </h2>
                <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Accès Fondateur Actif</p>
              </div>
              <span className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[var(--accent-fg)]">
                Actif
              </span>
            </div>
          </div>
          <div className="mt-7 space-y-5">
            <InfoLine label="E-mail" value={email} action="Modifier" />
            <InfoLine label="ID utilisateur" value={user?.id || 'nkyel-local-profile'} action="Copier" />
          </div>
        </>
      );
    }

    if (activeSection === 'personalization' || activeSection === 'general') {
      return (
        <>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {activeSection === 'general' ? 'Général & Personnalisation' : 'Personnalisation & Styles de textes'}
          </h1>
          <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
            Configure l’apparence, la taille des textes, la densité et la voix de ton espace souverain Ñkyel.
          </p>
          {renderPersonalizationControls()}
        </>
      );
    }

    const titles: Record<SettingsSection, string> = {
      general: 'Général',
      usage: 'Utilisation et facturation',
      shortcuts: 'Raccourcis',
      connectors: 'Connecteurs',
      skills: 'Compétences',
      mail: 'Messagerie Ñkyel',
      computer: 'Ñkyel Bureau',
      personalization: 'Personnalisation',
      account: 'Compte',
    };

    return (
      <>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{titles[activeSection]}</h1>
        <p className="mt-2 text-[13px] text-[var(--text-tertiary)]">
          Configure ton espace Ñkyel et contrôle les fonctionnalités disponibles.
        </p>
        <section className="mt-9 border-t border-[var(--border)] pt-7">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Préférences de communication</h2>
          <SettingRow
            label="Notifications du navigateur"
            detail="Recevoir les avancées et les tâches terminées."
            checked={browserNotifications}
            onChange={() =>
              handlePreference('Nkyel AI_browserNotifications', browserNotifications, setBrowserNotifications)
            }
          />
          <SettingRow
            label="Alerte sonore"
            detail="Jouer un son lorsqu'une mission est terminée."
            checked={soundAlerts}
            onChange={() => handlePreference('Nkyel AI_soundAlerts', soundAlerts, setSoundAlerts)}
          />
          <SettingRow
            label="Mises à jour produit"
            detail="Recevoir les nouveautés et études de cas Ñkyel."
            checked={productUpdates}
            onChange={() => handlePreference('Nkyel AI_productUpdates', productUpdates, setProductUpdates)}
          />
        </section>
      </>
    );
  };

  return (
    <div
      className="nkyel-settings-overlay fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Paramètres Ñkyel"
      onMouseDown={close}
    >
      <div
        ref={dialogRef}
        className="nkyel-settings-dialog flex h-[min(780px,calc(100dvh-48px))] w-[min(1280px,calc(100vw-48px))] overflow-hidden rounded-[20px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl text-[var(--text-primary)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <aside className="nkyel-settings-nav flex w-[292px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[12px] font-semibold text-[var(--text-primary)]">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{displayName}</p>
              <p className="text-[12px] text-[var(--text-tertiary)]">Pionnier Bêta</p>
            </div>
          </div>

          <label className="relative mt-5 block">
            <MagnifyingGlass size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un paramètre"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
            />
          </label>

          <nav className="mt-6 flex-1 overflow-y-auto space-y-6">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] transition-colors ${
                        activeSection === id
                          ? 'bg-[var(--selected)] font-semibold text-[var(--text-primary)] border border-[var(--border)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon size={18} weight={activeSection === id ? 'fill' : 'regular'} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            className="mt-auto flex items-center gap-3 border-t border-[var(--border)] px-2 pt-4 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <SignOut size={18} /> Se déconnecter
          </button>
        </aside>

        <main className="nkyel-settings-content relative flex-1 overflow-y-auto px-12 py-10 bg-[var(--bg)]">
          <button
            type="button"
            onClick={close}
            aria-label="Fermer les paramètres"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={21} />
          </button>
          <div className="mx-auto max-w-[980px] pr-8">{renderContent()}</div>
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
    <div className="flex items-center justify-between border-b border-[var(--border)] py-5">
      <div className="pr-8">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-secondary)]">{detail}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function InfoLine({ label, value, action }: { label: string; value: string; action: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
      <div>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{value}</p>
      </div>
      <button
        type="button"
        className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
      >
        {action}
      </button>
    </div>
  );
}
