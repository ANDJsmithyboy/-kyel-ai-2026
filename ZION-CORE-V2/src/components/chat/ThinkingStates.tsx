'use client';

import React, { useEffect, useState } from 'react';

type ThinkingMode = 'default' | 'search' | 'legal' | 'panther' | 'payment' | 'language' | 'image' | 'analytics';

interface ThinkingStatesProps {
  mode?: ThinkingMode;
  progress?: number;
}

const THINKING_STATES: Record<ThinkingMode, {
  phrases: string[];
  auraColors: string[];
  icon: string;
  label: string;
}> = {
  default: {
    icon: '🌿',
    label: 'GabomaGPT réfléchit',
    auraColors: ['#22C55E', '#38BDF8', '#FACC15'],
    phrases: [
      'GabomaGPT consulte les savoirs gabonais...',
      'Connexion aux mémoires de nos ancêtres...',
      'Les esprits de l\'Iboga guident la réponse...',
      'Synthèse des connaissances du Gabon profond...',
      'Analyse depuis Libreville en cours...'
    ]
  },
  search: {
    icon: '🌊',
    label: 'Recherche en cours',
    auraColors: ['#38BDF8', '#22C55E', '#06B6D4'],
    phrases: [
      'Sondage des courants profonds de l\'Ogooué...',
      'Navigation à travers la brume de Lambaréné...',
      'Remontée du fleuve vers la source des informations...',
      'Traversée du delta vers les données fraîches...',
      'Consultation des archives de Port-Gentil...'
    ]
  },
  legal: {
    icon: '⚖️',
    label: 'Analyse juridique',
    auraColors: ['#A78BFA', '#7C3AED', '#D4A417'],
    phrases: [
      'Consultation silencieuse des anciens...',
      'Ouverture des archives sacrées du Mvett...',
      'Traduction des murmures de la forêt équatoriale...',
      'Convocation du conseil des sages sous l\'arbre à palabre...',
      'Lecture des tablettes du droit OHADA...'
    ]
  },
  panther: {
    icon: '⚫',
    label: 'Panthère en mission',
    auraColors: ['#D4A417', '#FF6B00', '#00FF87'],
    phrases: [
      'La Panthère piste la transaction dans l\'ombre...',
      'Affût nocturne dans la forêt des Abeilles...',
      'Alignement des réseaux... L\'œil de la Panthère est fixé.',
      'Traversée silencieuse de la canopée numérique...',
      'La Panthère approche de sa cible. Patience...'
    ]
  },
  payment: {
    icon: '💫',
    label: 'Sécurisation du paiement',
    auraColors: ['#22C55E', '#D4A417', '#00FF87'],
    phrases: [
      'La Panthère sécurise ta transaction...',
      'Vérification des canaux Airtel Money en cours...',
      'Traversée sécurisée du pont financier gabonais...',
      'Validation de la transaction par les gardiens...',
      'Tes jetons sont en route, frère. Patience un instant.'
    ]
  },
  language: {
    icon: '🌿',
    label: 'Traduction en cours',
    auraColors: ['#22C55E', '#FACC15', '#EF4444'],
    phrases: [
      'Consultation des anciens locuteurs Fang...',
      'Harmonisation avec la phonologie Mpongwé...',
      'Recherche dans les archives linguistiques Punu...',
      'Alignement des structures grammaticales Bantu...',
      'Traduction depuis les profondeurs de la forêt équatoriale...'
    ]
  },
  image: {
    icon: '🎨',
    label: 'Création en cours',
    auraColors: ['#EF4444', '#FACC15', '#A78BFA'],
    phrases: [
      'L\'artiste numérique puise dans l\'imaginaire gabonais...',
      'Fusion des couleurs de la forêt équatoriale...',
      'Modelage des pixels sur l\'enclume du créateur...',
      'L\'image prend forme depuis les profondeurs...',
      'Peinture numérique en cours depuis Libreville...'
    ]
  },
  analytics: {
    icon: '📊',
    label: 'Analyse des données',
    auraColors: ['#38BDF8', '#22C55E', '#FACC15'],
    phrases: [
      'ANDJ Analytics traite les données gabonaises...',
      'Croisement des flux économiques de l\'Afrique centrale...',
      'Cartographie des tendances du marché gabonais...',
      'Synthèse des indicateurs de Libreville à Port-Gentil...',
      'L\'intelligence des données au service du Gabon...'
    ]
  }
};

export default function ThinkingStates({ mode = 'default', progress = 0 }: ThinkingStatesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const state = THINKING_STATES[mode];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % state.phrases.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [state.phrases.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-6 select-none">
      {/* Aura lumineuse */}
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 animate-spin-slow"
          style={{
            background: `conic-gradient(${state.auraColors[0]}, ${state.auraColors[1]}, ${state.auraColors[2]}, ${state.auraColors[0]})`
          }}
        />
        <div className="absolute inset-2 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-2xl animate-pulse-inner">
          {state.icon}
        </div>
      </div>

      {/* Label */}
      <span className="text-xs font-mono tracking-widest text-[var(--text-tertiary)] uppercase">
        {state.label}
      </span>

      {/* Phrase */}
      <div className="h-6 flex items-center">
        <p
          className={`text-sm text-[var(--text-secondary)] text-center font-mono italic max-w-xs transition-opacity duration-400 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {state.phrases[currentIndex % state.phrases.length]}
        </p>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <>
          <div className="w-48 h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: state.auraColors[0]
              }}
            />
          </div>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">{progress}%</span>
        </>
      )}

      {/* Blink dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full animate-blink"
            style={{
              backgroundColor: state.auraColors[i % state.auraColors.length],
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-inner {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-pulse-inner {
          animation: pulse-inner 2s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 1.4s infinite;
        }
      `}</style>
    </div>
  );
}
