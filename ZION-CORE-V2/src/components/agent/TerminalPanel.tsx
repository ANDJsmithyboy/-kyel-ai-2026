/**
 * GabomaAI · TerminalPanel — Design System V3
 * SmartANDJ AI Technologies
 * JetBrains Mono 13px, mapping ANSI gabonais,
 * curseur accent clignotant, fond neutre très sombre.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { motion, AnimatePresence } from 'framer-motion';

/* V3 ANSI color mapping → palette gabonaise */
function getLineColor(line: string): string {
  if (line.startsWith('stderr:') || line.startsWith('error:') || line.startsWith('ERR'))
    return 'var(--ansi-red)';     /* latérite */
  if (line.startsWith('warn:') || line.startsWith('WARN'))
    return 'var(--ansi-yellow)';  /* raphia */
  if (line.startsWith('$') || line.startsWith('>'))
    return 'var(--accent)';       /* accent du thème */
  if (line.startsWith('info:') || line.startsWith('INFO'))
    return 'var(--ansi-blue)';    /* acier */
  if (line.startsWith('success:') || line.startsWith('✓'))
    return 'var(--ansi-green)';   /* forêt / okoumé */
  return 'var(--text-primary)';
}

export default function TerminalPanel() {
  const terminalLines = useAgentStore((s) => s.terminalLines);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll en bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

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
          gap: '8px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--fs-small)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Terminal
        </span>
        {terminalLines.length > 0 && (
          <span
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: 'var(--ls-meta)',
            }}
          >
            {terminalLines.length} lignes
          </span>
        )}
      </div>

      {/* ── Terminal output — V3: JetBrains Mono 13px ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          background: 'var(--zc-background)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-code-inline)',
          lineHeight: 'var(--lh-code-inline)',
        }}
      >
        <AnimatePresence initial={false}>
          {terminalLines.length === 0 ? (
            <div
              style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--fs-small)',
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                paddingTop: '24px',
              }}
            >
              Le terminal s&apos;affichera quand l&apos;agent exécutera du code…
            </div>
          ) : (
            terminalLines.map((line, i) => (
              <motion.div
                key={`line-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  color: getLineColor(line),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {line}
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* V3: Curseur terminal clignotant couleur accent */}
        {terminalLines.length > 0 && (
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '14px',
              background: 'var(--accent)',
              verticalAlign: 'middle',
              marginLeft: '2px',
              animation: 'terminal-cursor-blink 1s infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}
