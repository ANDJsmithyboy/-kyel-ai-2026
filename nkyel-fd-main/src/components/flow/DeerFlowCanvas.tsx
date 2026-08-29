'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* --- CUSTOM NODE --- */
const CustomNode = ({ data }: any) => {
  return (
    <div className="rounded-[1.35rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,22,0.9)] p-4 shadow-[0_14px_60px_rgba(0,0,0,0.24)] min-w-[180px]">
      <Handle type="target" position={Position.Top} style={{ background: 'var(--text-tertiary)' }} />
      <span className="text-[0.65rem] uppercase tracking-[0.24em]" style={{ color: data.accent || 'var(--text-tertiary)' }}>
        {data.nodeType || 'Nœud'}
      </span>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{data.label}</p>
      <div className="mt-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-[var(--text-secondary)]">
        {data.description || 'Temps réel ou guide de conversation.'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--text-tertiary)' }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: any[] = [];
const initialEdges: any[] = [];

export default function DeerFlowCanvas() {
  const [liveMode, setLiveMode] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initialEdges);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function fetchWorkGraph() {
      try {
        const res = await fetch('/api/workgraph/current');
        if (res.ok) {
          const data = await res.json();
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkGraph();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds: any) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(255,255,255,0.3)' } } as any, eds)),
    [setEdges]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.88)] shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 bg-[rgba(7,11,20,0.72)] z-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Obsidian Glass</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">DeerFlow Canvas</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xl">
            Workspace nodal propulsé par React Flow pour planifier les agents d&apos;IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <Switch checked={liveMode} onCheckedChange={(value) => setLiveMode(value)} />
            <span>{liveMode ? 'Live' : 'Draft'}</span>
          </label>

          <Button
            variant="secondary"
            onClick={() => toast.success('Canvas Obsidian activé et interactif !')}
          >
            <Sparkles size={16} className="me-2" />
            Activer
          </Button>
        </div>
      </div>

      <div className="relative flex-1 w-full h-full">
        {/* Gradients de fond subtils */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,204,138,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_28%)] z-0" />
        
        {/* Canvas React Flow */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-4">
             <div className="w-20 h-20 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--text-tertiary)] shadow-lg shadow-black/20 backdrop-blur-xl">
              <Sparkles size={32} />
             </div>
             <div className="text-center space-y-1">
               <h3 className="text-lg font-semibold text-[var(--text-primary)]">WorkGraph Vierge</h3>
               <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                 Le plan d'exécution apparaîtra ici sous forme de nœuds canoniques (Objectif, Plan, Agent, Outil, etc.) dès que vous lancerez une mission.
               </p>
             </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="z-10 bg-transparent"
          >
            <Controls className="bg-[rgba(5,7,12,0.8)] border-[rgba(255,255,255,0.1)] fill-white text-white" />
            <MiniMap 
              nodeColor={(node) => {
                return node.data?.accent as string || 'var(--text-tertiary)';
              }}
              nodeStrokeWidth={3}
              maskColor="rgba(0, 0, 0, 0.7)"
              style={{ backgroundColor: 'rgba(5, 7, 12, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <Background color="rgba(255,255,255,0.05)" gap={16} />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
