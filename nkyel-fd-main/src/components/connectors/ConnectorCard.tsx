/**
 * Ñkyel AI · ConnectorCard (Prompt 3 & Section 39–48 Master Visual Specification)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Geometric discipline:
 * - Card layout: grid-template-columns: 50px minmax(0,1fr) 44px (column-gap: 14px)
 * - Height: 98–106px (min-height: 96px), padding: 14px, radius: 18px
 * - Dedicated logo tile: 50×50px square, radius 14px, optically centered with 7–10px safe margin
 * - Action button: 42×42px, radius 12px, "+" for disconnected, "✓" for connected
 * - Authentic brand colors preserved
 */

'use client';

import React from 'react';
import {
  Check,
  Plus,
  ArrowClockwise,
  WarningCircle,
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
  const isError = connector.status === 'ERROR';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(connector.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(connector.id);
        }
      }}
      className="group relative grid w-full rounded-[18px] p-3.5 sm:p-4 transition-all select-none cursor-pointer active:scale-[0.99] touch-manipulation min-h-[98px]"
      style={{
        gridTemplateColumns: '50px minmax(0, 1fr) 42px',
        columnGap: '12px',
        alignItems: 'center',
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
      {/* ─── LEFT: Dedicated Optical Logo Tile (Prompt 3 Section 9) ─── */}
      <div
        className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] shadow-xs transition-transform group-hover:scale-[1.02]"
        style={{
          background: 'var(--control-bg)',
          padding: '8px',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Icon size={26} className="object-contain" />
        </div>
      </div>

      {/* ─── CENTER: Title and Two-Line Description (Prompt 3 Section 15) ─── */}
      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[16px] sm:text-[17px] truncate text-[var(--text-primary)] leading-tight">
            {connector.name}
          </h3>
          {connector.category && (
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
              {connector.category}
            </span>
          )}
        </div>

        <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] leading-snug line-clamp-2 mt-1">
          {connector.description}
        </p>
      </div>

      {/* ─── RIGHT: Compact Action Button (Prompt 3 Section 16) ─── */}
      <div className="shrink-0 flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isConnected) {
              onSelect(connector.id);
            } else {
              onConnect(connector.id);
            }
          }}
          disabled={isConnecting}
          aria-label={isConnected ? `Manage ${connector.name}` : `Connect ${connector.name}`}
          className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 shadow-xs border ${
            isConnected
              ? 'bg-[#10B981] text-white border-transparent shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:brightness-110'
              : isError
              ? 'bg-[var(--error-subtle)] text-[var(--error)] border-[color-mix(in_srgb,var(--error)_30%,transparent)]'
              : 'bg-transparent hover:bg-[var(--hover)] text-[var(--text-secondary)] border-[var(--border-strong)] hover:border-[var(--accent-muted)]'
          }`}
        >
          {isConnecting ? (
            <ArrowClockwise size={18} className="animate-spin text-[var(--accent)]" />
          ) : isConnected ? (
            <Check size={20} weight="bold" />
          ) : isError ? (
            <WarningCircle size={20} />
          ) : (
            <Plus size={20} weight="bold" />
          )}
        </button>
      </div>
    </div>
  );
}
