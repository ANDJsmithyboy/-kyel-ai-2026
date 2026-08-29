'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WorkGraphNode from './WorkGraphNode';
import type { WorkNode, WorkEdge } from '@/lib/nkyel/work-graph.types';

const nodeTypes = {
  workNode: WorkGraphNode,
};

interface WorkGraphCanvasProps {
  nodes: WorkNode[];
  edges: WorkEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export default function WorkGraphCanvas({
  nodes: graphNodes,
  edges: graphEdges,
  selectedNodeId,
  onSelectNode,
}: WorkGraphCanvasProps) {
  
  // Transform domain nodes to React Flow nodes
  const rfNodes: Node[] = useMemo(() => {
    return graphNodes.map((n, idx) => ({
      id: n.id,
      type: 'workNode',
      data: n as unknown as Record<string, unknown>,
      position: (n as any).position || {
        x: 200 + (idx % 3) * 350,
        y: 100 + Math.floor(idx / 3) * 200,
      },
      selected: n.id === selectedNodeId,
    }));
  }, [graphNodes, selectedNodeId]);

  // Transform domain edges to React Flow edges
  const rfEdges = useMemo(() => {
    return graphEdges.map((e) => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      animated: false,
      style: {
        stroke: 'var(--text-tertiary)',
        strokeWidth: 1.5,
        opacity: 0.6,
      },
      type: 'smoothstep', // Gives those curved right-angle lines
    }));
  }, [graphEdges]);

  return (
    <div className="w-full h-full bg-[#08090D]">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-transparent"
      >
        <Background 
          color="rgba(255,255,255,0.04)" 
          gap={24} 
          size={1.5} 
          variant={BackgroundVariant.Dots}
        />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as unknown as WorkNode).status;
            if (status === 'completed') return 'var(--success)';
            if (status === 'active') return 'var(--accent)';
            return 'var(--bg-elevated)';
          }}
          className="bg-[#0E121A]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl !bottom-4 !right-4 !m-0"
          maskColor="rgba(0,0,0,0.4)"
          style={{ width: 180, height: 120 }}
        />
      </ReactFlow>
    </div>
  );
}
