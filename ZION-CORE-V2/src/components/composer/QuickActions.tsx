/**
 * Ñkyel AI · QuickActions
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Inspiration pills and quick action shortcuts for the home page.
 */

'use client';

import React from 'react';
import {
  Presentation,
  Globe,
  Code,
  Sparkle,
  TreeStructure,
} from '@phosphor-icons/react';

export interface QuickPill {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  prompt: string;
  colorVar: string;
}

export const DEFAULT_QUICK_ACTIONS: QuickPill[] = [
  {
    id: 'deck',
    label: 'Présentation Stratégique',
    icon: Presentation,
    prompt: 'Crée un pitch deck stratégique de 10 diapositives pour investisseurs sur :',
    colorVar: 'var(--hue-warning)',
  },
  {
    id: 'app',
    label: 'Application Interactive',
    icon: Globe,
    prompt: 'Conçois une application web complète avec interface moderne et données dynamiques pour :',
    colorVar: 'var(--hue-agent)',
  },
  {
    id: 'code',
    label: 'Architecture & Code',
    icon: Code,
    prompt: "Analyse et écris le code d'un microservice haute performance en Python/FastAPI pour :",
    colorVar: 'var(--hue-success)',
  },
  {
    id: 'research',
    label: 'Veille & Grounding',
    icon: Sparkle,
    prompt: 'Effectue une recherche approfondie avec vérification des sources primaires sur :',
    colorVar: 'var(--hue-source)',
  },
  {
    id: 'vie',
    label: 'Spatialisation VIE',
    icon: TreeStructure,
    prompt: "Modélise l'exécution spatiale et le WorkGraph pour :",
    colorVar: 'var(--hue-plum)',
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
            className="flex items-center gap-2 font-medium"
            style={{
              paddingInline: '14px',
              paddingBlock: '8px',
              minHeight: 36,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              transition: `all var(--transition-fast)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-subtle)';
              e.currentTarget.style.borderColor = 'var(--accent-muted)';
              e.currentTarget.style.color = 'var(--fg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-raised)';
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--fg-muted)';
            }}
          >
            <Icon size={15} style={{ color: pill.colorVar }} weight="bold" />
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
