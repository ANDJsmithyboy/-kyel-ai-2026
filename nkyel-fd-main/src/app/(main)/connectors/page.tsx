/**
 * Ñkyel AI · Connectors Workspace (Section 33–53 Master Visual Polish)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Geometric discipline:
 * - Mobile: near-fullscreen modal/sheet aesthetic, 1-column cards
 * - Header: Connectors title (24–28px) + close button
 * - Search bar: 48–52px height, 14–18px radius immediately below header
 * - Tabs: Applications, Custom API, MCP Servers, Projects
 * - Create control: Create ˅ menu
 * - Bottom catalog demand suggestion
 */

'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlugsConnected,
  Cpu,
  Terminal,
  FolderSimple,
  MagnifyingGlass,
  Plus,
  CaretDown,
  X,
  Sparkle,
  Globe,
  Trash,
  CheckCircle,
  PaperPlaneTilt,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { useConnectorsStore, type ConnectorItem } from '@/stores/connectors.store';
import { useLanguageStore } from '@/stores/language.store';
import ConnectorCard from '@/components/connectors/ConnectorCard';
import ConnectorDetailSheet from '@/components/connectors/ConnectorDetailSheet';
import MCPServerModal, { type MCPServerConfig } from '@/components/connectors/MCPServerModal';
import PageContainer from '@/components/layout/PageContainer';

export type ConnectorsActiveTab = 'apps' | 'custom_api' | 'mcp_servers' | 'projects';

const INITIAL_MCP_SERVERS: MCPServerConfig[] = [];

export default function ConnectorsPage() {
  const router = useRouter();
  const { t, uiLocale } = useLanguageStore();
  const isFr = uiLocale?.startsWith('fr');

  const {
    connectors,
    selectedConnectorId,
    searchQuery,
    setSearchQuery,
    setSelectedConnectorId,
    connectConnector,
    disconnectConnector,
    fetchConnectors,
  } = useConnectorsStore();

  const [activeTab, setActiveTab] = useState<ConnectorsActiveTab>('apps');
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [suggestComment, setSuggestComment] = useState('');
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>(INITIAL_MCP_SERVERS);

  const createMenuRef = useRef<HTMLDivElement>(null);

  // Fetch real connectors / providers on mount
  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  // Close create menu on click outside
  useEffect(() => {
    if (!createMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [createMenuOpen]);

  // Filtered connectors
  const filteredConnectors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return connectors;
    return connectors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.capabilities.some((cap) => cap.toLowerCase().includes(q))
    );
  }, [connectors, searchQuery]);

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

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestInput.trim()) return;
    // Persist connector demand to local storage/API
    try {
      const existing = JSON.parse(localStorage.getItem('nkyel_connector_demands') || '[]');
      existing.push({
        connector: suggestInput.trim(),
        comment: suggestComment.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('nkyel_connector_demands', JSON.stringify(existing));
    } catch {}
    setSuggestSubmitted(true);
    setTimeout(() => {
      setIsSuggestModalOpen(false);
      setSuggestSubmitted(false);
      setSuggestInput('');
      setSuggestComment('');
    }, 1500);
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      style={{ background: 'var(--material-canvas)' }}
    >
      <MCPServerModal
        isOpen={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
        onSaveServer={handleSaveMCPServer}
      />

      {/* Selected Connector Detail Sheet */}
      <ConnectorDetailSheet
        connector={connectors.find((c) => c.id === selectedConnectorId) || null}
        isOpen={Boolean(selectedConnectorId)}
        onClose={() => setSelectedConnectorId(null)}
        onConnect={connectConnector}
        onDisconnect={disconnectConnector}
      />

      {/* Connector Catalog Suggestion Modal (Section 52) */}
      {isSuggestModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSuggestModalOpen(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-[24px] bg-[var(--surface-raised)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('connectors.suggest') || 'Suggest a connector'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            {suggestSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle size={36} weight="fill" className="text-emerald-400 mx-auto" />
                <p className="font-semibold text-sm text-[var(--text-primary)]">
                  {t('connectors.suggestSubmitted') || 'Thank you! Your request has been recorded.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendSuggestion} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Connector Name or Service
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestInput}
                    onChange={(e) => setSuggestInput(e.target.value)}
                    placeholder="e.g. Canva, Airtable, HubSpot, Jira..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--control-bg)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Use Case (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={suggestComment}
                    onChange={(e) => setSuggestComment(e.target.value)}
                    placeholder="How would you like Ñkyel to use this connector?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--control-bg)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSuggestModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-[var(--hover)] text-[var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm active:scale-95 transition-all"
                  >
                    <PaperPlaneTilt size={14} weight="bold" />
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         MAIN CONTAINER (Standardized Wide PageContainer)
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <PageContainer variant="wide" className="space-y-4">
          {/* Header: Title + Close target */}
          <div className="shrink-0 flex items-start justify-between pb-1">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
                {isFr ? 'Connecteurs' : 'Connectors'}
              </h1>
              <p className="text-[13.5px] text-[var(--text-secondary)]">
                {isFr ? 'Connectez ñkyel à vos outils et données en quelques clics.' : 'Connect ñkyel to your tools and data in a few clicks.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors active:scale-95 border border-transparent hover:border-[var(--border)] bg-[var(--surface-raised)]"
              aria-label="Close"
              title="Close"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="shrink-0 relative">
            <MagnifyingGlass
              size={17}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFr ? 'Rechercher un connecteur...' : 'Search for a connector...'}
              className="w-full h-11 ps-10 pe-4 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-inset)] focus:bg-[var(--surface-raised)] text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-all shadow-inner-sm"
            />
          </div>

          {/* Categories / Navigation Tabs & Create Control (Section 37 & 38) */}
          <div className="shrink-0 flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-strong)]">
            {/* Horizontally scrollable category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0">
              {[
                { id: 'apps', label: isFr ? 'Applications' : 'Applications' },
                { id: 'custom_api', label: isFr ? 'APIs & services' : 'APIs & services' },
                { id: 'projects', label: isFr ? 'Passerelles' : 'Gateways' },
                { id: 'mcp_servers', label: isFr ? 'MCP & serveurs' : 'MCP & servers' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ConnectorsActiveTab)}
                    className={`relative px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors rounded-xl ${
                      isActive
                        ? 'text-[var(--text-primary)] border border-[var(--accent)] bg-[var(--surface-raised)]'
                        : 'text-[var(--text-secondary)] border border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Create ˅ Control (Section 38) */}
            <div className="relative shrink-0" ref={createMenuRef}>
              <button
                type="button"
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-[var(--text-primary)] border border-[var(--border)] transition-colors shadow-xs touch-manipulation min-h-[34px]"
              >
                <span>{t('connectors.create') || 'Create'}</span>
                <CaretDown size={12} className="opacity-60" />
              </button>

              {createMenuOpen && (
                <div className="absolute end-0 top-full mt-1.5 w-48 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] text-xs z-50 animate-scale-in">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      setIsAddServerOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start hover:bg-[var(--hover)] text-[var(--text-primary)]"
                  >
                    <Terminal size={15} className="text-[var(--accent)]" />
                    <span>MCP Server</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      setIsSuggestModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start hover:bg-[var(--hover)] text-[var(--text-primary)]"
                  >
                    <Globe size={15} className="text-emerald-400" />
                    <span>Custom API</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
             CONNECTOR LIST / TAB PANELS (Responsive Grid: 1 Col Mobile, 2-3 Col Desktop)
             ═══════════════════════════════════════════════════ */}
          <div className="py-2">
            {activeTab === 'apps' && (
              <div className="space-y-4">
                {connectors.length === 0 ? (
                  <div className="text-center py-20 px-4 space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/50 mt-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--control-bg)] border border-[var(--border-strong)] flex items-center justify-center mx-auto text-[var(--text-tertiary)] shadow-inner-sm">
                      <PlugsConnected size={24} weight="duotone" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {isFr ? 'Aucun connecteur disponible' : 'No connectors available'}
                      </h3>
                      <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
                        {isFr 
                          ? 'Le registre de connecteurs est actuellement vide. Veuillez configurer vos fournisseurs dans le backend.'
                          : 'The connector registry is currently empty. Please configure your providers in the backend.'}
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => fetchConnectors()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--control-bg)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--hover)] hover:border-[var(--border-strong)] transition-all shadow-xs"
                      >
                        <ArrowsClockwise size={14} weight="bold" />
                        <span>{isFr ? 'Rafraîchir le registre' : 'Refresh Registry'}</span>
                      </button>
                    </div>
                  </div>
                ) : filteredConnectors.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-tertiary)]">
                      <MagnifyingGlass size={20} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isFr ? 'Aucun résultat pour' : 'No connectors found matching'} &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSuggestModalOpen(true)}
                      className="inline-block text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      {isFr ? '+ Suggérer ce connecteur' : '+ Suggest this connector'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredConnectors.map((conn) => (
                      <ConnectorCard
                        key={conn.id}
                        connector={conn}
                        onSelect={setSelectedConnectorId}
                        onConnect={connectConnector}
                      />
                    ))}
                  </div>
                )}

                {/* Catalog Request Footer */}
                <div className="pt-8 pb-12 flex items-center justify-between mt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-tertiary)]">
                    <ArrowsClockwise size={15} weight="bold" />
                    <span>{filteredConnectors.length} connecteurs disponibles</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span>{connectors.filter(c => c.status === 'CONNECTED').length} connectés</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'custom_api' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--control-bg)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--accent)]">
                <Globe size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Custom OpenAPI / REST Connectors</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Connect your private backend APIs and enterprise endpoints directly into the Ñkyel intelligence loop.
              </p>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
              >
                Configure Custom Endpoint
              </button>
            </div>
          )}

          {activeTab === 'mcp_servers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Registered MCP Servers ({mcpServers.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddServerOpen(true)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <Plus size={12} weight="bold" />
                  <span>Add Server</span>
                </button>
              </div>

              {mcpServers.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-tertiary)]">
                    <Terminal size={20} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Aucun serveur MCP configuré.
                  </p>
                </div>
              ) : (
                mcpServers.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-raised)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--control-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center">
                        {srv.transport === 'stdio' ? <Terminal size={18} /> : <Globe size={18} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">{srv.name}</h4>
                        <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                          {srv.transport} · {srv.discoveredToolsCount} tools
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleServer(srv.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                          srv.enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {srv.enabled ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteServer(srv.id)}
                        className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete Server"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {srv.description}
                  </p>

                  {srv.command && (
                    <div className="p-2 rounded-lg bg-[var(--control-bg)] font-mono text-[11px] text-[var(--text-secondary)] truncate border border-[var(--border-subtle)]">
                      $ {srv.command}
                    </div>
                  )}
                </div>
              )))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--control-bg)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-tertiary)]">
                <FolderSimple size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Project Workspaces</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Group connectors, custom instructions, and mission histories per active project.
              </p>
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
              >
                View Projects
              </button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
    </div>
  );
}
