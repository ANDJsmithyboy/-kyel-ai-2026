/**
 * GabomaAI · AgentEventRow
 * SmartANDJ AI Technologies
 * Task 8 — Ligne d'événement dans la timeline agent
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { AgentEvent } from '@/lib/models';

interface AgentEventRowProps {
  event: AgentEvent;
  isLast: boolean;
}

const STATUS_COLORS: Record<AgentEvent['status'], string> = {
  pending: '#525258',
  active: '#C5A059',
  done: '#00D4AA',
  error: '#C0392D',
};

export default function AgentEventRow({ event, isLast }: AgentEventRowProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (event.status !== 'active' || !event.started_at) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - (event.started_at ?? Date.now()));
    }, 100);
    return () => clearInterval(interval);
  }, [event.status, event.started_at]);

  const durationDisplay = event.status === 'done' && event.duration_ms !== undefined
    ? formatDuration(event.duration_ms)
    : event.status === 'active'
    ? formatDuration(elapsed)
    : null;

  const dotColor = STATUS_COLORS[event.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        {/* Dot */}
        {event.status === 'active' ? (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full mt-1.5"
            style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
          />
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full mt-1.5"
            style={{ background: dotColor }}
          />
        )}
        {/* Line */}
        {!isLast && (
          <div className="flex-1 w-px mt-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px]" style={{ color: '#F0EDE6', lineHeight: 1.5 }}>
            {event.label}
          </p>
          {durationDisplay && (
            <span
              className="text-[11px] flex-shrink-0 font-mono tabular-nums"
              style={{ color: event.status === 'active' ? '#C5A059' : '#525258' }}
            >
              {durationDisplay}
            </span>
          )}
        </div>

        {event.output && (
          <p className="text-[12px] mt-1 line-clamp-2" style={{ color: '#525258' }}>
            {event.output}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}
