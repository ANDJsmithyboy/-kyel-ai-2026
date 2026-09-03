/**
 * Ñkyel AI · Ñkyel VIE (Visual Interactive Execution)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Visual interactive execution workspace:
 * - Spatial canvas React Flow (VIECanvas)
 * - Real DeerFlow orchestration & AG-UI event stream
 * - Direct human intervention controls
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWorkGraphStore, AgUiStreamAdapter } from '@/lib/nkyel';
import MissionComposer from '@/components/composer/MissionComposer';
import type { AgenticFeaturesState } from '@/components/composer/AgenticToggles';
import { workspacesApi, missionsApi, getApiBaseUrl } from '@/lib/api';

// Dynamic loading of VIECanvas for client-only rendering
const VIECanvas = dynamic(
  () => import('@/components/vie/VIECanvas'),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-[#7E8795] font-mono text-sm">Chargement de l'espace spatial Ñkyel VIE…</div> }
);

export default function NkyelWorkspacePage() {
  const { startRun, isRunning, stopRun, nodes, fetchWorkGraph } = useWorkGraphStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string>('');

  // Fetch current workspace on mount
  useEffect(() => {
    workspacesApi.current()
      .then((ws) => {
        setWorkspaceId(ws.id);
        fetchWorkGraph(ws.id);
      })
      .catch((err) => {
        console.warn('[Workspace Page] Workspace fetch notice:', err.message);
      });
  }, [fetchWorkGraph]);

  const handleLaunchMission = useCallback(
    async (goal: string, engineId: string, features: AgenticFeaturesState) => {
      const trimmed = goal.trim();
      if (!trimmed || isSubmitting) return;
      setIsSubmitting(true);

      try {
        // 1. Ensure real active workspace exists
        let currentWsId = workspaceId;
        if (!currentWsId) {
          const ws = await workspacesApi.current();
          currentWsId = ws.id;
          setWorkspaceId(ws.id);
        }

        // 2. Create real Mission on backend
        const missionTitle = trimmed.length > 60 ? `${trimmed.substring(0, 57)}...` : trimmed;
        const mission = await missionsApi.create(currentWsId, missionTitle, trimmed);

        // 3. Create real Run on backend
        const run = await missionsApi.createRun(currentWsId, mission.id, 'FULL');

        // 4. Start local graph state with backend Run ID
        startRun(trimmed, 'Mission lancée depuis l\'espace VIE', run.id);

        // 5. Connect to real AG-UI event stream
        const apiUrl = getApiBaseUrl();
        const adapter = new AgUiStreamAdapter(run.id);

        await adapter.connect(`${apiUrl}/api/v1/nkyel/run`, {
          message: trimmed,
          mission_id: mission.id,
          run_id: run.id,
          workspace_id: currentWsId,
          language: 'fr',
          engine: engineId,
          features,
        });

        // 6. Refresh WorkGraph from backend truth after run execution
        await fetchWorkGraph(currentWsId, mission.id);
      } catch (err: any) {
        console.error('[Workspace Page] Launch mission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, workspaceId, startRun, fetchWorkGraph]
  );

  const nodeCount = nodes.size || 0;
  const hasNodes = nodeCount > 0;

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
      <div className="absolute bottom-3 start-0 end-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <MissionComposer
            onSend={handleLaunchMission}
            onStop={stopRun}
            isStreaming={isRunning || isSubmitting}
            isHeroMode={!hasNodes}
          />
        </div>
      </div>
    </div>
  );
}
