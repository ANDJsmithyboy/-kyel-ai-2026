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
import ArtifactStudio from '@/components/rendu/ArtifactStudio';
import CapabilitiesDrawer from '@/components/capabilities/CapabilitiesDrawer';
import type { WorkspaceViewMode } from './WorkspaceModeSwitcher';
import BetaClosedScreen from '@/components/beta/BetaClosedScreen';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';
import DesktopSettingsModal from '@/components/settings/DesktopSettingsModal';
import { fetchBetaStatus, type BetaStatusResponse } from '@/lib/betaStateMachine';

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
  const [, setViewMode] = useState(activeViewMode);
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);
  const [dismissClosedScreen, setDismissClosedScreen] = useState(false);

  useEffect(() => {
    fetchBetaStatus()
      .then((data) => setBetaStatus(data))
      .catch(() => {});
  }, []);

  const handleModeChange = (mode: typeof activeViewMode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const isPublicClosed = betaStatus?.state === 'PUBLIC_CLOSED' && !dismissClosedScreen;

  return (
    <div className="nkyel-shell nkyel-monochrome-shell antialiased">
      <div className="nkyel-shell-grid">
        {/* Zone 1: Navigation Souveraine (Sidebar) */}
        <NkyelSidebar />

        {/* Zone 2: Espace Central Dédié (Conversation ou Mission) */}
        <div className="nkyel-shell-center">
          {/* Barre supérieure unique : modèle, offre et modes */}
          <TopBar onOpenCapabilities={() => setCapabilitiesOpen(true)} />

          {/* Corps Central */}
          <main className="nkyel-shell-main flex-1 overflow-hidden relative flex flex-col">
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
      <DesktopSettingsModal />

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

