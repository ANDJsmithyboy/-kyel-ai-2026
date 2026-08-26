/**
 * Ñkyel AI — Page Paramètres & Profil (Luma AI × Apple × Geist Level)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Architecture & Discipline Spatiale :
 * - LUMA dans la compacité, la clarté et la fluidité entre Web et Mobile
 * - APPLE dans le calme des rangées (Setting ... Control / Description) sans soupe de cartes
 * - GEIST dans la rigueur typographique et les contrastes WCAG 2.2 AA
 * - ZÉRO DÉLAI : Changements de thème, accents, police et langues appliqués en 0ms avec persistance Neon
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Gear,
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
  CaretRight,
  Sparkle,
  ArrowsClockwise,
  SlidersHorizontal,
  Lightning,
  LockKey,
  Database,
  Eye,
  Check,
} from '@phosphor-icons/react';
import { useSafeUser as useUser } from '@/lib/auth-client';
import { useLanguageStore, BCP47Language } from '@/stores/language.store';
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
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const SETTINGS_TABS: TabItem[] = [
  { id: 'general', label: 'Général & Langues', icon: Globe },
  { id: 'profile', label: 'Profil & Identité', icon: User },
  { id: 'appearance', label: 'Apparence & Thème', icon: Sun },
  { id: 'agent', label: 'Intelligence & Autonomie', icon: Cpu },
  { id: 'memory', label: 'Mémoire Souveraine', icon: Brain },
  { id: 'subscription', label: 'Forfait & Crédits', icon: Crown, badge: 'PRO' },
  { id: 'security', label: 'Sécurité & Données', icon: ShieldCheck },
  { id: 'danger', label: 'Zone Critique', icon: WarningOctagon },
];

const ACCENT_CHOICES = [
  { key: 'gold', name: 'Or Souverain', color: '#D5AE57' },
  { key: 'blue', name: 'Bleu Smart', color: '#0070F8' },
  { key: 'cyan', name: 'Bleu Réseau', color: '#00D4AA' },
  { key: 'magenta', name: 'Magenta Signal', color: '#F00080' },
  { key: 'graphite', name: 'Graphite Calme', color: '#8A92A0' },
];

const WORLD_LANGUAGES: { code: string; name: string; nativeName: string; region: string; rtl?: boolean }[] = [
  { code: 'fr-GA', name: 'Français (Gabon)', nativeName: 'Français du Gabon', region: 'Afrique Centrale' },
  { code: 'fr-FR', name: 'Français (France)', nativeName: 'Français de France', region: 'Europe' },
  { code: 'en-US', name: 'English (United States)', nativeName: 'American English', region: 'North America' },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'British English', region: 'Europe' },
  { code: 'pt-BR', name: 'Português (Brasil)', nativeName: 'Português Brasileiro', region: 'South America' },
  { code: 'es-ES', name: 'Español (España)', nativeName: 'Español Castellano', region: 'Europe' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', nativeName: 'Deutsch', region: 'Europe' },
  { code: 'ar-SA', name: 'العربية (السعودية)', nativeName: 'العربية الفصحى', region: 'Middle East', rtl: true },
  { code: 'zh-CN', name: '中文 (简体)', nativeName: '普通话', region: 'Asia' },
  { code: 'ja-JP', name: '日本語', nativeName: '日本語', region: 'Asia' },
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
      <div className="border-b border-[var(--border-subtle)] pb-2">
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
    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-0.5 max-w-md">
        <div className="font-medium text-[13px] text-[var(--text-primary)]">{label}</div>
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
  const { locale, setLocale } = useLanguageStore();

  const {
    theme,
    accent,
    fontSize,
    density,
    reducedMotion,
    autonomyLevel,
    responseDepth,
    researchDepth,
    memoryEnabled,
    memoryPolicy,
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

  const displayName = user?.fullName || 'Daniel Jonathan ANDJ';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || 'founder@smartandj.ai';
  const initials = 'DJ';

  return (
    <div className="min-h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] antialiased select-none">
      {/* ── Header Supérieur Minimal ── */}
      <header className="h-13 border-b border-[var(--border)] bg-[var(--material-glass-regular)] backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (mobileDrilldown) {
                setMobileDrilldown(null);
              } else {
                router.push('/chat');
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
            title="Retour au workspace"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold text-xs tracking-tight text-[var(--text-primary)]">
            {mobileDrilldown
              ? SETTINGS_TABS.find((t) => t.id === mobileDrilldown)?.label
              : 'Paramètres & Préférences'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)]">
          {isSyncing ? (
            <span className="flex items-center gap-1.5 text-amber-400">
              <ArrowsClockwise size={12} className="animate-spin" />
              <span className="hidden sm:inline">Synchronisation...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={13} weight="fill" />
              <span className="hidden sm:inline">Persisté Neon</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Toast de confirmation ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--material-glass-floating)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] shadow-[var(--shadow-floating)] backdrop-blur-2xl z-50 flex items-center gap-2"
          >
            <CheckCircle size={14} weight="fill" className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Conteneur Principal (Max-width 960px Discipline Luma) ── */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Desktop & Tablet View (2 Colonnes) ── */}
        <div className="hidden md:grid md:grid-cols-[200px_1fr] gap-8 items-start">
          {/* Navigation Latérale Gauche */}
          <nav className="space-y-0.5 sticky top-20">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={15} weight={isSelected ? 'bold' : 'regular'} />
                    <span className="truncate">{tab.label}</span>
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

          {/* Panneau de Contenu Droit */}
          <Surface material="content" className="p-6 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
            {/* 1. GÉNÉRAL & LANGUES */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Général & Région</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Préférences linguistiques universelles et formats d&apos;affichage.</p>
                </div>

                <SettingSection title="Langue de l'Interface (BCP-47)">
                  <SettingRow
                    label="Langue du Produit"
                    description="Dictionnaire utilisé pour l'ensemble des boutons, navigations et menus."
                    control={
                      <select
                        value={locale}
                        onChange={(e) => {
                          setLocale(e.target.value as BCP47Language);
                          showToast(`Langue changée : ${e.target.value}`);
                        }}
                        className="h-8 px-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent)]"
                      >
                        {WORLD_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name} ({lang.nativeName})
                          </option>
                        ))}
                      </select>
                    }
                  />
                </SettingSection>

                <SettingSection title="Fuseau & Calendrier">
                  <SettingRow
                    label="Fuseau Horaire"
                    description="Calcul et horodatage des tâches planifiées et des récurrences."
                    control={
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
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
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Profil & Identité</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Géré via SSO sécurisé et la sécurité souveraine SmartANDJ.</p>
                </div>

                <SettingSection title="Informations Personnelles">
                  <SettingRow
                    label="Avatar & Initiales"
                    description="Utilisé dans les conversations et les sessions collaboratives."
                    control={
                      <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-extrabold flex items-center justify-center text-xs shadow-sm">
                        {initials}
                      </div>
                    }
                  />
                  <SettingRow
                    label="Nom Complet"
                    description="Votre identité publique au sein du système."
                    control={
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {displayName}
                      </span>
                    }
                  />
                  <SettingRow
                    label="Adresse E-mail"
                    description="Compte principal associé à votre clé de sécurité."
                    control={
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {displayEmail}
                      </span>
                    }
                  />
                </SettingSection>
              </div>
            )}

            {/* 3. APPARENCE & THÈME (0ms LIVE SWITCHING) */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Apparence & Thème</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Bascule immédiate 100% Light et 100% Dark avec garantie WCAG 2.2 AA.</p>
                </div>

                <SettingSection title="Mode d'Affichage">
                  <SettingRow
                    label="Thème Visuel"
                    description="Sélectionnez l'apparence globale de l'interface."
                    control={
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                        {[
                          { key: 'neo-blanc', label: 'Clair', icon: Sun },
                          { key: 'system', label: 'Système', icon: Desktop },
                          { key: 'black-panther', label: 'Sombre', icon: Moon },
                        ].map((t) => {
                          const Icon = t.icon;
                          const isSelected =
                            theme === t.key ||
                            (t.key === 'neo-blanc' && (theme === 'light' || theme === 'aurore-ogoue')) ||
                            (t.key === 'black-panther' && theme === 'dark');
                          return (
                            <button
                              key={t.key}
                              onClick={() => {
                                setTheme(t.key as any);
                                showToast(`Thème activé : ${t.label}`);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                isSelected
                                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              <Icon size={14} />
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    }
                  />
                </SettingSection>

                <SettingSection title="Nuances d'Accentuation">
                  <SettingRow
                    label="Couleur d'Accent"
                    description="Appliquée avec parcimonie aux anneaux de focus, sélections et états de prestige."
                    control={
                      <div className="flex items-center gap-2">
                        {ACCENT_CHOICES.map((a) => (
                          <button
                            key={a.key}
                            onClick={() => {
                              setAccent(a.key as any);
                              showToast(`Accent activé : ${a.name}`);
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              accent === a.key
                                ? 'ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--material-canvas)] scale-110'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: a.color }}
                            title={a.name}
                          >
                            {accent === a.key && <Check size={11} weight="bold" className="text-white drop-shadow" />}
                          </button>
                        ))}
                      </div>
                    }
                  />
                </SettingSection>

                <SettingSection title="Échelle Typographique Geist">
                  <SettingRow
                    label="Taille du Texte"
                    description="Ajuste proportionnellement l'ensemble des polices sans casser la mise en page."
                    control={
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                        {[
                          { key: 'small', label: 'Petit (88%)' },
                          { key: 'normal', label: 'Défaut (100%)' },
                          { key: 'large', label: 'Grand (114%)' },
                        ].map((s) => (
                          <button
                            key={s.key}
                            onClick={() => {
                              setFontSize(s.key as FontSize);
                              showToast(`Taille ajustée : ${s.label}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                              fontSize === s.key || (s.key === 'normal' && fontSize === 'default' as any)
                                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold'
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

                <SettingSection title="Densité Spatiale">
                  <SettingRow
                    label="Densité de l'Interface"
                    description="Contrôle les espacements verticaux des tableaux et des barres d'outils."
                    control={
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
                        {[
                          { key: 'compact', label: 'Compact' },
                          { key: 'comfortable', label: 'Confortable' },
                        ].map((d) => (
                          <button
                            key={d.key}
                            onClick={() => {
                              setDensity(d.key as Density);
                              showToast(`Densité : ${d.label}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                              density === d.key
                                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold'
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

            {/* 4. AGENT & AUTONOMIE */}
            {activeTab === 'agent' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Intelligence & Modèles</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Contrôle fin de l&apos;orchestration autonome Google Gemini 3.1 Pro.</p>
                </div>

                <SettingSection title="Niveau d'Autonomie">
                  <SettingRow
                    label="Gouvernance des Décisions"
                    description="Autorisation requise pour l'exécution d'outils sensibles et les modifications de fichiers."
                    control={
                      <select
                        value={autonomyLevel}
                        onChange={(e) => {
                          updatePreferences({ autonomyLevel: e.target.value as any });
                          showToast('Niveau d\'autonomie mis à jour');
                        }}
                        className="h-8 px-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="guided">Guidé (Demander confirmation)</option>
                        <option value="semi_autonomous">Semi-Autonome (Recommandé)</option>
                        <option value="fully_autonomous">Autonome Illimité (Pro)</option>
                      </select>
                    }
                  />
                </SettingSection>
              </div>
            )}

            {/* 5. MÉMOIRE SOUVERAINE DEERMEM */}
            {activeTab === 'memory' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Mémoire Souveraine DeerMem</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Rétention locale et synchronisation chiffrée de vos contextes de travail.</p>
                </div>

                <SettingSection title="Politique de Rétention">
                  <SettingRow
                    label="Activation de la Mémoire"
                    description="Permet à Ñkyel de se souvenir de vos projets et préférences récurrentes."
                    control={
                      <input
                        type="checkbox"
                        checked={memoryEnabled}
                        onChange={(e) => {
                          updatePreferences({ memoryEnabled: e.target.checked });
                          showToast(e.target.checked ? 'Mémoire activée' : 'Mémoire désactivée');
                        }}
                        className="w-4 h-4 rounded accent-[var(--accent)]"
                      />
                    }
                  />
                </SettingSection>
              </div>
            )}

            {/* 6. FORFAIT & CRÉDITS */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Forfait & Quotas d&apos;Inférence</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Accès prioritaire à Google Gemini 3.1 Pro et Gemini 2.5 Flash.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown size={24} weight="fill" className="text-[var(--accent)]" />
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">Ñkyel Pro Illimité</div>
                      <div className="text-xs text-[var(--text-secondary)]">Inférence souveraine et fenêtres 2M tokens actives.</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ACTIF
                  </span>
                </div>
              </div>
            )}
          </Surface>
        </div>

        {/* ── Mobile View (Drill-down Navigation) ── */}
        <div className="md:hidden">
          {!mobileDrilldown ? (
            /* Menu Racine Mobile */
            <div className="space-y-2">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMobileDrilldown(tab.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left active:bg-[var(--surface-raised)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-[var(--accent)]" />
                      <span className="text-sm font-medium text-[var(--text-primary)]">{tab.label}</span>
                    </div>
                    <CaretRight size={16} className="text-[var(--text-tertiary)]" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Écran de Détail Section Mobile */
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
              <button
                onClick={() => setMobileDrilldown(null)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold mb-2"
              >
                <ArrowLeft size={14} />
                <span>Toutes les catégories</span>
              </button>

              {/* Contenu Section Mobile (Miroir de la section active) */}
              {mobileDrilldown === 'appearance' && (
                <div className="space-y-4 text-xs">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">Thème Visuel</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'neo-blanc', label: 'Clair' },
                      { key: 'system', label: 'Système' },
                      { key: 'black-panther', label: 'Sombre' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTheme(t.key as any)}
                        className={`py-2 rounded-xl border text-center font-semibold ${
                          theme === t.key || (t.key === 'neo-blanc' && theme === 'light')
                            ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent'
                            : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-primary)]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="font-semibold text-sm text-[var(--text-primary)] pt-3">Couleur d&apos;Accent</div>
                  <div className="flex items-center gap-3">
                    {ACCENT_CHOICES.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => setAccent(a.key as any)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          accent === a.key ? 'ring-2 ring-[var(--text-primary)] ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: a.color }}
                      >
                        {accent === a.key && <Check size={13} weight="bold" className="text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mobileDrilldown === 'general' && (
                <div className="space-y-4 text-xs">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">Langue du Produit</div>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as BCP47Language)}
                    className="w-full h-10 px-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                  >
                    {WORLD_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {mobileDrilldown === 'profile' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[var(--text-tertiary)] block">Nom :</span>
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-tertiary)] block">E-mail :</span>
                    <span className="font-mono text-xs text-[var(--text-secondary)]">{displayEmail}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span>Chargement des paramètres...</span>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
