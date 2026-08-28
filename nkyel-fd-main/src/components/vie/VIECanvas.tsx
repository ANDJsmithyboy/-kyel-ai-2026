/**
 * Ñkyel AI · VIECanvas (Visual Interactive Execution)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canvas spatial d'exécution en direct de la mission :
 * - Rendu haute performance React Flow
 * - Représentation graphique exacte des 8 protocoles & outils Google connectés
 * - Minimap, zoom, filtres de nœuds, plein écran
 * - Barre d'intervention humaine directe (HumanInterventionBar)
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
import type { WorkNode, WorkEdge, WorkNodeType } from '@/lib/nkyel/work-graph.types';
import HumanInterventionBar from './HumanInterventionBar';
import {
  TreeStructure,
  MagnifyingGlass,
  ArrowsOut,
  ArrowsIn,
  ShieldCheck,
  FloppyDisk,
  PuzzlePiece,
  PlugsConnected,
  UsersThree,
  ArrowClockwise,
} from '@phosphor-icons/react';

// Palette Wada Sanzo pour les types de nœuds
const NODE_COLORS: Record<WorkNodeType, string> = {
  goal: '#C39A52',          // Old Gold
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

// Node personnalisé pour le canvas
function CustomWorkNode({ data }: { data: WorkNode }) {
  const color = NODE_COLORS[data.type] || '#665F9E';
  const isActive = data.status === 'active';

  return (
    <div
      className={`p-3 rounded-2xl border bg-[var(--bg-elevated)] text-[var(--text-primary)] min-w-[220px] max-w-[280px] shadow-xl backdrop-blur-md transition-all ${
        isActive
          ? 'border-[var(--accent)] shadow-[var(--shadow-accent)] ring-1 ring-[var(--accent)]'
          : 'border-[var(--border)] hover:border-[var(--border-strong)]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold"
          style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}50` }}
        >
          {data.type.replace('_', ' ')}
        </span>
        {isActive && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
          </span>
        )}
      </div>

      <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
        {data.title}
      </h4>

      {data.summary && (
        <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
          {data.summary}
        </p>
      )}

      {data.provider && (
        <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
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
  const { nodes: graphNodesMap, edges: graphEdgesMap, selectedNodeId, selectNode, reset: resetGraph } = useWorkGraphStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const graphNodes = useMemo(() => Array.from(graphNodesMap.values()) as any[], [graphNodesMap]);
  const graphEdges = useMemo(() => Array.from(graphEdgesMap.values()) as any[], [graphEdgesMap]);

  // Conversion des nœuds pour React Flow
  const rfNodes = useMemo<any[]>(() => {
    return graphNodes.map((n: any, idx: number) => ({
      id: n.id,
      type: 'workNode',
      data: n,
      position: {
        x: 120 + (idx % 3) * 320,
        y: 80 + Math.floor(idx / 3) * 180,
      },
    }));
  }, [graphNodes]);

  // Conversion des arêtes pour React Flow
  const rfEdges = useMemo<any[]>(() => {
    return graphEdges.map((e: any) => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
    }));
  }, [graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  return (
    <div
      className={`relative w-full h-full bg-[var(--graph-canvas)] overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Barre de Contrôle Supérieure */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <HumanInterventionBar />
        </div>

        {/* Bouton Plein Écran */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => resetGraph()}
            className="p-2.5 rounded-xl bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors shadow-lg"
            title="Réinitialiser la vue"
          >
            <ArrowClockwise size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors shadow-lg"
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {isFullscreen ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
          </button>
        </div>
      </div>

      {/* Canvas React Flow */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => selectNode(node.id)}
          fitView
          className="bg-transparent"
        >
          <Background color="var(--graph-grid)" gap={24} size={1.5} />
          <Controls className="bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl fill-[var(--text-primary)] shadow-md" />
          <MiniMap
            nodeColor={(n) => NODE_COLORS[(n.data as any)?.type as WorkNodeType] || '#665F9E'}
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl"
            maskColor="var(--material-overlay)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
