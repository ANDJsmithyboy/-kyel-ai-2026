/**
 * Ñkyel AI · Observatoire des Protocoles
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Comprehensive visual observatory for all 8 protocol layers:
 * 1. Vue d'ensemble (Overview)
 * 2. Connecteurs MCP
 * 3. Registre Skills (SKILL.md)
 * 4. Agents A2A
 * 5. Flux AG-UI
 * 6. Surfaces A2UI
 * 7. MCP Apps
 * 8. Commerce AP2 / UCP (Ñkyel Pay)
 * 9. Sécurité & Gouvernance
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Graph,
  SquaresFour,
  PuzzlePiece,
  Users,
  ArrowsLeftRight,
  AppWindow,
  ShieldCheck,
  CreditCard,
  Sparkle,
  Plus,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  X,
  Play,
  DownloadSimple,
  UploadSimple,
  SlidersHorizontal,
  FileCode,
  Globe,
  Terminal,
  Lock,
} from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';
import { protocolEventBus, type ProtocolLogEvent } from '@/lib/protocols/protocol-events';
import A2UIRenderer from '@/components/protocols/A2UIRenderer';
import MCPAppRunner from '@/components/protocols/MCPAppRunner';
import GoogleIntegrationsHub from '@/components/capabilities/GoogleIntegrationsHub';
import type {
  MCPServerConfig,
  NkyelSkill,
  A2UISurfaceSpec,
  A2AAgentCard,
} from '@/lib/protocols/protocols.types';

type ProtocolTab =
  | 'overview'
  | 'mcp'
  | 'skills'
  | 'a2a'
  | 'agui'
  | 'a2ui'
  | 'mcp_apps'
  | 'commerce'
  | 'security';

export default function ProtocolsPage() {
  const [activeTab, setActiveTab] = useState<ProtocolTab>('overview');
  const [eventsList, setEventsList] = useState<ProtocolLogEvent[]>([]);

  // Protocol Store
  const {
    mcpServers,
    skills,
    a2aAgents,
    delegations,
    healthCards,
    activeApprovalRequest,
    activePaymentMandate,
    mcpApps,
    activeMCPApp,
    addMCPServer,
    toggleMCPTool,
    setMCPToolApproval,
    addSkill,
    toggleSkillStatus,
    testSkillLive,
    delegateA2ATask,
    sendA2AMessage,
    requestApproval,
    resolveApproval,
    openMCPApp,
    closeMCPApp,
    requestPaymentMandate,
    approvePaymentMandate,
    cancelPaymentMandate,
  } = useProtocolStore();

  // Modals state
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(mcpServers[0]?.id || null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(skills[0]?.id || null);
  const [skillTestInput, setSkillTestInput] = useState('Analyse du bilan énergétique 2025');
  const [skillTestResult, setSkillTestResult] = useState<string | null>(null);

  // New server form
  const [newServerName, setNewServerName] = useState('');
  const [newServerTransport, setNewServerTransport] = useState<'stdio' | 'sse'>('stdio');
  const [newServerEndpoint, setNewServerEndpoint] = useState('');

  // New skill form (SKILL.md)
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillInstructions, setNewSkillInstructions] = useState('');

  // A2A delegation prompt
  const [delegationTargetId, setDelegationTargetId] = useState<string>(a2aAgents[1]?.id || '');
  const [delegationGoal, setDelegationGoal] = useState('Modélisation quantitative DCF pour le projet hydroélectrique');

  // Sample A2UI Spec for Live Sandbox
  const sampleA2UISpec: A2UISurfaceSpec = {
    id: 'a2ui_demo_surface',
    title: 'Analyse d\'Opportunité d\'Investissement Souverain',
    description: 'Surface déclarative générée en temps réel par l\'Agent Analyste Financier',
    componentType: 'comparison_panel',
    generatedByAgent: 'Agent Analyste Financier',
    schemaVersion: '1.0.0',
    comparisonItems: [
      {
        id: 'opt_hydro',
        title: 'Centrale Hydroélectrique de Kinguélé Aval',
        badge: 'Recommandé',
        isRecommended: true,
        metrics: [
          { label: 'TRI (Taux de Rendement Interne)', value: '18.4 %', isPositive: true },
          { label: 'VAN (Valeur Actuelle Nette)', value: '42.5M €', isPositive: true },
          { label: 'Empreinte Carbone', value: '12 g CO2/kWh', isPositive: true },
        ],
        features: [
          { text: 'Concession garantie 35 ans', supported: true },
          { text: 'Accord d\'achat d\'énergie souverain (PPA)', supported: true },
          { text: 'Couverture contre le risque de change', supported: true },
        ],
        actionLabel: 'Sélectionner ce Projet',
      },
      {
        id: 'opt_solar',
        title: 'Parc Photovoltaïque d\'Ayémé',
        badge: 'Alternative',
        metrics: [
          { label: 'TRI', value: '14.2 %', isPositive: true },
          { label: 'VAN', value: '28.0M €', isPositive: true },
          { label: 'Empreinte Carbone', value: '35 g CO2/kWh' },
        ],
        features: [
          { text: 'Mise en service rapide (12 mois)', supported: true },
          { text: 'PPA souverain', supported: true },
          { text: 'Stockage batterie requis', supported: false },
        ],
        actionLabel: 'Examiner le Dossier',
      },
    ],
  };

  // Subscribe to protocol events
  useEffect(() => {
    setEventsList(protocolEventBus.getHistory());
    const unsubscribe = protocolEventBus.subscribe((evt) => {
      setEventsList((prev) => [evt, ...prev.slice(0, 99)]);
    });
    return () => unsubscribe();
  }, []);

  const selectedServer = mcpServers.find((s) => s.id === selectedServerId) || mcpServers[0];
  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  return (
    <div className="flex flex-col h-full bg-[#08090D] text-[#F1EEE7] overflow-hidden">
      {/* ── TOP OBSERVATORY HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0E121A]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#665F9E]/20 text-[#AAA2C8] border border-[#665F9E]/30 flex items-center justify-center font-bold text-sm">
              ◈
            </span>
            <h1 className="text-xl font-bold text-[#F1EEE7] tracking-tight">Observatoire des Protocoles</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6F9485]/15 text-[#6F9485] border border-[#6F9485]/30 font-semibold uppercase tracking-wider">
              Couche Visible Active
            </span>
          </div>
          <p className="text-[12px] text-[#7E8795] mt-1">
            Gouvernance, télémétrie et interopérabilité des protocoles autonomes : MCP, Skills, A2A, AG-UI, A2UI, MCP Apps, AP2 & Google.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => {
              requestApproval({
                id: `req_${Date.now()}`,
                runId: `run_${Date.now()}`,
                actionTitle: 'Mutation de base de données PostgreSQL',
                description: 'L\'Agent Coder souhaite exécuter une commande SQL INSERT sur la table de configuration.',
                sensitivity: 'high',
                requestedAt: new Date().toISOString(),
                status: 'pending',
                affectedResources: ['postgres://public/schema'],
                estimatedCostUsd: 0.02,
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-[#C39A52]/15 hover:bg-[#C39A52]/25 border border-[#C39A52]/30 text-[#C39A52] text-[12px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <WarningCircle size={14} weight="fill" />
            <span>Simuler Approbation AG-UI</span>
          </button>
        </div>
      </div>

      {/* ── 9 PROTOCOL NAVIGATION TABS ── */}
      <div className="flex items-center gap-1 px-6 py-2.5 overflow-x-auto border-b border-white/[0.06] bg-[#0E121A] shrink-0 no-scrollbar">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Graph },
          { id: 'mcp', label: 'Connecteurs MCP', icon: SquaresFour, count: mcpServers.length },
          { id: 'skills', label: 'Skills (SKILL.md)', icon: PuzzlePiece, count: skills.length },
          { id: 'a2a', label: 'Agents A2A', icon: Users, count: a2aAgents.length },
          { id: 'agui', label: 'Flux AG-UI', icon: ArrowsLeftRight },
          { id: 'a2ui', label: 'Surfaces A2UI', icon: SlidersHorizontal },
          { id: 'mcp_apps', label: 'MCP Apps', icon: AppWindow, count: mcpApps.length },
          { id: 'commerce', label: 'Commerce AP2/UCP', icon: CreditCard },
          { id: 'security', label: 'Sécurité & Gouvernance', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProtocolTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white/[0.1] text-white border border-white/10 shadow-sm font-semibold'
                  : 'text-[#7E8795] hover:text-[#F1EEE7] hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={15} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-[#AAA2C8]' : ''} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-[#B8C0CC]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── HUMAN APPROVAL BANNER (AG-UI) ── */}
      {activeApprovalRequest && (
        <div className="mx-6 my-3 p-4 rounded-2xl bg-[#BE6254]/15 border border-[#BE6254]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#BE6254]/25 text-[#BE6254] flex items-center justify-center shrink-0">
              <WarningCircle size={18} weight="fill" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-bold text-[#F1EEE7]">{activeApprovalRequest.actionTitle}</h4>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#BE6254]/30 text-[#BE6254] font-semibold uppercase">
                  Sensibilité {activeApprovalRequest.sensitivity}
                </span>
              </div>
              <p className="text-[12px] text-[#B8C0CC] mt-0.5">{activeApprovalRequest.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => resolveApproval('accept')}
              className="px-3 py-1.5 rounded-xl bg-[#6F9485] hover:bg-[#6F9485]/90 text-white text-[12px] font-semibold transition-colors"
            >
              Accepter
            </button>
            <button
              onClick={() => resolveApproval('modify', 'Limiter la modification à 5 enregistrements max')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[#F1EEE7] text-[12px] font-semibold transition-colors"
            >
              Modifier contrainte
            </button>
            <button
              onClick={() => resolveApproval('reject')}
              className="px-3 py-1.5 rounded-xl bg-[#BE6254]/20 hover:bg-[#BE6254]/30 text-[#BE6254] border border-[#BE6254]/30 text-[12px] font-semibold transition-colors"
            >
              Refuser
            </button>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 1. VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Protocol Health Cards */}
            <div>
              <h3 className="text-sm font-semibold text-[#7E8795] uppercase tracking-wider mb-3">
                Matrice des Protocoles & État d'Exécution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md font-mono"
                          style={{
                            backgroundColor: `${card.accentColor}20`,
                            color: card.accentColor,
                            border: `1px solid ${card.accentColor}40`,
                          }}
                        >
                          {card.acronym}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6F9485]/15 text-[#6F9485] font-semibold uppercase">
                          {card.statusBadge}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-semibold text-[#F1EEE7] leading-tight mb-1">{card.name}</h4>
                      <p className="text-[11px] text-[#7E8795]">Version : {card.negotiatedVersion}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#7E8795]">
                        <span>Capacités :</span>
                        <span className="text-[#F1EEE7] font-mono">{card.capabilitiesCount}</span>
                      </div>
                      <div className="flex justify-between text-[#7E8795]">
                        <span>Requêtes totales :</span>
                        <span className="text-[#F1EEE7] font-mono">{card.requestsCount}</span>
                      </div>
                      <div className="flex justify-between text-[#7E8795]">
                        <span>Latence moy. :</span>
                        <span className="text-[#6F9485] font-mono">{card.latencyMs} ms</span>
                      </div>
                      <div className="flex justify-between text-[#7E8795]">
                        <span>Dernier événement :</span>
                        <span className="text-[#B8C0CC]">{card.lastEventAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google AI & Workspace Section */}
            <GoogleIntegrationsHub />

            {/* Event Bus Live Stream */}
            <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F1EEE7]">Flux d'Événements Protocolaires en Direct</h3>
                  <span className="w-2 h-2 rounded-full bg-[#6F9485] animate-pulse" />
                </div>
                <button
                  onClick={() => setEventsList(protocolEventBus.getHistory())}
                  className="flex items-center gap-1 text-[11px] text-[#7E8795] hover:text-white"
                >
                  <ArrowClockwise size={13} />
                  <span>Actualiser</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-[12px]">
                {eventsList.slice(0, 15).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-[#08090D] border border-white/[0.04] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#7E8795]">{evt.timestamp.slice(11, 19)}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-[#AAA2C8] font-semibold">
                        {evt.type}
                      </span>
                      <span className="text-[#F1EEE7] truncate max-w-lg">{evt.summary}</span>
                    </div>
                    {evt.latencyMs && (
                      <span className="text-[#6F9485] shrink-0">{evt.latencyMs}ms</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CONNECTEURS MCP */}
        {activeTab === 'mcp' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left: Server List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F1EEE7]">Serveurs MCP Connectés</h3>
                <button
                  onClick={() => setIsAddServerOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#665F9E]/20 hover:bg-[#665F9E]/30 text-[#AAA2C8] text-[11px] font-semibold transition-colors"
                >
                  <Plus size={13} />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="space-y-2">
                {mcpServers.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServerId(srv.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedServer?.id === srv.id
                        ? 'bg-[#151922] border-[#5BA3B5] shadow-lg'
                        : 'bg-[#0E121A] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[13px] font-semibold text-[#F1EEE7]">{srv.name}</h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#6F9485]/15 text-[#6F9485] font-semibold">
                        {srv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7E8795]">{srv.provenance}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#7E8795]">
                      <span>Outils : {srv.tools.length}</span>
                      <span>Ressources : {srv.resources.length}</span>
                      <span className="text-[#6F9485]">{srv.latencyMs} ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Capabilities Inspector */}
            <div className="lg:col-span-2 space-y-6">
              {selectedServer ? (
                <div className="p-6 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-6">
                  {/* Server Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#F1EEE7]">{selectedServer.name}</h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[#AAA2C8]">
                          v{selectedServer.version}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7E8795] mt-1">
                        Transport : <span className="font-mono text-[#B8C0CC]">{selectedServer.transport}</span> · Scopes :{' '}
                        {selectedServer.scopes.join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#6F9485] font-mono bg-[#6F9485]/10 px-2.5 py-1 rounded-xl">
                      Latence : {selectedServer.latencyMs}ms
                    </span>
                  </div>

                  {/* Tools list */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#F1EEE7] mb-3">Outils Exposés ({selectedServer.tools.length})</h4>
                    <div className="space-y-3">
                      {selectedServer.tools.map((tool) => (
                        <div
                          key={tool.name}
                          className="p-4 rounded-xl bg-[#08090D] border border-white/[0.06] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-[13px] text-[#5BA3B5]">{tool.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full uppercase font-semibold ${
                                  tool.sensitivityLevel === 'high' || tool.sensitivityLevel === 'critical'
                                    ? 'bg-[#BE6254]/20 text-[#BE6254]'
                                    : 'bg-[#6F9485]/15 text-[#6F9485]'
                                }`}
                              >
                                {tool.sensitivityLevel}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#B8C0CC]">
                                <input
                                  type="checkbox"
                                  checked={tool.requiresApproval}
                                  onChange={(e) => setMCPToolApproval(selectedServer.id, tool.name, e.target.checked)}
                                  className="rounded bg-[#151922] border-white/10"
                                />
                                <span>Autorisation préalable</span>
                              </label>

                              <button
                                onClick={() => toggleMCPTool(selectedServer.id, tool.name)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  tool.enabled
                                    ? 'bg-[#6F9485]/20 text-[#6F9485] border border-[#6F9485]/30'
                                    : 'bg-white/[0.06] text-[#7E8795]'
                                }`}
                              >
                                {tool.enabled ? 'Actif' : 'Désactivé'}
                              </button>
                            </div>
                          </div>

                          <p className="text-[12px] text-[#7E8795]">{tool.description}</p>

                          {/* Schema Preview */}
                          <div className="p-3 rounded-lg bg-[#151922] border border-white/[0.04] text-[11px] font-mono text-[#B8C0CC]">
                            <span className="text-[#7E8795] block mb-1">Paramètres acceptés :</span>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(tool.inputSchema.properties, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-[#7E8795]">Sélectionnez un serveur MCP</div>
              )}
            </div>
          </div>
        )}

        {/* 3. SKILLS ÑKYEL (SKILL.md) */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Skills List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F1EEE7]">Registre de Skills</h3>
                <button
                  onClick={() => setIsCreateSkillOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C39A52]/20 hover:bg-[#C39A52]/30 text-[#C39A52] text-[11px] font-semibold transition-colors"
                >
                  <Plus size={13} />
                  <span>Nouveau SKILL.md</span>
                </button>
              </div>

              <div className="space-y-2">
                {skills.map((sk) => (
                  <div
                    key={sk.id}
                    onClick={() => setSelectedSkillId(sk.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedSkill?.id === sk.id
                        ? 'bg-[#151922] border-[#C39A52] shadow-lg'
                        : 'bg-[#0E121A] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[13px] font-semibold text-[#F1EEE7]">{sk.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                          sk.status === 'active' ? 'bg-[#6F9485]/15 text-[#6F9485]' : 'bg-white/[0.06] text-[#7E8795]'
                        }`}
                      >
                        {sk.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7E8795] line-clamp-2">{sk.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[10px] text-[#7E8795]">
                      <span>{sk.author}</span>
                      <span className="text-[#C39A52] font-mono">v{sk.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Detail & Live Test Bench */}
            <div className="lg:col-span-2 space-y-6">
              {selectedSkill && (
                <div className="p-6 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-6">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧩</span>
                        <h2 className="text-lg font-bold text-[#F1EEE7]">{selectedSkill.name}</h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C39A52]/20 text-[#C39A52]">
                          v{selectedSkill.version}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7E8795] mt-1">{selectedSkill.description}</p>
                    </div>

                    <button
                      onClick={() => toggleSkillStatus(selectedSkill.id)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors ${
                        selectedSkill.status === 'active'
                          ? 'bg-[#6F9485]/20 text-[#6F9485] border border-[#6F9485]/30'
                          : 'bg-white/[0.06] text-[#7E8795]'
                      }`}
                    >
                      {selectedSkill.status === 'active' ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  {/* Permissions & Scripts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#08090D] border border-white/[0.04]">
                      <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider mb-2">
                        Permissions déclarées
                      </h4>
                      <div className="space-y-1.5">
                        {selectedSkill.permissions.map((p) => (
                          <div key={p.id} className="text-[12px] text-[#7E8795] flex items-center justify-between">
                            <span className="font-mono text-[#AAA2C8]">{p.scope}</span>
                            <span className="text-[10px] text-[#7E8795]">{p.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#08090D] border border-white/[0.04]">
                      <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider mb-2">
                        Historique d'Utilisation
                      </h4>
                      <div className="space-y-1.5 text-[12px]">
                        <div className="flex justify-between text-[#7E8795]">
                          <span>Appels exécutés :</span>
                          <span className="text-[#F1EEE7] font-mono">{selectedSkill.usageCount}</span>
                        </div>
                        <div className="flex justify-between text-[#7E8795]">
                          <span>Taux de succès :</span>
                          <span className="text-[#6F9485] font-mono">{selectedSkill.successRatePercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SKILL.md Instructions View */}
                  <div className="p-4 rounded-xl bg-[#08090D] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-[#C39A52] font-mono">SKILL.md Instructions</span>
                    </div>
                    <pre className="text-[12px] text-[#F1EEE7] whitespace-pre-wrap font-mono leading-relaxed bg-[#151922] p-3 rounded-lg border border-white/[0.04]">
                      {selectedSkill.instructionsMarkdown}
                    </pre>
                  </div>

                  {/* Live Skill Test Bench */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-3">
                    <h4 className="text-sm font-semibold text-[#F1EEE7]">Banc d'Essai en Direct (Skill Test)</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillTestInput}
                        onChange={(e) => setSkillTestInput(e.target.value)}
                        placeholder="Entrez un prompt de test pour ce Skill..."
                        className="flex-1 px-3.5 py-2 rounded-xl text-[13px] text-[#F1EEE7] bg-[#08090D] border border-white/[0.08] focus:border-[#C39A52] focus:outline-none"
                      />
                      <button
                        onClick={async () => {
                          const res = await testSkillLive(selectedSkill.id, skillTestInput);
                          setSkillTestResult(res.output);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#C39A52] hover:bg-[#C39A52]/90 text-black font-semibold text-[13px] flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <Play size={14} weight="fill" />
                        <span>Tester le Skill</span>
                      </button>
                    </div>

                    {skillTestResult && (
                      <div className="p-3.5 rounded-xl bg-[#08090D] border border-[#C39A52]/30 text-[12px] font-mono text-[#F1EEE7] whitespace-pre-wrap">
                        {skillTestResult}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. AGENTS A2A */}
        {activeTab === 'a2a' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Agent Cards */}
            <div>
              <h3 className="text-sm font-semibold text-[#7E8795] uppercase tracking-wider mb-3">
                Agent Cards Référencées (A2A Network)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {a2aAgents.map((agent) => (
                  <div key={agent.id} className="p-4 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.avatar}</span>
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#F1EEE7]">{agent.name}</h4>
                        <span className="text-[10px] text-[#6F9485] font-mono">{agent.provider}</span>
                      </div>
                    </div>

                    <p className="text-[12px] text-[#7E8795]">{agent.role}</p>

                    <div className="space-y-1 py-2 border-t border-white/[0.04] text-[11px] text-[#7E8795]">
                      <div className="flex justify-between">
                        <span>Endpoint :</span>
                        <span className="font-mono text-[#B8C0CC] truncate max-w-[140px]">{agent.endpoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score réputation :</span>
                        <span className="text-[#6F9485] font-mono">{agent.reputationScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delegation Launcher & Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delegation Form */}
              <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-4">
                <h3 className="text-sm font-semibold text-[#F1EEE7]">Déléguer une Tâche A2A</h3>
                <div>
                  <label className="block text-[12px] text-[#7E8795] mb-1">Agent Destinataire :</label>
                  <select
                    value={delegationTargetId}
                    onChange={(e) => setDelegationTargetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-[#F1EEE7] focus:outline-none"
                  >
                    {a2aAgents.filter((a) => a.id !== 'agent_strategist').map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] text-[#7E8795] mb-1">Mission / Objectif :</label>
                  <textarea
                    rows={3}
                    value={delegationGoal}
                    onChange={(e) => setDelegationGoal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-[#F1EEE7] focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => delegateA2ATask(delegationTargetId, 'Mission Déléguée A2A', delegationGoal)}
                  className="w-full py-2 rounded-xl bg-[#6F9485] hover:bg-[#6F9485]/90 text-black font-semibold text-[13px] transition-colors"
                >
                  Lancer Délégation A2A
                </button>
              </div>

              {/* Delegations History & Messages */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-4">
                <h3 className="text-sm font-semibold text-[#F1EEE7]">Historique des Échanges A2A & Branches WorkGraph</h3>
                {delegations.length === 0 ? (
                  <p className="text-[12px] text-[#7E8795] py-8 text-center">Aucune délégation active. Lancez une mission ci-contre.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {delegations.map((del) => (
                      <div key={del.id} className="p-4 rounded-xl bg-[#08090D] border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[#6F9485] font-semibold text-[13px]">{del.taskTitle}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#6F9485]/15 text-[#6F9485] font-mono">
                              Vers {del.targetAgentName}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6F9485] font-mono font-semibold">{del.progressPercent}%</span>
                        </div>

                        {/* Message stream */}
                        <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                          {del.messages.map((m) => (
                            <div key={m.id} className="text-[11px] text-[#B8C0CC] flex items-start gap-2">
                              <span className="text-[#AAA2C8] font-semibold shrink-0">{m.senderName}:</span>
                              <span>{m.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. FLUX AG-UI */}
        {activeTab === 'agui' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-4">
              <h3 className="text-sm font-semibold text-[#F1EEE7]">Couche Événementielle Bidirectionnelle AG-UI</h3>
              <p className="text-[12px] text-[#7E8795]">
                AG-UI transmet en temps réel les flux d'exécution, la progression, les demandes d'arbitrage et permet à l'utilisateur de suspendre, modifier ou valider chaque étape.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => protocolEventBus.emit('agui.state.updated', 'agui', 'Suspension de la mission demandée par l\'utilisateur', {}, 'warning')}
                  className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[12px] font-semibold"
                >
                  Suspendre Mission
                </button>
                <button
                  onClick={() => protocolEventBus.emit('agui.state.updated', 'agui', 'Reprise normale de la mission', {}, 'success')}
                  className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[12px] font-semibold"
                >
                  Reprendre Mission
                </button>
                <button
                  onClick={() => protocolEventBus.emit('agui.state.updated', 'agui', 'Preuve cryptographique demandée pour le calcul DCF', {}, 'warning')}
                  className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[12px] font-semibold"
                >
                  Demander Preuve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. SURFACES A2UI */}
        {activeTab === 'a2ui' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-semibold text-[#F1EEE7]">Surfaces Génératives Sécurisées A2UI</h3>
                <p className="text-[12px] text-[#7E8795] mt-0.5">
                  Interfaces déclaratives sans Javascript arbitraire, rendues exclusivement avec le design system natif Ñkyel.
                </p>
              </div>
            </div>

            {/* Render sample A2UI Spec */}
            <A2UIRenderer spec={sampleA2UISpec} />
          </div>
        )}

        {/* 7. MCP APPS */}
        {activeTab === 'mcp_apps' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-semibold text-[#F1EEE7]">MCP Apps Isolées</h3>
                <p className="text-[12px] text-[#7E8795] mt-0.5">
                  Applications interactives retournées par les outils MCP compatibles, isolées dans un environnement sécurisé.
                </p>
              </div>
            </div>

            {mcpApps.map((app) => (
              <MCPAppRunner key={app.id} app={app} />
            ))}
          </div>
        )}

        {/* 8. COMMERCE AP2 / UCP (ÑKYEL PAY) */}
        {activeTab === 'commerce' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#0E121A] border border-[#D98E3B]/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#D98E3B]/20 text-[#D98E3B] flex items-center justify-center font-bold">
                    <CreditCard size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#F1EEE7]">Ñkyel Pay (AP2 & UCP)</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#D98E3B]/20 text-[#D98E3B] font-semibold uppercase">
                      Prévu & Expérimental
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-[#7E8795] leading-relaxed">
                Le protocole AP2 (Agent Payment Protocol) garantit qu'aucun paiement ne peut être exécuté par un agent sans un mandat explicite et une signature humaine préalable.
              </p>

              <div className="pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    requestPaymentMandate({
                      intentId: `intent_${Date.now()}`,
                      missionId: `mission_pay_demo`,
                      agentId: 'agent_strategist',
                      merchantName: 'Abonnement Données Marchés Bloomberg/Tavily',
                      amount: 45.0,
                      currency: 'EUR',
                      purpose: 'Accès API haute fréquence pour audit d\'investissement souverain',
                      isExperimental: true,
                      requiresExplicitHumanApproval: true,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D98E3B] hover:bg-[#D98E3B]/90 text-black text-[12px] font-semibold transition-colors"
                >
                  Simuler Intention de Paiement AP2
                </button>
              </div>

              {/* Active Payment Mandate Modal Simulation */}
              {activePaymentMandate && (
                <div className="p-4 rounded-xl bg-[#151922] border border-[#D98E3B]/40 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#D98E3B] uppercase tracking-wider">
                      Mandat d'Autorisation AP2 Requis
                    </span>
                    <span className="text-[11px] font-mono text-[#F1EEE7] font-bold">
                      {activePaymentMandate.amount} {activePaymentMandate.currency}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#B8C0CC]">
                    Marchand : <span className="font-semibold text-white">{activePaymentMandate.merchantName}</span>
                    <br />
                    Objet : {activePaymentMandate.purpose}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    {activePaymentMandate.status === 'approved' ? (
                      <span className="text-[12px] text-[#6F9485] font-semibold flex items-center gap-1">
                        <CheckCircle size={15} weight="fill" /> Mandat signé & approuvé ({activePaymentMandate.receiptId})
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => approvePaymentMandate(activePaymentMandate.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#6F9485] hover:bg-[#6F9485]/90 text-white text-[12px] font-semibold transition-colors"
                        >
                          Signer & Autoriser le Mandat
                        </button>
                        <button
                          onClick={() => cancelPaymentMandate(activePaymentMandate.id, 'Annulation utilisateur')}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[#F1EEE7] text-[12px] font-semibold transition-colors"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. SÉCURITÉ & GOUVERNANCE */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} weight="fill" className="text-[#6F9485]" />
                <h3 className="text-base font-semibold text-[#F1EEE7]">Sécurité, Allowlist & Caviardage</h3>
              </div>
              <p className="text-[12px] text-[#7E8795]">
                Tous les flux sortants sont filtrés par la liste blanche réseau stricte (MCP Allowlist). Les clés privées et secrets sont automatiquement caviardés avant toute émission dans le WorkGraph.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#08090D] border border-white/[0.04] space-y-2">
                  <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
                    Allowlist Réseau Active
                  </h4>
                  <ul className="text-[12px] font-mono text-[#6F9485] space-y-1">
                    <li>✓ *.google.com / *.googleapis.com</li>
                    <li>✓ *.tavily.com</li>
                    <li>✓ *.neon.tech</li>
                    <li>✓ *.vercel.app / vercel.com</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#08090D] border border-white/[0.04] space-y-2">
                  <h4 className="text-[12px] font-semibold text-[#B8C0CC] uppercase tracking-wider">
                    Garanties Cryptographiques
                  </h4>
                  <ul className="text-[12px] text-[#7E8795] space-y-1">
                    <li>• Chiffrement AES-256 en transit et au repos</li>
                    <li>• Checkpoints immuables rejouables</li>
                    <li>• Audit log certifié de chaque appel d'outil</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: AJOUTER SERVEUR MCP ── */}
      {isAddServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0E121A] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-[#F1EEE7]">Connecter un Serveur MCP</h3>
              <button onClick={() => setIsAddServerOpen(false)} className="text-[#7E8795] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">Nom du serveur :</label>
                <input
                  type="text"
                  placeholder="Ex: GitHub MCP, SQLite Server..."
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">Transport :</label>
                <select
                  value={newServerTransport}
                  onChange={(e) => setNewServerTransport(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white focus:outline-none"
                >
                  <option value="stdio">Local Stdio (CLI / uvx / npx)</option>
                  <option value="sse">Distant SSE (URL HTTPS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">
                  {newServerTransport === 'stdio' ? 'Commande / Package :' : 'URL Distante :'}
                </label>
                <input
                  type="text"
                  placeholder={newServerTransport === 'stdio' ? 'npx -y @modelcontextprotocol/server-sqlite' : 'https://mcp.example.com/sse'}
                  value={newServerEndpoint}
                  onChange={(e) => setNewServerEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setIsAddServerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[13px] text-[#F1EEE7]"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!newServerName) return;
                  addMCPServer({
                    id: `mcp_${Date.now()}`,
                    name: newServerName,
                    version: '1.0.0',
                    transport: newServerTransport,
                    endpoint: newServerTransport === 'sse' ? newServerEndpoint : undefined,
                    command: newServerTransport === 'stdio' ? newServerEndpoint : undefined,
                    status: 'connected',
                    latencyMs: 32,
                    scopes: ['custom:read'],
                    errorCount: 0,
                    appsCount: 0,
                    provenance: 'Serveur Utilisateur Personnalisé',
                    tools: [],
                    resources: [],
                    resourceTemplates: [],
                    prompts: [],
                  });
                  setIsAddServerOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/90 text-white font-semibold text-[13px]"
              >
                Connecter le Serveur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CRÉER SKILL.md ── */}
      {isCreateSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0E121A] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-[#F1EEE7]">Créer un Nouveau Skill (SKILL.md)</h3>
              <button onClick={() => setIsCreateSkillOpen(false)} className="text-[#7E8795] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">Nom du Skill :</label>
                <input
                  type="text"
                  placeholder="Ex: Analyse de Solvabilité Bancaire"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">Description courte :</label>
                <input
                  type="text"
                  placeholder="Ex: Évalue les ratios de liquidité et de levier financier..."
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#7E8795] mb-1">Instructions SKILL.md (Markdown) :</label>
                <textarea
                  rows={6}
                  placeholder={`# Skill: Analyse...\n\nInstructions détaillées pour le modèle lors de la mission...`}
                  value={newSkillInstructions}
                  onChange={(e) => setNewSkillInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-[13px] text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setIsCreateSkillOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[13px] text-[#F1EEE7]"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!newSkillName) return;
                  addSkill({
                    id: `skill_${Date.now()}`,
                    name: newSkillName,
                    slug: newSkillName.toLowerCase().replace(/\s+/g, '-'),
                    description: newSkillDesc,
                    version: '1.0.0',
                    author: 'Utilisateur Ñkyel Souverain',
                    compatibility: 'Ñkyel 2.0+',
                    status: 'active',
                    isOfficial: false,
                    usageCount: 0,
                    successRatePercent: 100,
                    tags: ['custom'],
                    permissions: [
                      { id: 'p1', scope: 'analysis:custom', reason: 'Exécution du Skill', isSensitive: false },
                    ],
                    scripts: [],
                    references: [],
                    assets: [],
                    instructionsMarkdown: newSkillInstructions || `# Skill: ${newSkillName}\n\nInstructions par défaut.`,
                  });
                  setIsCreateSkillOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#C39A52] hover:bg-[#C39A52]/90 text-black font-semibold text-[13px]"
              >
                Enregistrer le Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
