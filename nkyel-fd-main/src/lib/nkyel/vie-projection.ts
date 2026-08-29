import { useMemo } from 'react';
import { useWorkGraphStore } from './work-graph-store';
import type { WorkNode, WorkNodeStatus } from './work-graph.types';

export interface VIESectionState<T> {
  status: 'idle' | 'collecting' | 'processing' | 'ready' | 'partial' | 'running' | 'completed' | 'failed' | 'insufficient';
  data: T;
}

export interface VIEPerception {
  sources: WorkNode[];
  sourceCategories: Record<string, number>;
  totalSources: number;
}

export interface VIEInterpretation {
  goals: WorkNode[];
  decisions: WorkNode[];
  hypotheses: WorkNode[];
  risks: WorkNode[];
  confidenceMetrics: number | null; // e.g. 92
}

export interface VIEPlan {
  actions: WorkNode[];
  completedActions: number;
  totalActions: number;
}

export interface VIEResults {
  evidence: WorkNode[];
  artifacts: WorkNode[];
  progress: number | null;
  metrics?: { label: string; value: string; unit: string } | null;
  traceability: number | null;
}

export interface VIEProjection {
  missionId: string;
  runId: string;
  isStreaming: boolean;
  perception: VIESectionState<VIEPerception>;
  interpretation: VIESectionState<VIEInterpretation>;
  plan: VIESectionState<VIEPlan>;
  results: VIESectionState<VIEResults>;
}

// Helper to deduce overall status based on nodes
const deduceSectionStatus = (nodes: WorkNode[], isStreaming: boolean): VIESectionState<any>['status'] => {
  if (nodes.length === 0) return isStreaming ? 'processing' : 'idle';
  const hasFailed = nodes.some(n => n.status === 'failed');
  if (hasFailed) return 'failed';
  const hasRunning = nodes.some(n => n.status === 'active' || n.status === 'pending');
  if (hasRunning) return 'running';
  return 'completed'; // or 'ready' depending on context
};

export function useVIEProjection(workspaceId: string, threadId: string): VIEProjection {
  const { nodes: nodeMap, isRunning } = useWorkGraphStore();
  
  return useMemo(() => {
    const nodes = Array.from(nodeMap.values()) as WorkNode[];
    
    // 1. PERCEPTION
    const sources = nodes.filter(n => n.type === 'source');
    const sourceCategories = sources.reduce((acc, src) => {
      // In a real app, type might be in metadata.category or similar.
      // We fallback to a generic classification logic based on title/metadata for now.
      const cat = (src.metadata?.category as string) || 'Autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const perceptionState: VIESectionState<VIEPerception> = {
      status: sources.length > 0 ? (isRunning ? 'running' : 'completed') : 'idle',
      data: {
        sources,
        sourceCategories,
        totalSources: sources.length,
      }
    };

    // 2. INTERPRETATION
    const goals = nodes.filter(n => n.type === 'goal' || n.type === 'plan');
    const hypotheses = nodes.filter(n => n.type === 'hypothesis');
    const decisions = nodes.filter(n => n.type === 'decision');
    // Using a fake risk array for now until backend defines 'risk' nodes explicitly
    // Could map 'error' or metadata flags as risks
    const risks = nodes.filter(n => n.metadata?.risk);
    
    // Attempt to find a real confidence metric
    let overallConfidence: number | null = null;
    const scoredNodes = nodes.filter(n => typeof n.confidence === 'number');
    if (scoredNodes.length > 0) {
      overallConfidence = Math.round(scoredNodes.reduce((sum, n) => sum + (n.confidence || 0), 0) / scoredNodes.length * 100);
    }

    const interpretationState: VIESectionState<VIEInterpretation> = {
      status: deduceSectionStatus([...goals, ...hypotheses, ...decisions], isRunning),
      data: {
        goals,
        decisions,
        hypotheses,
        risks,
        confidenceMetrics: overallConfidence
      }
    };

    // 3. PLAN
    const actions = nodes.filter(n => ['task', 'tool_call', 'agent'].includes(n.type));
    const completedActions = actions.filter(n => n.status === 'completed').length;
    
    const planState: VIESectionState<VIEPlan> = {
      status: deduceSectionStatus(actions, isRunning),
      data: {
        actions,
        completedActions,
        totalActions: actions.length
      }
    };

    // 4. RESULTS
    const evidence = nodes.filter(n => n.type === 'evidence' || n.type === 'claim');
    const artifacts = nodes.filter(n => n.type === 'artifact');
    
    // Look for impact metrics in artifacts or metadata
    let progress: number | null = null;
    let traceability: number | null = null;
    let metrics = null;
    if (evidence.length > 0 && decisions.length > 0) {
      // Very naive traceability calculation: (evidence / decisions) capped at 100
      traceability = Math.min(100, Math.round((evidence.length / decisions.length) * 100));
    }

    const resultsState: VIESectionState<VIEResults> = {
      status: deduceSectionStatus([...evidence, ...artifacts], isRunning),
      data: {
        evidence,
        artifacts,
        progress,
        metrics,
        traceability,
      }
    };

    return {
      missionId: workspaceId,
      runId: threadId,
      isStreaming: isRunning,
      perception: perceptionState,
      interpretation: interpretationState,
      plan: planState,
      results: resultsState,
    };
  }, [nodeMap, isRunning, workspaceId, threadId]);
}
