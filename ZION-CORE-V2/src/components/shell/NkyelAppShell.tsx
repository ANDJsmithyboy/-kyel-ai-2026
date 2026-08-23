/**
 * Ñkyel AI · NkyelAppShell
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Spatial container — 3 zones:
 *   Zone 1: Sovereign Navigation (NkyelSidebar)
 *   Zone 2: Central workspace (Conversation ↔ Mission VIE)
 *   Zone 3: Ñkyel Artifact Studio (resizable right panel)
 */

'use client';

import React, { useState, useEffect } from 'react';
import NkyelSidebar from './NkyelSidebar';
import TopBar from './TopBar';
import ArtifactStudio from '@/components/rendu/ArtifactStudio';
import CapabilitiesDrawer from '@/components/capabilities/CapabilitiesDrawer';
import WorkspaceModeSwitcher, { type WorkspaceViewMode } from './WorkspaceModeSwitcher';
import BetaStatusBanner from '@/components/beta/BetaStatusBanner';
import BetaClosedScreen from '@/components/beta/BetaClosedScreen';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';
import { fetchBetaStatus, type BetaStatusResponse } from '@/lib/betaStateMachine';
import { useWorkGraphStore } from '@/lib/nkyel';

interface NkyelAppShellProps {
  children?: React.ReactNode;
  activeViewMode?: WorkspaceViewMode;
  onViewModeChange?: (mode: WorkspaceViewMode) => void;
}

export default function NkyelAppShell({
  children,
  activeViewMode = 'conversation',
  onViewModeChange,
}: NkyelAppShellProps) {
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>(activeViewMode);
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);
  const [dismissClosedScreen, setDismissClosedScreen] = useState(false);
  const isRunning = useWorkGraphStore((s) => s.isRunning);

  useEffect(() => {
    fetchBetaStatus()
      .then((data) => setBetaStatus(data))
      .catch(() => {});
  }, []);

  const handleModeChange = (mode: WorkspaceViewMode) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const isPublicClosed = betaStatus?.state === 'PUBLIC_CLOSED' && !dismissClosedScreen;

  return (
    <div className="flex h-dvh w-screen overflow-hidden flex-col select-none"
         style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* Beta Status Banner (global header) */}
      <BetaStatusBanner onOpenFeedback={() => setFeedbackOpen(true)} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Zone 1: Sovereign Navigation */}
        <NkyelSidebar />

        {/* Zone 2: Central Workspace */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
             style={{ background: 'var(--bg)' }}>

          {/* Top Bar — 52px, backdrop blur, hairline border */}
          <header
            className="shrink-0 flex items-center justify-between backdrop-blur-md"
            style={{
              height: 'var(--header-height)',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-glass)',
              paddingInline: 'var(--space-4)',
              zIndex: 'var(--z-header)',
            }}
          >
            <div className="flex items-center gap-3">
              <WorkspaceModeSwitcher
                mode={viewMode}
                onModeChange={handleModeChange}
                isRunning={isRunning}
              />
            </div>
            <TopBar onOpenCapabilities={() => setCapabilitiesOpen(true)} />
          </header>

          {/* Central Content */}
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </main>
        </div>

        {/* Capabilities Drawer */}
        <CapabilitiesDrawer
          isOpen={capabilitiesOpen}
          onClose={() => setCapabilitiesOpen(false)}
          onSelectCapability={() => setCapabilitiesOpen(false)}
        />

        {/* Zone 3: Artifact Studio (Right Panel) */}
        <ArtifactStudio />
      </div>

      {/* Beta Feedback Modal */}
      <BetaFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {/* Beta Closed Overlay */}
      {isPublicClosed && (
        <BetaClosedScreen
          onOpenFeedback={() => setFeedbackOpen(true)}
          onViewHistory={() => setDismissClosedScreen(true)}
          onJoinWaitlist={() => window.location.href = '/waitlist'}
        />
      )}
    </div>
  );
}
