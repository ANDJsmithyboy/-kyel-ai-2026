/**
 * Ñkyel AI · RenduHeader
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

'use client';

import React from 'react';
import { X, Code, FileText, Table, ChartBar, Desktop } from '@phosphor-icons/react';
import type { RenduType } from '@/lib/models';

interface RenduHeaderProps {
  title: string;
  type: RenduType;
  version?: number;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, any> = {
  markdown: FileText,
  code: Code,
  csv: Table,
  excel: Table,
  word: FileText,
  pdf: FileText,
  chart: ChartBar,
  html: Desktop,
  website: Desktop,
};

export default function RenduHeader({ title, type, version, onClose }: RenduHeaderProps) {
  const Icon = TYPE_ICONS[type] || FileText;

  return (
    <div
      className="flex items-center justify-between backdrop-blur-xl"
      style={{
        paddingInline: 'var(--space-4)',
        paddingBlock: 'var(--space-3)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass)',
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-muted)',
            color: 'var(--accent)',
          }}
        >
          <Icon size={18} weight="duotone" />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="font-semibold truncate pr-2"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--fg)' }}
          >
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono uppercase tracking-wider"
              style={{ fontSize: '10px', color: 'var(--fg-subtle)' }}
            >
              Livrable Ñkyel
            </span>
            {version && (
              <span
                className="font-mono"
                style={{
                  fontSize: '10px',
                  color: 'var(--fg-muted)',
                  background: 'var(--accent-subtle)',
                  paddingInline: '6px',
                  paddingBlock: '2px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                v{version}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32,
            height: 32,
            color: 'var(--fg-subtle)',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.background = 'var(--accent-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-subtle)';
            e.currentTarget.style.background = 'transparent';
          }}
          title="Fermer"
          aria-label="Fermer"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
