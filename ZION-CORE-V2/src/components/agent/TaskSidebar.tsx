/**
 * GabomaAI · TaskSidebar
 * SmartANDJ AI Technologies
 * Barre latérale avec l'historique des actions de l'agent.
 * Animée par Framer Motion, thème Zion Core.
 */

'use client';

import { useAgentStore, AgentTask } from '@/store/agentStore';
import { motion, AnimatePresence } from 'framer-motion';

const statusIcons: Record<AgentTask['status'], string> = {
  pending: '◯',
  running: '◉',
  done: '✓',
  error: '✕',
};

const statusColors: Record<AgentTask['status'], string> = {
  pending: 'var(--text-tertiary)',
  running: 'var(--accent)',
  done: 'var(--green-emerald)',
  error: 'var(--destructive, #FF6B7A)',
};

export default function TaskSidebar() {
  const tasks = useAgentStore((s) => s.tasks);
  const phase = useAgentStore((s) => s.phase);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Actions
          </span>
          {tasks.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: 'var(--accent-10)',
                color: 'var(--accent)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {tasks.length}
            </span>
          )}
        </div>

        {/* Phase indicator */}
        {phase !== 'idle' && phase !== 'done' && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: '11px',
              color: 'var(--accent)',
              fontWeight: 500,
            }}
          >
            {phase === 'planning' && '🧠 Planification…'}
            {phase === 'executing' && '⚡ Exécution…'}
            {phase === 'browsing' && '🌐 Navigation…'}
            {phase === 'writing' && '✍️ Écriture…'}
          </motion.div>
        )}
      </div>

      {/* ── Task List ── */}
      <div
        className="scroll-fade"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}
      >
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
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
              En attente d&apos;une instruction…
            </div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '4px',
                  background: task.status === 'running' ? 'var(--accent-10)' : 'transparent',
                  transition: 'background 200ms ease',
                }}
              >
                {/* Status icon */}
                <span
                  style={{
                    color: statusColors[task.status],
                    fontSize: '14px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {task.status === 'running' ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {statusIcons[task.status]}
                    </motion.span>
                  ) : (
                    statusIcons[task.status]
                  )}
                </span>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      marginTop: '2px',
                    }}
                  >
                    {new Date(task.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
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
