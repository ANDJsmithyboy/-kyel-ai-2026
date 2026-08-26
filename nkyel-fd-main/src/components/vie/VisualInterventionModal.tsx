/**
 * Ñkyel AI · VisualInterventionModal
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Implémente l'intervention visuelle et sémantique directe de la Section 27 :
 * Cycle : Intervention -> Validation -> Événement durable -> Replanification DeerFlow -> Reprise
 */

'use client';

import React, { useState } from 'react';
import {
  PencilSimple,
  X,
  CheckCircle,
  WarningCircle,
  ClockCounterClockwise,
  UsersThree,
  ShieldCheck,
  Sparkle,
  Trash,
  ArrowClockwise,
} from '@phosphor-icons/react';

export interface VisualInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string;
  threadId: string;
  selectedNodeId?: string;
  nodeTitle?: string;
  nodeType?: string;
  onInterventionSuccess?: (result: any) => void;
}

export default function VisualInterventionModal({
  isOpen,
  onClose,
  runId,
  threadId,
  selectedNodeId = 'node_active',
  nodeTitle = 'Tâche / Nœud Actif',
  nodeType = 'task',
  onInterventionSuccess,
}: VisualInterventionModalProps) {
  const [interventionType, setInterventionType] = useState<string>('constraint_updated');
  const [constraintText, setConstraintText] = useState('');
  const [reason, setReason] = useState('');
  const [targetAgent, setTargetAgent] = useState('researcher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/workgraph/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          run_id: runId || 'run_active',
          thread_id: threadId || 'thread_active',
          user_id: 'user_default',
          intervention_type: interventionType,
          node_id: selectedNodeId,
          new_value: {
            constraint: constraintText,
            target_agent: targetAgent,
            title: nodeTitle,
          },
          reason: reason || 'Intervention directe dans le WorkGraph',
          target_agent_id: targetAgent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Échec de la validation par le serveur');
      }

      const result = await res.json();
      onInterventionSuccess?.(result);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l’intervention.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0E121A] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121620]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/30">
              <PencilSimple size={20} weight="bold" />
            </span>
            <div>
              <h2 className="text-sm font-bold font-heading text-[#F1EEE7]">
                Intervention Visuelle Sémantique
              </h2>
              <p className="text-xs text-[#7E8795] mt-0.5">
                Cible : <code className="text-[#AAA2C8]">{selectedNodeId}</code> ({nodeTitle})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E8795] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Choice of action */}
          <div>
            <label className="text-xs text-[#7E8795] block mb-1.5 font-medium">Type d'intervention</label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none focus:border-[var(--accent)]"
            >
              <option value="constraint_updated">Modifier une contrainte d'exécution</option>
              <option value="hypothesis_rejected">Rejeter cette hypothèse & explorer une alternative</option>
              <option value="proof_requested">Demander une preuve certifiée supplémentaire</option>
              <option value="task_reassigned">Réaffecter la tâche à un autre agent</option>
              <option value="task_created">Créer une sous-tâche intermédiaire</option>
              <option value="branch_paused">Mettre la branche en pause</option>
              <option value="branch_resumed">Relancer l'exécution de la branche</option>
            </select>
          </div>

          {/* Conditional inputs */}
          {interventionType === 'constraint_updated' && (
            <div>
              <label className="text-xs text-[#7E8795] block mb-1.5 font-medium">Nouvelle contrainte</label>
              <textarea
                value={constraintText}
                onChange={(e) => setConstraintText(e.target.value)}
                placeholder="Ex : Exiger au minimum 3 sources primaires gouvernementales avec dates 2026..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {interventionType === 'task_reassigned' && (
            <div>
              <label className="text-xs text-[#7E8795] block mb-1.5 font-medium">Agent récepteur</label>
              <select
                value={targetAgent}
                onChange={(e) => setTargetAgent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none focus:border-[var(--accent)]"
              >
                <option value="visual-director">Visual Director & Media</option>
                <option value="researcher">Researcher & Tavily Synthesizer</option>
                <option value="coder">Code Studio & Python Sandbox</option>
                <option value="reviewer">Reviewer & Fact Checker</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-[#7E8795] block mb-1.5 font-medium">Motif / Justification (facultatif)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Données antérieures à 2026 obsolètes"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#F1EEE7] outline-none focus:border-[var(--accent)]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#BE6254]/15 border border-[#BE6254]/30 text-xs text-[#BE6254] flex items-center gap-2">
              <WarningCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.03] text-xs text-[#7E8795] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <ArrowClockwise size={14} className="animate-spin" />
                  <span>Replanification en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} weight="bold" />
                  <span>Appliquer & Replanifier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
