/**
 * Ñkyel AI · Beta Closed Screen (Écran officiel de fin de Bêta)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * S'affiche automatiquement à partir du 24 août 2026 à 06h00 Libreville (05h00 UTC).
 * Bloque les nouveaux appels payants LLM/médias et permet la consultation
 * en lecture seule de l'historique ainsi que la saisie du retour d'expérience.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { ChatTeardropText, ClockCounterClockwise, UserPlus, GlobeHemisphereWest, Sparkle } from '@phosphor-icons/react';

interface BetaClosedScreenProps {
  onOpenFeedback: () => void;
  onViewHistory: () => void;
  onJoinWaitlist?: () => void;
}

export default function BetaClosedScreen({
  onOpenFeedback,
  onViewHistory,
  onJoinWaitlist,
}: BetaClosedScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#08090D]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-[#F1EEE7] select-none overflow-y-auto">
      {/* Conteneur Élégant */}
      <div className="max-w-xl w-full bg-[#0E121A] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
        {/* Halo décoratif Wada Sanzo */}
        <div
          className="absolute -top-24 -start-24 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C59B27 0%, transparent 70%)' }}
        />

        {/* Logo Ñkyel AI */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-6 border border-[#C59B27]/40 shadow-lg">
          <Image
            src="/Nkyel AI-logo.jpeg"
            alt="Ñkyel AI"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Badge Clôture */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[#E5B842] text-xs font-semibold tracking-wider uppercase mb-4">
          <Sparkle size={14} weight="fill" />
          Clôture de la Bêta 42h
        </span>

        {/* Titre & Message Officiel */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#F1EEE7]">
          La bêta privée de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5B842] to-[#F1EEE7]">Ñkyel AI</span> est terminée.
        </h2>

        <p className="text-sm sm:text-base text-[#F1EEE7]/80 leading-relaxed mb-8">
          Merci aux 100 premiers testeurs. Vos retours contribueront directement à la prochaine version de Ñkyel AI. Vous pouvez encore consulter votre historique et compléter votre retour d’expérience.
        </p>

        {/* Grille d'actions souveraines */}
        <div className="w-full flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={onOpenFeedback}
            className="flex-1 py-3 px-5 rounded-xl bg-[#C59B27] hover:bg-[#D4A932] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
          >
            <ChatTeardropText size={18} weight="bold" />
            Donner mon avis
          </button>

          <button
            onClick={onViewHistory}
            className="flex-1 py-3 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F1EEE7] border border-white/[0.12] font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <ClockCounterClockwise size={18} />
            Consulter mon historique
          </button>
        </div>

        {/* Liens secondaires */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#F1EEE7]/60">
          <a
            href="/waitlist"
            onClick={(e) => {
              if (onJoinWaitlist) {
                e.preventDefault();
                onJoinWaitlist();
              }
            }}
            className="hover:text-[#E5B842] flex items-center gap-1.5 transition underline-offset-4 hover:underline"
          >
            <UserPlus size={15} />
            Rejoindre la liste d'attente
          </a>

          <span>•</span>

          <a
            href="https://smartandjai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#E5B842] flex items-center gap-1.5 transition underline-offset-4 hover:underline"
          >
            <GlobeHemisphereWest size={15} />
            Suivre SmartANDJ AI Technologies
          </a>
        </div>

        {/* Mention Souveraine */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] w-full text-center text-[11px] text-[#F1EEE7]/40 tracking-wider">
          SMARTANDJ AI TECHNOLOGIES · LIBREVILLE, GABON · CANDIDATURE GOOGLE 2026
        </div>
      </div>
    </div>
  );
}
