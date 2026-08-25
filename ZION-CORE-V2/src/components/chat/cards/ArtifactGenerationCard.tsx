/**
 * Ñkyel AI — In-Flight Live Generation Card · SmartANDJ AI Technologies
 * Expérience visuelle vivante de génération d'artefacts en temps réel :
 * - Réservation préalable de l'espace (aspect ratio 16:9, 1:1, 4:5) évitant tout saut d'interface
 * - Progression par phases réelles vérifiées (Zéro pourcentage fabriqué)
 * - Morphing direct en carte d'artefact finalisée dès l'émission de l'événement artifact.ready
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CircleNotch, Sparkle, Image as ImageIcon, VideoCamera, FileText, Table, Presentation, Check } from '@phosphor-icons/react';

export type GenerationPhase = 'PREPARING' | 'GENERATING' | 'PROCESSING' | 'VALIDATING' | 'READY' | 'FAILED';

export interface InFlightArtifactData {
  id: string;
  agentName: string;
  taskTitle: string;
  type: 'image' | 'video' | 'report' | 'pptx' | 'xlsx' | 'website';
  model: string;
  provider: string;
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16';
  phase: GenerationPhase;
  phaseLabel?: string;
  sourceCount?: number;
  evidenceCount?: number;
}

interface ArtifactGenerationCardProps {
  data: InFlightArtifactData;
}

export default function ArtifactGenerationCard({ data }: ArtifactGenerationCardProps) {
  const aspectClass = {
    '16:9': 'aspect-video',
    '1:1': 'aspect-square',
    '4:5': 'aspect-[4/5]',
    '9:16': 'aspect-[9/16]',
  }[data.aspectRatio || '16:9'];

  const phaseMessages: Record<GenerationPhase, string> = {
    PREPARING: 'Préparation du brief & des contraintes...',
    GENERATING: data.type === 'video' ? 'Inférence vidéo Veo 3.1 en cours...' : data.type === 'image' ? 'Génération du visuel haute résolution...' : 'Structuration du livrable...',
    PROCESSING: 'Traitement des couches & assemblage...',
    VALIDATING: 'Validation de l\'intégrité & calcul SHA-256...',
    READY: 'Artefact prêt et vérifié.',
    FAILED: 'Échec de génération. Recommencez ou changez de modèle.',
  };

  const currentMessage = data.phaseLabel || phaseMessages[data.phase] || 'Traitement agentique en cours...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full my-3.5 rounded-2xl border border-[var(--accent,#c39a52)]/30 bg-[#0e1626]/90 shadow-xl overflow-hidden text-white"
    >
      {/* En-tête de carte en cours */}
      <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CircleNotch size={14} className="text-[#c39a52] animate-spin shrink-0" />
          <span className="font-semibold text-white">{data.agentName || 'Visual Agent'}</span>
          <span className="text-[11px] font-mono text-slate-400">· {data.taskTitle}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#c39a52] px-2 py-0.5 rounded-full bg-[#c39a52]/10 border border-[#c39a52]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c39a52] animate-ping" />
          <span>{data.phase}</span>
        </div>
      </div>

      {/* Zone Canvas Réservée (Empêche tout saut de mise en page) */}
      <div className={`relative w-full ${aspectClass} max-h-[300px] bg-[#060911] flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
        {/* Motif d'arrière-plan discret */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="relative z-10 flex flex-col items-center gap-3 max-w-sm">
          {data.type === 'video' ? (
            <VideoCamera size={36} className="text-[#cf72a8] animate-pulse" />
          ) : data.type === 'image' ? (
            <ImageIcon size={36} className="text-[#c39a52] animate-pulse" />
          ) : data.type === 'pptx' ? (
            <Presentation size={36} className="text-[#c39a52] animate-pulse" />
          ) : data.type === 'xlsx' ? (
            <Table size={36} className="text-[#6f9485] animate-pulse" />
          ) : (
            <FileText size={36} className="text-[#be6254] animate-pulse" />
          )}

          <div className="text-xs font-medium text-slate-200">{currentMessage}</div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
            <span>Modèle : {data.model}</span>
            {data.sourceCount !== undefined && (
              <>
                <span>•</span>
                <span>{data.sourceCount} sources</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pied de carte */}
      <div className="px-4 py-2 bg-[#121826] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>{data.provider} · {data.type.toUpperCase()}</span>
        <span>Espace réservé {data.aspectRatio || '16:9'}</span>
      </div>
    </motion.div>
  );
}
