/**
 * GabomaAI · FilesPanel
 * SmartANDJ AI Technologies
 * Explorateur de fichiers du sandbox de l'agent.
 * Thème : Zion Core Obsidian.
 */

'use client';

import { useAgentStore } from '@/store/agentStore';
import { motion, AnimatePresence } from 'framer-motion';

const fileIcons: Record<string, string> = {
  py: '🐍',
  ts: '💎',
  tsx: '⚛️',
  js: '🟨',
  json: '📋',
  md: '📝',
  html: '🌐',
  css: '🎨',
  yaml: '⚙️',
  yml: '⚙️',
  sql: '🗃️',
  csv: '📊',
  xlsx: '📊',
  docx: '📄',
  pdf: '📕',
  png: '🖼️',
  jpg: '🖼️',
  svg: '🖼️',
};

function getIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return fileIcons[ext] ?? '📎';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPanel() {
  const files = useAgentStore((s) => s.files);

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
          Fichiers
        </span>
        {files.length > 0 && (
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
            {files.length}
          </span>
        )}
      </div>

      {/* ── File list ── */}
      <div
        className="scroll-fade"
        style={{ flex: 1, overflowY: 'auto', padding: '8px' }}
      >
        <AnimatePresence initial={false}>
          {files.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              Aucun fichier généré
            </div>
          ) : (
            files.map((file, index) => (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-10)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {getIcon(file.name)}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      marginTop: '1px',
                    }}
                  >
                    {formatSize(file.size)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
