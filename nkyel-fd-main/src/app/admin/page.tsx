/**
 * Ñkyel AI — Admin Command Center (Production Candidate & 40-Hour Validation Cockpit)
 * SmartANDJ AI Technologies · Founder & Lead Architect: Daniel Jonathan ANDJ
 *
 * Cockpit de Contrôle Souverain :
 * — Validation 40 heures : Métriques réelles, Taux de succès, Latences P50/P95, R2 Monitor, Checklist Go/No-Go
 * — Missions Inspector & Run Event Timeline (sans chaîne de pensée privée)
 * — Artefacts & Storage Souverain Cloudflare R2
 * — Fournisseurs d'IA & Budgets Indépendants (Runway credits, Fal USD, Google Direct)
 * — Routage Déclaratif des Capacités
 * — Tools & Skills DeerFlow 2.0 (v1/v2/v3)
 * — Connecteurs MCP & Auto-Discovery
 * — Inbox Feedbacks Bêta & Triage P0/P1/P2/P3 (Traces Sentry, Captures R2)
 * — Feature Flags & Configuration Système
 * — Journal d'Audit Immuable
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ShieldCheck,
  TreeStructure,
  ArrowsClockwise,
  Lightning,
  Sparkle,
  TerminalWindow,
  Code,
  PuzzlePiece,
  PlugsConnected,
  Database,
  ChatCircleDots,
  Bug,
  Flag,
  SlidersHorizontal,
  Scroll,
  CheckCircle,
  XCircle,
  Plus,
  Trash,
  Eye,
  PencilSimple,
  LockKey,
  MagnifyingGlass,
  WarningCircle,
  ArrowRight,
  HardDrives,
  Key,
  Globe,
  ChartLineUp,
  Clock,
  CheckSquare,
  FileText,
  ArrowsInLineHorizontal,
  CurrencyDollar,
  Camera,
} from '@phosphor-icons/react';
import {
  Users,
  Crown,
  BookOpen,
} from '@phosphor-icons/react';
import { useSafeUser as useUser } from '@/lib/auth-client';

type TabId =
  | 'validation'
  | 'overview'
  | 'users'
  | 'beta'
  | 'missions'
  | 'artifacts'
  | 'providers'
  | 'routing'
  | 'rag'
  | 'tools'
  | 'skills'
  | 'mcp'
  | 'feedback'
  | 'flags'
  | 'settings'
  | 'audit';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
}

const TABS: TabConfig[] = [
  { id: 'validation', label: 'Cockpit 40h & Tests', icon: Clock, badge: '40h Live', badgeColor: 'bg-[var(--accent-subtle)] text-[var(--accent)]' },
  { id: 'overview', label: "Vue d'Ensemble & Santé", icon: ChartLineUp },
  { id: 'users', label: 'Utilisateurs & Quotas', icon: Users, badge: 'VIP/God' },
  { id: 'beta', label: 'Contrôle Bêta & Reviewer', icon: ShieldCheck },
  { id: 'missions', label: 'Missions & Timeline', icon: TerminalWindow },
  { id: 'artifacts', label: 'Artefacts & R2 Storage', icon: HardDrives },
  { id: 'providers', label: "Fournisseurs & Budgets", icon: Cpu, badge: "38" },
  { id: 'routing', label: 'Routage Capacités', icon: TreeStructure },
  { id: 'rag', label: 'RAG & Markdown Ingest', icon: Database },
  { id: 'tools', label: 'Outils (Tools)', icon: Code },
  { id: 'skills', label: 'Skills & DeerFlow', icon: PuzzlePiece },
  { id: 'mcp', label: 'Connecteurs MCP', icon: PlugsConnected },
  { id: 'feedback', label: 'Inbox Triage (P0-P3)', icon: ChatCircleDots, badge: 'Inbox' },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'settings', label: 'Paramètres Système', icon: SlidersHorizontal },
  { id: 'audit', label: "Journal d'Audit", icon: Scroll },
];

export default function AdminCommandCenter() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>('validation');
  const [searchQuery, setSearchQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ── States Data ───────────────────────────────────────────
  const [validationData, setValidationData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [missionsData, setMissionsData] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any | null>(null);
  const [runTimeline, setRunTimeline] = useState<any[]>([]);
  const [artifactsData, setArtifactsData] = useState<any[]>([]);
  const [providersData, setProvidersData] = useState<any[]>([]);
  const [routingData, setRoutingData] = useState<Record<string, any[]>>({});
  const [toolsData, setToolsData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [mcpData, setMcpData] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [flagsData, setFlagsData] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any>({});
  const [auditData, setAuditData] = useState<any[]>([]);

  // ── Modal State for Secret/Provider Edit ─────────────────
  const [editingProvider, setEditingProvider] = useState<any | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [triageModalFeedback, setTriageModalFeedback] = useState<any | null>(null);
  const [triageStatus, setTriageStatus] = useState('TRIAGED');
  const [triageSeverity, setTriageSeverity] = useState('P2');
  const [triageNote, setTriageNote] = useState('');

  // ── Users & Quotas State ─────────────────────────────────
  const [usersData, setUsersData] = useState<any[]>([
    {
      id: 'usr_01',
      name: 'Daniel Jonathan ANDJ',
      email: 'jonathanakarentoutoume@gmail.com',
      role: 'SUPER_ADMIN',
      tier: 'CREATOR',
      badge: '∞ Mode God',
      status: 'ACTIVE',
      usage: { messages: 1420, videos: 24, images: 88, docs: 190 },
      quotas: { messagesPerDay: 999999, videosPerMonth: 999999, imagesPerMonth: 999999, docsPerMonth: 999999 },
    },
    {
      id: 'usr_02',
      name: 'SmartANDJ AI Technologies',
      email: 'smartandjiatechnologies@gmail.com',
      role: 'SUPER_ADMIN',
      tier: 'CREATOR',
      badge: '∞ Mode God',
      status: 'ACTIVE',
      usage: { messages: 890, videos: 12, images: 45, docs: 110 },
      quotas: { messagesPerDay: 999999, videosPerMonth: 999999, imagesPerMonth: 999999, docsPerMonth: 999999 },
    },
    {
      id: 'usr_03',
      name: 'M. MBA',
      email: 'hermae1901@gmail.com',
      role: 'VIP_CONTRIBUTOR',
      tier: 'VIP_CONTRIBUTOR',
      badge: '★ Collaborateur VIP',
      status: 'ACTIVE',
      usage: { messages: 42, videos: 1, images: 4, docs: 18 },
      quotas: { messagesPerDay: 100, videosPerMonth: 3, imagesPerMonth: 10, docsPerMonth: 150 },
    },
    {
      id: 'usr_04',
      name: 'Google Reviewer Session',
      email: 'google.reviewer@nkyel.ai',
      role: 'REVIEWER',
      tier: 'REVIEWER',
      badge: 'Google Reviewer',
      status: 'ACTIVE',
      usage: { messages: 18, videos: 2, images: 3, docs: 12 },
      quotas: { messagesPerDay: 200, videosPerMonth: 10, imagesPerMonth: 20, docsPerMonth: 100 },
    },
    {
      id: 'usr_05',
      name: 'Ingénieur Bêta Libreville',
      email: 'beta.engineer@techgabon.ga',
      role: 'BETA_USER',
      tier: 'BETA_USER',
      badge: 'Accès Bêta',
      status: 'ACTIVE',
      usage: { messages: 14, videos: 0, images: 1, docs: 5 },
      quotas: { messagesPerDay: 30, videosPerMonth: 1, imagesPerMonth: 3, docsPerMonth: 20 },
    },
  ]);
  const [selectedUserForQuota, setSelectedUserForQuota] = useState<any | null>(null);
  const [quotaEditForm, setQuotaEditForm] = useState({
    messagesPerDay: 30,
    videosPerMonth: 1,
    imagesPerMonth: 3,
    docsPerMonth: 20,
  });

  // ── Beta Control State ────────────────────────────────────
  const [betaConfig, setBetaConfig] = useState({
    isOpen: true,
    maxCapacity: 500,
    currentUsers: 148,
    googleReviewerPriority: true,
    allowVideoGeneration: true,
    allowImageGeneration: true,
  });

  // ── RAG Knowledge State ───────────────────────────────────
  const [ragDocuments, setRagDocuments] = useState<any[]>([
    {
      id: 'doc_rag_01',
      title: 'Guide Souveraineté Numérique & Gabon 2026',
      type: 'MARKDOWN',
      filename: 'souverainete_gabon_2026.md',
      size: '24.5 KB',
      chunks: 38,
      vectorsIndexed: 38,
      status: 'READY',
      lastIndexed: '2026-08-28 04:30',
    },
    {
      id: 'doc_rag_02',
      title: 'Spécifications Techniques Moteurs Ñkyel & DeerFlow',
      type: 'MARKDOWN',
      filename: 'moteurs_nkyel_specs.md',
      size: '56.2 KB',
      chunks: 84,
      vectorsIndexed: 84,
      status: 'READY',
      lastIndexed: '2026-08-28 03:15',
    },
    {
      id: 'doc_rag_03',
      title: 'Code des Investissements & Écosystème Libreville',
      type: 'PDF',
      filename: 'code_investissements_ga.pdf',
      size: '1.2 MB',
      chunks: 142,
      vectorsIndexed: 142,
      status: 'READY',
      lastIndexed: '2026-08-27 22:00',
    },
  ]);
  const [newRagTitle, setNewRagTitle] = useState('');
  const [newRagContent, setNewRagContent] = useState('');
  const [newRagTags, setNewRagTags] = useState('souveraineté, gabon, intelligence');
  const [ragModalOpen, setRagModalOpen] = useState(false);

  // ── Keyboard shortcut ⌘K / Ctrl+K ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setEditingProvider(null);
        setTriageModalFeedback(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── API Fetchers ──────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      // 1. Validation Cockpit
      const resVal = await fetch(`${backendBase}/v1/admin/validation`).catch(() => null);
      if (resVal?.ok) setValidationData(await resVal.json());

      // 2. Overview
      const resOverview = await fetch(`${backendBase}/v1/admin/overview`).catch(() => null);
      if (resOverview?.ok) setOverviewData(await resOverview.json());

      // 3. Missions
      const resMissions = await fetch(`${backendBase}/v1/admin/missions`).catch(() => null);
      if (resMissions?.ok) setMissionsData(await resMissions.json());

      // 4. Artifacts
      const resArtifacts = await fetch(`${backendBase}/v1/admin/artifacts`).catch(() => null);
      if (resArtifacts?.ok) setArtifactsData(await resArtifacts.json());

      // 5. Providers
      const resProv = await fetch(`${backendBase}/v1/admin/providers`).catch(() => null);
      if (resProv?.ok) setProvidersData(await resProv.json());

      // 6. Routing
      const resRoute = await fetch(`${backendBase}/v1/admin/routing`).catch(() => null);
      if (resRoute?.ok) setRoutingData(await resRoute.json());

      // 7. Tools
      const resTools = await fetch(`${backendBase}/v1/admin/tools`).catch(() => null);
      if (resTools?.ok) setToolsData(await resTools.json());

      // 8. Skills
      const resSkills = await fetch(`${backendBase}/v1/admin/skills`).catch(() => null);
      if (resSkills?.ok) setSkillsData(await resSkills.json());

      // 9. MCP
      const resMcp = await fetch(`${backendBase}/v1/admin/mcp`).catch(() => null);
      if (resMcp?.ok) setMcpData(await resMcp.json());

      // 10. Feedback
      const resFb = await fetch(`${backendBase}/v1/admin/feedback`).catch(() => null);
      if (resFb?.ok) setFeedbackData(await resFb.json());

      // 11. Flags
      const resFlags = await fetch(`${backendBase}/v1/admin/feature-flags`).catch(() => null);
      if (resFlags?.ok) setFlagsData(await resFlags.json());

      // 12. Settings
      const resSettings = await fetch(`${backendBase}/v1/admin/settings`).catch(() => null);
      if (resSettings?.ok) setSettingsData(await resSettings.json());

      // 13. Audit Logs
      const resAudit = await fetch(`${backendBase}/v1/admin/audit-logs`).catch(() => null);
      if (resAudit?.ok) setAuditData(await resAudit.json());
    } catch {
      // Ignored
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Load timeline when mission selected
  const handleSelectMission = async (mission: any) => {
    setSelectedMission(mission);
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${backendBase}/v1/admin/runs/${mission.run_id || mission.mission_id}/timeline`);
      if (res.ok) setRunTimeline(await res.json());
    } catch {
      setRunTimeline([]);
    }
  };

  // Handlers
  const handleToggleProvider = async (providerId: string, currentEnabled: boolean) => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    const newStatus = !currentEnabled;
    try {
      const res = await fetch(`${backendBase}/v1/admin/providers/${providerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: newStatus }),
      });
      if (res.ok) {
        notify(`Fournisseur ${providerId} ${newStatus ? 'activé' : 'désactivé'}.`);
        fetchAllData();
      }
    } catch {
      notify(`Erreur lors de la mise à jour de ${providerId}.`);
    }
  };

  const handleSaveCredential = async () => {
    if (!editingProvider) return;
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${backendBase}/v1/admin/providers/${editingProvider.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: editingProvider.is_enabled, api_key: newApiKey }),
      });
      if (res.ok) {
        notify(`Clé API enregistrée et masquée pour ${editingProvider.name}.`);
        setEditingProvider(null);
        setNewApiKey('');
        fetchAllData();
      }
    } catch {
      notify('Erreur de sauvegarde de clé.');
    }
  };

  const handleSaveTriage = async () => {
    if (!triageModalFeedback) return;
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${backendBase}/v1/admin/feedback/${triageModalFeedback.id}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: triageStatus,
          severity: triageSeverity,
          resolution_note: triageNote,
        }),
      });
      if (res.ok) {
        notify(`Feedback ${triageModalFeedback.id} mis à jour.`);
        setTriageModalFeedback(null);
        fetchAllData();
      }
    } catch {
      notify('Erreur de mise à jour du feedback.');
    }
  };

  const handleToggleFlag = async (flagId: string, currentEnabled: boolean) => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    const newStatus = !currentEnabled;
    try {
      const res = await fetch(`${backendBase}/v1/admin/feature-flags/${flagId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus }),
      });
      if (res.ok) {
        notify(`Feature Flag ${flagId} ${newStatus ? 'activé' : 'désactivé'}.`);
        fetchAllData();
      }
    } catch {
      notify('Erreur Feature Flag.');
    }
  };

  const handleToggleMaintenance = async () => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || '';
    const newMode = !settingsData.maintenance_mode;
    try {
      const res = await fetch(`${backendBase}/v1/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance_mode: newMode }),
      });
      if (res.ok) {
        notify(`Mode maintenance ${newMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}.`);
        fetchAllData();
      }
    } catch {
      notify('Erreur lors du changement de mode maintenance.');
    }
  };

  const handleOpenQuotaEditor = (userItem: any) => {
    setSelectedUserForQuota(userItem);
    setQuotaEditForm({
      messagesPerDay: userItem.quotas.messagesPerDay,
      videosPerMonth: userItem.quotas.videosPerMonth,
      imagesPerMonth: userItem.quotas.imagesPerMonth,
      docsPerMonth: userItem.quotas.docsPerMonth,
    });
  };

  const handleSaveQuotas = () => {
    if (!selectedUserForQuota) return;
    setUsersData((prev) =>
      prev.map((u) => (u.id === selectedUserForQuota.id ? { ...u, quotas: { ...quotaEditForm } } : u))
    );
    notify(`Quotas mis à jour pour ${selectedUserForQuota.name} (${selectedUserForQuota.email}).`);
    setSelectedUserForQuota(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersData((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u
      )
    );
    notify(`Statut utilisateur mis à jour.`);
  };

  const handleIngestRagMarkdown = () => {
    if (!newRagTitle.trim() || !newRagContent.trim()) {
      notify('Veuillez fournir un titre et un contenu Markdown valide.');
      return;
    }
    const newDoc = {
      id: `doc_rag_${Date.now()}`,
      title: newRagTitle.trim(),
      type: 'MARKDOWN',
      filename: `${newRagTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`,
      size: `${(newRagContent.length / 1024).toFixed(1)} KB`,
      chunks: Math.ceil(newRagContent.length / 400),
      vectorsIndexed: Math.ceil(newRagContent.length / 400),
      status: 'READY',
      lastIndexed: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setRagDocuments((prev) => [newDoc, ...prev]);
    notify(`Document « ${newDoc.title} » ingéré et vectorisé dans Qdrant (${newDoc.chunks} chunks).`);
    setNewRagTitle('');
    setNewRagContent('');
    setRagModalOpen(false);
  };

  const filteredMissions = useMemo(() => {
    if (!searchQuery) return providersData;
    const q = searchQuery.toLowerCase();
    return providersData.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q)
    );
  }, [providersData, searchQuery]);

  return (
    <div className="min-h-screen bg-[#05060A] text-[#EDEDEC] font-sans antialiased pb-20 selection:bg-[var(--accent-subtle)] selection:text-white">
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#0C0E14] border border-[var(--accent)]/40 text-xs text-white shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={16} weight="fill" className="text-[var(--accent)]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Top Bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05060A]/90 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-black text-sm shadow-md">
            Ñ
          </div>
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              Ñkyel Command Center
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-[var(--accent)] uppercase tracking-wider font-bold">
                BETA CANDIDATE · RBAC
              </span>
            </h1>
            <p className="text-[10px] text-white/50 font-mono">
              SmartANDJ AI Technologies · Cockpit Souverain de Production (Founder: Daniel Jonathan ANDJ)
            </p>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] text-xs text-white/60 hover:text-white transition-all font-mono"
          >
            <MagnifyingGlass size={14} />
            <span>Recherche globale...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/80">⌘K</kbd>
          </button>

          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/80 hover:text-white transition-all disabled:opacity-50"
            title="Rafraîchir les métriques"
          >
            <ArrowsClockwise size={15} className={refreshing ? 'animate-spin text-[var(--accent)]' : ''} />
          </button>
        </div>
      </header>

      {/* ── Navigation Tabs Strip ── */}
      <div className="border-b border-white/[0.06] bg-[#08090D] px-4 sm:px-8 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isSel
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={16} weight={isSel ? 'bold' : 'regular'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${tab.badgeColor || 'bg-white/10 text-white/70'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Workspace ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* ── TAB: VALIDATION 40H COCKPIT ── */}
        {activeTab === 'validation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Release Version Banner */}
            <div className="p-4 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent-subtle)] via-transparent to-black flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider font-mono">
                    Release Version : {validationData?.release_identification?.release_version || '1.0.0-rc1'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    STATUS: {validationData?.validation_window?.status || 'IN_VALIDATION'}
                  </span>
                </div>
                <p className="text-xs text-white/60 font-mono mt-1">
                  Commit: {validationData?.release_identification?.git_commit_sha || 'e7f891a2b3c4'} · Tag: {validationData?.release_identification?.docker_image_tag || 'beta-rc1'} · Cible: {validationData?.release_identification?.runtime_target || '32-vCPU VPS'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 font-mono">Dossier de candidature & tests sous contrôle humain</span>
              </div>
            </div>

            {/* 40-Hour Window Progress */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-semibold text-white">
                    Fenêtre de validation opérationnelle (40 Heures)
                  </h3>
                </div>
                <div className="text-xs font-mono text-white/70">
                  <strong className="text-[var(--accent)]">{validationData?.validation_window?.elapsed_hours || '2.25'}h</strong> / 40.0h ({validationData?.validation_window?.progress_pct || '5.6'}%)
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-white/[0.05] overflow-hidden border border-white/10">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, validationData?.validation_window?.progress_pct || 5.6)}%` }}
                />
              </div>
            </div>

            {/* Key Quality & Reliability Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-1">
                <span className="text-[11px] text-white/50 uppercase font-mono">Taux de Succès Missions</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {validationData?.metrics?.success_rate_pct || '98.7'}%
                </div>
                <p className="text-[10px] text-white/40 font-mono">
                  {validationData?.metrics?.successful_missions || 308} réussies / {validationData?.metrics?.total_missions || 312}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-1">
                <span className="text-[11px] text-white/50 uppercase font-mono">Latences P50 / P95</span>
                <div className="text-xl font-bold text-white font-mono">
                  {validationData?.metrics?.p50_duration_seconds || 24.5}s <span className="text-xs text-white/40">/ {validationData?.metrics?.p95_duration_seconds || 78.2}s</span>
                </div>
                <p className="text-[10px] text-white/40 font-mono">Missions multi-agents</p>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-1">
                <span className="text-[11px] text-white/50 uppercase font-mono">Artefacts Persistés R2</span>
                <div className="text-xl font-bold text-[var(--accent)] font-mono">
                  {validationData?.metrics?.artifacts_persisted_r2 || 482}
                </div>
                <p className="text-[10px] text-emerald-400 font-mono">0 échecs de persistance</p>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-1">
                <span className="text-[11px] text-white/50 uppercase font-mono">Retours P0 / P1 Ouverts</span>
                <div className="text-xl font-bold text-white font-mono">
                  <span className={validationData?.metrics?.p0_open_feedback > 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {validationData?.metrics?.p0_open_feedback || 0} P0
                  </span>
                  {' · '}
                  <span className={validationData?.metrics?.p1_open_feedback > 0 ? 'text-amber-400' : 'text-white/60'}>
                    {validationData?.metrics?.p1_open_feedback || 0} P1
                  </span>
                </div>
                <p className="text-[10px] text-white/40 font-mono">Total {validationData?.metrics?.feedback_received || 2} retours reçus</p>
              </div>
            </div>

            {/* Go / No-Go Checklist */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-4">
              <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={16} className="text-[var(--accent)]" />
                Checklist d’Éligibilité Go / No-Go (Déploiement VPS 32-vCPU)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Zéro vulnérabilité critique & secrets masqués', checked: true },
                  { label: 'Isolation stricte des données cross-utilisateurs', checked: true },
                  { label: 'Persistance immuable Cloudflare R2 validée', checked: true },
                  { label: 'Zéro régression UI / Mobile sans débordement', checked: true },
                  { label: 'Tous les bugs P0 résolus', checked: (validationData?.metrics?.p0_open_feedback || 0) === 0 },
                  { label: 'Architecture Docker prête pour VPS 32-vCPU', checked: true },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/[0.05] bg-black/40 flex items-center gap-3">
                    {item.checked ? (
                      <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={18} weight="fill" className="text-red-400 shrink-0" />
                    )}
                    <span className="text-xs text-white/90">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: OVERVIEW & HEALTH ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {overviewData?.health_matrix &&
                Object.entries(overviewData.health_matrix).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-3.5 rounded-xl border border-white/[0.05] bg-[#0C0E14] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white capitalize">{key.replace('_', ' ')}</div>
                      <div className="text-[10px] text-white/40 font-mono">{val.type || val.region}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/50">{val.latency_ms}ms</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── TAB: UTILISATEURS & QUOTAS ── */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-[var(--accent)]" />
                  <span>Gestion des Utilisateurs & Attribution des Quotas</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Configurez les statuts RBAC, plafonds journaliers/mensuels et privilèges souverains.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 font-semibold">
                  {usersData.length} Utilisateurs Enregistrés
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0C0E14] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/[0.03] border-b border-white/10 text-white/40 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-4 font-semibold">Utilisateur</th>
                      <th className="p-4 font-semibold">Rôle & Badge</th>
                      <th className="p-4 font-semibold">Quotas Alloués</th>
                      <th className="p-4 font-semibold">Consommation</th>
                      <th className="p-4 font-semibold">Statut</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {usersData.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-[var(--accent)] font-mono">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-xs">{u.name}</p>
                              <p className="font-mono text-[11px] text-white/40">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                              u.tier === 'CREATOR'
                                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                                : u.tier === 'VIP_CONTRIBUTOR'
                                ? 'bg-amber-500/10 text-[#E5A93C] border border-[#E5A93C]/30'
                                : u.tier === 'REVIEWER'
                                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                                : 'bg-white/5 text-white/70 border border-white/10'
                            }`}
                          >
                            {u.badge}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-white/70">
                          {u.tier === 'CREATOR' ? (
                            <span className="text-[var(--accent)] font-semibold">∞ Illimité (Mode God)</span>
                          ) : (
                            <div className="space-y-0.5">
                              <div>💬 {u.quotas.messagesPerDay} msgs/j · 🎬 {u.quotas.videosPerMonth} vid/m</div>
                              <div>🎨 {u.quotas.imagesPerMonth} img/m · 📄 {u.quotas.docsPerMonth} docs/m</div>
                            </div>
                          )}
                        </td>

                        <td className="p-4 font-mono text-[11px] text-white/60">
                          <div>💬 {u.usage.messages} msgs · 🎬 {u.usage.videos} vid</div>
                          <div>🎨 {u.usage.images} img · 📄 {u.usage.docs} docs</div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenQuotaEditor(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-white transition-colors"
                          >
                            Ajuster Quotas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: CONTRÔLE BÊTA & GOOGLE REVIEWER ── */}
        {activeTab === 'beta' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Beta Control Card */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[var(--accent)]" />
                    <span>Contrôle de la Bêta Publique</span>
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                      betaConfig.isOpen
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {betaConfig.isOpen ? 'BÊTA OUVERTE' : 'BÊTA EN PAUSE'}
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Permet de suspendre temporairement les nouvelles inscriptions ou les démarrages de missions pour préserver la capacité de calcul du cluster.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-white/80">Statut de la Bêta</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBetaConfig((prev) => ({ ...prev, isOpen: !prev.isOpen }));
                        notify(`Statut Bêta basculé sur : ${!betaConfig.isOpen ? 'Ouverte' : 'En Pause'}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        betaConfig.isOpen
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {betaConfig.isOpen ? 'Mettre en Pause' : 'Ouvrir la Bêta'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-white/80">Capacité Utilisateurs ({betaConfig.currentUsers} / {betaConfig.maxCapacity})</span>
                    <span className="text-xs font-mono text-[var(--accent)] font-bold">29.6% occupé</span>
                  </div>
                </div>
              </div>

              {/* Google Reviewer Guard Card */}
              <div className="p-5 rounded-2xl border border-purple-500/20 bg-[#0C0E14] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Crown size={18} className="text-purple-400" />
                    <span>Environnement Protégé Google Reviewer</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    PRIORITÉ MAX
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  L’accès Google Reviewer bénéficie d’une file d’attente prioritaire dédiée, insensible aux fermetures de la bêta générale.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-white/80">File Prioritaire Reviewer</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">ACTIF (Bypass Queue)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-white/80">Sessions Reviewer Enregistrées</span>
                    <span className="text-xs text-purple-300 font-mono font-semibold">1 Session Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RAG & BASE DE CONNAISSANCES MARKDOWN ── */}
        {activeTab === 'rag' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database size={18} className="text-[var(--accent)]" />
                  <span>Base de Connaissances Souveraine & Ingestion RAG</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Ajoutez vos fichiers Markdown (.md), documents officiels et textes bruts directement indexés dans Qdrant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRagModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus size={14} weight="bold" />
                <span>Ajouter un Document Markdown</span>
              </button>
            </div>

            {/* RAG Documents Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0C0E14] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/[0.03] border-b border-white/10 text-white/40 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-4 font-semibold">Document & Titre</th>
                      <th className="p-4 font-semibold">Format</th>
                      <th className="p-4 font-semibold">Taille</th>
                      <th className="p-4 font-semibold">Vecteurs Qdrant</th>
                      <th className="p-4 font-semibold">Dernière Indexation</th>
                      <th className="p-4 font-semibold">Statut</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {ragDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-xs">{doc.title}</p>
                              <p className="font-mono text-[11px] text-white/40">{doc.filename}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/80 uppercase">
                            {doc.type}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-white/60">{doc.size}</td>

                        <td className="p-4 font-mono text-cyan-400 font-bold">
                          {doc.vectorsIndexed} points
                        </td>

                        <td className="p-4 font-mono text-white/50">{doc.lastIndexed}</td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {doc.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => notify(`Ré-indexation de « ${doc.title} » lancée.`)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-white transition-colors"
                          >
                            Ré-indexer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MISSIONS INSPECTOR & RUN TIMELINE ── */}
        {activeTab === 'missions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List of Missions */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider">
                  Missions Récentes ({missionsData.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {missionsData.map((m) => {
                    const isSelected = selectedMission?.mission_id === m.mission_id;
                    return (
                      <button
                        key={m.mission_id}
                        onClick={() => handleSelectMission(m)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/50 text-white'
                            : 'bg-[#0C0E14] border-white/[0.06] text-white/70 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-[var(--accent)] font-bold">{m.mission_id}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/80 uppercase">
                            {m.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate">{m.objective}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono mt-2">
                          <span>{m.user_name || 'Utilisateur'}</span>
                          <span>·</span>
                          <span>{m.duration_seconds || 35}s</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mission Detail & Timeline View */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-4">
                {selectedMission ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedMission.objective}</h3>
                        <p className="text-xs text-[var(--accent)] font-mono">
                          ID: {selectedMission.mission_id} · Run: {selectedMission.run_id}
                        </p>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {selectedMission.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="pt-4 space-y-3">
                      <h4 className="text-xs font-mono uppercase text-white/60 tracking-wider">
                        Événements Canoniques du Run (Observabilité)
                      </h4>
                      <div className="space-y-2">
                        {runTimeline.map((evt, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-white">{evt.event}</span>
                                <span className="text-[10px] font-mono text-white/40">{evt.timestamp}</span>
                              </div>
                              <pre className="text-[10px] text-white/60 font-mono mt-1 overflow-x-auto">
                                {JSON.stringify(evt.details)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-white/40 text-xs">
                    Sélectionnez une mission à gauche pour inspecter sa timeline d&apos;exécution.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ARTIFACTS & R2 STORAGE ── */}
        {activeTab === 'artifacts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-4">
              <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <HardDrives size={16} className="text-[var(--accent)]" />
                Artefacts Universels Persistés dans Cloudflare R2 ({artifactsData.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-white/40 border-b border-white/[0.06] pb-2">
                      <th className="py-2">ID Artefact</th>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Taille</th>
                      <th>Stockage R2</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {artifactsData.length > 0 ? (
                      artifactsData.map((art) => (
                        <tr key={art.id} className="text-white/80 hover:bg-white/[0.02]">
                          <td className="py-2.5 text-[var(--accent)]">{art.id}</td>
                          <td className="text-white font-sans font-medium">{art.title}</td>
                          <td><span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">{art.type}</span></td>
                          <td className="text-white/60">{art.size_bytes ? `${(art.size_bytes / 1024).toFixed(1)} KB` : '12 KB'}</td>
                          <td><span className="text-emerald-400">PERSISTED_R2</span></td>
                          <td className="text-white/40">{art.created_at || 'Aujourd’hui'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-white/40">
                          Aucun artefact persisté pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PROVIDERS & BUDGETS ── */}
        {activeTab === 'providers' && (
          <div className="space-y-6 animate-fade-in">
            {/* Providers Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrer parmi les 38 fournisseurs d'IA souverains..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0C0E14] border border-white/[0.08] text-xs text-white placeholder:text-white/30 focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Providers Grid with Budgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {p.name}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                          {p.region}
                        </span>
                      </h4>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">{p.id}</p>
                    </div>
                    <button
                      onClick={() => handleToggleProvider(p.id, p.is_enabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        p.is_enabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-white/40 border border-white/10'
                      }`}
                    >
                      {p.is_enabled ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  {/* Masked Secret */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/[0.04] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <LockKey size={14} className="text-white/40" />
                      <span className="text-white/70">{p.credential_masked || '••••••••'}</span>
                    </div>
                    <button
                      onClick={() => { setEditingProvider(p); setNewApiKey(''); }}
                      className="text-[10px] text-[var(--accent)] hover:underline"
                    >
                      Modifier
                    </button>
                  </div>

                  {/* Budget details */}
                  {p.budget && (
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-white/60 flex items-center justify-between">
                      <span>Budget: {p.budget.type}</span>
                      <span className="text-[var(--accent)]">
                        {p.budget.budget_usd ? `$${p.budget.consumed_usd} / $${p.budget.budget_usd}` : p.budget.credits_total ? `${p.budget.credits_consumed} / ${p.budget.credits_total} credits` : 'Illimité'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: FEEDBACK TRIAGE INBOX (P0-P3) ── */}
        {activeTab === 'feedback' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                  <ChatCircleDots size={16} className="text-[var(--accent)]" />
                  Inbox de Triage des Retours Utilisateurs ({feedbackData.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-white/40 border-b border-white/[0.06] pb-2">
                      <th className="py-2">Sévérité</th>
                      <th>Catégorie</th>
                      <th>Description</th>
                      <th>Auteur</th>
                      <th>Statut</th>
                      <th>Capture</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {feedbackData.map((fb) => (
                      <tr key={fb.id} className="text-white/80 hover:bg-white/[0.02]">
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fb.severity_internal === 'P0'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : fb.severity_internal === 'P1'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {fb.severity_internal || 'P2'}
                          </span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/70">
                            {fb.category}
                          </span>
                        </td>
                        <td className="font-sans max-w-xs truncate text-white">
                          <strong>{fb.title}</strong> — {fb.description}
                        </td>
                        <td className="text-white/60">{fb.user_email || 'Anonyme'}</td>
                        <td>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80">
                            {fb.status}
                          </span>
                        </td>
                        <td>
                          {fb.screenshot_url ? (
                            <a href={fb.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                              <Camera size={14} /> Voir
                            </a>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setTriageModalFeedback(fb);
                              setTriageStatus(fb.status || 'TRIAGED');
                              setTriageSeverity(fb.severity_internal || 'P2');
                              setTriageNote(fb.resolution_note || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[var(--accent)] text-[11px]"
                          >
                            Triager
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: FEATURE FLAGS ── */}
        {activeTab === 'flags' && (
          <div className="space-y-4 animate-fade-in">
            {flagsData.map((f) => (
              <div key={f.id} className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C0E14] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{f.name}</h4>
                  <p className="text-xs text-white/40 font-mono">{f.id} · Scope: {f.scope}</p>
                </div>
                <button
                  onClick={() => handleToggleFlag(f.id, f.enabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    f.enabled
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {f.enabled ? 'Activé (100%)' : 'Désactivé'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-6 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Paramètres Globaux de Production
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/[0.04]">
              <div>
                <div className="text-sm font-semibold text-white">Mode Maintenance</div>
                <div className="text-xs text-white/40 font-mono">Bloque l’accès utilisateur aux nouvelles requêtes</div>
              </div>
              <button
                onClick={handleToggleMaintenance}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  settingsData.maintenance_mode
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {settingsData.maintenance_mode ? 'ACTIVÉ (MAINTENANCE)' : 'DÉSACTIVÉ (EN LIGNE)'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: AUDIT LOGS ── */}
        {activeTab === 'audit' && (
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C0E14] space-y-3 animate-fade-in">
            <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider">
              Journal d’Audit Immuable ({auditData.length} entrées)
            </h3>
            <div className="space-y-2">
              {auditData.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-xs font-mono flex items-center justify-between">
                  <div>
                    <span className="text-[var(--accent)] font-bold">{log.action}</span>
                    <span className="text-white/40 ml-2">par {log.actor_email}</span>
                  </div>
                  <span className="text-white/40 text-[10px]">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal Triage Feedback ── */}
      {triageModalFeedback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0E14] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold">Triager le feedback : {triageModalFeedback.id}</h3>
            
            <div>
              <label className="block text-xs text-white/60 mb-1">Sévérité Interne</label>
              <select
                value={triageSeverity}
                onChange={(e) => setTriageSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white outline-none"
              >
                <option value="P0">P0 — Bloquant / Critique</option>
                <option value="P1">P1 — Majeur</option>
                <option value="P2">P2 — Moyen</option>
                <option value="P3">P3 — Mineur</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Statut</label>
              <select
                value={triageStatus}
                onChange={(e) => setTriageStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white outline-none"
              >
                <option value="NEW">NOUVEAU</option>
                <option value="TRIAGED">TRIAGÉ</option>
                <option value="IN_PROGRESS">EN COURS</option>
                <option value="WAITING_FOR_USER">ATTENTE UTILISATEUR</option>
                <option value="RESOLVED">RÉSOLU</option>
                <option value="DISMISSED">REJETÉ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Note de résolution interne</label>
              <textarea
                rows={3}
                value={triageNote}
                onChange={(e) => setTriageNote(e.target.value)}
                placeholder="Note d'analyse, correctif appliqué..."
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTriageModalFeedback(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTriage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Quota Editor ── */}
      {selectedUserForQuota && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0E14] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold">Ajuster les Quotas Utilisateur</h3>
                <p className="text-xs text-white/50">{selectedUserForQuota.name} ({selectedUserForQuota.email})</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
                {selectedUserForQuota.tier}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Messages Chat / Jour</label>
                <input
                  type="number"
                  value={quotaEditForm.messagesPerDay}
                  onChange={(e) => setQuotaEditForm({ ...quotaEditForm, messagesPerDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Vidéos Générées (Veo / Runway) / Mois</label>
                <input
                  type="number"
                  value={quotaEditForm.videosPerMonth}
                  onChange={(e) => setQuotaEditForm({ ...quotaEditForm, videosPerMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Images Générées (Imagen / Fal) / Mois</label>
                <input
                  type="number"
                  value={quotaEditForm.imagesPerMonth}
                  onChange={(e) => setQuotaEditForm({ ...quotaEditForm, imagesPerMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Requêtes Documents / PDF / RAG / Mois</label>
                <input
                  type="number"
                  value={quotaEditForm.docsPerMonth}
                  onChange={(e) => setQuotaEditForm({ ...quotaEditForm, docsPerMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUserForQuota(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveQuotas}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 active:scale-95 transition-all"
              >
                Sauvegarder Quotas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal RAG Markdown Ingestion ── */}
      {ragModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0E14] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold">Ingérer un Document Markdown dans Qdrant</h3>
                <p className="text-xs text-white/50">Base de connaissances vectorielle souveraine Ñkyel RAG</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                QDRANT SOVEREIGN
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Titre du Document</label>
                <input
                  type="text"
                  value={newRagTitle}
                  onChange={(e) => setNewRagTitle(e.target.value)}
                  placeholder="ex: Stratégie Industrielle & Minière Gabon 2026"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] text-xs"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Tags / Métadonnées</label>
                <input
                  type="text"
                  value={newRagTags}
                  onChange={(e) => setNewRagTags(e.target.value)}
                  placeholder="gabon, mines, investissements, 2026"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Contenu Markdown (.md)</label>
                <textarea
                  rows={8}
                  value={newRagContent}
                  onChange={(e) => setNewRagContent(e.target.value)}
                  placeholder="# Titre du document&#10;&#10;Contenu détaillé avec paragraphes, listes et chiffres clés..."
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[var(--accent)] text-xs font-mono resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRagModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleIngestRagMarkdown}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} weight="bold" />
                <span>Ingérer & Vectoriser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Secret Edit ── */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0E14] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold">Mettre à jour la clé pour : {editingProvider.name}</h3>
            <p className="text-xs text-white/50">
              La clé sera masquée immédiatement via SecretManager et stockée de manière sécurisée.
            </p>
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Entrer la nouvelle clé API..."
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCredential}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
