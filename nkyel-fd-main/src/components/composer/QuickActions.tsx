/**
 * Ñkyel AI · QuickActions
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Pilules d'inspiration et raccourcis d'actions rapides pour la page d'accueil
 */

'use client';

import React from 'react';
import {
  Presentation,
  Globe,
  Palette,
  Code,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react';

export interface QuickPill {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  prompt: string;
  color: string;
}

export const DEFAULT_QUICK_ACTIONS: QuickPill[] = [
  {
    id: 'deck',
    label: 'Créer des diapositives',
    icon: Presentation,
    prompt: 'Crée un pitch deck stratégique de 10 diapositives pour investisseurs sur :',
    color: '#C9A24E',
  },
  {
    id: 'app',
    label: 'Créer un site web',
    icon: Globe,
    prompt: 'Conçois une application web complète avec interface moderne et données dynamiques pour :',
    color: '#665F9E',
  },
  {
    id: 'code',
    label: 'Conception',
    icon: Code,
    prompt: 'Analyse et écris le code d\'un microservice haute performance en Python/FastAPI pour :',
    color: '#6F9485',
  },
  {
    id: 'research',
    label: 'Recherche',
    icon: Sparkle,
    prompt: 'Effectue une recherche approfondie avec vérification des sources primaires sur :',
    color: '#315A70',
  },
  {
    id: 'vie',
    label: 'WorkGraph',
    icon: TreeStructure,
    prompt: 'Modélise l\'exécution spatiale et le WorkGraph pour :',
    color: '#765E78',
  },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="nkyel-quick-actions select-none">
      {DEFAULT_QUICK_ACTIONS.map((pill) => {
        const Icon = pill.icon;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelect(pill.prompt)}
            className="nkyel-quick-pill"
          >
            <Icon size={18} style={{ color: pill.color }} weight="regular" />
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
