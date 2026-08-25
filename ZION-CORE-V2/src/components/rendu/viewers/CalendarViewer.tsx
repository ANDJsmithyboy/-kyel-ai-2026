/**
 * Ñkyel AI — Calendar & Event Viewer (ICS) · SmartANDJ AI Technologies
 * Visualiseur d'événements et calendriers exportables :
 * - Carte visuelle structurée de l'événement
 * - Téléchargement .ics
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { CalendarBlank, DownloadSimple, Clock, MapPin, User } from '@phosphor-icons/react';

interface CalendarViewerProps {
  title: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  organizer?: string;
  description?: string;
  onExport?: () => void;
}

export default function CalendarViewer({
  title,
  startDate = "15 Octobre 2026 · 09:00",
  endDate = "15 Octobre 2026 · 18:00",
  location = "Libreville & Loango, Gabon",
  organizer = "Ñkyel AI & Agence Nationale des Parcs Nationaux",
  description = "Lancement officiel de la saison écotouristique internationale et présentation des certifications durables.",
  onExport,
}: CalendarViewerProps) {
  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0e17] text-white">
      {/* Barre d'outils */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#121826]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CalendarBlank size={18} className="text-[#c39a52]" />
          <span className="font-semibold text-xs text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
            iCalendar (.ics)
          </span>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] font-bold text-xs transition-colors"
        >
          <DownloadSimple size={14} weight="bold" />
          <span>Export ICS</span>
        </button>
      </div>

      {/* Carte d'événement structurée */}
      <div className="flex-1 overflow-auto p-6 md:p-10 flex items-center justify-center bg-[#060911]">
        <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#c39a52]">
              ÉVÉNEMENT DU WORKSPACE
            </span>
            <h2 className="text-xl font-bold text-white mt-1.5">{title}</h2>
          </div>

          <div className="space-y-3 font-sans text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-[#c39a52] shrink-0" />
              <span>{startDate} → {endDate}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <User size={16} className="text-slate-400 shrink-0" />
              <span>Organisé par {organizer}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-white/10 pt-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
