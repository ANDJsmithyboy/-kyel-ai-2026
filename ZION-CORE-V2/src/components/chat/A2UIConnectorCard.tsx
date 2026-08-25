/**
 * Ñkyel AI · A2UIConnectorCard
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Safe registered declarative UI card for in-chat authorization requests.
 * Renders when an agent requires access to a connected resource (e.g. Google Drive).
 */

'use client';

import React, { useState } from 'react';
import {
  PlugsConnected,
  HardDrives,
  FileText,
  Table,
  EnvelopeSimple,
  CheckCircle,
  ArrowClockwise,
  ArrowRight,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useConnectorsStore, type ConnectorItem } from '@/stores/connectors.store';

interface A2UIConnectorCardProps {
  connectorSlug: string;
  connectorName: string;
  taskContext: string;
  onConnected?: () => void;
}

export default function A2UIConnectorCard({
  connectorSlug,
  connectorName,
  taskContext,
  onConnected,
}: A2UIConnectorCardProps) {
  const { connectors, connectConnector } = useConnectorsStore();
  const connector = connectors.find((c: ConnectorItem) => c.slug === connectorSlug);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDone, setIsDone] = useState(connector?.status === 'CONNECTED');

  const handleConnect = async () => {
    if (!connector) return;
    setIsConnecting(true);
    await connectConnector(connector.id);
    setIsConnecting(false);
    setIsDone(true);
    if (onConnected) onConnected();
  };

  return (
    <div
      className="my-3 p-4 rounded-2xl max-w-lg transition-all animate-in fade-in zoom-in-95 duration-150"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-key)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isDone ? 'rgba(34, 197, 94, 0.12)' : 'var(--accent-subtle)',
            color: isDone ? 'var(--success, #22c55e)' : 'var(--accent)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {isDone ? <CheckCircle size={20} weight="fill" /> : <PlugsConnected size={20} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
              Connexion requise : {connectorName}
            </h4>
            <span
              className="text-[10px] px-2 py-0.2 rounded-full font-semibold uppercase"
              style={{ background: 'var(--hover)', color: 'var(--text-tertiary)' }}
            >
              A2UI Sécurisé
            </span>
          </div>

          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {taskContext || `Ñkyel a besoin d'accéder à ${connectorName} pour poursuivre cette mission.`}
          </p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <ShieldCheck size={12} />
              <span>Chiffrement AES-256 de bout en bout</span>
            </span>

            {isDone ? (
              <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--success, #22c55e)' }}>
                <CheckCircle size={13} weight="fill" />
                <span>Intégration prête</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                {isConnecting ? (
                  <>
                    <ArrowClockwise size={13} className="animate-spin" />
                    <span>Autorisation...</span>
                  </>
                ) : (
                  <>
                    <span>Connecter {connectorName}</span>
                    <ArrowRight size={12} weight="bold" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
