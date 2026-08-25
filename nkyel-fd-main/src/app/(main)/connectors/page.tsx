/**
 * Ñkyel AI · Connectors Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Professional Connectors, Skills & Data Sources Workspace.
 * Google First integration, truthful states, zero technical protocol jargon.
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
} from '@phosphor-icons/react';
import { useConnectorsStore, type ConnectorItem, type SkillItem } from '@/stores/connectors.store';
import ConnectorCard from '@/components/connectors/ConnectorCard';
import ConnectorDetailSheet from '@/components/connectors/ConnectorDetailSheet';
import CreateSkillModal from '@/components/connectors/CreateSkillModal';

const CATEGORIES = [
  'All',
  'Google',
  'Productivity',
  'Communication',
  'Developer',
  'Research',
  'Data',
  'Marketing',
];

const SKILL_ICON_MAP: Record<string, React.ComponentType<any>> = {
  MagnifyingGlass,
  Presentation: Browsers,
  TrendUp,
  Target,
  Browsers,
  VideoCamera,
  PuzzlePiece,
};

export default function ConnectorsPage() {
  const {
    connectors,
    skills,
    dataSources,
    selectedConnectorId,
    activeTab,
    searchQuery,
    selectedCategory,
    setActiveTab,
    setSearchQuery,
    setSelectedCategory,
    setSelectedConnectorId,
    connectConnector,
    disconnectConnector,
    toggleSkill,
    addCustomSkill,
  } = useConnectorsStore();

  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false);

  // Filtered connectors
  const filteredConnectors = useMemo(() => {
    return connectors.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' ||
        c.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Google' && c.isGoogle);

      return matchesSearch && matchesCat;
    });
  }, [connectors, searchQuery, selectedCategory]);

  // Connected connectors subset
  const connectedList = useMemo(() => {
    return connectors.filter((c) => c.status === 'CONNECTED');
  }, [connectors]);

  // Google first subset
  const googleList = useMemo(() => {
    return filteredConnectors.filter((c) => c.isGoogle);
  }, [filteredConnectors]);

  // Non-Google filtered subset
  const otherList = useMemo(() => {
    return filteredConnectors.filter((c) => !c.isGoogle);
  }, [filteredConnectors]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [skills, searchQuery]);

  // Filtered data sources
  const filteredDataSources = useMemo(() => {
    return dataSources.filter((d) => {
      return (
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [dataSources, searchQuery]);

  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId) || null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* ═══════════════════════════════════════════════════
         TOP HEADER & CONTROLS
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 p-6"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-raised)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <PlugsConnected size={18} weight="bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Connexions
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Connectez les services, capacités et sources que Ñkyel peut utiliser dans vos missions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateSkillOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = 'var(--accent-hover)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              <Plus size={14} weight="bold" />
              <span>Nouvelle capacité</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         TAXONOMY TABS & SEARCH BAR
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 px-6 py-3"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Taxonomy Navigation */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            {[
              { id: 'connectors', label: 'Applications', icon: PlugsConnected, count: connectors.length },
              { id: 'skills', label: 'Capacités', icon: Sparkle, count: skills.length },
              { id: 'data_sources', label: 'Sources', icon: Database, count: dataSources.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--surface-raised)' : 'transparent',
                    border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  }}
                >
                  <Icon size={14} weight={isActive ? 'fill' : 'regular'} style={{ color: isActive ? 'var(--accent)' : 'inherit' }} />
                  <span>{tab.label}</span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.2 rounded-full"
                    style={{
                      background: isActive ? 'var(--accent-subtle)' : 'var(--surface-raised)',
                      color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher intégrations, compétences..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border outline-none text-xs"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         MAIN SCROLLABLE CONTENT
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 1. TAB: CONNECTORS */}
          {activeTab === 'connectors' && (
            <>
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                      style={{
                        background: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--accent-muted)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {cat === 'All' ? 'Tous les connecteurs' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Connected Active Section */}
              {connectedList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      <CheckCircle size={14} weight="fill" style={{ color: 'var(--success, #22c55e)' }} />
                      <span>Intégrations Connectées ({connectedList.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connectedList.map((conn) => (
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

              {/* Google First-Class Section */}
              {googleList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      <HardDrives size={14} style={{ color: 'var(--accent)' }} />
                      <span>Google Workspace & Outils Cloud</span>
                    </h3>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      Intégrations natives souveraines
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {googleList.map((conn) => (
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

              {/* Other Professional Connectors */}
              {otherList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Développement & Productivité
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherList.map((conn) => (
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

              {filteredConnectors.length === 0 && (
                <div
                  className="p-12 text-center rounded-2xl"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px dashed var(--border-strong)',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Aucun connecteur trouvé pour &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Essayez un autre mot-clé ou réinitialisez les filtres.
                  </p>
                </div>
              )}
            </>
          )}

          {/* 2. TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Catalogue de Compétences Recommandées
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Activez des modules d&apos;expertise spécialisés directement utilisables par votre agent.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => {
                  const Icon = SKILL_ICON_MAP[skill.icon] || PuzzlePiece;
                  return (
                    <div
                      key={skill.id}
                      className="p-4 rounded-2xl flex flex-col justify-between"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-key)',
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: skill.enabled ? 'var(--accent-subtle)' : 'var(--surface)',
                                color: skill.enabled ? 'var(--accent)' : 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <Icon size={18} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                                {skill.name}
                              </h4>
                              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                {skill.category} • v{skill.version}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            style={{
                              background: skill.enabled ? 'rgba(34, 197, 94, 0.12)' : 'var(--surface)',
                              color: skill.enabled ? 'var(--success, #22c55e)' : 'var(--text-secondary)',
                              border: skill.enabled ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid var(--border-subtle)',
                            }}
                          >
                            {skill.enabled ? (
                              <>
                                <Check size={12} weight="bold" />
                                <span>Activé</span>
                              </>
                            ) : (
                              <span>Activer</span>
                            )}
                          </button>
                        </div>

                        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {skill.description}
                        </p>

                        <div className="space-y-1 text-[11px] pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          <div className="flex justify-between" style={{ color: 'var(--text-tertiary)' }}>
                            <span>Livrables :</span>
                            <span className="font-medium truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>
                              {skill.outputs.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. TAB: DATA SOURCES */}
          {activeTab === 'data_sources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Flux & Bases de Données Référencées
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Sources documentaires et financières certifiées en lecture seule pour alimenter les missions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDataSources.map((ds) => (
                  <div
                    key={ds.id}
                    className="p-4 rounded-2xl flex items-start justify-between gap-4"
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <Database size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {ds.name}
                          </h4>
                          <span
                            className="text-[10px] px-2 py-0.2 rounded-full font-semibold"
                            style={{
                              background: ds.status === 'CONNECTED' ? 'rgba(34, 197, 94, 0.12)' : 'var(--surface)',
                              color: ds.status === 'CONNECTED' ? 'var(--success, #22c55e)' : 'var(--text-tertiary)',
                            }}
                          >
                            {ds.status === 'CONNECTED' ? 'Disponible' : 'Sur demande'}
                          </span>
                        </div>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {ds.description}
                        </p>
                        {ds.recordsCount && (
                          <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            <span>Volume : {ds.recordsCount}</span>
                            {ds.lastUpdated && <span>• Mis à jour : {ds.lastUpdated}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Detail Sheet */}
      <ConnectorDetailSheet
        connector={selectedConnector}
        isOpen={Boolean(selectedConnectorId)}
        onClose={() => setSelectedConnectorId(null)}
        onConnect={connectConnector}
        onDisconnect={disconnectConnector}
      />

      {/* Visual Skill Creator Modal */}
      <CreateSkillModal
        isOpen={isCreateSkillOpen}
        onClose={() => setIsCreateSkillOpen(false)}
        onCreate={addCustomSkill}
      />
    </div>
  );
}
