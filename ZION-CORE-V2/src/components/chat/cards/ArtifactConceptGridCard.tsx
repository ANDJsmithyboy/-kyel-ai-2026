/**
 * Ñkyel AI — 4-Concept Ideation Grid Card · SmartANDJ AI Technologies
 * Grille de 4 concepts exploratoires générés par l'agent :
 * - Présentation visuelle compacte 2x2
 * - Sélection interactive par l'utilisateur du concept préféré
 * - Déclenchement de la version finale dérivée dans le WorkGraph
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkle, Check, Eye } from '@phosphor-icons/react';

export interface ConceptItem {
  id: string;
  concept_number: number;
  label: string;
  prompt: string;
  preview_url?: string;
}

interface ArtifactConceptGridCardProps {
  id: string;
  title: string;
  concepts: ConceptItem[];
  selectedConceptNumber?: number;
  onSelectConcept: (gridId: string, conceptNumber: number) => Promise<void>;
}

export default function ArtifactConceptGridCard({
  id,
  title,
  concepts,
  selectedConceptNumber,
  onSelectConcept,
}: ArtifactConceptGridCardProps) {
  const [selected, setSelected] = useState<number | null>(selectedConceptNumber || null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (num: number) => {
    setSelected(num);
    setLoading(true);
    try {
      await onSelectConcept(id, num);
    } catch (e) {
      console.error('Concept selection error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full my-3.5 rounded-2xl border border-[var(--border,rgba(255,255,255,0.08))] bg-[#0e1626] shadow-xl overflow-hidden text-white"
    >
      {/* En-tête */}
      <div className="px-4 py-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle size={16} className="text-[#c39a52]" />
          <h4 className="font-bold text-xs text-white">{title}</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">4 Concepts Exploratoires</span>
      </div>

      {/* Grille 2x2 de concepts */}
      <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {concepts.map((c) => {
          const isChosen = selected === c.concept_number;
          return (
            <div
              key={c.id}
              onClick={() => handleSelect(c.concept_number)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isChosen
                  ? 'border-[#c39a52] bg-[#c39a52]/10 ring-1 ring-[#c39a52]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
              }`}
            >
              <div className="aspect-video w-full rounded-lg bg-black/50 border border-white/5 mb-2.5 flex items-center justify-center overflow-hidden">
                {c.preview_url ? (
                  <img src={c.preview_url} alt={c.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-mono text-[#c39a52]">{c.label}</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{c.label}</span>
                  {isChosen && <Check size={14} weight="bold" className="text-[#c39a52]" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{c.prompt}</p>
              </div>

              <button
                disabled={loading}
                className={`mt-2.5 w-full py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  isChosen
                    ? 'bg-[#c39a52] text-[#0a0e17]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {isChosen ? (
                  <>
                    <Check size={13} weight="bold" />
                    <span>Concept Sélectionné</span>
                  </>
                ) : (
                  <span>Choisir ce concept</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
