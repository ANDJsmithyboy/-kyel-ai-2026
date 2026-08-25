/**
 * Ñkyel AI — Discreet Artifact Provenance Header · SmartANDJ AI Technologies
 * Ligne d'en-tête discrète et élégante respectant la politique de visibilité à 3 niveaux :
 * - LEVEL 1 (USER) : Affiche uniquement l'agent Ñkyel et le résultat (Infrastructure masquée).
 * - LEVEL 2 (GOOGLE SHOWCASE) : Attribution discrète "Powered by Google · Google Image" UNIQUEMENT si Google Direct (Vérité absolue).
 * - LEVEL 3 (ADMIN) : Télémétrie technique complète.
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { Sparkle, Info, Graph, Check } from '@phosphor-icons/react';
import { resolveAttribution, VisibilityLevel, ProvenanceDetails } from '@/lib/visibility';

export type ArtifactProvenanceData = ProvenanceDetails & {
  createdAt?: string;
  workGraphNodeId?: string;
};

interface ArtifactProvenanceHeaderProps {
  provenance: ArtifactProvenanceData;
  visibilityLevel?: VisibilityLevel;
  onOpenProvenance?: (provenance: ArtifactProvenanceData) => void;
  onOpenWorkGraphNode?: (nodeId: string) => void;
}

export default function ArtifactProvenanceHeader({
  provenance,
  visibilityLevel = 'GOOGLE_SHOWCASE',
  onOpenProvenance,
  onOpenWorkGraphNode,
}: ArtifactProvenanceHeaderProps) {
  const [showPopover, setShowPopover] = useState(false);

  const attr = resolveAttribution(provenance, visibilityLevel);

  return (
    <div className="relative w-full px-3.5 py-1.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
      <div className="flex items-center gap-1.5 truncate">
        <Sparkle size={12} className="text-[#c39a52] shrink-0" />
        {attr.showGoogleAttribution ? (
          <span>
            Généré par <strong className="text-slate-200 font-semibold">{attr.agentLabel}</strong> · <span className="text-[#c39a52] font-semibold">{attr.primaryAttribution}</span>
          </span>
        ) : (
          <span>
            Généré par <strong className="text-slate-200 font-semibold">{attr.agentLabel}</strong>
          </span>
        )}
      </div>

      <button
        onClick={() => {
          if (onOpenProvenance) {
            onOpenProvenance(provenance);
          } else {
            setShowPopover(!showPopover);
          }
        }}
        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0 ml-2"
        title="Inspecter la traçabilité complète dans VIE"
      >
        <Info size={13} />
        <span className="underline decoration-dotted underline-offset-2">Provenance</span>
      </button>

      {/* Popover de provenance rapide si aucun handler parent */}
      {showPopover && (
        <div className="absolute top-full right-2 mt-1 z-30 w-72 p-3 rounded-xl bg-[#0e1626] border border-white/10 shadow-2xl text-xs font-sans text-slate-300 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-semibold text-white">
            <span>Traçabilité & Preuves (VIE)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-1 font-mono text-[11px] text-slate-400">
            <div>Tâche : <span className="text-white">{provenance.taskTitle || 'Génération de livrable'}</span></div>
            <div>Agent : <span className="text-white">{provenance.agentName || 'Visual Agent'}</span></div>
            {attr.showGoogleAttribution && (
              <div>Moteur : <span className="text-[#c39a52]">{attr.primaryAttribution}</span></div>
            )}
            {visibilityLevel === 'ADMIN' && attr.adminDetails && (
              <>
                <div>Provider : <span className="text-white">{attr.adminDetails.provider}</span></div>
                <div>Méthode : <span className="text-white">{attr.adminDetails.accessMethod}</span></div>
                <div>Modèle : <span className="text-white">{attr.adminDetails.model}</span></div>
              </>
            )}
            {provenance.sourceCount !== undefined && (
              <div>Sources utilisées : <span className="text-white">{provenance.sourceCount} sources vérifiées</span></div>
            )}
          </div>

          {provenance.workGraphNodeId && onOpenWorkGraphNode && (
            <button
              onClick={() => {
                onOpenWorkGraphNode(provenance.workGraphNodeId!);
                setShowPopover(false);
              }}
              className="w-full mt-2 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#c39a52] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Graph size={13} />
              <span>Voir dans WorkGraph</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
