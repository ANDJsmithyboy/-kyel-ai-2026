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
  Scales,
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
    <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-[#0E121A]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl select-none">
      {/* Ligne 1 : Contrôles d'intervention rapide */}
      <div className="flex items-center flex-wrap gap-1.5 text-[12px] font-medium text-[#F1EEE7]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#665F9E]/20 text-[#AAA2C8] border border-[#665F9E]/30 font-mono text-[11px]">
          <Hand size={14} weight="bold" />
          <span>Contrôle Humain</span>
        </div>

        {/* Suspendre / Reprendre */}
        {isRunning ? (
          <button
            type="button"
            onClick={stopRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#BE6254]/20 text-[#BE6254] border border-[#BE6254]/40 hover:bg-[#BE6254]/30 transition-colors"
            title="Suspendre l'exécution de la mission"
          >
            <Pause size={14} weight="fill" />
            <span>Suspendre</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6F9485]/20 text-[#6F9485] border border-[#6F9485]/40 hover:bg-[#6F9485]/30 transition-colors"
            title="Reprendre l'exécution"
          >
            <Play size={14} weight="fill" />
            <span>Reprendre</span>
          </button>
        )}

        {/* Modifier une contrainte */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Modification des contraintes demandée');
            onAddConstraint?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#151922] hover:bg-white/[0.06] border border-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] transition-colors"
          title="Modifier les contraintes d'exécution"
        >
          <SlidersHorizontal size={14} />
          <span>Contraintes</span>
        </button>

        {/* Ajouter une instruction */}
        <button
          type="button"
          onClick={() => setIsPromptOpen(!isPromptOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#151922] hover:bg-white/[0.06] border border-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] transition-colors"
          title="Injecter une instruction au plan d'exécution"
        >
          <PlusCircle size={14} />
          <span>Instruction</span>
        </button>

        {/* Demander une preuve */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Exigence de preuve formelle émise');
            onRequestProof?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#C39A52]/15 text-[#C39A52] border border-[#C39A52]/30 hover:bg-[#C39A52]/25 transition-colors"
          title="Demander une preuve et citation primaire"
        >
          <ShieldCheck size={14} />
          <span>Exiger preuve</span>
        </button>

        {/* Rejeter une hypothèse */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Hypothèse active rejetée par l\'humain');
            onRejectHypothesis?.();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#BE6254]/15 text-[#BE6254] border border-[#BE6254]/30 hover:bg-[#BE6254]/25 transition-colors"
          title="Rejeter une hypothèse et forcer le recalcul du plan"
        >
          <XCircle size={14} />
          <span>Rejeter hypothèse</span>
        </button>

        {/* Checkpoint */}
        <button
          type="button"
          onClick={onRestoreCheckpoint}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#151922] hover:bg-white/[0.06] border border-white/[0.06] text-[#B8C0CC] hover:text-[#F1EEE7] transition-colors font-mono text-[11px]"
          title="Revenir au dernier checkpoint vérifié"
        >
          <FloppyDisk size={14} />
          <span>Checkpoints</span>
        </button>
      </div>

      {/* Ligne 2 : Formulaire d'injection d'instruction directe */}
      {isPromptOpen && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
          <input
            type="text"
            placeholder="Ex : Priorise les données européennes et supprime l'étape 3..."
            value={instructionInput}
            onChange={(e) => setInstructionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendInstruction()}
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#151922] border border-white/[0.08] text-[13px] text-[#F1EEE7] placeholder-[#7E8795] focus:outline-none focus:border-[#665F9E]"
          />
          <button
            type="button"
            onClick={handleSendInstruction}
            className="px-3 py-1.5 rounded-xl bg-[#665F9E] text-[#F1EEE7] text-[12px] font-medium hover:brightness-110 transition-all"
          >
            Injecter
          </button>
        </div>
      )}
    </div>
  );
}
