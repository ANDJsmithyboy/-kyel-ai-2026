/**
 * Ñkyel AI — Visual Workspace Canvas
 *
 * The spatial reasoning canvas that renders the Canonical Work Graph
 * using React Flow, driven by real events from the Event Store.
 *
 * @version 1.0.0
 */

'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge as RFEdge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import type { WorkNode, WorkEdge, WorkNodeType, NkyelEvent } from '@/lib/nkyel/work-graph.types';

// ─── Node Colors by Type ────────────────────────────────

const NODE_COLORS: Record<WorkNodeType, string> = {
  goal: '#C0A062',       // Gold
  plan: '#6B8AE0',       // Blue
  task: '#7C9AE8',       // Light blue
  agent: '#9B72CF',      // Purple
  tool_call: '#5BA3B5',  // Teal
  source: '#6EB86E',     // Green
  evidence: '#4CAF50',   // Vivid green
  claim: '#E8A838',      // Amber
  hypothesis: '#CF72A8', // Pink
  scenario: '#B56BD4',   // Violet
  decision: '#E0C054',   // Yellow gold
  artifact: '#72B8CF',   // Cyan
  approval: '#FFB74D',   // Orange
  checkpoint: '#90A4AE', // Grey-blue
  error: '#E57373',      // Red
};

const NODE_ICONS: Record<WorkNodeType, string> = {
  goal: '🎯',
  plan: '📋',
  task: '⚡',
  agent: '🤖',
  tool_call: '🔧',
  source: '📄',
  evidence: '✅',
  claim: '💬',
  hypothesis: '🔀',
  scenario: '🔮',
  decision: '⚖️',
  artifact: '📦',
  approval: '🔐',
  checkpoint: '💾',
  error: '❌',
};

const STATUS_INDICATORS: Record<string, string> = {
  pending: '○',
  active: '◉',
  completed: '●',
  failed: '✕',
  cancelled: '⊘',
  blocked: '◈',
  waiting_approval: '⊙',
};

// ─── Custom Node Component ──────────────────────────────

interface NkyelNodeData {
  workNode: WorkNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onBranch: (id: string) => void;
}

function NkyelNode({ data }: { data: NkyelNodeData }) {
  const { workNode, isSelected, onSelect, onEdit, onBranch } = data;
  const color = NODE_COLORS[workNode.type] || '#888';
  const icon = NODE_ICONS[workNode.type] || '◆';
  const statusIcon = STATUS_INDICATORS[workNode.status] || '○';

  return (
    <div
      className="nkyel-node"
      onClick={() => onSelect(workNode.id)}
      onDoubleClick={() => onEdit(workNode.id)}
      role="button"
      tabIndex={0}
      aria-label={`${workNode.type}: ${workNode.title}`}
      style={{
        borderColor: isSelected ? color : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected
          ? `0 0 24px ${color}40, 0 14px 60px rgba(0,0,0,0.24)`
          : '0 14px 60px rgba(0,0,0,0.24)',
      }}
    >
      {/* Header */}
      <div className="nkyel-node-header" style={{ color }}>
        <span className="nkyel-node-icon">{icon}</span>
        <span className="nkyel-node-type">{workNode.type.replace('_', ' ')}</span>
        <span className="nkyel-node-status" title={workNode.status}>{statusIcon}</span>
      </div>

      {/* Title */}
      <h3 className="nkyel-node-title">{workNode.title}</h3>

      {/* Summary */}
      {workNode.summary && (
        <p className="nkyel-node-summary">{workNode.summary}</p>
      )}

      {/* Provenance badge */}
      <div className="nkyel-node-footer">
        <span
          className="nkyel-provenance-badge"
          style={{ borderColor: `${color}40` }}
        >
          {workNode.provenance}
        </span>
        {workNode.provider && (
          <span className="nkyel-provider-badge">{workNode.provider}</span>
        )}
      </div>

      {/* Action buttons (visible on hover/select) */}
      {isSelected && (
        <div className="nkyel-node-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(workNode.id); }} title="Edit">
            ✏️
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBranch(workNode.id); }} title="Create branch">
            🔀
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Edge Type Colors ───────────────────────────────────

const EDGE_COLORS: Record<string, string> = {
  decomposes_into: '#6B8AE0',
  assigned_to: '#9B72CF',
  depends_on: '#E8A838',
  uses: '#5BA3B5',
  produces: '#4CAF50',
  supports: '#6EB86E',
  contradicts: '#E57373',
  derived_from: '#CF72A8',
  compares_with: '#B56BD4',
  selected: '#C0A062',
  rejected: '#E57373',
  blocked_by: '#FF5722',
  resumes_from: '#90A4AE',
};

// ─── Layout Engine ──────────────────────────────────────

function computeLayout(
  nodes: Map<string, WorkNode>,
  edges: Map<string, WorkEdge>
): { x: number; y: number }[] {
  const positions: Map<string, { x: number; y: number }> = new Map();
  const nodesArray = Array.from(nodes.values());

  // Simple hierarchical layout based on parent relationships
  const roots = nodesArray.filter(n => !n.parentId);
  const children = nodesArray.filter(n => n.parentId);

  // Position roots in a horizontal line
  roots.forEach((node, i) => {
    positions.set(node.id, {
      x: 400 * i,
      y: 0,
    });
  });

  // Position children below their parents
  const childrenByParent = new Map<string, WorkNode[]>();
  children.forEach(c => {
    if (!c.parentId) return;
    if (!childrenByParent.has(c.parentId)) {
      childrenByParent.set(c.parentId, []);
    }
    childrenByParent.get(c.parentId)!.push(c);
  });

  function layoutChildren(parentId: string, depth: number) {
    const kids = childrenByParent.get(parentId) || [];
    const parentPos = positions.get(parentId) || { x: 0, y: 0 };

    kids.forEach((kid, i) => {
      const x = parentPos.x + (i - (kids.length - 1) / 2) * 300;
      const y = parentPos.y + 200 + depth * 20;
      positions.set(kid.id, { x, y });
      layoutChildren(kid.id, depth + 1);
    });
  }

  roots.forEach(root => layoutChildren(root.id, 0));

  // Handle orphans (nodes without parent and not roots — e.g. from edge relationships)
  const orphans = nodesArray.filter(n => !positions.has(n.id));
  orphans.forEach((node, i) => {
    positions.set(node.id, {
      x: 300 * i,
      y: 600,
    });
  });

  return nodesArray.map(n => positions.get(n.id) || { x: 0, y: 0 });
}

// ─── Main Canvas Component ──────────────────────────────

const nodeTypes = { nkyel: NkyelNode };

export default function NkyelWorkspaceCanvas() {
  const {
    nodes: workNodes,
    edges: workEdges,
    eventLog,
    isRunning,
    isReplaying,
    selectedNodeId,
    selectNode,
    userEditNode,
    userCreateBranch,
    userRejectHypothesis,
    replayStep,
  } = useWorkGraphStore();

  // Convert WorkGraph to React Flow nodes/edges
  const rfNodes = useMemo(() => {
    const nodesArray = Array.from(workNodes.values());
    const positions = computeLayout(workNodes, workEdges);

    return nodesArray.map((wn, i) => ({
      id: wn.id,
      type: 'nkyel',
      position: positions[i] || { x: 0, y: 0 },
      data: {
        workNode: wn,
        isSelected: wn.id === selectedNodeId,
        onSelect: selectNode,
        onEdit: (id: string) => {
          const title = prompt('Edit node title:', wn.title);
          if (title) userEditNode(id, { title });
        },
        onBranch: (id: string) => {
          const branchTitle = prompt('Branch title:');
          if (branchTitle) userCreateBranch(id, branchTitle);
        },
      },
    }));
  }, [workNodes, workEdges, selectedNodeId, selectNode, userEditNode, userCreateBranch]);

  const rfEdges = useMemo(() => {
    return Array.from(workEdges.values()).map(we => ({
      id: we.id,
      source: we.sourceId,
      target: we.targetId,
      label: we.type.replace('_', ' '),
      animated: we.type === 'depends_on' || we.type === 'assigned_to',
      style: {
        stroke: EDGE_COLORS[we.type] || 'rgba(255,255,255,0.3)',
        strokeWidth: 2,
      },
      labelStyle: {
        fontSize: 10,
        fill: 'rgba(255,255,255,0.6)',
      },
    }));
  }, [workEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync React Flow state when work graph changes
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection | RFEdge) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: 'rgba(255,255,255,0.3)' },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Latest event for the activity feed
  const latestEvent = eventLog[eventLog.length - 1];

  return (
    <div className="nkyel-workspace">
      {/* Canvas Header */}
      <div className="nkyel-workspace-header">
        <div>
          <p className="nkyel-workspace-label">Ñkyel AI</p>
          <h2 className="nkyel-workspace-title">Visual Workspace</h2>
          <p className="nkyel-workspace-subtitle">
            {isRunning ? 'Mission active' : isReplaying ? 'Replay mode' : 'Ready'}
            {eventLog.length > 0 && ` · ${eventLog.length} events`}
          </p>
        </div>
        <div className="nkyel-workspace-controls">
          {isReplaying && (
            <button className="nkyel-btn nkyel-btn-secondary" onClick={replayStep}>
              ▶ Step
            </button>
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="nkyel-canvas-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="nkyel-react-flow"
        >
          <Controls className="nkyel-controls" />
          <MiniMap
            nodeColor={(node) => {
              const wn = workNodes.get(node.id);
              return wn ? NODE_COLORS[wn.type] : '#888';
            }}
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{
              backgroundColor: 'rgba(5, 7, 12, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            color="rgba(255,255,255,0.04)"
            gap={24}
          />

          {/* Activity Feed Panel */}
          <Panel position="bottom-left">
            <div className="nkyel-activity-feed">
              <h4>Activity</h4>
              <div className="nkyel-activity-list">
                {eventLog.slice(-8).reverse().map((evt) => (
                  <div key={evt.id} className="nkyel-activity-item">
                    <span className="nkyel-activity-type">{evt.type}</span>
                    {evt.node?.title && (
                      <span className="nkyel-activity-detail">{evt.node.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
