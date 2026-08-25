/**
 * Ñkyel AI — In-Line Human-in-the-Graph Approval Card · SmartANDJ AI Technologies
 * Demande d'arbitrage humaine intégrée au fil de conversation :
 * - Autorisation de consommation de crédits médias (Veo 3.1, Runway)
 * - Confirmation d'actions externes (Envoi d'e-mails, création d'événements)
 * - Boutons [Approuver], [Modifier], [Refuser]
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, X, PencilSimple, Coins, WarningCircle } from '@phosphor-icons/react';

export interface ApprovalRequestData {
  id: string;
  capability: string;
  title: string;
  description: string;
  estimatedCostUsd?: number;
  estimatedCredits?: number;
  recipient?: string;
  subject?: string;
  model?: string;
  reason?: string;
}

interface ApprovalCardProps {
  data: ApprovalRequestData;
  onApprove: (id: string) => Promise<void>;
  onModify: (id: string, newParams: Record<string, any>) => Promise<void>;
  onDeny: (id: string) => Promise<void>;
}

export default function ApprovalCard({
  data,
  onApprove,
  onModify,
  onDeny,
}: ApprovalCardProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied' | 'modifying'>('pending');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'deny') => {
    setLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(data.id);
        setStatus('approved');
      } else {
        await onDeny(data.id);
        setStatus('denied');
      }
    } catch (e) {
      console.error('Approval action error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full my-3.5 rounded-2xl border p-4.5 transition-all ${
        status === 'approved'
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : status === 'denied'
          ? 'border-rose-500/30 bg-rose-950/20'
          : 'border-[#c39a52]/40 bg-[#121826]/90 shadow-xl'
      }`}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c39a52]/20 border border-[#c39a52]/30 flex items-center justify-center text-[#c39a52]">
            <ShieldCheck size={18} weight="bold" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {data.title || 'Approbation Humaine Requise'}
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Human-in-the-Graph · {data.capability}
            </span>
          </div>
        </div>

        {(data.estimatedCostUsd || data.estimatedCredits) && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#c39a52]">
            <Coins size={14} />
            <span>${data.estimatedCostUsd?.toFixed(3)} ({data.estimatedCredits || 40} crédits)</span>
          </div>
        )}
      </div>

      {/* Description & Détails */}
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
        {data.description || data.reason || 'Ñkyel AI demande votre confirmation avant d\'exécuter cette action sensible.'}
      </p>

      {/* Métadonnées contextuelles si présentes */}
      {(data.recipient || data.model) && (
        <div className="mb-3.5 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
          {data.model && <div>Modèle cible : <span className="text-white">{data.model}</span></div>}
          {data.recipient && <div>Destinataire : <span className="text-white">{data.recipient}</span></div>}
          {data.subject && <div>Objet : <span className="text-white">{data.subject}</span></div>}
        </div>
      )}

      {/* Boutons d'Action */}
      {status === 'pending' ? (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => handleAction('deny')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors"
          >
            <X size={14} />
            <span>Refuser</span>
          </button>

          <button
            onClick={() => setStatus('modifying')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <PencilSimple size={14} />
            <span>Modifier</span>
          </button>

          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#c39a52] hover:bg-[#b08842] text-[#0a0e17] text-xs font-bold transition-colors shadow-md"
          >
            <Check size={14} weight="bold" />
            <span>{loading ? 'Validation...' : 'Approuver'}</span>
          </button>
        </div>
      ) : status === 'approved' ? (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
          <Check size={16} weight="bold" />
          <span>Action approuvée et exécutée avec succès dans le WorkGraph.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium text-rose-400">
          <X size={16} weight="bold" />
          <span>Action refusée par l'opérateur. L'agent emprunte un chemin alternatif.</span>
        </div>
      )}
    </motion.div>
  );
}
