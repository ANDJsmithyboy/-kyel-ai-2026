/**
 * Ñkyel AI · VIECanvas (Visual Interactive Execution)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Spatial live mission execution canvas:
 * — High-performance React Flow rendering
 * — Canonical WorkGraph node representations & semantic colors
 * — Minimap, zoom, node filters, fullscreen
 * — Direct human intervention bar (HumanInterventionBar)
 */

'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import type { WorkNode, WorkNodeType } from '@/lib/nkyel/work-graph.types';
import HumanInterventionBar from './HumanInterventionBar';
import {
  ArrowsOut,
  ArrowsIn,
} from '@phosphor-icons/react';

// Semantic Node Colors
const NODE_COLORS: Record<WorkNodeType, string> = {
  goal: '#C39A52',          // Gold
  plan: '#665F9E',          // Ñkyel Indigo
  task: '#7C9AE8',          // Light Blue
  agent: '#6F9485',         // Celadon Green (A2A)
  tool_call: '#5BA3B5',     // Cyan Hexagon (MCP)
  source: '#315A70',        // Deep Aizuri Blue
  evidence: '#6F9485',      // Celadon
  claim: '#E8A838',         // Amber
  hypothesis: '#CF72A8',    // Pink
  scenario: '#B56BD4',      // Violet
  decision: '#C39A52',      // Gold
  artifact: '#72B8CF',      // Cyan Deliverable
  approval: '#BE6254',      // Soft Vermilion
  checkpoint: '#C39A52',    // Gold
  error: '#BE6254',         // Soft Vermilion
  mcp_tool: '#5BA3B5',      // Cyan Hexagon
  mcp_app: '#665F9E',       // Indigo Window
  skill: '#C39A52',         // Golden Puzzle
  a2a_agent: '#6F9485',     // Green Double Circles
  agui_stream: '#315A70',   // Animated Blue Stream
  a2ui_surface: '#765E78',  // Muted Plum Panel
  ap2_payment: '#D98E3B',   // Amber Shield
  ucp_commerce: '#C5A059',  // Commerce Network
  google_tool: '#4285F4',   // Google Blue
  workspace_doc: '#72B8CF', // Document Blue
  firebase_deploy: '#FFA000', // Firebase Amber
};

// Custom Node for the React Flow canvas
function CustomWorkNode({ data }: { data: WorkNode }) {
  const color = NODE_COLORS[data.type] || '#665F9E';
  const isActive = data.status === 'active';

  return (
    <div
      className="p-3 shadow-xl backdrop-blur-md transition-all"
      style={{
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-overlay)',
        border: isActive ? `1.5px solid var(--accent)` : '1px solid var(--border-default)',
        boxShadow: isActive ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        minWidth: 220,
        maxWidth: 280,
        color: 'var(--fg)',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="font-mono uppercase tracking-wider font-semibold"
          style={{
            fontSize: '10px',
            paddingInline: '8px',
            paddingBlock: '2px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: `${color}20`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {data.type.replace('_', ' ')}
        </span>
        {isActive && (
          <span className="flex h-2 w-2 relative">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--accent)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: 'var(--accent)' }}
            />
          </span>
        )}
      </div>

      <h4
        className="font-semibold leading-snug line-clamp-2"
        style={{ fontSize: 'var(--text-sm)', color: 'var(--fg)' }}
      >
        {data.title}
      </h4>

      {data.summary && (
        <p
          className="line-clamp-2 leading-relaxed"
          style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}
        >
          {data.summary}
        </p>
      )}

      {data.provider && (
        <div
          className="flex items-center justify-between font-mono"
          style={{
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px',
            color: 'var(--fg-subtle)',
          }}
        >
          <span className="truncate">{data.provider}</span>
          {data.latencyMs && <span>{data.latencyMs}ms</span>}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  workNode: CustomWorkNode,
};

export default function VIECanvas() {
  const { nodes: graphNodes, edges: graphEdges, selectNode } = useWorkGraphStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Conversion of nodes for React Flow
  const rfNodes = useMemo(() => {
    return graphNodes.map((n, idx) => ({
      id: n.id,
      type: 'workNode',
      data: n,
      position: {
        x: 120 + (idx % 3) * 320,
        y: 80 + Math.floor(idx / 3) * 180,
      },
    }));
  }, [graphNodes]);

  // Conversion of edges
  const rfEdges = useMemo(() => {
    return graphEdges.map((e) => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      label: e.type.replace('_', ' '),
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
      labelStyle: { fill: 'var(--fg-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' },
      labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.85 },
    }));
  }, [graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ background: 'var(--bg)' }}
    >
      {/* Top Control Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <HumanInterventionBar />
        </div>

        {/* Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center justify-center backdrop-blur-md shadow-lg"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border-default)',
              color: 'var(--fg-muted)',
              transition: `all var(--transition-fast)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--fg)';
              e.currentTarget.style.background = 'var(--surface-raised)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--fg-muted)';
              e.currentTarget.style.background = 'var(--surface-overlay)';
            }}
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {isFullscreen ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => selectNode(node.id)}
          fitView
          style={{ background: 'var(--bg)' }}
        >
          <Background color="var(--fg)" gap={32} size={1} style={{ opacity: 0.03 }} />
          <Controls
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--fg)',
              fill: 'var(--fg)',
            }}
          />
          <MiniMap
            nodeColor={(n) => NODE_COLORS[(n.data as WorkNode)?.type] || '#665F9E'}
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
            }}
            maskColor="rgba(8, 9, 13, 0.75)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
