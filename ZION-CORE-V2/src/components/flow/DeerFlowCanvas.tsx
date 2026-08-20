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
        Nœud
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

/* --- INITIAL DATA --- */
const initialNodes = [
  {
    id: 'prompt',
    type: 'custom',
    position: { x: 50, y: 50 },
    data: { label: 'Prompt', accent: 'var(--gabon-blue)', description: 'Entrée utilisateur initiale.' },
  },
  {
    id: 'intent',
    type: 'custom',
    position: { x: 250, y: 200 },
    data: { label: 'Intent', accent: 'var(--gabon-green)', description: 'Classification de l\'intention.' },
  },
  {
    id: 'agent',
    type: 'custom',
    position: { x: 450, y: 350 },
    data: { label: 'Agent', accent: 'var(--gabon-yellow)', description: 'Exécution du modèle Black Panther.' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'prompt', target: 'intent', animated: true, style: { stroke: 'rgba(255,255,255,0.3)' } },
  { id: 'e2-3', source: 'intent', target: 'agent', animated: true, style: { stroke: 'rgba(255,255,255,0.3)' } },
];

export default function DeerFlowCanvas() {
  const [liveMode, setLiveMode] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(255,255,255,0.3)' } }, eds)),
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
            <Sparkles size={16} className="mr-2" />
            Activer
          </Button>
        </div>
      </div>

      <div className="relative flex-1 w-full h-full">
        {/* Gradients de fond subtils */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,204,138,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_28%)] z-0" />
        
        {/* Canvas React Flow */}
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
              switch (node.id) {
                case 'prompt': return 'var(--gabon-blue)';
                case 'intent': return 'var(--gabon-green)';
                case 'agent': return 'var(--gabon-yellow)';
                default: return 'var(--text-tertiary)';
              }
            }}
            nodeStrokeWidth={3}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{ backgroundColor: 'rgba(5, 7, 12, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <Background color="rgba(255,255,255,0.05)" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
