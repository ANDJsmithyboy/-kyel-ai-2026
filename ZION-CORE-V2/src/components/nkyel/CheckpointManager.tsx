/**
 * Nkyel AI — Checkpoint Manager
 *
 * Allows users to fork from a checkpoint, restore graph state,
 * and initiate replanification from any saved point.
 *
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { WorkGraphSnapshot, NkyelEvent } from '@/lib/nkyel/work-graph.types';
import { eventStore } from '@/lib/nkyel/event-store';
import './checkpoint-manager.css';

// --- Types ----------------------------------------------

interface CheckpointManagerProps {
  /** Current run ID */
  runId: string;
  /** Callback to restore graph to a snapshot state */
  onRestore?: (snapshot: WorkGraphSnapshot) => void;
  /** Callback to fork from a checkpoint (creates new run) */
  onFork?: (snapshot: WorkGraphSnapshot) => void;
  /** Callback to request replanification from a point */
  onReplan?: (fromSequence: number, reason: string) => void;
}

// --- Component ------------------------------------------

export default function CheckpointManager({
  runId,
  onRestore,
  onFork,
  onReplan,
}: CheckpointManagerProps) {
  const [snapshots, setSnapshots] = useState<WorkGraphSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replanReason, setReplanReason] = useState('');
  const [showReplanInput, setShowReplanInput] = useState(false);
  const [replanTargetSeq, setReplanTargetSeq] = useState<number>(0);

  // Load snapshots for this run
  useEffect(() => {
    const allSnapshots: WorkGraphSnapshot[] = [];
    // Reconstruct from event store - create snapshot at key points
    const events = eventStore.getEvents(runId);
    const checkpointEvents = events.filter(e =>
      e.type === 'checkpoint.created' ||
      e.type === 'plan.created' ||
      e.type === 'plan.updated'
    );

    for (const evt of checkpointEvents) {
      const snap = eventStore.createSnapshot(runId);
      allSnapshots.push({
        ...snap,
        id: `snap_${evt.sequenceNumber}`,
        atSequence: evt.sequenceNumber,
        timestamp: evt.timestamp,
      });
    }

    // Always include the "latest" snapshot
    const latestSnap = eventStore.getLatestSnapshot(runId);
    if (latestSnap) {
      allSnapshots.push(latestSnap);
    }

    // Deduplicate by atSequence
    const unique = Array.from(
      new Map(allSnapshots.map(s => [s.atSequence, s])).values()
    ).sort((a, b) => a.atSequence - b.atSequence);

    setSnapshots(unique);
  }, [runId]);

  const handleRestore = useCallback((snap: WorkGraphSnapshot) => {
    setSelectedId(snap.id);
    onRestore?.(snap);
  }, [onRestore]);

  const handleFork = useCallback((snap: WorkGraphSnapshot) => {
    onFork?.(snap);
  }, [onFork]);

  const handleReplan = useCallback(() => {
    if (replanReason.trim() && replanTargetSeq > 0) {
      onReplan?.(replanTargetSeq, replanReason.trim());
      setReplanReason('');
      setShowReplanInput(false);
    }
  }, [replanReason, replanTargetSeq, onReplan]);

  const openReplanDialog = useCallback((atSequence: number) => {
    setReplanTargetSeq(atSequence);
    setShowReplanInput(true);
  }, []);

  const getCheckpointLabel = (snap: WorkGraphSnapshot, index: number): string => {
    if (index === snapshots.length - 1) return 'Dernier état';
    if (index === 0) return 'Plan initial';
    return `Checkpoint #${snap.atSequence}`;
  };

  const getNodeCount = (snap: WorkGraphSnapshot): number => {
    return snap.nodes?.length ?? 0;
  };

  if (snapshots.length === 0) {
    return (
      <div className="checkpoint-mgr checkpoint-mgr--empty">
        <div className="checkpoint-mgr__empty-icon">💾</div>
        <p className="checkpoint-mgr__empty-text">Aucun checkpoint disponible</p>
        <p className="checkpoint-mgr__empty-sub">Les checkpoints sont créés automatiquement lors de la planification et de la livraison.</p>
      </div>
    );
  }

  return (
    <div className="checkpoint-mgr">
      <div className="checkpoint-mgr__header">
        <h3 className="checkpoint-mgr__title">💾 Checkpoints</h3>
        <span className="checkpoint-mgr__count">{snapshots.length}</span>
      </div>

      <div className="checkpoint-mgr__list">
        {snapshots.map((snap, i) => (
          <div
            key={snap.id}
            className={`checkpoint-card ${selectedId === snap.id ? 'checkpoint-card--selected' : ''}`}
          >
            <div className="checkpoint-card__header">
              <span className="checkpoint-card__label">{getCheckpointLabel(snap, i)}</span>
              <span className="checkpoint-card__seq">seq #{snap.atSequence}</span>
            </div>

            <div className="checkpoint-card__meta">
              <span>{getNodeCount(snap)} nœuds</span>
              <span>{snap.edges?.length ?? 0} arêtes</span>
              <span className="checkpoint-card__time">
                {new Date(snap.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="checkpoint-card__actions">
              <button
                className="checkpoint-action checkpoint-action--restore"
                onClick={() => handleRestore(snap)}
                title="Restaurer le graphe à cet état"
              >
                ↩️ Restaurer
              </button>
              <button
                className="checkpoint-action checkpoint-action--fork"
                onClick={() => handleFork(snap)}
                title="Créer une branche depuis ce checkpoint"
              >
                🔀 Forker
              </button>
              <button
                className="checkpoint-action checkpoint-action--replan"
                onClick={() => openReplanDialog(snap.atSequence)}
                title="Replanifier depuis ce point"
              >
                🔄 Replan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Replan dialog */}
      {showReplanInput && (
        <div className="checkpoint-replan">
          <div className="checkpoint-replan__header">
            <span>🔄 Replanifier depuis seq #{replanTargetSeq}</span>
            <button
              className="checkpoint-replan__close"
              onClick={() => setShowReplanInput(false)}
            >
              ✕
            </button>
          </div>
          <textarea
            className="checkpoint-replan__input"
            placeholder="Raison de la replanification..."
            value={replanReason}
            onChange={(e) => setReplanReason(e.target.value)}
            rows={3}
          />
          <button
            className="checkpoint-replan__submit"
            onClick={handleReplan}
            disabled={!replanReason.trim()}
          >
            Lancer la replanification
          </button>
        </div>
      )}
    </div>
  );
}
