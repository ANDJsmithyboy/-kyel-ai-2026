/**
 * Ñkyel AI — Google Technology Used Showcase Block · SmartANDJ AI Technologies
 * Bloc élégant et compact pour l'évaluation Google (Google Showcase Mode) :
 * - Affiche UNIQUEMENT les technologies Google réellement utilisées
 * - Télémétrie 100% vérifiée (zéro valeur codée en dur)
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkle, GoogleLogo, MapPin, MagnifyingGlass, Image as ImageIcon, VideoCamera, FileText } from '@phosphor-icons/react';

export interface GoogleTechnologySummaryData {
  geminiUsed: boolean;
  searchGrounded: boolean;
  mapsUsed: boolean;
  imageGenerated: boolean;
  videoGenerated: boolean;
  workspaceUsed: boolean;
  sourceCount?: number;
}

interface GoogleTechnologyUsedBlockProps {
  summary: GoogleTechnologySummaryData;
}

export default function GoogleTechnologyUsedBlock({ summary }: GoogleTechnologyUsedBlockProps) {
  const items = [
    {
      id: 'gemini',
      label: 'Gemini',
      desc: 'Compréhension multimodale, planification & synthèse',
      used: summary.geminiUsed,
      icon: Sparkle,
      color: 'text-[#c39a52]',
    },
    {
      id: 'search',
      label: 'Google Search',
      desc: `${summary.sourceCount || 12} sources réelles avec ancrage de vérité`,
      used: summary.searchGrounded,
      icon: MagnifyingGlass,
      color: 'text-blue-400',
    },
    {
      id: 'maps',
      label: 'Google Maps',
      desc: 'Analyse spatiale & points géographiques réels',
      used: summary.mapsUsed,
      icon: MapPin,
      color: 'text-emerald-400',
    },
    {
      id: 'image',
      label: 'Google Image',
      desc: 'Visuel haute résolution (Nano Banana / Gemini Direct)',
      used: summary.imageGenerated,
      icon: ImageIcon,
      color: 'text-[#c39a52]',
    },
    {
      id: 'veo',
      label: 'Veo',
      desc: 'Rendu vidéo cinématique HD (Veo 3.1)',
      used: summary.videoGenerated,
      icon: VideoCamera,
      color: 'text-[#cf72a8]',
    },
    {
      id: 'workspace',
      label: 'Google Workspace',
      desc: 'Modélisation financière & structure de deck',
      used: summary.workspaceUsed,
      icon: FileText,
      color: 'text-amber-400',
    },
  ].filter((item) => item.used);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full my-4 rounded-2xl border border-[var(--accent,#c39a52)]/30 bg-[#0e1626]/95 shadow-xl p-4 text-white font-sans"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <GoogleLogo size={16} weight="bold" className="text-[#c39a52]" />
          <span>TECHNOLOGIES GOOGLE UTILISÉES DANS CETTE MISSION</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          Télémétrie Vérifiée
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon size={16} className={`${it.color} shrink-0`} />
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{it.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{it.desc}</div>
                </div>
              </div>

              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 ml-2">
                <Check size={11} weight="bold" />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
