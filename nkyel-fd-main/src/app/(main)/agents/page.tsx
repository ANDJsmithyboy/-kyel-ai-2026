/**
 * Ñkyel AI — Page Agent Mesh (Agent-to-Agent A2A)
 * Route : /agents
 */

'use client';

import React, { useEffect } from 'react';
import { UsersThree, ShieldCheck, CheckCircle, Clock, Lightning, Cpu, ArrowRight } from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';

import AgentEditorSheet from '@/components/agent/AgentEditorSheet';

export default function AgentsMeshPage() {
  const { a2aAgents, fetchA2AAgents } = useProtocolStore();
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  useEffect(() => {
    fetchA2AAgents();
  }, [fetchA2AAgents]);

  return (
    <div className="flex-1 bg-[var(--bg-main)] p-6 text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <UsersThree size={24} className="text-[var(--accent)]" />
              Ñkyel Agent Mesh (A2A)
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Cartes d'agents autonomes, délégations de tâches et coordination inter-agents mesh.
            </p>
          </div>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span>Créer un agent</span>
          </button>
        </div>

        {/* Agents Grid */}
        {a2aAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-tertiary)]">
              <Cpu size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Aucun agent configuré</h3>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
                Votre registre d'agents est vide. Créez votre premier agent pour déléguer des tâches spécifiques.
              </p>
            </div>
            <button
              onClick={() => setIsEditorOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[var(--surface-raised)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-primary)] transition-all"
            >
              Ouvrir l'éditeur visuel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {a2aAgents.map((agent) => (
            <div
              key={agent.id}
              className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-[#6F9485]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F1EEE7]">{agent.name}</h3>
                      <span className="text-[10px] text-[#7E8795]">{agent.role}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6F9485]/20 text-[#6F9485]">
                    {agent.status}
                  </span>
                </div>

                <div className="my-3 space-y-2">
                  <span className="text-[10px] text-[#7E8795] uppercase block font-semibold">
                    Capacités Déclarées
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.declaredCapabilities.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-[#B8C0CC]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px] text-[#7E8795]">
                <div className="flex items-center gap-2">
                  <Lightning size={13} className="text-[var(--accent)]" />
                  <span>Latence : {agent.latencyMs} ms</span>
                </div>
                <span>Fournisseur : {agent.provider}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <AgentEditorSheet
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
