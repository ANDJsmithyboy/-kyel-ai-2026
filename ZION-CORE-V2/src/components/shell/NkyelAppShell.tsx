/**
 * Ñkyel AI · NkyelAppShell (Zone 1 - Zone 2 - Zone 3)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Conteneur spatial modulaire respectant l'ergonomie Apple :
 * - Zone 1 : Navigation souveraine (NkyelSidebar)
 * - Zone 2 : Espace Central fluide (Conversation ↔ Mission VIE)
 * - Zone 3 : Ñkyel Artifact Studio (Redimensionnable 420px à 560px)
 */

'use client';

import React, { useState, useEffect } from 'react';
import NkyelSidebar from './NkyelSidebar';
import TopBar from './TopBar';
import AuroraBackground from '@/components/ui/AuroraBackground';
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
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const isPublicClosed = betaStatus?.state === 'PUBLIC_CLOSED' && !dismissClosedScreen;

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-[#08090D] text-[#F1EEE7] antialiased select-none font-sans flex-col">
      {/* Bandeau de Statut Bêta 42h (Header Global) */}
      <BetaStatusBanner onOpenFeedback={() => setFeedbackOpen(true)} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Fond fluide et subtil sans récursion de calcul */}
        <AuroraBackground />

        {/* Zone 1: Navigation Souveraine (Sidebar) */}
        <NkyelSidebar />

        {/* Zone 2: Espace Central Dédié (Conversation ou Mission VIE) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#08090D] relative z-10 overflow-hidden">
          {/* Barre Supérieure avec Switcher de mode & Hub */}
          <header className="h-14 border-b border-white/[0.06] bg-[#0E121A]/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
              <WorkspaceModeSwitcher
                mode={viewMode}
                onModeChange={handleModeChange}
                isRunning={isRunning}
              />
            </div>

            <TopBar onOpenCapabilities={() => setCapabilitiesOpen(true)} />
          </header>

          {/* Corps Central */}
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </main>
        </div>

        {/* Tiroir d'Actions et Capacités (Action Launcher) */}
        <CapabilitiesDrawer
          isOpen={capabilitiesOpen}
          onClose={() => setCapabilitiesOpen(false)}
          onSelectCapability={() => setCapabilitiesOpen(false)}
        />

        {/* Zone 3: Ñkyel Artifact Studio (Right Panel) */}
        <ArtifactStudio />
      </div>

      {/* Modal de Retour d'Expérience Bêta Structuré */}
      <BetaFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {/* Écran de Fin de Bêta post-24 août 06h00 Libreville */}
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

