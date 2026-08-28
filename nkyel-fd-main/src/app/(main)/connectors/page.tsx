/**
 * Ñkyel AI · Connecteurs Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Professional Connectors, MCP & MCP Server Catalog:
 * 1. Applications (Google, Microsoft, Notion, Slack, GitHub, Linear, Stripe, PostgreSQL, Supabase...)
 * 2. MCP (Model Context Protocol client tools & native integrations)
 * 3. MCP Servers (Custom stdio / Streamable HTTP / SSE servers with live test wizard)
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  PlugsConnected,
  PuzzlePiece,
  Database,
  MagnifyingGlass,
  Plus,
  CheckCircle,
  SlidersHorizontal,
  Sparkle,
  HardDrives,
  TrendUp,
  FileText,
  Browsers,
  VideoCamera,
  Target,
  ShieldCheck,
  Check,
  Terminal,
  Globe,
  ArrowSquareOut,
  Trash,
  ArrowClockwise,
  CloudCheck,
  Cpu,
  CaretRight,
} from '@phosphor-icons/react';
import { useConnectorsStore, type ConnectorItem } from '@/stores/connectors.store';
import ConnectorCard from '@/components/connectors/ConnectorCard';
import ConnectorDetailSheet from '@/components/connectors/ConnectorDetailSheet';
import MCPServerModal, { type MCPServerConfig } from '@/components/connectors/MCPServerModal';

export type ConnectorsActiveTab = 'apps' | 'mcp' | 'mcp_servers';

const ALL_CATEGORIES = [
  'Tous',
  'Productivité',
  'Cloud',
  'Développement',
  'Base de données',
  'Communication',
  'CRM & Ventes',
  'Finance',
  'Recherche & Data',
  'Stockage',
  'Design & Média',
  'Entreprise',
];

const INITIAL_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp_postgres_prod',
    name: 'PostgreSQL Enterprise Hub',
    description: 'Accès sécurisé en lecture seule aux schémas analytiques et tables relationnelles.',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-postgres',
    enabled: true,
    status: 'connected',
    discoveredToolsCount: 6,
    lastPingMs: 12,
  },
  {
    id: 'mcp_github_gateway',
    name: 'GitHub Repository Gateway',
    description: 'Gestion des pull requests, commits, issues et navigation d’arborescence Git.',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-github',
    enabled: true,
    status: 'connected',
    discoveredToolsCount: 14,
    lastPingMs: 24,
  },
  {
    id: 'mcp_brave_search',
    name: 'Brave Search Live Feed',
    transport: 'streamable-http',
    url: 'https://mcp.brave.com/v1',
    description: 'Indexation web mondiale indépendante et extraction de contenu sans pistage.',
    enabled: true,
    status: 'connected',
    discoveredToolsCount: 3,
    lastPingMs: 45,
  },
  {
    id: 'mcp_filesystem_sandbox',
    name: 'Sandbox Filesystem Workspace',
    description: 'Lecture et écriture d’artefacts dans le répertoire de travail /workspace.',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-filesystem',
    enabled: true,
    status: 'connected',
    discoveredToolsCount: 8,
    lastPingMs: 8,
  },
];

export default function ConnectorsPage() {
  const {
    connectors,
    skills,
    selectedConnectorId,
    searchQuery,
    setSearchQuery,
    setSelectedConnectorId,
    connectConnector,
    disconnectConnector,
  } = useConnectorsStore();

  const [activeTab, setActiveTab] = useState<ConnectorsActiveTab>('apps');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [showAllConnectors, setShowAllConnectors] = useState(false);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>(INITIAL_MCP_SERVERS);

  // Filtered applications
  const filteredConnectors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return connectors.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.capabilities.some((cap) => cap.toLowerCase().includes(q));

      const matchCat =
        selectedCategory === 'Tous' ||
        c.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCat;
    });
  }, [connectors, searchQuery, selectedCategory]);

  const popularConnectors = useMemo(() => {
    return filteredConnectors.slice(0, 6);
  }, [filteredConnectors]);

  const remainingConnectors = useMemo(() => {
    return filteredConnectors.slice(6);
  }, [filteredConnectors]);

  const handleSaveMCPServer = (server: MCPServerConfig) => {
    setMcpServers((prev) => [server, ...prev]);
  };

  const handleDeleteServer = (id: string) => {
    setMcpServers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleServer = (id: string) => {
    setMcpServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      <MCPServerModal
        isOpen={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
        onSaveServer={handleSaveMCPServer}
      />

      {/* ═══════════════════════════════════════════════════
         TOP HEADER
         ═══════════════════════════════════════════════════ */}
      <div className="shrink-0 p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-muted)]">
                <PlugsConnected size={18} weight="bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Connecteurs & Protocoles
              </h1>
            </div>
            <p className="text-xs mt-1 text-[var(--text-secondary)]">
              Étendez les pouvoirs de votre agent avec des applications SaaS, le Model Context Protocol (MCP) et vos serveurs personnalisés.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'mcp_servers' ? (
              <button
                type="button"
                onClick={() => setIsAddServerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus size={14} weight="bold" />
                <span>Ajouter un Serveur MCP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddServerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--hover)] transition-all"
              >
                <Plus size={14} />
                <span>Serveur MCP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         3 FIRST-CLASS TABS & SEARCH
         ═══════════════════════════════════════════════════ */}
      <div className="shrink-0 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'apps', label: 'Applications', icon: PlugsConnected, count: connectors.length },
              { id: 'mcp', label: 'Outils MCP', icon: Cpu, count: 18 },
              { id: 'mcp_servers', label: 'MCP Servers', icon: Terminal, count: mcpServers.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ConnectorsActiveTab)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <Icon size={15} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-[var(--accent)]' : ''} />
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                        : 'bg-[var(--surface-raised)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher intégrations, MCP, serveurs…"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         TAB CONTENT
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* TAB 1: APPLICATIONS */}
          {activeTab === 'apps' && (
            <>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-muted)] font-semibold'
                          : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Popular Connectors Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <Sparkle size={14} weight="fill" className="text-[var(--accent)]" />
                    <span>Connecteurs Populaires</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularConnectors.map((conn) => (
                    <ConnectorCard
                      key={conn.id}
                      connector={conn}
                      onSelect={setSelectedConnectorId}
                      onConnect={connectConnector}
                    />
                  ))}
                </div>
              </div>

              {/* Progressive Disclosure "Voir plus" */}
              {remainingConnectors.length > 0 && (
                <div>
                  {!showAllConnectors ? (
                    <div className="text-center py-4 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => setShowAllConnectors(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-muted)] hover:text-[var(--accent)] transition-all"
                      >
                        <span>Voir tout le catalogue ({remainingConnectors.length} autres connecteurs)</span>
                        <CaretRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Tous les connecteurs du catalogue
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {remainingConnectors.map((conn) => (
                          <ConnectorCard
                            key={conn.id}
                            connector={conn}
                            onSelect={setSelectedConnectorId}
                            onConnect={connectConnector}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: MCP CLIENT TOOLS */}
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-[var(--accent-muted)] bg-[var(--accent-subtle)]/20 flex items-start gap-4">
                <Cpu size={24} className="text-[var(--accent)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Model Context Protocol (MCP) — Client Intégré
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Le standard ouvert d’Anthropic / Linux Foundation est nativement pris en charge par le moteur d’orchestration Ñkyel.
                    Vos agents appellent dynamiquement les outils et accèdent aux ressources exposées par les serveurs connectés.
                  </p>
                </div>
              </div>

              {/* Grid of Discovered MCP Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'execute_sql_query', srv: 'PostgreSQL Enterprise', desc: 'Exécute des requêtes de lecture avec validation AST de sécurité.' },
                  { name: 'create_pull_request', srv: 'GitHub Repository Gateway', desc: 'Génère une PR automatisée avec description enrichie.' },
                  { name: 'web_search_brave', srv: 'Brave Search Feed', desc: 'Recherche Web temps réel sans biais publicitaire.' },
                  { name: 'read_workspace_file', srv: 'Filesystem Sandbox', desc: 'Lit un document ou code source localement.' },
                  { name: 'write_workspace_artifact', srv: 'Filesystem Sandbox', desc: 'Enregistre un livrable généré dans /workspace.' },
                  { name: 'list_database_tables', srv: 'PostgreSQL Enterprise', desc: 'Inspecte les métadonnées et types de colonnes.' },
                ].map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--accent)]">
                        {tool.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                        outil MCP
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {tool.desc}
                    </p>
                    <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] font-mono">
                      Fourni par : <span className="text-[var(--text-primary)]">{tool.srv}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MCP SERVERS */}
          {activeTab === 'mcp_servers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Serveurs MCP Enregistrés ({mcpServers.length})
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Gérez les processus locaux (stdio) et endpoints distants (HTTP / SSE) connectés à Ñkyel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddServerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 transition-all"
                >
                  <Plus size={14} weight="bold" />
                  <span>Nouveau Serveur</span>
                </button>
              </div>

              {/* MCP Server Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mcpServers.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center">
                            {srv.transport === 'stdio' ? <Terminal size={20} /> : <Globe size={20} />}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">
                              {srv.name}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] uppercase">
                              {srv.transport}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleServer(srv.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              srv.enabled
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                            }`}
                          >
                            {srv.enabled ? 'Actif' : 'Désactivé'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteServer(srv.id)}
                            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Supprimer le serveur"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-3">
                        {srv.description}
                      </p>

                      {srv.command && (
                        <div className="mt-2.5 p-2 rounded-lg bg-[var(--surface-sunken)] font-mono text-[11px] text-[var(--text-secondary)] truncate border border-[var(--border-subtle)]">
                          $ {srv.command}
                        </div>
                      )}
                      {srv.url && (
                        <div className="mt-2.5 p-2 rounded-lg bg-[var(--surface-sunken)] font-mono text-[11px] text-[var(--text-secondary)] truncate border border-[var(--border-subtle)]">
                          Endpoint : {srv.url}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                        <span>{srv.discoveredToolsCount} outils disponibles</span>
                      </div>
                      {srv.lastPingMs && (
                        <span className="font-mono text-[10px]">
                          Latence : {srv.lastPingMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
