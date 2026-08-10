/**
 * Ñkyel AI — Hero Demo Page
 * 
 * The main workspace page where the user submits a goal
 * and watches the autonomous agent work in a spatial canvas.
 */

'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWorkGraphStore, AgUiStreamAdapter, eventStore } from '@/lib/nkyel';
import '../../../components/nkyel/nkyel-workspace.css';

// Dynamic import for React Flow (client-only)
const NkyelWorkspaceCanvas = dynamic(
  () => import('@/components/nkyel/NkyelWorkspaceCanvas'),
  { ssr: false, loading: () => <div className="nkyel-loading">Loading workspace...</div> }
);

// ─── Demo Orchestrator ──────────────────────────────────
// For the P0 demo, we can run the agent via the backend SSE endpoint
// or simulate events locally for offline testing.

function generateDemoEvents(runId: string, goal: string) {
  const now = () => new Date().toISOString();
  let seq = 0;

  const events = [
    {
      id: `evt_demo_${++seq}`,
      type: 'goal.received' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'goal_1',
        type: 'goal' as const,
        version: '1.0.0',
        title: goal,
        status: 'active' as const,
        provenance: 'user_provided' as const,
        createdAt: now(),
        updatedAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'plan.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'plan_1',
        type: 'plan' as const,
        version: '1.0.0',
        parentId: 'goal_1',
        title: 'Research Plan',
        summary: 'Structured plan to investigate the topic',
        status: 'active' as const,
        provenance: 'generated' as const,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_1',
        type: 'decomposes_into' as const,
        sourceId: 'goal_1',
        targetId: 'plan_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'task.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'task_1',
        type: 'task' as const,
        version: '1.0.0',
        parentId: 'plan_1',
        title: 'Web Research',
        summary: 'Search for authoritative sources on the topic',
        status: 'pending' as const,
        provenance: 'generated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_2',
        type: 'decomposes_into' as const,
        sourceId: 'plan_1',
        targetId: 'task_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'task.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'task_2',
        type: 'task' as const,
        version: '1.0.0',
        parentId: 'plan_1',
        title: 'Source Analysis',
        summary: 'Extract claims and evidence from sources',
        status: 'pending' as const,
        provenance: 'generated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_3',
        type: 'decomposes_into' as const,
        sourceId: 'plan_1',
        targetId: 'task_2',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'task.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'task_3',
        type: 'task' as const,
        version: '1.0.0',
        parentId: 'plan_1',
        title: 'Synthesis',
        summary: 'Produce final comprehensive response',
        status: 'pending' as const,
        provenance: 'generated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_4',
        type: 'decomposes_into' as const,
        sourceId: 'plan_1',
        targetId: 'task_3',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'agent.spawned' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'agent_researcher',
        type: 'agent' as const,
        version: '1.0.0',
        title: 'Researcher Agent',
        summary: 'Specialized in web search and source gathering',
        status: 'active' as const,
        provenance: 'generated' as const,
        provider: 'gemini',
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_5',
        type: 'assigned_to' as const,
        sourceId: 'task_1',
        targetId: 'agent_researcher',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'tool.started' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'tool_search_1',
        type: 'tool_call' as const,
        version: '1.0.0',
        title: 'Web Search',
        summary: `Searching: "${goal}"`,
        status: 'active' as const,
        provenance: 'generated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_6',
        type: 'uses' as const,
        sourceId: 'agent_researcher',
        targetId: 'tool_search_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'source.added' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'source_1',
        type: 'source' as const,
        version: '1.0.0',
        title: 'Research Article',
        summary: 'A comprehensive overview from academic sources',
        sourceRef: 'https://example.com/research',
        status: 'completed' as const,
        provenance: 'retrieved' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_7',
        type: 'produces' as const,
        sourceId: 'tool_search_1',
        targetId: 'source_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'claim.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'claim_1',
        type: 'claim' as const,
        version: '1.0.0',
        title: 'Key Finding',
        summary: 'The primary conclusion from the research',
        status: 'active' as const,
        provenance: 'generated' as const,
        provider: 'gemini',
        createdAt: now(),
        updatedAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'evidence.linked' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'evidence_1',
        type: 'evidence' as const,
        version: '1.0.0',
        title: 'Supporting Data',
        summary: 'Statistical data supporting the claim',
        sourceRef: 'https://example.com/research',
        status: 'completed' as const,
        provenance: 'retrieved' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_8',
        type: 'supports' as const,
        sourceId: 'evidence_1',
        targetId: 'claim_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'hypothesis.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'hyp_1',
        type: 'hypothesis' as const,
        version: '1.0.0',
        title: 'Alternative Interpretation',
        summary: 'A contrasting viewpoint worth exploring',
        status: 'active' as const,
        provenance: 'generated' as const,
        provider: 'gemini',
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_9',
        type: 'contradicts' as const,
        sourceId: 'hyp_1',
        targetId: 'claim_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'artifact.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'artifact_1',
        type: 'artifact' as const,
        version: '1.0.0',
        title: 'Research Synthesis',
        summary: 'Final comprehensive analysis with sourced conclusions',
        status: 'completed' as const,
        provenance: 'generated' as const,
        provider: 'gemini',
        createdAt: now(),
        updatedAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'checkpoint.created' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'checkpoint_1',
        type: 'checkpoint' as const,
        version: '1.0.0',
        title: 'Mission Complete',
        status: 'completed' as const,
        provenance: 'generated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
    },
  ];

  return events;
}

// ─── Main Page Component ────────────────────────────────

export default function NkyelWorkspacePage() {
  const [goalInput, setGoalInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'idle' | 'running' | 'complete'>('idle');
  const { startRun, emitEvent, isRunning, stopRun, startReplay, eventLog, reset } = useWorkGraphStore();

  const handleSubmitGoal = useCallback(async () => {
    if (!goalInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setMode('running');

    const runId = startRun(goalInput.trim(), 'User-submitted research goal');

    // Try real backend first, fallback to demo
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const adapter = new AgUiStreamAdapter(runId);
      await adapter.connect(`${apiUrl}/api/v1/nkyel/run`, {
        message: goalInput.trim(),
        user_id: 'demo-user',
        language: 'fr',
        run_id: runId,
      });
      setMode('complete');
    } catch {
      // Fallback: run demo events with staggered timing
      console.info('[Ñkyel] Backend unavailable, running demo mode');
      const demoEvents = generateDemoEvents(runId, goalInput.trim());

      for (const evt of demoEvents) {
        await new Promise(resolve => setTimeout(resolve, 400));
        emitEvent(evt);
      }
      setMode('complete');
    }

    setIsSubmitting(false);
  }, [goalInput, isSubmitting, startRun, emitEvent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitGoal();
    }
  }, [handleSubmitGoal]);

  return (
    <div className="nkyel-page">
      {/* Header Bar */}
      <header className="nkyel-page-header">
        <div className="nkyel-brand">
          <span className="nkyel-brand-icon">✦</span>
          <h1 className="nkyel-brand-name">Ñkyel AI</h1>
          <span className="nkyel-brand-tag">Visual Workspace</span>
        </div>
        <div className="nkyel-header-actions">
          {mode === 'running' && (
            <button className="nkyel-btn nkyel-btn-secondary" onClick={stopRun}>
              ⏹ Stop
            </button>
          )}
          {mode === 'complete' && (
            <>
              <button className="nkyel-btn nkyel-btn-secondary" onClick={() => {
                const wgs = useWorkGraphStore.getState();
                if (wgs.runId) startReplay(wgs.runId);
              }}>
                ⏪ Replay
              </button>
              <button className="nkyel-btn nkyel-btn-secondary" onClick={() => {
                reset();
                setMode('idle');
                setGoalInput('');
              }}>
                ✨ New Mission
              </button>
            </>
          )}
        </div>
      </header>

      {/* Goal Input (shown when idle) */}
      {mode === 'idle' && (
        <div className="nkyel-goal-input-container">
          <div className="nkyel-goal-card">
            <div className="nkyel-goal-icon">✦</div>
            <h2 className="nkyel-goal-heading">What would you like to explore?</h2>
            <p className="nkyel-goal-subtitle">
              Ñkyel will plan, research, analyze, and synthesize — all visible in your spatial workspace.
            </p>
            <div className="nkyel-goal-input-row">
              <textarea
                className="nkyel-goal-textarea"
                placeholder="e.g. Explain the impact of AI on education in Africa..."
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                aria-label="Enter your research goal"
              />
              <button
                className="nkyel-btn nkyel-btn-primary nkyel-goal-submit"
                onClick={handleSubmitGoal}
                disabled={!goalInput.trim() || isSubmitting}
              >
                {isSubmitting ? '⏳ Starting...' : '🚀 Launch Mission'}
              </button>
            </div>
            <p className="nkyel-goal-hint">
              Powered by Gemini · Sources are verified · You can edit the plan
            </p>
          </div>
        </div>
      )}

      {/* Workspace Canvas (shown when running or complete) */}
      {mode !== 'idle' && (
        <div className="nkyel-workspace-wrapper">
          <NkyelWorkspaceCanvas />
        </div>
      )}
    </div>
  );
}
