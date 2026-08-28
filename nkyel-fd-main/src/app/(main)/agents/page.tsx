/**
 * Ñkyel AI — Page Agent Mesh (Agent-to-Agent A2A)
 * Route : /agents
 */

'use client';

import React, { useEffect } from 'react';
import { UsersThree, ShieldCheck, CheckCircle, Clock, Lightning, Cpu, ArrowRight } from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';

export default function AgentsMeshPage() {
  const { a2aAgents, fetchA2AAgents } = useProtocolStore();

  useEffect(() => {
    fetchA2AAgents();
  }, [fetchA2AAgents]);

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <UsersThree size={24} className="text-[#6F9485]" />
              Ñkyel Agent Mesh (A2A)
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Cartes d'agents autonomes, délégations de tâches et coordination inter-agents mesh.
            </p>
          </div>
        </div>

        {/* Agents Grid */}
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
      </div>
    </div>
  );
}
