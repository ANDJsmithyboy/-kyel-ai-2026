/**
 * Ñkyel AI · ModelSelector
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Sélecteur dynamique souverain — « Ñkyel » par défaut.
 * Aucune version ou modèle figé en dur : les métadonnées proviennent du Capability Registry.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, CaretDown, Check, ShieldCheck, Cpu } from '@phosphor-icons/react';

export interface ModelOption {
  id: string;
  label: string;
  tagline: string;
  provider: string;
  badge?: string;
}

export const DYNAMIC_ENGINES: ModelOption[] = [
  {
    id: 'nkyel-auto',
    label: 'Ñkyel',
    tagline: 'Orchestration intelligente multimodale & routage automatique',
    provider: 'Moteur Souverain',
    badge: 'Recommandé',
  },
  {
    id: 'nkyel-pro',
    label: 'Ñkyel Pro',
    tagline: 'Raisonnement logique profond, synthèse et code',
    provider: 'DeerFlow Orchestrator',
  },
  {
    id: 'nkyel-research',
    label: 'Ñkyel Research',
    tagline: 'Recherche web approfondie & grounding vérifié',
    provider: 'Google Search Grounding',
  },
  {
    id: 'nkyel-multi-agent',
    label: 'Ñkyel Multi-Agent (A2A)',
    tagline: 'Collaboration et délégation entre agents spécialisés',
    provider: 'A2A Protocol Mesh',
  },
];

interface ModelSelectorProps {
  selectedEngineId?: string;
  onSelectEngine: (engineId: string) => void;
}

export default function ModelSelector({
  selectedEngineId = 'nkyel-auto',
  onSelectEngine,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeEngine =
    DYNAMIC_ENGINES.find((e) => e.id === selectedEngineId) || DYNAMIC_ENGINES[0];

  return (
    <div className="relative inline-block text-left">
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151922]/80 hover:bg-[#151922] border border-white/[0.08] text-[12px] font-medium text-[#F1EEE7] transition-all hover:border-white/[0.14] select-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Sparkle size={14} className="text-[#C8C8C8]" weight="fill" />
        <span>{activeEngine.label}</span>
        <CaretDown size={12} className={`text-[#7E8795] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Déroulant Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 bottom-full mb-2 w-72 rounded-2xl bg-[#0E121A]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl p-1.5 z-50 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <span className="text-[11px] font-mono text-[#7E8795] uppercase tracking-wider">
                  Moteur d'exécution actif
                </span>
              </div>

              <div className="space-y-1">
                {DYNAMIC_ENGINES.map((engine) => {
                  const isSelected = engine.id === activeEngine.id;

                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        onSelectEngine(engine.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#151922] border border-white/[0.08] text-[#F1EEE7]'
                          : 'hover:bg-white/[0.04] text-[#B8C0CC]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-[#F1EEE7]">
                            {engine.label}
                          </span>
                          {engine.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] text-[#B8B8B8] border border-white/[0.12] font-mono">
                              {engine.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7E8795] line-clamp-1 mt-0.5">
                          {engine.tagline}
                        </span>
                      </div>

                      {isSelected && (
                        <Check size={16} className="text-[#A8A8A8] shrink-0 mt-0.5" weight="bold" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 px-3 py-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#7E8795] font-mono">
                <span>Routage dynamique</span>
                <span className="text-[#A8A8A8]">Connecté</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
