/**
 * Ñkyel AI · ConnectorDetailSheet
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Slide-over detail pane with humanized permissions, truthful states,
 * and security governance. No raw credentials or OAuth secrets.
 */

'use client';

import React from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  WarningCircle,
  PlugsConnected,
  HardDrives,
  FileText,
  Table,
  EnvelopeSimple,
  CalendarBlank,
  GitBranch,
  Notebook,
  Chats,
  Database,
  ArrowClockwise,
  SignOut,
  Lock,
  Sparkle,
} from '@phosphor-icons/react';
import type { ConnectorItem } from '@/stores/connectors.store';

interface ConnectorDetailSheetProps {
  connector: ConnectorItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  GoogleLogo: HardDrives,
  HardDrives,
  FileText,
  Table,
  EnvelopeSimple,
  CalendarBlank,
  GitBranch,
  Notebook,
  Chats,
  Database,
};

export default function ConnectorDetailSheet({
  connector,
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
}: ConnectorDetailSheetProps) {
  if (!isOpen || !connector) return null;

  const Icon = ICON_MAP[connector.icon] || PlugsConnected;
  const isConnected = connector.status === 'CONNECTED';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'var(--material-scrim)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        style={{
          background: 'var(--surface-raised)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: isConnected ? 'var(--accent-subtle)' : 'var(--surface)',
                color: isConnected ? 'var(--accent)' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Icon size={20} weight={isConnected ? 'fill' : 'regular'} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {connector.name}
              </h2>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {connector.category}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-6">
          {/* Status & Account summary */}
          <div
            className="p-4 rounded-xl flex items-center justify-between"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                État de la connexion
              </span>
              <div className="flex items-center gap-1.5">
                {isConnected ? (
                  <>
                    <CheckCircle size={14} weight="fill" style={{ color: 'var(--success, #22c55e)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Connecté et actif
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Disponible
                    </span>
                  </>
                )}
              </div>
              {isConnected && connector.connectedAccount && (
                <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Compte : {connector.connectedAccount}
                </p>
              )}
            </div>

            {isConnected && connector.lastUsedAt && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--hover)', color: 'var(--text-tertiary)' }}>
                {connector.lastUsedAt}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Description
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {connector.description}
            </p>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Ce que Ñkyel peut faire avec cette intégration
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {connector.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Sparkle size={12} style={{ color: 'var(--accent)' }} />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Humanized Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Autorisations accordées (Human-in-the-Graph)
              </h4>
              <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
            </div>

            <div className="space-y-2">
              {connector.permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="p-3 rounded-xl flex items-start justify-between gap-3 text-xs"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="space-y-0.5">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {perm.humanLabel}
                    </p>
                    <span className="text-[10px] font-mono block" style={{ color: 'var(--text-tertiary)' }}>
                      Portée : {perm.scope}
                    </span>
                  </div>

                  {perm.requiresApproval && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: 'rgba(213, 174, 87, 0.12)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(213, 174, 87, 0.25)',
                      }}
                      title="Une validation explicite vous sera demandée avant toute action"
                    >
                      Accord requis
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-5 shrink-0 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={() => onDisconnect(connector.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{
                  color: 'var(--error, #ef4444)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <SignOut size={14} />
                <span>Déconnecter</span>
              </button>

              <button
                type="button"
                onClick={() => onConnect(connector.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                Re-synchroniser
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConnect(connector.id)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              <PlugsConnected size={15} weight="bold" />
              <span>Connecter {connector.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
