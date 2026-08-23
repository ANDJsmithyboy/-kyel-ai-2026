'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User,
  SlidersHorizontal,
  PuzzlePiece,
  PlugsConnected,
  EnvelopeSimple,
  Monitor,
  MagnifyingGlass,
  X,
  Check,
  Moon,
  Sun,
  CircleHalf,
  ArrowSquareOut,
  CreditCard,
  SignOut,
} from '@phosphor-icons/react';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { ACCENTS, useSettingsStore, type Density, type FontSize } from '@/stores/settings.store';

type SettingsSection = 'general' | 'account' | 'usage' | 'shortcuts' | 'personalization' | 'connectors' | 'skills' | 'mail' | 'computer';
type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: React.ComponentType<{ size?: number }> }> = [
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

const NAV_GROUPS: Array<{ label: string; items: Array<{ id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number; weight?: any }> }> }> = [
  { label: 'Paramètres', items: [
    { id: 'general', label: 'Général', icon: SlidersHorizontal },
    { id: 'account', label: 'Compte', icon: User },
    { id: 'usage', label: 'Utilisation et facturation', icon: CreditCard },
    { id: 'shortcuts', label: 'Raccourcis', icon: Monitor },
  ] },
  { label: 'Fonctionnalités', items: [
    { id: 'personalization', label: 'Personnalisation', icon: SlidersHorizontal },
    { id: 'connectors', label: 'Connecteurs', icon: PlugsConnected },
    { id: 'skills', label: 'Compétences', icon: PuzzlePiece },
    { id: 'mail', label: 'Messagerie Ñkyel', icon: EnvelopeSimple },
    { id: 'computer', label: 'Ñkyel Bureau', icon: Monitor },
  ] },
];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'N';
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
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={onChange} className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--active)]'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform ${checked ? 'translate-x-[18px] bg-[var(--accent-fg)]' : 'translate-x-0.5 bg-[var(--text-tertiary)]'}`} /></button>;
}

export default function DesktopSettingsModal() {
  const { user } = useUser();
  const isOpen = useSettingsModal((state) => state.isOpen);
  const close = useSettingsModal((state) => state.close);
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [query, setQuery] = useState('');
  const [browserNotifications, setBrowserNotifications] = useState(() => readBool('Nkyel AI_browserNotifications', true));
  const [soundAlerts, setSoundAlerts] = useState(() => readBool('Nkyel AI_soundAlerts', true));
  const [productUpdates, setProductUpdates] = useState(() => readBool('Nkyel AI_productUpdates', true));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('Nkyel AI_themeMode');
    return stored === 'light' || stored === 'auto' ? stored : 'light';
  });
  const theme = useSettingsStore((state) => state.theme);
  const accent = useSettingsStore((state) => state.accent);
  const fontSize = useSettingsStore((state) => state.fontSize);
  const density = useSettingsStore((state) => state.density);
  const greetingStyle = useSettingsStore((state) => state.greetingStyle);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setAccent = useSettingsStore((state) => state.setAccent);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const setDensity = useSettingsStore((state) => state.setDensity);
  const setGreetingStyle = useSettingsStore((state) => state.setGreetingStyle);
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

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const restoreFocus = () => {
      const fallback = document.querySelector<HTMLElement>('button[aria-label="Ouvrir les paramètres"]');
      const target = previousFocus && document.contains(previousFocus) && previousFocus !== document.body ? previousFocus : fallback;
      target?.focus();
    };
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.hasAttribute('disabled'));
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleTab);
    const focusTimer = window.setTimeout(() => focusable()[0]?.focus(), 40);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleTab);
      window.setTimeout(restoreFocus, 0);
    };
  }, [isOpen]);

  const handleThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (typeof window !== 'undefined') localStorage.setItem('Nkyel AI_themeMode', mode);
    if (mode === 'light') setTheme('neo-blanc');
    else if (mode === 'dark') setTheme('black-panther');
    else {
      const prefersLight = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'neo-blanc' : 'black-panther');
    }
  };

  const handlePreference = (key: string, current: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(!current);
    persistBool(key, current);
  };

  const displayName = user?.fullName || user?.username || 'Christ pour la VOP Et toutes les Nations';
  const email = user?.primaryEmailAddress?.emailAddress || 'christpourlavop@gmail.com';
  const initials = initialsFor(displayName);
  const visibleGroups = useMemo(() => NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.items.length), [query]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (activeSection === 'account') return <>
      <h1>Compte</h1>
      <div className="mt-8 flex items-center gap-5"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-xl font-semibold text-[var(--text-primary)]">{user?.imageUrl ? <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}</div><div><p className="mb-1 text-[13px] text-[var(--text-tertiary)]">Nom complet</p><div className="rounded-lg bg-[var(--surface-raised)] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)]">{displayName}</div></div></div>
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><div><h2 className="nkyel-plan-name text-[20px] font-semibold text-[var(--text-primary)]">Gratuit</h2><p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Compte Ñkyel actif</p></div><button type="button" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[var(--accent-fg)]">Mise à niveau</button></div><div className="my-5 border-t border-dashed border-[var(--border)]" /><div className="flex items-center justify-between py-2"><span className="flex items-center gap-2 text-[14px] text-[var(--text-primary)]"><SparkleIcon /> Crédits</span><span className="text-[15px] text-[var(--text-primary)]">0</span></div><div className="flex items-center justify-between py-2"><span className="text-[14px] text-[var(--text-primary)]">Crédits de rafraîchissement quotidien</span><span className="text-[15px] text-[var(--text-primary)]">300</span></div></div>
      <div className="mt-7 space-y-5"><InfoLine label="E-mail" value={email} action="Modifier" /><InfoLine label="ID utilisateur" value={user?.id || 'nkyel-local-profile'} action="Copier" /></div>
    </>;
    if (activeSection === 'personalization') return <>
      <h1>Personnalisation</h1>
      <p className="mt-2 text-[13px] text-[#858585]">Choisis l’apparence, la densité et la voix de ton espace Ñkyel.</p>

      <section className="mt-9 border-t border-white/[0.08] pt-7">
        <h2>Thème</h2>
        <div className="mt-4 grid max-w-[520px] grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => handleThemeMode(id)} aria-pressed={themeMode === id} className={`nkyel-preference-card flex h-[84px] flex-col items-center justify-center gap-2 rounded-xl border text-[13px] ${themeMode === id ? 'border-[#D0A040] bg-white/[0.09] text-white shadow-[inset_2px_0_0_#D0A040]' : 'border-white/[0.10] text-[#A7A7A7] hover:bg-white/[0.045]'}`}><Icon size={20} /><span>{label}</span></button>)}
        </div>
      </section>

      <section className="mt-9 border-t border-white/[0.08] pt-7">
        <div className="flex items-end justify-between gap-4"><div><h2>Couleur d’accent</h2><p className="mt-1 text-[12px] text-[#777777]">Les accents SmartANDJ AI restent réservés aux signaux utiles.</p></div><span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#777777]">{ACCENTS.find((item) => item.key === accent)?.name || 'Or SmartANDJ'}</span></div>
        <div className="mt-4 grid max-w-[620px] grid-cols-5 gap-3">{ACCENTS.map((item) => <button key={item.key} type="button" onClick={() => setAccent(item.key)} aria-label={`Accent ${item.name}`} aria-pressed={accent === item.key} className={`nkyel-accent-swatch group flex h-[68px] flex-col items-center justify-center gap-2 rounded-xl border ${accent === item.key ? 'border-white bg-white/[0.08]' : 'border-white/[0.08] bg-white/[0.018] hover:bg-white/[0.045]'}`}><span className="h-5 w-5 rounded-full border border-white/30 shadow-[0_0_0_3px_rgba(255,255,255,0.04)]" style={{ backgroundColor: item.color }} /><span className="max-w-full truncate px-1 text-[10px] text-[#A7A7A7]">{item.name}</span></button>)}</div>
      </section>

      <section className="mt-9 border-t border-white/[0.08] pt-7">
        <h2>Texte et densité</h2>
        <div className="mt-4 grid max-w-[620px] grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.018] p-3"><p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[#777777]">Taille</p><div className="flex gap-2">{FONT_OPTIONS.map((item) => <button key={item.id} type="button" onClick={() => setFontSize(item.id)} aria-pressed={fontSize === item.id} className={`flex h-9 flex-1 items-center justify-center rounded-lg border text-[12px] ${fontSize === item.id ? 'border-[#D0A040] bg-white/[0.08] text-white' : 'border-white/[0.08] text-[#A7A7A7] hover:bg-white/[0.04]'}`}><span className={item.id === 'small' ? 'text-[11px]' : item.id === 'large' ? 'text-[15px]' : 'text-[13px]'}>{item.sample}</span><span className="ml-1.5">{item.label}</span></button>)}</div></div>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.018] p-3"><p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[#777777]">Densité</p><div className="flex gap-2">{DENSITY_OPTIONS.map((item) => <button key={item.id} type="button" onClick={() => setDensity(item.id)} aria-pressed={density === item.id} className={`flex h-9 flex-1 flex-col items-center justify-center rounded-lg border text-[11px] ${density === item.id ? 'border-[#D0A040] bg-white/[0.08] text-white' : 'border-white/[0.08] text-[#A7A7A7] hover:bg-white/[0.04]'}`}><span>{item.label}</span><span className="text-[9px] text-[#777777]">{item.detail}</span></button>)}</div></div>
        </div>
        <div className="mt-4 flex max-w-[620px] gap-3"><button type="button" onClick={() => setGreetingStyle('formel')} aria-pressed={greetingStyle === 'formel'} className={`flex-1 rounded-xl border px-3 py-3 text-left text-[12px] ${greetingStyle === 'formel' ? 'border-[#D0A040] bg-white/[0.08] text-white' : 'border-white/[0.08] text-[#A7A7A7] hover:bg-white/[0.04]'}`}><span className="block font-medium">Formel</span><span className="mt-1 block text-[10px] text-[#777777]">Sobre et professionnel</span></button><button type="button" onClick={() => setGreetingStyle('gabonais')} aria-pressed={greetingStyle === 'gabonais'} className={`flex-1 rounded-xl border px-3 py-3 text-left text-[12px] ${greetingStyle === 'gabonais' ? 'border-[#D0A040] bg-white/[0.08] text-white' : 'border-white/[0.08] text-[#A7A7A7] hover:bg-white/[0.04]'}`}><span className="block font-medium">Chaleureux</span><span className="mt-1 block text-[10px] text-[#777777]">Humain et accessible</span></button><button type="button" onClick={() => setGreetingStyle('argot')} aria-pressed={greetingStyle === 'argot'} className={`flex-1 rounded-xl border px-3 py-3 text-left text-[12px] ${greetingStyle === 'argot' ? 'border-[#D0A040] bg-white/[0.08] text-white' : 'border-white/[0.08] text-[#A7A7A7] hover:bg-white/[0.04]'}`}><span className="block font-medium">Direct</span><span className="mt-1 block text-[10px] text-[#777777]">Court et sans détour</span></button></div>
      </section>

      <section className="mt-9 border-t border-white/[0.08] pt-7"><h2>Préférences de communication</h2><SettingRow label="Notifications du navigateur" detail="Recevoir les avancées et les tâches terminées." checked={browserNotifications} onChange={() => handlePreference('Nkyel AI_browserNotifications', browserNotifications, setBrowserNotifications)} /><SettingRow label="Alerte sonore" detail="Jouer un son lorsqu’une mission est terminée." checked={soundAlerts} onChange={() => handlePreference('Nkyel AI_soundAlerts', soundAlerts, setSoundAlerts)} /><SettingRow label="Mises à jour produit" detail="Recevoir les nouveautés et études de cas Ñkyel." checked={productUpdates} onChange={() => handlePreference('Nkyel AI_productUpdates', productUpdates, setProductUpdates)} /></section>
    </>;
    const titles: Record<SettingsSection, string> = { general: 'Général', usage: 'Utilisation et facturation', shortcuts: 'Raccourcis', connectors: 'Connecteurs', skills: 'Compétences', mail: 'Messagerie Ñkyel', computer: 'Ñkyel Bureau', personalization: 'Personnalisation', account: 'Compte' };
    return <><h1>{titles[activeSection]}</h1><p className="mt-2 text-[13px] text-[var(--text-tertiary)]">Configure ton espace Ñkyel et contrôle les fonctionnalités disponibles.</p><section className="mt-9 border-t border-[var(--border-subtle)] pt-7"><h2>Préférences</h2><SettingRow label="Notifications du navigateur" detail="Recevoir les avancées et les tâches terminées." checked={browserNotifications} onChange={() => setBrowserNotifications((value) => !value)} /><SettingRow label="Alerte sonore" detail="Jouer un son lorsqu'une mission est terminée." checked={soundAlerts} onChange={() => setSoundAlerts((value) => !value)} /><SettingRow label="Mises à jour produit" detail="Recevoir les nouveautés et études de cas Ñkyel." checked={productUpdates} onChange={() => setProductUpdates((value) => !value)} /></section></>;
  };

  return <div className="nkyel-settings-overlay fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Paramètres Ñkyel" onMouseDown={close}>
    <div ref={dialogRef} className="nkyel-settings-dialog flex h-[min(760px,calc(100dvh-48px))] w-[min(1280px,calc(100vw-48px))] overflow-hidden rounded-[18px] border text-[var(--text-primary)]" onMouseDown={(event) => event.stopPropagation()}>
      <aside className="nkyel-settings-nav flex w-[292px] shrink-0 flex-col border-r px-4 py-5"><div className="flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[12px] font-semibold">{user?.imageUrl ? <img src={user.imageUrl} alt={displayName} className="h-full w-full rounded-full object-cover" /> : initials}</div><div className="min-w-0"><p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{displayName}</p><p className="text-[12px] text-[var(--text-tertiary)]">Personnel</p></div><button type="button" className="ml-auto text-[var(--text-tertiary)]" aria-label="Changer d'espace"><SlidersHorizontal size={17} /></button></div><label className="relative mt-5 block"><MagnifyingGlass size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" className="h-10 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-inset)] pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]" /></label><nav className="mt-6 flex-1 overflow-y-auto">{visibleGroups.map((group) => <div key={group.label} className="mb-6"><p className="mb-2 px-2 text-[12px] text-[var(--text-tertiary)]">{group.label}</p>{group.items.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setActiveSection(id)} className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] transition-colors ${activeSection === id ? 'bg-[var(--selected)] font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'}`}><Icon size={18} weight={activeSection === id ? 'fill' : 'regular'} />{label}</button>)}</div>)}</nav><button type="button" className="mt-auto flex items-center gap-3 border-t border-[var(--border-subtle)] px-2 pt-4 text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><SignOut size={18} /> Se déconnecter</button></aside>
      <main className="nkyel-settings-content relative flex-1 overflow-y-auto px-12 py-10"><button type="button" onClick={close} aria-label="Fermer les paramètres" className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"><X size={21} /></button><div className="mx-auto max-w-[980px] pr-8">{renderContent()}</div></main>
    </div>
  </div>;
}

function SettingRow({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: () => void }) { return <div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-6"><div className="pr-8"><p className="text-[15px] font-medium text-[var(--text-primary)]">{label}</p><p className="mt-1 text-[12px] leading-relaxed text-[var(--text-tertiary)]">{detail}</p></div><Toggle checked={checked} onChange={onChange} label={label} /></div>; }
function InfoLine({ label, value, action }: { label: string; value: string; action: string }) { return <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4"><div><p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p><p className="mt-1 text-[13px] text-[var(--text-tertiary)]">{value}</p></div><button type="button" className="rounded-lg border border-[var(--border-strong)] px-3 py-2 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--hover)]">{action}</button></div>; }
function SparkleIcon() { return <span className="inline-flex h-4 w-4 items-center justify-center text-[var(--text-secondary)]">✦</span>; }
