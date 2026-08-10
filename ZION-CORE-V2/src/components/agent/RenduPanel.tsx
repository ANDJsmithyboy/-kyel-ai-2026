/**
 * GabomaAI · RenduPanel
 * SmartANDJ AI Technologies
 * Affiche les artifacts générés (code, markdown, Word, Excel).
 * Thème : Zion Core Obsidian.
 */

'use client';

import { useState } from 'react';
import { useAgentStore, AgentArtifact } from '@/store/agentStore';
import { motion, AnimatePresence } from 'framer-motion';

const typeLabels: Record<AgentArtifact['type'], string> = {
  code: '💻 Code',
  markdown: '📝 Markdown',
  html: '🌐 HTML',
  docx: '📄 Word',
  xlsx: '📊 Excel',
  image: '🖼️ Image',
  unknown: '📎 Fichier',
};

export default function RenduPanel() {
  const artifacts = useAgentStore((s) => s.artifacts);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = artifacts.find((a) => a.id === selectedId) ?? artifacts[artifacts.length - 1] ?? null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Rendus
        </span>
        {artifacts.length > 0 && (
          <span
            style={{
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '999px',
              background: 'var(--accent-10)',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            {artifacts.length}
          </span>
        )}
      </div>

      {/* ── Tabs des artifacts ── */}
      {artifacts.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '8px 12px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {artifacts.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedId(art.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: selected?.id === art.id ? 'var(--accent-20)' : 'var(--bg-surface)',
                color: selected?.id === art.id ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 150ms ease',
              }}
            >
              {art.file.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {/* ── Contenu ── */}
      <div
        className="scroll-fade"
        style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
      >
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              Les rendus apparaîtront ici…
            </motion.div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* File info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>{typeLabels[selected.type]}</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selected.file}</span>
              </div>

              {/* Content renderer */}
              {selected.type === 'code' ? (
                <pre
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.6,
                  }}
                >
                  {selected.content}
                </pre>
              ) : selected.type === 'markdown' ? (
                <div
                  className="markdown-prose"
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                  }}
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              ) : selected.type === 'image' ? (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={selected.content}
                    alt={selected.file}
                    style={{
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              ) : (
                <pre
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selected.content}
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
