/**
 * Nkyel AI — Accessible Outline
 *
 * Linear, text-based view of the Canonical Work Graph.
 * Alternative to the spatial React Flow canvas for:
 * - Screen readers and assistive technology
 * - Low-bandwidth connections
 * - Debugging and inspection
 *
 * @version 1.0.0
 */

'use client';

import React, { useMemo, useState } from 'react';
import type { WorkNode, WorkEdge, WorkNodeType, WorkNodeStatus } from '@/lib/nkyel/work-graph.types';
import { eventStore } from '@/lib/nkyel/event-store';
import './accessible-outline.css';

// --- Display Helpers ------------------------------------

const NODE_LABELS: Record<WorkNodeType, string> = {
  goal: '🎯 Objectif',
  plan: '📋 Plan',
  task: '📌 Tâche',
  agent: '🤖 Agent',
  tool_call: '🔧 Appel outil',
  source: '📎 Source',
  evidence: '🔗 Preuve',
  claim: '💡 Affirmation',
  hypothesis: '🔬 Hypothèse',
  scenario: '📊 Scénario',
  decision: '⚖️ Décision',
  artifact: '📄 Artefact',
  approval: '✋ Approbation',
  checkpoint: '💾 Checkpoint',
  error: '❌ Erreur',
  // Protocol extensions
  mcp_tool: '🔌 Outil MCP',
  mcp_app: '📦 App MCP',
  skill: '⚡ Compétence Skill',
  a2a_agent: '🤝 Agent A2A',
  agui_stream: '🌊 Flux AG-UI',
  a2ui_surface: '🖥️ Surface A2UI',
  ap2_payment: '💳 Paiement AP2',
  ucp_commerce: '🛒 Commerce UCP',
  google_tool: '🌐 Outil Google',
  workspace_doc: '📁 Doc Workspace',
  firebase_deploy: '🔥 Déploiement Firebase',
};

const STATUS_LABELS: Record<WorkNodeStatus, string> = {
  pending: '⏳ En attente',
  active: '⚡ Actif',
  completed: '✅ Terminé',
  failed: '❌ Échoué',
  cancelled: '🚫 Annulé',
  blocked: '🔒 Bloqué',
  waiting_approval: '✋ Approbation requise',
};

const STATUS_CLASSES: Record<WorkNodeStatus, string> = {
  pending: 'outline-node--pending',
  active: 'outline-node--active',
  completed: 'outline-node--completed',
  failed: 'outline-node--failed',
  cancelled: 'outline-node--cancelled',
  blocked: 'outline-node--blocked',
  waiting_approval: 'outline-node--waiting',
};

// --- Types ----------------------------------------------

interface AccessibleOutlineProps {
  /** Run ID to display */
  runId: string;
  /** Optional: reconstruct graph up to this sequence number */
  upToSequence?: number;
  /** Callback when user clicks a node */
  onNodeClick?: (nodeId: string) => void;
  /** Whether to group nodes by type */
  groupByType?: boolean;
}

// --- Component ------------------------------------------

export default function AccessibleOutline({
  runId,
  upToSequence,
  onNodeClick,
  groupByType = false,
}: AccessibleOutlineProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<WorkNodeType | 'all'>('all');

  // Reconstruct graph from event store
  const graph = useMemo(() => {
    return eventStore.reconstructGraph(runId, upToSequence);
  }, [runId, upToSequence]);

  const nodes = useMemo(() => {
    const allNodes = Array.from(graph.nodes.values());
    if (filter === 'all') return allNodes;
    return allNodes.filter(n => n.type === filter);
  }, [graph, filter]);

  const edges = useMemo(() => {
    return Array.from(graph.edges.values());
  }, [graph]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(nodes.map(n => n.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Group by type if requested
  const groupedNodes = useMemo(() => {
    if (!groupByType) return { all: nodes };
    const groups: Record<string, WorkNode[]> = {};
    for (const node of nodes) {
      const key = node.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(node);
    }
    return groups;
  }, [nodes, groupByType]);

  // Get connected edges for a node
  const getNodeEdges = (nodeId: string) => {
    return edges.filter(e => e.sourceId === nodeId || e.targetId === nodeId);
  };

  // Get node title by ID
  const getNodeTitle = (id: string) => {
    const node = graph.nodes.get(id);
    return node?.title || id;
  };

  // Active node types for filter
  const activeTypes = useMemo(() => {
    const types = new Set<WorkNodeType>();
    for (const node of Array.from(graph.nodes.values())) {
      types.add(node.type);
    }
    return Array.from(types);
  }, [graph]);

  if (nodes.length === 0) {
    return (
      <div className="accessible-outline accessible-outline--empty" role="region" aria-label="Vue linéaire du graphe de travail">
        <p>Aucun nœud dans le graphe.</p>
      </div>
    );
  }

  return (
    <div className="accessible-outline" role="region" aria-label="Vue linéaire du graphe de travail">
      {/* Toolbar */}
      <div className="outline-toolbar" role="toolbar" aria-label="Contrôles de la vue linéaire">
        <div className="outline-toolbar__left">
          <h3 className="outline-toolbar__title">📝 Vue Linéaire</h3>
          <span className="outline-toolbar__count">{nodes.length} nœuds</span>
        </div>

        <div className="outline-toolbar__right">
          {/* Type filter */}
          <select
            className="outline-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as WorkNodeType | 'all')}
            aria-label="Filtrer par type"
          >
            <option value="all">Tous les types</option>
            {activeTypes.map(t => (
              <option key={t} value={t}>{NODE_LABELS[t] || t}</option>
            ))}
          </select>

          <button className="outline-btn" onClick={expandAll} aria-label="Tout déplier">
            ↕️ Déplier
          </button>
          <button className="outline-btn" onClick={collapseAll} aria-label="Tout replier">
            ↔️ Replier
          </button>
        </div>
      </div>

      {/* Node list */}
      <div className="outline-list" role="list">
        {Object.entries(groupedNodes).map(([groupKey, groupNodes]) => (
          <React.Fragment key={groupKey}>
            {groupByType && groupKey !== 'all' && (
              <div className="outline-group-header" role="heading" aria-level={4}>
                {NODE_LABELS[groupKey as WorkNodeType] || groupKey}
                <span className="outline-group-count">({groupNodes.length})</span>
              </div>
            )}

            {groupNodes.map((node) => {
              const isExpanded = expandedNodes.has(node.id);
              const nodeEdges = getNodeEdges(node.id);
              const statusClass = STATUS_CLASSES[node.status] || '';

              return (
                <div
                  key={node.id}
                  className={`outline-node ${statusClass}`}
                  role="listitem"
                >
                  <button
                    className="outline-node__header"
                    onClick={() => toggleExpand(node.id)}
                    aria-expanded={isExpanded}
                    aria-label={`${NODE_LABELS[node.type]} : ${node.title}`}
                  >
                    <span className="outline-node__expand">{isExpanded ? '▼' : '▶'}</span>
                    <span className="outline-node__type">{NODE_LABELS[node.type] || node.type}</span>
                    <span className="outline-node__title">{node.title}</span>
                    <span className="outline-node__status">{STATUS_LABELS[node.status]}</span>
                  </button>

                  {isExpanded && (
                    <div className="outline-node__details">
                      {node.summary && (
                        <p className="outline-node__summary">{node.summary}</p>
                      )}

                      <dl className="outline-node__meta">
                        <dt>ID</dt>
                        <dd><code>{node.id}</code></dd>

                        <dt>Provenance</dt>
                        <dd>{node.provenance}</dd>

                        {node.provider && (
                          <>
                            <dt>Fournisseur</dt>
                            <dd>{node.provider} {node.model && `(${node.model})`}</dd>
                          </>
                        )}

                        {node.latencyMs !== undefined && (
                          <>
                            <dt>Latence</dt>
                            <dd>{node.latencyMs}ms</dd>
                          </>
                        )}

                        {node.sourceRef && (
                          <>
                            <dt>Source</dt>
                            <dd>
                              <a href={node.sourceRef} target="_blank" rel="noopener noreferrer" className="outline-link">
                                {node.sourceRef.length > 60 ? node.sourceRef.substring(0, 57) + '...' : node.sourceRef}
                              </a>
                            </dd>
                          </>
                        )}
                      </dl>

                      {/* Connected edges */}
                      {nodeEdges.length > 0 && (
                        <div className="outline-node__edges">
                          <span className="outline-edges-label">Connexions :</span>
                          {nodeEdges.map(edge => {
                            const targetId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
                            const direction = edge.sourceId === node.id ? '→' : '←';
                            return (
                              <button
                                key={edge.id}
                                className="outline-edge-pill"
                                onClick={() => onNodeClick?.(targetId)}
                              >
                                {direction} {edge.type}: {getNodeTitle(targetId)}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Click to select in canvas */}
                      {onNodeClick && (
                        <button
                          className="outline-node__select"
                          onClick={() => onNodeClick(node.id)}
                        >
                          Voir sur le canvas →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
