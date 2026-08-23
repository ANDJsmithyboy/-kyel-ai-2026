/**
 * Ñkyel AI · Ñkyel VIE (Visual Interactive Execution)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Page de l'espace visuel vivant et interactif :
 * - Canvas spatial React Flow (VIECanvas)
 * - Orchestration DeerFlow & flux d'événements AG-UI
 * - Contrôle d'interventions humaines directes
 */

'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWorkGraphStore, AgUiStreamAdapter } from '@/lib/nkyel';
import MissionComposer from '@/components/composer/MissionComposer';
import type { AgenticFeaturesState } from '@/components/composer/AgenticToggles';

// Chargement dynamique du canvas spatial React Flow côté client
const VIECanvas = dynamic(
  () => import('@/components/vie/VIECanvas'),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-[#7E8795] font-mono text-sm">Chargement de l'espace spatial Ñkyel VIE…</div> }
);

function generateCanonicalDemoEvents(runId: string, goal: string) {
  const now = () => new Date().toISOString();
  let seq = 0;

  return [
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
        title: 'Plan d\'exécution stratégique',
        summary: 'Décomposition en 3 branches : modélisation, veille sectorielle et synthèse vérifiée.',
        status: 'active' as const,
        provenance: 'generated' as const,
        provider: 'Ñkyel Orchestrator',
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
        id: 'skill_1',
        type: 'skill' as const,
        version: '1.0.0',
        parentId: 'plan_1',
        title: 'Skill : Analyse Stratégique (SKILL.md)',
        summary: 'Chargement du module expert certifié',
        status: 'completed' as const,
        provenance: 'verified' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_skill_1',
        type: 'loads_skill' as const,
        sourceId: 'plan_1',
        targetId: 'skill_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'tool.started' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'mcp_1',
        type: 'mcp_tool' as const,
        version: '1.0.0',
        parentId: 'skill_1',
        title: 'Connecteur MCP : Recherche & Grounding',
        summary: 'Extraction de données et citations primaires',
        status: 'completed' as const,
        provenance: 'retrieved' as const,
        latencyMs: 38,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_mcp_1',
        type: 'uses_mcp' as const,
        sourceId: 'skill_1',
        targetId: 'mcp_1',
        createdAt: now(),
      },
    },
    {
      id: `evt_demo_${++seq}`,
      type: 'agent.spawned' as const,
      version: '1.0.0',
      runId,
      node: {
        id: 'a2a_1',
        type: 'a2a_agent' as const,
        version: '1.0.0',
        parentId: 'mcp_1',
        title: 'Agent A2A : Spécialiste Synthèse',
        summary: 'Exécution de la modélisation et vérification des hypothèses',
        status: 'completed' as const,
        provenance: 'calculated' as const,
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_a2a_1',
        type: 'delegates_a2a' as const,
        sourceId: 'mcp_1',
        targetId: 'a2a_1',
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
        title: 'Livrable Exécutif Souverain',
        summary: 'Document vérifiable avec sources primaires',
        status: 'completed' as const,
        provenance: 'generated' as const,
        provider: 'Ñkyel Artifact Studio',
        createdAt: now(),
        updatedAt: now(),
      },
      edge: {
        id: 'edge_art_1',
        type: 'produces' as const,
        sourceId: 'a2a_1',
        targetId: 'artifact_1',
        createdAt: now(),
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
        title: 'Mission Terminée & Vérifiée',
        status: 'completed' as const,
        provenance: 'verified' as const,
        createdAt: now(),
        updatedAt: now(),
      },
    },
  ];
}

export default function NkyelWorkspacePage() {
  const { startRun, emitEvent, isRunning, stopRun, nodes } = useWorkGraphStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunchMission = useCallback(
    async (goal: string, engineId: string, features: AgenticFeaturesState) => {
      if (!goal.trim() || isSubmitting) return;
      setIsSubmitting(true);

      const runId = startRun(goal.trim(), 'Objectif de mission soumis par l\'utilisateur');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ejresep5jsepf3-8080.proxy.runpod.net';

      try {
        const adapter = new AgUiStreamAdapter(runId);
        await adapter.connect(`${apiUrl}/api/v1/nkyel/run`, {
          message: goal.trim(),
          user_id: 'demo-user',
          language: 'fr',
          run_id: runId,
        });
      } catch {
        // Fallback démo déterministe hors-ligne
        const demoEvents = generateCanonicalDemoEvents(runId, goal.trim());
        for (const evt of demoEvents) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          emitEvent(evt);
        }
      }

      setIsSubmitting(false);
    },
    [isSubmitting, startRun, emitEvent]
  );

  const hasNodes = nodes.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#08090D] relative overflow-hidden">
      {/* Background Subtle WorkGraph Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #F1EEE7 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Canvas Spatial React Flow */}
      <div className="flex-1 w-full h-full relative">
        <VIECanvas />
      </div>

      {/* Floating Sticky Composer */}
      <div className="absolute bottom-3 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <MissionComposer
            onSend={handleLaunchMission}
            onStop={stopRun}
            isStreaming={isRunning}
            isHeroMode={!hasNodes}
          />
        </div>
      </div>
    </div>
  );
}
