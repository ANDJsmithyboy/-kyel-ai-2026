/**
 * GabomaAI · ConnectorsRow
 * Pills horizontaux scrollables pour les connecteurs.
 */

'use client';

import { Lightning, Plug, WhatsappLogo, PlusCircle } from '@phosphor-icons/react';

interface Connector {
  id: string;
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

const CONNECTORS: Connector[] = [
  { id: 'skills', label: 'Skills', icon: <Lightning size={14} weight="thin" />, available: false },
  { id: 'mcp', label: 'MCP', icon: <Plug size={14} weight="thin" />, available: false },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsappLogo size={14} weight="thin" />, available: false },
  { id: 'add', label: '+ Ajouter', icon: <PlusCircle size={14} weight="thin" />, available: false },
];

export default function ConnectorsRow() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {CONNECTORS.map((conn) => (
        <button
          key={conn.id}
          disabled={!conn.available}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
          style={{
            border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
            opacity: conn.available ? 1 : 0.45,
            cursor: conn.available ? 'pointer' : 'not-allowed',
            background: 'transparent',
          }}
          aria-label={conn.available ? conn.label : `${conn.label} — bientôt disponible`}
        >
          <span style={{ color: 'var(--text-secondary, #8A8378)' }}>{conn.icon}</span>
          <span
            className="text-xs font-medium"
            style={{
              color: 'var(--text-secondary, #8A8378)',
              fontFamily: 'var(--font-body, Sora, sans-serif)',
            }}
          >
            {conn.label}
          </span>
          {!conn.available && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: 'var(--bg-elevated, rgba(255,255,255,0.06))',
                color: 'var(--text-tertiary, #525258)',
              }}
            >
              Bientôt
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
