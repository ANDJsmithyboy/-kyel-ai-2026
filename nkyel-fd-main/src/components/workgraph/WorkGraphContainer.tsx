'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import WorkGraphCanvas from './WorkGraphCanvas';
import WorkGraphToolbar from './WorkGraphToolbar';
import WorkGraphInspector from './WorkGraphInspector';
import WorkGraphZoomRail from './WorkGraphZoomRail';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';
import { useParams } from 'next/navigation';
import { workspacesApi } from '@/lib/api';

export default function WorkGraphContainer() {
  const { 
    nodes, 
    edges, 
    selectedNodeId, 
    selectNode, 
    fetchWorkGraph, 
    userEditNode,
    startRun,
    isRunning
  } = useWorkGraphStore();
  
  const [isLocked, setIsLocked] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const params = useParams();
  const threadId = (params?.id as string) || 'active-thread';

  useEffect(() => {
    workspacesApi.current()
      .then((ws) => {
        setWorkspaceId(ws.id);
        fetchWorkGraph(ws.id, threadId);
      })
      .catch(() => {
        fetchWorkGraph('default', threadId);
      });
  }, [threadId, fetchWorkGraph]);


  const nodesArray = useMemo(() => Array.from(nodes.values()) as import('@/lib/nkyel/work-graph.types').WorkNode[], [nodes]);
  const edgesArray = useMemo(() => Array.from(edges.values()) as import('@/lib/nkyel/work-graph.types').WorkEdge[], [edges]);
  
  const selectedNode = selectedNodeId ? nodes.get(selectedNodeId) || null : null;

  const handleExecute = () => {
    if (!isRunning) {
      startRun('Run WorkGraph', 'Executing mission from WorkGraph UI');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#08090D] overflow-hidden">
      
      {/* React Flow Context Provider */}
      <ReactFlowProvider>
        <div className="flex-1 relative min-h-0 w-full h-full">
          
          <WorkGraphCanvas 
            nodes={nodesArray}
            edges={edgesArray}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
          />
          
          {/* Overlays */}
          <WorkGraphToolbar 
            onExecute={handleExecute}
            onUndo={() => {}}
            onRedo={() => {}}
            onAdd={() => {}}
            onToggleGrid={() => {}}
            onMore={() => {}}
            canUndo={false}
            canRedo={false}
            isRunning={isRunning}
          />

          <WorkGraphZoomRail 
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
          />

          {/* Inspector */}
          {selectedNode && (
            <WorkGraphInspector 
              node={selectedNode}
              onSave={(id, updates) => userEditNode(id, updates)}
              onDelete={(id) => console.log('Delete node', id)}
              onDuplicate={(id) => console.log('Duplicate node', id)}
              onAddLink={(id) => console.log('Add link for', id)}
              onFocusNode={selectNode}
            />
          )}

        </div>
      </ReactFlowProvider>
    </div>
  );
}
