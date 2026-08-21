/**
 * Ñkyel AI · Beta Status Banner & Countdown
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Affiche l'état réel de la Bêta 42 heures, le compteur de places (100 max)
 * et le bouton d'accès au formulaire de retour d'expérience.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { type BetaStatusResponse, fetchBetaStatus, enrollInBeta } from '@/lib/betaStateMachine';
import { Sparkle, Timer, Users, Lock, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface BetaStatusBannerProps {
  onOpenFeedback?: () => void;
}

export default function BetaStatusBanner({ onOpenFeedback }: BetaStatusBannerProps) {
  const [status, setStatus] = useState<BetaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchBetaStatus();
        if (mounted) {
          setStatus(data);
          setLoading(false);
        }
      } catch {
        // Fallback discret
        if (mounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000); // Polling toutes les 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Formatage du décompte
  useEffect(() => {
    if (!status?.server_time) return;

    let seconds = status.server_time.seconds_remaining;
    const timer = setInterval(() => {
      if (seconds <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }
      seconds -= 1;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setTimeRemaining(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  if (loading || !status) return null;

  const { state, campaign, user_enrollment } = status;

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await enrollInBeta();
      if (res.success) {
        const updated = await fetchBetaStatus();
        setStatus(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’inscription.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="w-full bg-[#0E121A]/90 border-b border-white/[0.08] backdrop-blur-md px-4 py-2 flex flex-wrap items-center justify-between text-xs text-[#F1EEE7] gap-2 z-30">
      {/* Badge & Statut principal */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/30 text-[#E5B842] font-semibold text-[11px] tracking-wide">
          <Sparkle size={13} weight="fill" />
          BÊTA PRIVÉE 42H
        </span>

        {state === 'PRELAUNCH' && (
          <span className="text-[#F1EEE7]/80 flex items-center gap-1.5 font-medium">
            <Timer size={14} className="text-[#C59B27]" />
            Ouverture le 22 août à 12h00 Libreville · 100 accès gratuits
            {timeRemaining && <span className="text-[#E5B842] font-mono font-bold">({timeRemaining})</span>}
          </span>
        )}

        {state === 'OPEN' && (
          <span className="text-[#F1EEE7]/90 flex items-center gap-1.5 font-medium">
            <Users size={14} className="text-emerald-400" />
            <span className="font-semibold text-emerald-300">{campaign.claimed_seats}/100 places</span> attribuées
            {timeRemaining && <span className="text-[#F1EEE7]/50 font-mono text-[11px]">· Clôture dans {timeRemaining}</span>}
          </span>
        )}

        {state === 'CAPACITY_REACHED' && (
          <span className="text-[#F1EEE7]/80 flex items-center gap-1.5 font-medium">
            <Lock size={14} className="text-amber-400" />
            Toutes les 100 places ont été attribuées · Liste d'attente active
          </span>
        )}

        {state === 'PUBLIC_CLOSED' && (
          <span className="text-[#F1EEE7]/70 flex items-center gap-1.5 font-medium">
            <CheckCircle size={14} className="text-blue-400" />
            Bêta terminée · Mode consultation de votre historique
          </span>
        )}
      </div>

      {/* Actions & Siège utilisateur */}
      <div className="flex items-center gap-3">
        {user_enrollment.enrolled ? (
          <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-emerald-300 font-mono text-[11px]">
            Siège Pionnier #{user_enrollment.seat_number}
          </span>
        ) : state === 'OPEN' ? (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-3 py-1 rounded-lg bg-[#C59B27] hover:bg-[#D4A932] text-black font-semibold text-[11px] transition shadow-sm"
          >
            {enrolling ? 'Attribution...' : 'Réserver ma place'}
          </button>
        ) : null}

        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[#F1EEE7] border border-white/[0.1] text-[11px] font-medium transition"
          >
            Donner mon avis
          </button>
        )}
      </div>
    </div>
  );
}
