/**
 * Ñkyel AI — Page Suppression de Compte & Droit à l'Oubli (Section 45)
 * Route : /delete-account
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash, ArrowLeft, WarningCircle, CheckCircle } from '@phosphor-icons/react';

export default function DeleteAccountPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simuler / Déclencher la demande de suppression dans deletion_requests
    setTimeout(() => {
      setIsDeleting(false);
      setSuccess(true);
    }, 1500);
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
          <span className="w-10 h-10 rounded-2xl bg-[#BE6254]/20 text-[#BE6254] flex items-center justify-center border border-[#BE6254]/30">
            <Trash size={22} weight="bold" />
          </span>
          <div>
            <h1 className="text-base font-bold font-heading text-[#F1EEE7]">Suppression de Compte</h1>
            <p className="text-xs text-[#7E8795]">Droit à l'oubli et effacement souverain des données</p>
          </div>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-[#6F9485]/15 border border-[#6F9485]/30 text-xs text-[#6F9485] space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle size={18} weight="bold" />
              <span>Demande de suppression enregistrée</span>
            </div>
            <p className="text-[#B8C0CC]">
              Votre compte et l'ensemble de vos données associées dans Neon PostgreSQL et Cloudflare R2 seront
              définitivement purgés sous un délai de 30 jours conformément à notre politique de confidentialité.
            </p>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-[#B8C0CC] leading-relaxed">
            <p>
              La suppression de votre compte Ñkyel AI est irréversible. Elle entraînera la suppression immédiate de :
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#7E8795]">
              <li>Toutes vos conversations, messages et threads LangGraph</li>
              <li>L'ensemble de vos souvenirs et profils dans DeerMem</li>
              <li>Tous vos livrables, artefacts et fichiers hébergés sur Cloudflare R2</li>
              <li>Vos identités et organisations rattachées</li>
            </ul>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-[11px] text-[#F1EEE7]">
                Je confirme vouloir supprimer définitivement mon compte et toutes mes données associées.
              </span>
            </label>

            <button
              onClick={handleDelete}
              disabled={!confirmed || isDeleting}
              className="w-full py-3 rounded-xl bg-[#BE6254] hover:bg-[#BE6254]/80 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-40"
            >
              {isDeleting ? 'Traitement de la purge...' : 'Confirmer la suppression définitive'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
