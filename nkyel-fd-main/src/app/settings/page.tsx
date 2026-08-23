/**
 * Ñkyel AI — Page Paramètres & Profil (Luma AI × Apple × Geist Level)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Philosophie de Design :
 * - LUMA dans la simplicité, la hiérarchie et la lisibilité du compte
 * - APPLE dans le calme, les rangées épurées (Setting ... Value > / Setting ... Toggle) et l'absence de cartes B2B surchargées
 * - GEIST dans la rigueur typographique (Geist Sans / Geist Mono)
 * - ÑKYEL dans l'intelligence contextuelle et la mémoire souveraine DeerMem
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  UploadSimple,
  Trash,
  ArrowsClockwise,
  SlidersHorizontal,
  HandPointing,
  Lightning,
  LockKey,
  Key,
  Database,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { useUser } from '@clerk/nextjs';
import { useLanguageStore, BCP47Language } from '@/stores/language.store';
import { useSettingsStore } from '@/stores/settings.store';

type SettingsTab =
  | 'profile'
  | 'general'
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
  { id: 'profile', label: 'Profil & Identité', icon: User },
  { id: 'general', label: 'Général & Langues (BCP-47)', icon: Globe },
  { id: 'appearance', label: 'Apparence', icon: Sun },
  { id: 'agent', label: 'Politique d\'Agent & Autonomie', icon: Cpu },
  { id: 'memory', label: 'Mémoire Souveraine DeerMem', icon: Brain },
  { id: 'subscription', label: 'Forfait & Crédits', icon: Crown, badge: 'Illimités' },
  { id: 'security', label: 'Sécurité & Résidence Données', icon: ShieldCheck },
  { id: 'danger', label: 'Zone Critique', icon: WarningOctagon },
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

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'profile';

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { user } = useUser();
  const { locale, setLocale } = useLanguageStore();
  const { preferences, updatePreference, setTheme } = useSettingsStore();

  // ── Profile Fields ────────────────────────────────────────
  const [fullName, setFullName] = useState('Daniel Jonathan ANDJ');
  const [username, setUsername] = useState('daniel_andj');
  const [bio, setBio] = useState('Fondateur & Architecte en Chef · SmartANDJ AI Technologies');
  const [agentLanguage, setAgentLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Libreville');
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');

  // ── Appearance Fields ─────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState<'black-panther' | 'nuit-lope' | 'aurore-ogoue' | 'system'>('black-panther');

  // ── Agent & Autonomy Fields ───────────────────────────────
  const [autonomyLevel, setAutonomyLevel] = useState<'guided' | 'semi_autonomous' | 'fully_autonomous'>('semi_autonomous');
  const [defaultModelPolicy, setDefaultModelPolicy] = useState('gemini-3.1-pro');
  const [requireConfirmationForCode, setRequireConfirmationForCode] = useState(true);

  // ── Memory Fields ─────────────────────────────────────────
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [confirmBeforeRemembering, setConfirmBeforeRemembering] = useState(false);

  const isSuperAdmin = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
    return (
      email.includes('jonathanakarentoutoume') ||
      email.includes('smartandjia') ||
      email.includes('nkyel.ai')
    );
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync initial user data
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.username) setUsername(user.username);
    }
  }, [user]);

  // ── Handlers ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updatePreference('full_name', fullName);
      await updatePreference('username', username);
      await updatePreference('bio', bio);
      showToast('Profil enregistré avec succès dans Neon PostgreSQL.');
    } catch {
      showToast('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (code: string, label: string) => {
    setLocale(code);
    await updatePreference('ui_locale', code);
    showToast(`Langue appliquée : ${label}`);
  };

  const handleThemeChange = async (themeKey: 'black-panther' | 'nuit-lope' | 'aurore-ogoue' | 'system') => {
    setCurrentTheme(themeKey);
    setTheme(themeKey === 'system' ? 'black-panther' : themeKey);
    await updatePreference('theme', themeKey);
    showToast(`Thème appliqué : ${themeKey}`);
  };

  const handleAutonomyChange = async (level: 'guided' | 'semi_autonomous' | 'fully_autonomous') => {
    setAutonomyLevel(level);
    await updatePreference('autonomy_level', level);
    showToast('Niveau d\'autonomie mis à jour.');
  };

  const handleToggleMemory = async () => {
    const newVal = !memoryEnabled;
    setMemoryEnabled(newVal);
    await updatePreference('memory_enabled', newVal);
    showToast(`Mémoire automatique : ${newVal ? 'Activée' : 'Désactivée'}`);
  };

  return (
    <div className="min-h-screen bg-[#07080D] text-[#ECECEC] font-sans antialiased selection:bg-[#D5AE57]/30 selection:text-white flex flex-col">
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[100] px-4 py-2.5 rounded-2xl bg-[#0E1017] border border-[#D5AE57]/40 text-xs text-white shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={16} weight="fill" className="text-[#D5AE57]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <header className="h-14 border-b border-white/[0.06] bg-[#07080D]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white transition-colors"
            title="Retour à la conversation"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Paramètres & Profil</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50">
              Luma × Apple Design
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#D5AE57] text-black font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <ArrowsClockwise size={14} className="animate-spin" /> : <Sparkle size={14} weight="fill" />}
          <span>Enregistrer</span>
        </button>
      </header>

      {/* ── Settings Layout: Sidebar + Calm Rows ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-[11px] font-mono uppercase text-white/40 px-3 pb-2 font-bold">
            Sections
          </div>
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all text-left ${
                  isSel
                    ? 'bg-[#D5AE57]/15 text-[#D5AE57] border border-[#D5AE57]/30 shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} weight={isSel ? 'bold' : 'regular'} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Area: Apple-Grade Calm Rows */}
        <main className="flex-1 space-y-8 pb-16 max-w-2xl">
          {/* ── 1. PROFILE & IDENTITY ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Profil & Identité</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Informations de compte synchronisées avec Clerk et Neon PostgreSQL.
                </p>
              </div>

              {/* Avatar Box (Luma style) */}
              <div className="p-4 rounded-3xl bg-[#0D0F17] border border-white/[0.06] flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                  {(fullName.slice(0, 2) || 'DJ').toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">{fullName}</div>
                  <div className="text-xs text-white/40 font-mono">
                    {user?.primaryEmailAddress?.emailAddress || 'daniel@nkyel.ai'}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => showToast('Téléversement d\'avatar prêt.')}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/10 text-[11px] text-white/80 transition-colors flex items-center gap-1.5"
                    >
                      <UploadSimple size={13} />
                      <span>Changer Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Calm Row Form Fields */}
              <div className="p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.06] divide-y divide-white/[0.06] space-y-4">
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">Nom Complet</div>
                    <div className="text-[11px] text-white/40">Nom affiché sur la plateforme</div>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="p-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D5AE57] w-full sm:w-64"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">Nom d&apos;utilisateur</div>
                    <div className="text-[11px] text-white/40">Identifiant unique @username</div>
                  </div>
                  <div className="flex items-center gap-1 w-full sm:w-64">
                    <span className="text-white/40 text-xs">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="p-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D5AE57] flex-1"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">Rôle & Bio</div>
                    <div className="text-[11px] text-white/40">Contextualise les réponses de l&apos;agent</div>
                  </div>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="p-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D5AE57] w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 2. GENERAL & BCP-47 LANGUAGES ── */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Général & Langues Mondiales (BCP-47)</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Séparation stricte entre la langue de l&apos;interface et la langue de génération de l&apos;agent.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.06] space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono text-[#D5AE57]">
                  Langue d&apos;Interface Utilisateur (UI)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORLD_LANGUAGES.map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code, lang.name)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-white shadow-sm'
                            : 'bg-black/30 border-white/[0.05] text-white/60 hover:text-white hover:border-white/10'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{lang.name}</div>
                          <div className="text-[10px] text-white/40 font-mono">{lang.nativeName} ({lang.code})</div>
                        </div>
                        {isSelected && <CheckCircle size={16} weight="fill" className="text-[#D5AE57]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone & Time Format */}
              <div className="p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.06] divide-y divide-white/[0.06] space-y-4">
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Fuseau Horaire</div>
                    <div className="text-[11px] text-white/40">Utilisé pour les missions planifiées</div>
                  </div>
                  <span className="text-xs font-mono text-white/80">{timezone}</span>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Format de l&apos;heure</div>
                    <div className="text-[11px] text-white/40">24 heures ou 12 heures AM/PM</div>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                    <button
                      onClick={() => setTimeFormat('24h')}
                      className={`px-3 py-1 rounded-lg font-mono ${
                        timeFormat === '24h' ? 'bg-[#D5AE57] text-black font-bold' : 'text-white/60'
                      }`}
                    >
                      24h
                    </button>
                    <button
                      onClick={() => setTimeFormat('12h')}
                      className={`px-3 py-1 rounded-lg font-mono ${
                        timeFormat === '12h' ? 'bg-[#D5AE57] text-black font-bold' : 'text-white/60'
                      }`}
                    >
                      12h
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Apparence & Thèmes</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Thèmes optimisés pour écrans OLED et contrastes Apple précis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('black-panther')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    currentTheme === 'black-panther'
                      ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-white shadow-lg'
                      : 'bg-[#0A0B10] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Moon size={20} className="text-[#D5AE57]" />
                  <div className="font-bold text-xs text-white">Black Panther</div>
                  <p className="text-[10px] text-white/40">Noir profond avec touches d&apos;or souverain.</p>
                </button>

                <button
                  onClick={() => handleThemeChange('nuit-lope')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    currentTheme === 'nuit-lope'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-lg'
                      : 'bg-[#0A0B10] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Moon size={20} className="text-emerald-400" />
                  <div className="font-bold text-xs text-white">Nuit Lopé</div>
                  <p className="text-[10px] text-white/40">Onyx avec accents émeraude gabonaise.</p>
                </button>

                <button
                  onClick={() => handleThemeChange('aurore-ogoue')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    currentTheme === 'aurore-ogoue'
                      ? 'bg-white/20 border-white/40 text-white shadow-lg'
                      : 'bg-[#0A0B10] border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Sun size={20} className="text-amber-200" />
                  <div className="font-bold text-xs text-white">Aurore Ogooué</div>
                  <p className="text-[10px] text-white/40">Mode clair inspiré de la pureté Apple.</p>
                </button>
              </div>
            </div>
          )}

          {/* ── 4. AGENT & AUTONOMY ── */}
          {activeTab === 'agent' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Politique d&apos;Agent & Autonomie</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Contrôlez le degré d&apos;initiative et les seuils d&apos;approbation humaine de Ñkyel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleAutonomyChange('guided')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    autonomyLevel === 'guided'
                      ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-white'
                      : 'bg-[#0D0F17] border-white/[0.06] text-white/60 hover:text-white'
                  }`}
                >
                  <HandPointing size={20} className="text-[#D5AE57]" />
                  <div className="font-bold text-xs text-white">Guidée</div>
                  <p className="text-[10px] text-white/40">Demande confirmation pour chaque étape et outil.</p>
                </button>

                <button
                  onClick={() => handleAutonomyChange('semi_autonomous')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    autonomyLevel === 'semi_autonomous'
                      ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-white'
                      : 'bg-[#0D0F17] border-white/[0.06] text-white/60 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal size={20} className="text-[#D5AE57]" />
                  <div className="font-bold text-xs text-white">Semi-Autonome</div>
                  <p className="text-[10px] text-white/40">Exécute les recherches, demande pour les actions critiques.</p>
                </button>

                <button
                  onClick={() => handleAutonomyChange('fully_autonomous')}
                  className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
                    autonomyLevel === 'fully_autonomous'
                      ? 'bg-[#D5AE57]/15 border-[#D5AE57]/40 text-white'
                      : 'bg-[#0D0F17] border-white/[0.06] text-white/60 hover:text-white'
                  }`}
                >
                  <Lightning size={20} className="text-amber-300" />
                  <div className="font-bold text-xs text-white">Autonome</div>
                  <p className="text-[10px] text-white/40">Enchaîne jusqu&apos;à 40 étapes sans interruption.</p>
                </button>
              </div>
            </div>
          )}

          {/* ── 5. MEMORY SOUVERAINE DEERMEM ── */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Mémoire Souveraine DeerMem</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Apprentissage cross-session et mémorisation contextuelle sans fuite de données.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.06] divide-y divide-white/[0.06] space-y-4">
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Extraction Automatique des Faits</div>
                    <div className="text-[11px] text-white/40">Permet à Ñkyel de retenir vos préférences au fil des échanges</div>
                  </div>
                  <button
                    onClick={handleToggleMemory}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      memoryEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    {memoryEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Demander Confirmation Avant Mémorisation</div>
                    <div className="text-[11px] text-white/40">Affiche une invite avant d&apos;enregistrer un nouveau souvenir</div>
                  </div>
                  <button
                    onClick={() => setConfirmBeforeRemembering(!confirmBeforeRemembering)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      confirmBeforeRemembering
                        ? 'bg-[#D5AE57]/20 text-[#D5AE57] border border-[#D5AE57]/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    {confirmBeforeRemembering ? 'OUI' : 'NON'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 6. SUBSCRIPTION & CREDITS ── */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Forfait & Crédits d&apos;Inférence</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Gestion de votre plan et suivi de vos quotas de jetons d&apos;IA.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#12141F] to-[#0A0C14] border border-[#D5AE57]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={20} className="text-[#D5AE57]" />
                    <span className="font-bold text-sm text-white">
                      {isSuperAdmin ? 'Plan Fondateur Super Admin' : 'Plan Professionnel'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D5AE57]/20 text-[#D5AE57] font-bold">
                    ACTIF
                  </span>
                </div>

                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Crédits d&apos;Inférence Restants :</span>
                    <span className="font-mono font-bold text-white">
                      {isSuperAdmin ? '999,999,999 (Illimités)' : '25,000 / 25,000'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#D5AE57]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 7. SECURITY & DATA RESIDENCY ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Sécurité & Résidence Souveraine</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Chiffrement de bout en bout et isolation étanche des données par tenant.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.06] space-y-3 text-xs text-white/70">
                <div className="flex items-center justify-between">
                  <span>Authentification</span>
                  <span className="font-mono text-emerald-400 font-bold">Clerk JWKS RS256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Isolation des données</span>
                  <span className="font-mono text-white">PostgreSQL Row-Level Security</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chiffrement des clés API</span>
                  <span className="font-mono text-[#D5AE57]">AES-256-GCM SecretManager</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 8. DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-red-400">Zone Critique</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  Actions destructives ou de réinitialisation de vos données.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Effacer le Cache Local & Mémoire</div>
                    <div className="text-[11px] text-white/40">Supprime les données temporaires locales</div>
                  </div>
                  <button
                    onClick={() => showToast('Cache local nettoyé.')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                  >
                    Nettoyer
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
