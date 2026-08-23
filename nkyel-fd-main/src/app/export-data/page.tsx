/**
 * Ñkyel AI — Page Export & Portabilité des Données (Section 45)
 * Route : /export-data
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DownloadSimple, ArrowLeft, CheckCircle, Database } from '@phosphor-icons/react';

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F1EEE7] p-6 md:p-12 overflow-y-auto flex items-center justify-center">
      <div className="max-w-lg w-full bg-[#0E121A] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#7E8795] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'application
        </Link>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
          <span className="w-10 h-10 rounded-2xl bg-[#665F9E]/20 text-[#AAA2C8] flex items-center justify-center border border-[#665F9E]/30">
            <DownloadSimple size={22} weight="bold" />
          </span>
          <div>
            <h1 className="text-base font-bold font-heading text-[#F1EEE7]">Export & Portabilité des Données</h1>
            <p className="text-xs text-[#7E8795]">Téléchargez une archive JSON/SQL complète de vos données</p>
          </div>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-[#6F9485]/15 border border-[#6F9485]/30 text-xs text-[#6F9485] space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle size={18} weight="bold" />
              <span>Archive prête au téléchargement</span>
            </div>
            <p className="text-[#B8C0CC]">
              Votre archive <code className="text-[#AAA2C8]">nkyel_export_data.zip</code> contenant l'ensemble de vos
              conversations, mémoires DeerMem et métadonnées est prête.
            </p>
            <button
              onClick={() => alert("Téléchargement de l'archive ZIP...")}
              className="w-full py-2.5 rounded-xl bg-[#6F9485] hover:bg-[#6F9485]/80 text-[#08090D] font-bold text-xs shadow-lg transition-all"
            >
              Télécharger l'archive ZIP (JSON + SQL)
            </button>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-[#B8C0CC] leading-relaxed">
            <p>
              Conformément au principe de souveraineté des données, vous pouvez exporter l'intégralité de votre
              historique de travail dans un format structuré et interopérable :
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#7E8795]">
              <li>Historique complet des discussions au format JSON</li>
              <li>Instantanés et nœuds du WorkGraph VIE</li>
              <li>Profils et faits extraits de la mémoire DeerMem</li>
              <li>Liens de téléchargement direct des fichiers hébergés sur Cloudflare R2</li>
            </ul>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-[#665F9E] hover:bg-[#665F9E]/80 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-40"
            >
              {isExporting ? 'Génération de l’archive en cours...' : 'Générer mon archive complète'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
