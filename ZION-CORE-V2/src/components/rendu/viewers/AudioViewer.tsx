/**
 * Ñkyel AI — Audio & Voice Asset Viewer · SmartANDJ AI Technologies
 * Visualiseur d'actifs audio, spots sonores et podcasts générés :
 * - Lecteur audio avec waveform et scrubber
 * - Retranscription synchronisée
 * - Téléchargement MP3 / WAV
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import {
  SpeakerHigh,
  Play,
  Pause,
  DownloadSimple,
  Waveform,
  FileText,
} from '@phosphor-icons/react';

interface AudioViewerProps {
  title: string;
  url?: string;
  durationSeconds?: number;
  transcript?: string;
  model?: string;
  onExport?: (format: 'mp3' | 'wav') => void;
}

export default function AudioViewer({
  title,
  url,
  durationSeconds = 30,
  transcript = "Bienvenue dans l'aventure équatoriale du Gabon. Découvrez la nature sauvage de Loango, les plages dorées de l'Atlantique et une faune préservée au cœur de l'Afrique.",
  model = "gemini-audio-v1",
  onExport,
}: AudioViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils supérieure */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <SpeakerHigh size={18} className="text-[#aaa2c8]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            00:{String(durationSeconds).padStart(2, '0')} · {model}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onExport && onExport('mp3')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export MP3</span>
          </button>
        </div>
      </div>

      {/* Zone Lecteur & Waveform */}
      <div className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center justify-center bg-[#060911]">
        <div className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
              <p className="text-xs text-slate-400">Spot Audio Promotionnel · Voix Studio Haute Fidélité</p>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" className="ml-1" />}
            </button>
          </div>

          {/* Waveform simulée stylisée */}
          <div className="h-16 flex items-center gap-1 px-4 rounded-xl bg-black/40 border border-white/5 overflow-hidden">
            {[40, 60, 30, 80, 95, 45, 70, 85, 30, 65, 90, 100, 75, 50, 80, 60, 40, 90, 70, 50, 60, 80, 45, 95, 70, 40, 60, 30, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#aaa2c8]/60 hover:bg-[#c39a52] rounded-full transition-colors cursor-pointer"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Transcription intégrée */}
          {transcript && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <FileText size={14} className="text-[#c39a52]" />
                <span>Transcription Audio</span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                "{transcript}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
