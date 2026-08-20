/**
 * Ñkyel AI · AgenticToggles
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Toggles rapides pour activer/désactiver les capacités agentiques dans le compositeur :
 * - Skills (SKILL.md)
 * - Connecteurs MCP
 * - Recherche & Grounding
 * - Collaboration A2A
 */

'use client';

import React from 'react';
import {
  PuzzlePiece,
  PlugsConnected,
  Globe,
  UsersThree,
} from '@phosphor-icons/react';

export interface AgenticFeaturesState {
  skillsEnabled: boolean;
  mcpEnabled: boolean;
  groundingEnabled: boolean;
  a2aEnabled: boolean;
}

interface AgenticTogglesProps {
  state: AgenticFeaturesState;
  onChange: (newState: AgenticFeaturesState) => void;
}

export default function AgenticToggles({ state, onChange }: AgenticTogglesProps) {
  const toggle = (key: keyof AgenticFeaturesState) => {
    onChange({
      ...state,
      [key]: !state[key],
    });
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
      {/* 1. Skills Toggle */}
      <button
        type="button"
        onClick={() => toggle('skillsEnabled')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
          state.skillsEnabled
            ? 'bg-[#C39A52]/15 border-[#C39A52]/40 text-[#C39A52]'
            : 'bg-white/[0.02] border-white/[0.06] text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
        title="Activer le chargement dynamique des Skills (SKILL.md)"
      >
        <PuzzlePiece size={13} weight={state.skillsEnabled ? 'fill' : 'regular'} />
        <span>Skills</span>
      </button>

      {/* 2. MCP Toggle */}
      <button
        type="button"
        onClick={() => toggle('mcpEnabled')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
          state.mcpEnabled
            ? 'bg-[#315A70]/25 border-[#5BA3B5]/40 text-[#5BA3B5]'
            : 'bg-white/[0.02] border-white/[0.06] text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
        title="Activer l'accès aux serveurs et outils MCP"
      >
        <PlugsConnected size={13} weight={state.mcpEnabled ? 'fill' : 'regular'} />
        <span>MCP</span>
      </button>

      {/* 3. Grounding / Sources Toggle */}
      <button
        type="button"
        onClick={() => toggle('groundingEnabled')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
          state.groundingEnabled
            ? 'bg-[#315A70]/30 border-[#315A70]/50 text-[#AAA2C8]'
            : 'bg-white/[0.02] border-white/[0.06] text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
        title="Activer la recherche Google Grounding & citations vérifiées"
      >
        <Globe size={13} weight={state.groundingEnabled ? 'fill' : 'regular'} />
        <span>Recherche</span>
      </button>

      {/* 4. A2A Toggle */}
      <button
        type="button"
        onClick={() => toggle('a2aEnabled')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
          state.a2aEnabled
            ? 'bg-[#6F9485]/20 border-[#6F9485]/40 text-[#6F9485]'
            : 'bg-white/[0.02] border-white/[0.06] text-[#7E8795] hover:text-[#B8C0CC]'
        }`}
        title="Activer la délégation multi-agents via le protocole A2A"
      >
        <UsersThree size={13} weight={state.a2aEnabled ? 'fill' : 'regular'} />
        <span>A2A</span>
      </button>
    </div>
  );
}
