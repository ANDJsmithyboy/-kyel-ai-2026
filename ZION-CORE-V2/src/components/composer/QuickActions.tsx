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
    label: 'Présentation Stratégique',
    icon: Presentation,
    prompt: 'Crée un pitch deck stratégique de 10 diapositives pour investisseurs sur :',
    color: '#C39A52',
  },
  {
    id: 'app',
    label: 'Application Interactive',
    icon: Globe,
    prompt: 'Conçois une application web complète avec interface moderne et données dynamiques pour :',
    color: '#665F9E',
  },
  {
    id: 'code',
    label: 'Architecture & Code',
    icon: Code,
    prompt: 'Analyse et écris le code d\'un microservice haute performance en Python/FastAPI pour :',
    color: '#6F9485',
  },
  {
    id: 'research',
    label: 'Veille & Grounding',
    icon: Sparkle,
    prompt: 'Effectue une recherche approfondie avec vérification des sources primaires sur :',
    color: '#315A70',
  },
  {
    id: 'vie',
    label: 'Spatialisation VIE',
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
    <div className="flex items-center justify-center flex-wrap gap-2 pt-2 select-none">
      {DEFAULT_QUICK_ACTIONS.map((pill) => {
        const Icon = pill.icon;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelect(pill.prompt)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#151922]/60 hover:bg-[#151922] border border-white/[0.06] hover:border-white/[0.12] text-[12px] font-medium text-[#B8C0CC] hover:text-[#F1EEE7] transition-all min-h-[36px]"
          >
            <Icon size={15} style={{ color: pill.color }} weight="bold" />
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
