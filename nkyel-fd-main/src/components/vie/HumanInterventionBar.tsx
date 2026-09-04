/**
 * Ñkyel AI · HumanInterventionBar
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Barre de contrôle d'intervention humaine en direct sur le WorkGraph :
 * - Modifier une contrainte
 * - Ajouter une instruction
 * - Demander une preuve
 * - Rejeter une hypothèse
 * - Suspendre / Reprendre la mission
 * - Revenir à un checkpoint
 * - Relancer une branche
 */

'use client';

import React, { useState } from 'react';
import {
  Hand,
  SlidersHorizontal,
  PlusCircle,
  ShieldCheck,
  XCircle,
  Pause,
  Play,
  FloppyDisk,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { useWorkGraphStore } from '@/lib/nkyel';
import { protocolEventBus } from '@/lib/protocols/protocol-events';

interface HumanInterventionBarProps {
  onAddConstraint?: () => void;
  onRequestProof?: () => void;
  onRejectHypothesis?: () => void;
  onRestoreCheckpoint?: () => void;
}

export default function HumanInterventionBar({
  onAddConstraint,
  onRequestProof,
  onRejectHypothesis,
  onRestoreCheckpoint,
}: HumanInterventionBarProps) {
  const { isRunning, stopRun, resumeRun } = useWorkGraphStore();
  const [instructionInput, setInstructionInput] = useState('');
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const handleSendInstruction = () => {
    if (!instructionInput.trim()) return;
    protocolEventBus.emit('agui.state.updated', 'agui', `Instruction humaine ajoutée : ${instructionInput.trim()}`);
    setInstructionInput('');
    setIsPromptOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-[var(--bg-elevated)] backdrop-blur-xl border border-[var(--border)] shadow-2xl select-none text-[var(--text-primary)]">
      {/* Ligne 1 : Contrôles d'intervention rapide */}
      <div className="flex items-center flex-wrap gap-1.5 text-[12px] font-medium text-[var(--text-primary)]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-muted)] font-mono text-[11px] font-semibold">
          <Hand size={14} weight="bold" />
          <span>Contrôle Humain</span>
        </div>

        {/* Suspendre / Annuler */}
        {isRunning && (
          <>
            <button
              type="button"
              onClick={() => {
                protocolEventBus.emit('agui.state.updated', 'agui', 'Suspension temporaire demandée');
                stopRun();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)] hover:opacity-90 transition-colors"
              title="Suspendre l'exécution"
            >
              <Pause size={14} weight="fill" />
              <span>Suspendre</span>
            </button>
            <button
              type="button"
              onClick={() => {
                protocolEventBus.emit('agui.state.updated', 'agui', 'Annulation totale de la mission');
                stopRun();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--error-subtle)] text-[var(--error)] border border-[var(--error)] hover:opacity-90 transition-colors"
              title="Annuler l'exécution"
            >
              <XCircle size={14} weight="fill" />
              <span>Annuler</span>
            </button>
          </>
        )}

        {/* Modifier une contrainte */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Modification des contraintes demandée');
            onAddConstraint?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Modifier les contraintes d'exécution"
        >
          <SlidersHorizontal size={14} />
          <span>Contraintes</span>
        </button>

        {/* Demander une preuve */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Exigence de preuve formelle ajoutée');
            onRequestProof?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Demander des sources ou preuves à l'agent"
        >
          <ShieldCheck size={14} />
          <span>Exiger Preuve</span>
        </button>

        {/* Rejeter une hypothèse */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Hypothèse en cours rejetée par l’utilisateur');
            onRejectHypothesis?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Invalider une hypothèse de recherche"
        >
          <XCircle size={14} />
          <span>Rejeter Hypothèse</span>
        </button>

        {/* Ajouter une instruction */}
        <button
          type="button"
          onClick={() => setIsPromptOpen(!isPromptOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors ${
            isPromptOpen
              ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]'
              : 'bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title="Injecter une instruction en cours de route"
        >
          <PlusCircle size={14} />
          <span>Ajouter Instruction</span>
        </button>

        {/* Checkpoint & Replay */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Restauration vers checkpoint');
            onRestoreCheckpoint?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-mono text-[11px]"
          title="Revenir à un point de contrôle"
        >
          <FloppyDisk size={14} />
          <span>Checkpoints</span>
        </button>
      </div>

      {/* Ligne 2 : Champ d'injection d'instruction contextuelle */}
      {isPromptOpen && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={instructionInput}
            onChange={(e) => setInstructionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendInstruction()}
            placeholder="Ex: Concentre la recherche uniquement sur Libreville et Port-Gentil..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSendInstruction}
            className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-[12px] font-medium hover:opacity-90 transition-all"
          >
            Injecter
          </button>
        </div>
      )}
    </div>
  );
}
