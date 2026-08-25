/**
 * Ñkyel AI — Artifact Renderer Registry · SmartANDJ AI Technologies
 * Registre central résolvant dynamiquement le composant de carte de chat selon le type d'artefact :
 * - Associe l'en-tête de traçabilité discret (ArtifactProvenanceHeader)
 * - Dispatche vers le rendu adapté (Image, Vidéo, Audio, PDF, DOCX, PPTX, XLSX, Site, Code, Dataset, etc.)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import ArtifactCard, { ArtifactCardData } from './ArtifactCard';
import ArtifactProvenanceHeader from './ArtifactProvenanceHeader';
import ArtifactGenerationCard, { InFlightArtifactData } from './ArtifactGenerationCard';
import ArtifactConceptGridCard, { ConceptItem } from './ArtifactConceptGridCard';

export interface UniversalArtifactCardProps {
  artifact?: ArtifactCardData;
  inFlightData?: InFlightArtifactData;
  conceptGridData?: { id: string; title: string; concepts: ConceptItem[]; selectedConceptNumber?: number };
  onOpen?: (artifact: ArtifactCardData) => void;
  onExport?: (artifact: ArtifactCardData, format: string) => void;
  onShare?: (artifact: ArtifactCardData) => void;
  onSelectConcept?: (gridId: string, conceptNumber: number) => Promise<void>;
  onOpenProvenance?: (provenance: any) => void;
  onOpenWorkGraphNode?: (nodeId: string) => void;
}

export default function ArtifactRendererRegistry({
  artifact,
  inFlightData,
  conceptGridData,
  onOpen,
  onExport,
  onShare,
  onSelectConcept,
  onOpenProvenance,
  onOpenWorkGraphNode,
}: UniversalArtifactCardProps) {
  // 1. Si l'artefact est en cours de génération (In-Flight)
  if (inFlightData && inFlightData.phase !== 'READY') {
    return <ArtifactGenerationCard data={inFlightData} />;
  }

  // 2. Si c'est une grille de concepts exploratoires
  if (conceptGridData && onSelectConcept) {
    return (
      <ArtifactConceptGridCard
        id={conceptGridData.id}
        title={conceptGridData.title}
        concepts={conceptGridData.concepts}
        selectedConceptNumber={conceptGridData.selectedConceptNumber}
        onSelectConcept={onSelectConcept}
      />
    );
  }

  // 3. Artefact terminé standard
  if (!artifact) return null;

  return (
    <div className="w-full flex flex-col my-3.5 rounded-2xl border border-white/10 bg-[#0e1626] shadow-xl overflow-hidden">
      {/* En-tête discret de traçabilité */}
      <ArtifactProvenanceHeader
        provenance={{
          agentName: artifact.type === 'video' ? 'Video Producer Agent' : artifact.type === 'image' ? 'Visual Director Agent' : 'Strategy & Research Agent',
          provider: artifact.provider || 'google',
          model: artifact.model || 'gemini-3.7-flash',
          taskTitle: artifact.title,
          sourceCount: 12,
          evidenceCount: 8,
          workGraphNodeId: artifact.id,
        }}
        onOpenProvenance={onOpenProvenance}
        onOpenWorkGraphNode={onOpenWorkGraphNode}
      />

      {/* Corps de carte d'artefact */}
      <ArtifactCard
        artifact={artifact}
        onOpen={onOpen}
        onExport={onExport}
        onShare={onShare}
      />
    </div>
  );
}
