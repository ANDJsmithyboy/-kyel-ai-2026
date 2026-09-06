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
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import NkyelSidebar from './NkyelSidebar';
import TopBar from './TopBar';
import type { WorkspaceViewMode } from './WorkspaceModeSwitcher';
import type { FeedbackCategory } from '@/components/feedback/ProductionFeedbackModal';
import DesktopSettingsModal from '@/components/settings/DesktopSettingsModal';
import { fetchBetaStatus, type BetaStatusResponse } from '@/lib/betaStateMachine';
import { useSafeUser } from '@/lib/auth-client';
import { useNeonSync } from '@/hooks/useNeonSync';
import { useAuth } from '@clerk/nextjs';

const ArtifactStudio = dynamic(() => import('@/components/rendu/ArtifactStudio'), { ssr: false });
const CapabilitiesDrawer = dynamic(() => import('@/components/capabilities/CapabilitiesDrawer'), { ssr: false });
const ProductionFeedbackModal = dynamic(() => import('@/components/feedback/ProductionFeedbackModal'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('@/components/pwa/PWAInstallPrompt'), { ssr: false });
const BetaClosedScreen = dynamic(() => import('@/components/beta/BetaClosedScreen'), { ssr: false });

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
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();
  const { getToken } = useAuth();

  // PRODUCTION: Sync Clerk user → Neon on every login
  useNeonSync();

  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('SUGGESTION');
  const [feedbackContext, setFeedbackContext] = useState<{ missionId?: string; runId?: string; artifactId?: string }>({});
  const [, setViewMode] = useState(activeViewMode);
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);
  const [dismissClosedScreen, setDismissClosedScreen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasReviewSession =
        document.cookie.includes('nkyel_review_session') ||
        Boolean(localStorage.getItem('nkyel_review_token'));
      if (hasReviewSession) {
        return; // Review session bypass active
      }
    }
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    fetchBetaStatus(getToken)
      .then((data) => setBetaStatus(data))
      .catch(() => {});

    const handleFeedbackEvent = (e: Event) => {
      const custom = e as CustomEvent<{ category?: FeedbackCategory; missionId?: string; runId?: string; artifactId?: string }>;
      if (custom.detail) {
        if (custom.detail.category) setFeedbackCategory(custom.detail.category);
        setFeedbackContext({
          missionId: custom.detail.missionId,
          runId: custom.detail.runId,
          artifactId: custom.detail.artifactId,
        });
      }
      setFeedbackOpen(true);
    };

    window.addEventListener('nkyel:open-feedback', handleFeedbackEvent);
    return () => window.removeEventListener('nkyel:open-feedback', handleFeedbackEvent);
  }, []);

  const handleModeChange = (mode: typeof activeViewMode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const isPublicClosed = betaStatus?.state === 'PUBLIC_CLOSED' && !betaStatus?.admitted;
  const isCapacityReached = betaStatus?.state === 'CAPACITY_REACHED' && !betaStatus?.admitted;

  return (
    <div className="nkyel-shell nkyel-monochrome-shell antialiased">
      <div className="nkyel-shell-grid">
        {/* Zone 1: Navigation Souveraine (Sidebar) */}
        <NkyelSidebar />

        {/* Zone 2: Espace Central Dédié (Conversation ou Mission) */}
        <div className="nkyel-shell-center relative flex flex-col flex-1 min-w-0 h-[100dvh] overflow-hidden bg-[var(--bg)]">
          {/* Barre supérieure unique : modèle, offre et modes */}
          <TopBar onOpenCapabilities={() => setCapabilitiesOpen(true)} />

          {/* Corps Central */}
          <main className="nkyel-shell-main flex-1 overflow-hidden relative flex flex-col z-0">
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

      {/* Modales de Configuration et Feedback de Production */}
      <DesktopSettingsModal />
      <PWAInstallPrompt />

      <ProductionFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        defaultCategory={feedbackCategory}
        missionId={feedbackContext.missionId}
        runId={feedbackContext.runId}
        artifactId={feedbackContext.artifactId}
      />

      {/* Écran de Fin de Bêta post-24 août 06h00 Libreville */}
      {isPublicClosed && !dismissClosedScreen && (
        <BetaClosedScreen
          onOpenFeedback={() => setFeedbackOpen(true)}
          onViewHistory={() => setDismissClosedScreen(true)}
          onJoinWaitlist={() => window.location.href = '/waitlist'}
          mode="closed"
        />
      )}

      {/* Écran Bêta Complète (100 places attribuées) */}
      {isCapacityReached && !dismissClosedScreen && (
        <BetaClosedScreen
          onOpenFeedback={() => {}}
          onViewHistory={() => {}}
          onJoinWaitlist={() => window.location.href = '/waitlist'}
          mode="full"
        />
      )}
    </div>
  );
}

