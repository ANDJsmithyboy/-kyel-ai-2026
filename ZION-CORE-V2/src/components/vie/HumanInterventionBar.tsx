/**
 * Ñkyel AI · HumanInterventionBar
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Live human intervention control bar over the WorkGraph:
 * — Constraint modification, instruction injection, proof demand, hypothesis rejection
 * — Pause / Resume mission, checkpoint restore
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
    <div
      className="flex flex-col select-none"
      style={{
        gap: 'var(--space-2)',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(32px)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Row 1: Fast Intervention Controls */}
      <div className="flex items-center flex-wrap gap-1.5 font-medium" style={{ fontSize: 'var(--text-xs)' }}>
        <div
          className="flex items-center gap-1.5 font-mono"
          style={{
            paddingInline: 'var(--space-2)',
            paddingBlock: '4px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-subtle)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-muted)',
            fontSize: '11px',
          }}
        >
          <Hand size={14} weight="bold" />
          <span>Contrôle Humain</span>
        </div>

        {/* Pause / Resume */}
        {isRunning ? (
          <button
            type="button"
            onClick={stopRun}
            className="flex items-center gap-1.5"
            style={{
              paddingInline: '12px',
              paddingBlock: '6px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(190, 98, 84, 0.15)',
              color: 'var(--hue-danger)',
              border: '1px solid rgba(190, 98, 84, 0.3)',
              transition: `all var(--transition-fast)`,
            }}
            title="Suspendre l'exécution de la mission"
          >
            <Pause size={14} weight="fill" />
            <span>Suspendre</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeRun}
            className="flex items-center gap-1.5"
            style={{
              paddingInline: '12px',
              paddingBlock: '6px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(111, 148, 133, 0.15)',
              color: 'var(--hue-success)',
              border: '1px solid rgba(111, 148, 133, 0.3)',
              transition: `all var(--transition-fast)`,
            }}
            title="Reprendre l'exécution"
          >
            <Play size={14} weight="fill" />
            <span>Reprendre</span>
          </button>
        )}

        {/* Modify constraint */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Modification des contraintes demandée');
            onAddConstraint?.();
          }}
          className="flex items-center gap-1.5"
          style={{
            paddingInline: '10px',
            paddingBlock: '6px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--fg-muted)',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.background = 'var(--accent-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-muted)';
            e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          title="Modifier les contraintes d'exécution"
        >
          <SlidersHorizontal size={14} />
          <span>Contraintes</span>
        </button>

        {/* Add instruction */}
        <button
          type="button"
          onClick={() => setIsPromptOpen(!isPromptOpen)}
          className="flex items-center gap-1.5"
          style={{
            paddingInline: '10px',
            paddingBlock: '6px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--fg-muted)',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.background = 'var(--accent-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-muted)';
            e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          title="Injecter une instruction au plan d'exécution"
        >
          <PlusCircle size={14} />
          <span>Instruction</span>
        </button>

        {/* Require proof */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Exigence de preuve formelle émise');
            onRequestProof?.();
          }}
          className="flex items-center gap-1.5"
          style={{
            paddingInline: '10px',
            paddingBlock: '6px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(195, 154, 82, 0.12)',
            color: 'var(--hue-warning)',
            border: '1px solid rgba(195, 154, 82, 0.3)',
            transition: `all var(--transition-fast)`,
          }}
          title="Demander une preuve et citation primaire"
        >
          <ShieldCheck size={14} />
          <span>Exiger preuve</span>
        </button>

        {/* Reject hypothesis */}
        <button
          type="button"
          onClick={() => {
            protocolEventBus.emit('agui.state.updated', 'agui', 'Hypothèse active rejetée par l\'humain');
            onRejectHypothesis?.();
          }}
          className="flex items-center gap-1.5"
          style={{
            paddingInline: '10px',
            paddingBlock: '6px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(190, 98, 84, 0.12)',
            color: 'var(--hue-danger)',
            border: '1px solid rgba(190, 98, 84, 0.3)',
            transition: `all var(--transition-fast)`,
          }}
          title="Rejeter une hypothèse et forcer le recalcul du plan"
        >
          <XCircle size={14} />
          <span>Rejeter hypothèse</span>
        </button>

        {/* Checkpoint */}
        <button
          type="button"
          onClick={onRestoreCheckpoint}
          className="flex items-center gap-1.5 font-mono"
          style={{
            paddingInline: '10px',
            paddingBlock: '6px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--fg-muted)',
            fontSize: '11px',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.background = 'var(--accent-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-muted)';
            e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          title="Revenir au dernier checkpoint vérifié"
        >
          <FloppyDisk size={14} />
          <span>Checkpoints</span>
        </button>
      </div>

      {/* Row 2: Direct Instruction Injection Input */}
      {isPromptOpen && (
        <div
          className="flex items-center gap-2 pt-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <input
            type="text"
            placeholder="Ex : Priorise les données européennes et supprime l'étape 3..."
            value={instructionInput}
            onChange={(e) => setInstructionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendInstruction()}
            className="flex-1 rounded-xl outline-none"
            style={{
              paddingInline: 'var(--space-3)',
              paddingBlock: '6px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--fg)',
            }}
          />
          <button
            type="button"
            onClick={handleSendInstruction}
            className="font-medium rounded-xl"
            style={{
              paddingInline: 'var(--space-3)',
              paddingBlock: '6px',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              fontSize: 'var(--text-xs)',
              transition: `all var(--transition-fast)`,
            }}
          >
            Injecter
          </button>
        </div>
      )}
    </div>
  );
}
