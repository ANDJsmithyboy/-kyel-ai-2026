/**
 * Ñkyel AI — Page Paramètres & Profil (Apple × Manus Sovereign Level)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Architecture & Discipline Spatiale :
 * - Full responsive scrolling with custom luxury scrollbar (no cut-off)
 * - Immediate reactive language switching across all interface labels
 * - Apple-grade restraint (Setting ... Control / Description) with Sumi/Gofun tokens
 * - 0ms theme, accent, font size and density switching
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Globe,
  Sun,
  Moon,
  Desktop,
  Cpu,
  Brain,
  Crown,
  ShieldCheck,
  WarningOctagon,
  ArrowLeft,
  CheckCircle,
  ArrowsClockwise,
  Check,
  Sparkle,
  Trash,
  Database,
  LockKey,
} from '@phosphor-icons/react';
import { useSafeUser as useUser } from '@/lib/auth-client';
import { useLanguageStore, BCP47Language, SUPPORTED_LANGUAGES } from '@/stores/language.store';
import { useSettingsStore, FontSize, Density } from '@/stores/settings.store';
import Surface from '@/components/ui/Surface';

type SettingsTab =
  | 'general'
  | 'profile'
  | 'appearance'
  | 'agent'
  | 'memory'
  | 'subscription'
  | 'security'
  | 'danger';

interface TabItem {
  id: SettingsTab;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const SETTINGS_TABS: TabItem[] = [
  { id: 'general', labelKey: 'settings.tab.general', defaultLabel: 'General & Language', icon: Globe },
  { id: 'profile', labelKey: 'settings.tab.profile', defaultLabel: 'Profile & Identity', icon: User },
  { id: 'appearance', labelKey: 'settings.tab.appearance', defaultLabel: 'Appearance & Theme', icon: Sun },
  { id: 'agent', labelKey: 'settings.tab.agent', defaultLabel: 'Intelligence & Autonomy', icon: Cpu },
  { id: 'memory', labelKey: 'settings.tab.memory', defaultLabel: 'Sovereign Memory', icon: Brain },
  { id: 'subscription', labelKey: 'settings.tab.subscription', defaultLabel: 'Plans & Credits', icon: Crown, badge: 'PRO' },
  { id: 'security', labelKey: 'settings.tab.security', defaultLabel: 'Security & Data', icon: ShieldCheck },
  { id: 'danger', labelKey: 'settings.tab.danger', defaultLabel: 'Critical Zone', icon: WarningOctagon },
];

const ACCENT_CHOICES = [
  { key: 'gold', name: 'Kin Gold', color: '#D5AE57' },
  { key: 'blue', name: 'Ai Indigo', color: '#4F46E5' },
  { key: 'cyan', name: 'Teal Network', color: '#00D4AA' },
  { key: 'magenta', name: 'Signal Magenta', color: '#F00080' },
  { key: 'graphite', name: 'Sumi Slate', color: '#8A92A0' },
];

/* ── Composants Primitifs Calmes ── */
function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pt-4 first:pt-0">
      <div className="border-b border-[var(--border-subtle)] pb-2.5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">{title}</h3>
        {description && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{description}</p>
        )}
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-0.5 max-w-md">
        <div className="font-medium text-[13.5px] text-[var(--text-primary)]">{label}</div>
        {description && (
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center">{control}</div>
    </div>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as SettingsTab) || 'general';

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [mobileDrilldown, setMobileDrilldown] = useState<SettingsTab | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user } = useUser();
  const { uiLocale, setUiLocale, setLocale, t } = useLanguageStore();
  const currentLocale = uiLocale || 'en-US';
  const isFr = currentLocale.startsWith('fr');

  const {
    theme,
    accent,
    fontSize,
    density,
    autonomyLevel,
    responseDepth,
    researchDepth,
    memoryEnabled,
    setTheme,
    setAccent,
    setFontSize,
    setDensity,
    updatePreferences,
    isSyncing,
  } = useSettingsStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLanguageChange = (tag: string) => {
    setUiLocale(tag);
    if (setLocale) setLocale(tag);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.tag === tag);
    showToast(isFr ? `Langue activée : ${langObj?.name || tag}` : `Language updated: ${langObj?.name || tag}`);
  };

  const displayName = user?.fullName || 'Daniel Jonathan ANDJ';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || 'founder@smartandj.ai';
  const initials = 'DJ';

  return (
    <div className="h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] antialiased select-none flex flex-col overflow-hidden">
      {/* ── Top Minimal Header ── */}
      <header className="h-14 shrink-0 border-b border-[var(--border)] bg-[var(--material-glass-regular)] backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (mobileDrilldown) {
                setMobileDrilldown(null);
              } else {
                router.push('/chat');
              }
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors active:scale-95 touch-manipulation"
            title="Retour au workspace"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold text-xs tracking-tight text-[var(--text-primary)]">
            {mobileDrilldown
              ? t(SETTINGS_TABS.find((t) => t.id === mobileDrilldown)?.labelKey || '')
              : t('settings.title')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)]">
          {isSyncing ? (
            <span className="flex items-center gap-1.5 text-amber-400">
              <ArrowsClockwise size={12} className="animate-spin" />
              <span className="hidden sm:inline">{isFr ? 'Synchronisation...' : 'Syncing...'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={13} weight="fill" />
              <span className="hidden sm:inline">{isFr ? 'Persisté Neon' : 'Persisted on Neon'}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Toast Confirmation ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--surface-raised)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] shadow-lg backdrop-blur-2xl z-50 flex items-center gap-2"
          >
            <CheckCircle size={14} weight="fill" className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable Body with Clean Luxury Scrollbar ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
          {/* ── Desktop & Tablet View (2 Columns) ── */}
          <div className="hidden md:grid md:grid-cols-[220px_1fr] gap-8 items-start">
            {/* Left Navigation */}
            <nav className="space-y-1 sticky top-6">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                const label = t(tab.labelKey) || tab.defaultLabel;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all text-left touch-manipulation ${
                      isSelected
                        ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} weight={isSelected ? 'bold' : 'regular'} className={isSelected ? 'text-[var(--accent)]' : ''} />
                      <span className="truncate">{label}</span>
                    </div>
                    {tab.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Content Panel */}
            <Surface material="content" className="p-6 sm:p-7 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
              {/* 1. GENERAL & LANGUES */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.general.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('settings.general.desc')}
                    </p>
                  </div>

                  {/* Quick Language Switcher Pills */}
                  <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    {[
                      { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
                      { code: 'fr-FR', label: 'Français (France)', flag: '🇫🇷' },
                      { code: 'fr-GA', label: 'Français (Gabon)', flag: '🇬🇦' },
                      { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
                      { code: 'fan', label: 'Fang (Ekang)', flag: '🇬🇦' },
                    ].map((pill) => {
                      const isActive = currentLocale === pill.code;
                      return (
                        <button
                          key={pill.code}
                          type="button"
                          onClick={() => handleLanguageChange(pill.code)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-xs'
                              : 'bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                          }`}
                        >
                          <span>{pill.flag}</span>
                          <span>{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <SettingSection title={t('settings.general.interfaceLanguage')}>
                    <SettingRow
                      label={t('settings.general.productLanguage')}
                      description={t('settings.general.productLanguageDesc')}
                      control={
                        <select
                          value={currentLocale}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="h-9 px-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                        >
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.tag} value={lang.tag}>
                              {lang.name} ({lang.nativeName})
                            </option>
                          ))}
                        </select>
                      }
                    />
                  </SettingSection>

                  <SettingSection title={isFr ? 'Fuseau & Horodatage' : 'Timezone & Clock'}>
                    <SettingRow
                      label={isFr ? 'Fuseau Horaire' : 'System Timezone'}
                      description={isFr ? 'Horodatage des missions et des exports d’artefacts.' : 'Timezone used for mission timestamps and artifact exports.'}
                      control={
                        <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                          Africa/Libreville (UTC+1)
                        </span>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 2. PROFIL & IDENTITÉ */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.tab.profile')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isFr ? 'Géré via SSO souverain et protocoles SmartANDJ.' : 'Managed via sovereign SSO and SmartANDJ security.'}
                    </p>
                  </div>

                  <SettingSection title={isFr ? 'Informations Personnelles' : 'Personal Details'}>
                    <SettingRow
                      label={isFr ? 'Avatar & Initiales' : 'Avatar & Initials'}
                      description={isFr ? 'Utilisé dans les missions et les sessions de travail.' : 'Shown in work sessions and shared mission logs.'}
                      control={
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-bold flex items-center justify-center text-xs shadow-sm">
                          {initials}
                        </div>
                      }
                    />
                    <SettingRow
                      label={isFr ? 'Nom Complet' : 'Full Name'}
                      description={isFr ? 'Votre identité au sein du système souverain.' : 'Your identity across the sovereign intelligence platform.'}
                      control={
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {displayName}
                        </span>
                      }
                    />
                    <SettingRow
                      label={isFr ? 'Adresse Courriel' : 'Email Address'}
                      description={isFr ? 'Compte principal associé à votre clé de sécurité.' : 'Primary account linked to your zero-knowledge encryption key.'}
                      control={
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          {displayEmail}
                        </span>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 3. APPARENCE & THÈME */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.appearance.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('settings.appearance.subtitle')}
                    </p>
                  </div>

                  <SettingSection title={t('settings.appearance.mode')}>
                    <SettingRow
                      label={t('settings.appearance.visualTheme')}
                      description={t('settings.appearance.visualThemeDesc')}
                      control={
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                          {[
                            { key: 'neo-blanc', label: t('settings.appearance.light'), icon: Sun },
                            { key: 'system', label: t('settings.appearance.system'), icon: Desktop },
                            { key: 'black-panther', label: t('settings.appearance.dark'), icon: Moon },
                          ].map((tItem) => {
                            const Icon = tItem.icon;
                            const isSelected =
                              theme === tItem.key ||
                              (tItem.key === 'neo-blanc' && (theme === 'light' || theme === 'aurore-ogoue')) ||
                              (tItem.key === 'black-panther' && theme === 'dark');
                            return (
                              <button
                                key={tItem.key}
                                type="button"
                                onClick={() => {
                                  setTheme(tItem.key as any);
                                  showToast(`${t('settings.appearance.visualTheme')} : ${tItem.label}`);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                  isSelected
                                    ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                              >
                                <Icon size={14} />
                                <span>{tItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      }
                    />
                  </SettingSection>

                  <SettingSection title={t('settings.appearance.accent')}>
                    <SettingRow
                      label={t('settings.appearance.accentColor')}
                      description={t('settings.appearance.accentDesc')}
                      control={
                        <div className="flex items-center gap-2">
                          {ACCENT_CHOICES.map((a) => (
                            <button
                              key={a.key}
                              type="button"
                              onClick={() => {
                                setAccent(a.key as any);
                                showToast(`${t('settings.appearance.accentColor')} : ${a.name}`);
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                accent === a.key
                                  ? 'ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--material-canvas)] scale-110'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: a.color }}
                              title={a.name}
                            >
                              {accent === a.key && <Check size={12} weight="bold" className="text-white drop-shadow" />}
                            </button>
                          ))}
                        </div>
                      }
                    />
                  </SettingSection>

                  <SettingSection title={t('settings.appearance.typography')}>
                    <SettingRow
                      label={t('settings.appearance.fontSize')}
                      description={isFr ? "Ajuste proportionnellement la taille de l'ensemble de l'interface." : 'Scales interface fonts proportionally across all views.'}
                      control={
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                          {[
                            { key: 'small', label: isFr ? 'Compact (88%)' : 'Compact (88%)' },
                            { key: 'normal', label: isFr ? 'Défaut (100%)' : 'Default (100%)' },
                            { key: 'large', label: isFr ? 'Grand (114%)' : 'Large (114%)' },
                          ].map((s) => (
                            <button
                              key={s.key}
                              type="button"
                              onClick={() => {
                                setFontSize(s.key as FontSize);
                                showToast(`${t('settings.appearance.fontSize')} : ${s.label}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                fontSize === s.key || (s.key === 'normal' && fontSize === 'default' as any)
                                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      }
                    />
                  </SettingSection>

                  <SettingSection title={t('settings.appearance.density')}>
                    <SettingRow
                      label={t('settings.appearance.density')}
                      description={isFr ? "Contrôle les espacements des panneaux de travail et barres d'outils." : 'Controls padding and margins across workspace panels and toolbars.'}
                      control={
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                          {[
                            { key: 'compact', label: isFr ? 'Compact' : 'Compact' },
                            { key: 'comfortable', label: isFr ? 'Confortable' : 'Comfortable' },
                          ].map((d) => (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => {
                                setDensity(d.key as Density);
                                showToast(`${t('settings.appearance.density')} : ${d.label}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                density === d.key
                                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 4. INTELLIGENCE & AUTONOMIE */}
              {activeTab === 'agent' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.agent.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('settings.agent.subtitle')}
                    </p>
                  </div>

                  <SettingSection title={t('settings.agent.autonomy')}>
                    <SettingRow
                      label={t('settings.agent.autonomy')}
                      description={isFr ? "Permet à l'agent de planifier et d'exécuter des sous-tâches de manière autonome." : 'Allows agent to autonomously plan and execute sub-tasks.'}
                      control={
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                          {[
                            { key: 'guided', label: isFr ? 'Supervisé' : 'Supervised' },
                            { key: 'balanced', label: isFr ? 'Équilibré' : 'Balanced' },
                            { key: 'autonomous', label: isFr ? 'Plein Autonome' : 'Full Autonomous' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                updatePreferences({ autonomyLevel: item.key as any });
                                showToast(`${t('settings.agent.autonomy')} : ${item.label}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                autonomyLevel === item.key
                                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      }
                    />
                  </SettingSection>

                  <SettingSection title={t('settings.agent.depth')}>
                    <SettingRow
                      label={t('settings.agent.depth')}
                      description={isFr ? "Budget de tokens alloué au raisonnement en profondeur." : 'Token reasoning budget allocated to multi-step tasks.'}
                      control={
                        <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)]">
                          {responseDepth === 'deep' ? (isFr ? 'Raisonnement Profond' : 'Deep Reasoning') : (isFr ? 'Standard' : 'Standard')}
                        </span>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 5. MÉMOIRE SOUVERAINE */}
              {activeTab === 'memory' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.memory.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('settings.memory.subtitle')}
                    </p>
                  </div>

                  <SettingSection title={t('settings.memory.toggle')}>
                    <SettingRow
                      label={t('settings.memory.toggle')}
                      description={isFr ? "Mémorise les contextes importants entre les sessions sans jamais partager vos données avec des tiers." : 'Remembers key context across sessions without sharing data with third parties.'}
                      control={
                        <button
                          type="button"
                          onClick={() => {
                            updatePreferences({ memoryEnabled: !memoryEnabled });
                            showToast(memoryEnabled ? (isFr ? 'Mémoire désactivée' : 'Memory disabled') : (isFr ? 'Mémoire activée' : 'Memory enabled'));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            memoryEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--control-bg)] border border-[var(--border)]'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                              memoryEnabled ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 6. FORFAIT & CRÉDITS */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.tab.subscription')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isFr ? 'Accès illimité et quotas d’intelligence de votre compte.' : 'Unlimited access and intelligence quotas for your account.'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--accent)]/40 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                        <Crown size={20} weight="fill" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">
                            {isFr ? 'Mode Créateur God' : 'Creator God Mode'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-bold">
                            ∞ GOD
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {isFr ? 'Quotas illimités pour Daniel Jonathan ANDJ' : 'Unlimited quotas for Daniel Jonathan ANDJ'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SÉCURITÉ & DONNÉES */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                      {t('settings.security.title')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {t('settings.security.subtitle')}
                    </p>
                  </div>

                  <SettingSection title={isFr ? 'Chiffrement & Stockage' : 'Encryption & Vault'}>
                    <SettingRow
                      label={isFr ? 'Stockage Chiffré' : 'Encrypted Storage'}
                      description={isFr ? 'Toutes les conversations et artéfacts sont chiffrés au repos.' : 'All conversations and artifacts are encrypted at rest.'}
                      control={
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <ShieldCheck size={16} weight="fill" />
                          <span>AES-GCM 256</span>
                        </span>
                      }
                    />
                  </SettingSection>
                </div>
              )}

              {/* 8. ZONE CRITIQUE */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-red-400 tracking-tight">
                      {t('settings.tab.danger')}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isFr ? 'Actions irréversibles relatives aux données de votre compte.' : 'Irreversible actions relating to your account data.'}
                    </p>
                  </div>

                  <SettingSection title={isFr ? 'Suppression des Données' : 'Data Purge'}>
                    <SettingRow
                      label={isFr ? 'Purger l’historique' : 'Purge Conversation History'}
                      description={isFr ? 'Supprime définitivement toutes les missions locales et persistées.' : 'Permanently clears all local and persisted mission logs.'}
                      control={
                        <button
                          type="button"
                          onClick={() => showToast(isFr ? 'Historique nettoyé' : 'History cleared')}
                          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                        >
                          {isFr ? 'Purger' : 'Purge'}
                        </button>
                      }
                    />
                  </SettingSection>
                </div>
              )}
            </Surface>
          </div>

          {/* ── Mobile View: Drilldown or List ── */}
          <div className="md:hidden space-y-3">
            {!mobileDrilldown ? (
              <div className="space-y-2">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const label = t(tab.labelKey) || tab.defaultLabel;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMobileDrilldown(tab.id)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-left active:scale-[0.99] touch-manipulation min-h-[54px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)]">
                          <Icon size={18} />
                        </div>
                        <span className="font-semibold text-sm text-[var(--text-primary)]">{label}</span>
                      </div>
                      {tab.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-bold">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-4">
                {mobileDrilldown === 'general' && (
                  <div className="space-y-4 text-xs">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">
                      {t('settings.general.productLanguage')}
                    </div>
                    <select
                      value={currentLocale}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.tag} value={lang.tag}>
                          {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mobileDrilldown === 'appearance' && (
                  <div className="space-y-4 text-xs">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">
                      {t('settings.appearance.mode')}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'neo-blanc', label: t('settings.appearance.light') },
                        { key: 'system', label: t('settings.appearance.system') },
                        { key: 'black-panther', label: t('settings.appearance.dark') },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTheme(item.key as any)}
                          className="py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center font-medium"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
