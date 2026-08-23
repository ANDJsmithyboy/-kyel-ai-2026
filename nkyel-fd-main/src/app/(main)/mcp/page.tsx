/**
 * Ñkyel AI — Page MCP Hub (Model Context Protocol)
 * Route : /mcp
 */

'use client';

import React from 'react';
import { PlugsConnected, ShieldCheck, CheckCircle, Clock, Lightning, Cpu } from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';

export default function MCPHubPage() {
  const { mcpServers } = useProtocolStore();

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <PlugsConnected size={24} className="text-[#5BA3B5]" />
              MCP Hub — Serveurs & Outils Connectés
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Registre des serveurs MCP (stdio, streamable HTTP, SSE) et schémas d'outils validés.
            </p>
          </div>
        </div>

        {/* Server Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mcpServers.map((server) => (
            <div
              key={server.id}
              className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-[#5BA3B5]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#5BA3B5]/20 text-[#5BA3B5] flex items-center justify-center border border-[#5BA3B5]/30">
                      <PlugsConnected size={16} />
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F1EEE7]">{server.name}</h3>
                      <span className="text-[10px] text-[#7E8795] font-mono">
                        v{server.version} • {server.transport.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6F9485]/20 text-[#6F9485] flex items-center gap-1">
                    <CheckCircle size={12} weight="bold" /> {server.status}
                  </span>
                </div>

                <div className="space-y-2 my-4">
                  <span className="text-[10px] text-[#7E8795] uppercase block font-semibold">
                    Outils Exposable ({server.tools.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {server.tools.map((t) => (
                      <span
                        key={t.name}
                        className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-[#B8C0CC]"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px] text-[#7E8795]">
                <div className="flex items-center gap-2">
                  <Lightning size={13} className="text-[#C39A52]" />
                  <span>Latence : {server.latencyMs} ms</span>
                </div>
                <span>{server.provenance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
