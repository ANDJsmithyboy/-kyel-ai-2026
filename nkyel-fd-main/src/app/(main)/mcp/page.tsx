/**
 * Ñkyel AI — Page MCP Hub (Model Context Protocol)
 * Route : /mcp
 *
 * Registre des serveurs MCP connectés avec identité authentique et fallback canonique.
 */

'use client';

import React from 'react';
import { PlugsConnected, CheckCircle, Lightning } from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';
import { getConnectorIcon, McpFallbackIcon } from '@/components/icons';

export default function MCPHubPage() {
  const { mcpServers } = useProtocolStore();

  return (
    <div className="flex-1 bg-[var(--material-canvas)] p-6 text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <PlugsConnected size={24} className="text-[#D5AE57]" />
              MCP Hub — Serveurs & Outils Connectés
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Registre des serveurs MCP (stdio, streamable HTTP, SSE) et schémas d&apos;outils validés.
            </p>
          </div>
        </div>

        {/* Server Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mcpServers.map((server) => {
            const Icon = getConnectorIcon(server.id);
            return (
              <div
                key={server.id}
                className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent-muted)] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-xs">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[var(--text-primary)]">{server.name}</h3>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          v{server.version} • {server.transport.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle size={12} weight="bold" /> {server.status}
                    </span>
                  </div>

                  <div className="space-y-2 my-4">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-semibold">
                      Outils Exposés ({server.tools.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {server.tools.map((t) => (
                        <span
                          key={t.name}
                          className="px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1.5">
                    <Lightning size={13} className="text-[#D5AE57]" />
                    <span>Latence : {server.latencyMs} ms</span>
                  </div>
                  <span>{server.provenance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
