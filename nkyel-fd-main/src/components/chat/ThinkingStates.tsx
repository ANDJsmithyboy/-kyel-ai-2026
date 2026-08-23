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
    label: 'Ñkyel AI réfléchit',
    auraColors: ['#22C55E', '#38BDF8', '#FACC15'],
    phrases: [
      'Ñkyel AI orchestre le réseau mondial...',
      'Raisonnement arborescent et vérification croisée...',
      'Activation des modèles de raisonnement profond...',
      'Synthèse des connaissances universelles...',
      'Analyse multi-modèles et inférence en cours...'
    ]
  },
  search: {
    icon: '🌊',
    label: 'Recherche en cours',
    auraColors: ['#38BDF8', '#22C55E', '#06B6D4'],
    phrases: [
      'Exploration du web en temps réel...',
      'Indexation des sources scientifiques et documentaires...',
      'Vérification croisée des données mondiales...',
      'Extraction des faits vérifiés et citations...',
      'Filtrage des informations haute confiance...'
    ]
  },
  legal: {
    icon: '⚖️',
    label: 'Analyse juridique',
    auraColors: ['#A78BFA', '#7C3AED', '#D4A417'],
    phrases: [
      'Consultation des corpus juridiques internationaux...',
      'Vérification de conformité réglementaire...',
      'Analyse comparative des clauses contractuelles...',
      'Contrôle de conformité RGPD et droit des affaires...',
      'Synthèse juridique structurée...'
    ]
  },
  panther: {
    icon: '⚫',
    label: 'Agent en mission',
    auraColors: ['#D4A417', '#FF6B00', '#00FF87'],
    phrases: [
      'Orchestration des sous-agents autonomes...',
      'Exécution des étapes du WorkGraph...',
      'Contrôle des métriques de précision...',
      'Traversée des protocoles de communication...',
      'Finalisation de la mission...'
    ]
  },
  payment: {
    icon: '💫',
    label: 'Sécurisation de la transaction',
    auraColors: ['#22C55E', '#D4A417', '#00FF87'],
    phrases: [
      'Sécurisation de la transaction...',
      'Vérification des passerelles de paiement...',
      'Chiffrement bancaire de bout en bout...',
      'Validation de la transaction par les serveurs sécurisés...',
      'Attribution immédiate de vos crédits.'
    ]
  },
  language: {
    icon: '🌿',
    label: 'Traduction en cours',
    auraColors: ['#22C55E', '#FACC15', '#EF4444'],
    phrases: [
      'Alignement des structures linguistiques universelles...',
      'Traitement phonologique et sémantique multilingue...',
      'Recherche dans les corpus de langues mondiales & africaines...',
      'Harmonisation contextuelle et nuances culturelles...',
      'Traduction fidèle haute fidélité en cours...'
    ]
  },
  image: {
    icon: '🎨',
    label: 'Création en cours',
    auraColors: ['#EF4444', '#FACC15', '#A78BFA'],
    phrases: [
      'L\'artiste numérique compose la scène...',
      'Génération haute résolution par le studio VIE...',
      'Modelage des pixels et rendu texturé...',
      'L\'image prend forme sur la toile...',
      'Rendu final de l\'artéfact visuel...'
    ]
  },
  analytics: {
    icon: '📊',
    label: 'Analyse des données',
    auraColors: ['#38BDF8', '#22C55E', '#FACC15'],
    phrases: [
      'ANDJ Analytics traite les flux de données mondiaux...',
      'Croisement des indicateurs économiques et financiers...',
      'Cartographie des tendances de marché globales...',
      'Synthèse des métriques de performance...',
      'L\'intelligence des données au service de la décision...'
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
