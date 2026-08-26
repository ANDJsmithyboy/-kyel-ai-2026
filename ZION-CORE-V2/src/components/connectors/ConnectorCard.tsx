/**
 * Ñkyel AI · ConnectorCard
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Compact, high-polish card following the Apple × Geist aesthetic.
 * Renders authentic recognizable third-party brand logos (Google, GitHub, Slack, Notion, etc.).
 * Displays truthful backend-derived status, without hardcoded fake connected states.
 */

'use client';

import React from 'react';
import {
  CheckCircle,
  ArrowClockwise,
  WarningCircle,
  Lock,
} from '@phosphor-icons/react';
import type { ConnectorItem } from '@/stores/connectors.store';
import { getConnectorIcon } from '@/components/icons';

interface ConnectorCardProps {
  connector: ConnectorItem;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
}

export default function ConnectorCard({ connector, onSelect, onConnect }: ConnectorCardProps) {
  const Icon = getConnectorIcon(connector.slug || connector.id);
  const isConnected = connector.status === 'CONNECTED';
  const isConnecting = connector.status === 'CONNECTING';
  const isAuthRequired = connector.status === 'AUTHORIZATION_REQUIRED' || connector.status === 'REAUTH_REQUIRED';
  const isError = connector.status === 'ERROR';

  return (
    <div
      onClick={() => onSelect(connector.id)}
      className="group relative flex flex-col justify-between rounded-2xl p-4 transition-all cursor-pointer"
      style={{
        background: 'var(--surface-raised)',
        border: isConnected ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-key)',
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.borderColor = 'var(--accent-muted)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.borderColor = isConnected ? 'var(--border-strong)' : 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: Authentic Brand Icon + Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Neutral container preserving real brand colors */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xs"
            >
              <Icon size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {connector.name}
              </h3>
              <span
                className="text-[11px] truncate block"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {connector.category}
              </span>
            </div>
          </div>

          {/* Truthful Status Indicator */}
          {isConnected && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--success, #22c55e)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
              }}
            >
              <CheckCircle size={11} weight="fill" />
              <span>Connecté</span>
            </span>
          )}

          {isAuthRequired && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20"
            >
              <Lock size={11} />
              <span>Reconnexion</span>
            </span>
          )}

          {isError && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-red-500/10 text-red-400 border border-red-500/20"
            >
              <WarningCircle size={11} />
              <span>Erreur</span>
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {connector.description}
        </p>
      </div>

      {/* Bottom row: Account metadata / Action button */}
      <div
        className="flex items-center justify-between pt-3 mt-auto"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="min-w-0 text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
          {isConnected && connector.connectedAccount ? (
            <span className="font-mono text-[10px]">{connector.connectedAccount}</span>
          ) : (
            <span>{connector.capabilities.length} capacités</span>
          )}
        </div>

        <div>
          {isConnected ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(connector.id);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--hover)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              Gérer
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConnect(connector.id);
              }}
              disabled={isConnecting}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = 'var(--accent-hover)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              {isConnecting ? (
                <>
                  <ArrowClockwise size={12} className="animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <span>Connecter</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
