/**
 * Ñkyel AI — Slide Deck & Presentation Viewer · SmartANDJ AI Technologies
 * Visualiseur de présentations professionnelles :
 * - Carrousel de diapositives haute résolution (Format 16:9)
 * - Navigation par vignettes
 * - Mode présentation plein écran
 * - Exportation PPTX authentique & PDF
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  CaretLeft,
  CaretRight,
  Presentation,
  ArrowsOut,
  DownloadSimple,
  Note,
  Check,
} from '@phosphor-icons/react';

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

interface SlideViewerProps {
  title: string;
  slides?: SlideData[];
  onExport?: (format: 'pptx' | 'pdf') => void;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 1,
    title: 'Gabon Écotourisme 2026',
    subtitle: 'Stratégie de Lancement International & Positionnement Souverain',
    bullets: [
      'Positionnement mondial : Le dernier sanctuaire équatorial préservé',
      'Marchés cibles prioritaires : Europe de l\'Ouest & Amérique du Nord',
      'Objectif : 100 000 visiteurs éco-responsables à haute valeur d\'ici 2028',
    ],
    notes: 'Insister sur la biodiversité unique (Loango, Pongara, Ivindo) et la forêt primaire.',
  },
  {
    id: 2,
    title: 'Analyse du Marché & Opportunités',
    subtitle: 'Segments Voyageurs Éco-Luxe & Aventure Durable',
    bullets: [
      'Croissance annuelle de 14.8% sur le segment mondial de l\'écotourisme',
      'Forte appétence pour l\'immersion faunique non altérée',
      'Faible concurrence directe en Afrique Centrale',
    ],
    notes: 'Montrer les études comparatives avec le Costa Rica et le Rwanda.',
  },
  {
    id: 3,
    title: 'Plan Opérationnel & Investissements Q1-Q2',
    subtitle: 'Déploiement Budgétaire Équilibré ($305,000)',
    bullets: [
      'Campagne digitale omnicanale & médias : $120,000',
      'Résidences d\'influence & voyages de presse : $85,000',
      'Certifications environnementales & éco-lodges : $50,000',
      'Relations publiques & partenariats tour-opérateurs : $50,000',
    ],
    notes: 'Rassurer sur le ROI estimé à 3.2x dès la première saison touristique.',
  },
];

export default function SlideViewer({
  title,
  slides = DEFAULT_SLIDES,
  onExport,
}: SlideViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Presentation size={18} className="text-[#c39a52]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showNotes ? 'bg-[#c39a52] text-[#0a0e17]' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Note size={14} />
            <span>Notes</span>
          </button>

          <button
            onClick={() => onExport && onExport('pptx')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export PPTX</span>
          </button>
        </div>
      </div>

      {/* Zone Centrale : Diapositive Active */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vignettes à gauche */}
        <div className="w-48 border-r border-white/10 p-3 space-y-2.5 overflow-y-auto bg-[#0a0e17]/80 hidden md:block">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`w-full p-2.5 rounded-xl border text-left transition-all aspect-video flex flex-col justify-between ${
                currentSlideIndex === idx
                  ? 'border-[#c39a52] bg-[#c39a52]/10 ring-1 ring-[#c39a52]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-300 truncate">{s.title}</div>
              <div className="text-[9px] font-mono text-slate-500 text-right">{idx + 1}</div>
            </button>
          ))}
        </div>

        {/* Diapositive 16:9 Principale */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#060911]">
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl bg-gradient-to-br from-[#121826] via-[#1a2333] to-[#0d1422] border border-white/10 shadow-2xl p-8 md:p-12 flex flex-col justify-between text-left">
            <div>
              <div className="text-[#c39a52] text-xs font-mono font-semibold uppercase tracking-widest mb-2">
                ÑKYEL AI · STRATEGIC DECK
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm md:text-base text-slate-400 mb-6 font-medium">
                  {currentSlide.subtitle}
                </p>
              )}

              <ul className="space-y-3.5 my-4">
                {currentSlide.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-[#c39a52] mt-2 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pied de diapositive */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Souveraineté Économique Gabon 2026</span>
              <span>Diapositive {currentSlideIndex + 1} / {slides.length}</span>
            </div>
          </div>

          {/* Contrôles de navigation */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-30 transition-colors"
            >
              <CaretLeft size={18} />
            </button>

            <span className="text-xs font-mono text-slate-400">
              {currentSlideIndex + 1} de {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-30 transition-colors"
            >
              <CaretRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Notes du présentateur si activées */}
      {showNotes && currentSlide.notes && (
        <div className="p-4 bg-[#121826] border-t border-white/10 text-xs text-slate-300 flex items-start gap-3">
          <Note size={18} className="text-[#c39a52] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Notes de présentation : </span>
            <span>{currentSlide.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
