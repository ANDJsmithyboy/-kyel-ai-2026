/**
 * GabomaAI · AgentTimeline
 * SmartANDJ AI Technologies
 * Task 8 — Timeline verticale des événements agent
 */

'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AgentEvent } from '@/lib/models';
import AgentEventRow from '@/components/agent/AgentEventRow';

interface AgentTimelineProps {
  events: AgentEvent[];
}

export default function AgentTimeline({ events }: AgentTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [events.length]);

  if (!events.length) return null;

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto px-4 py-3"
      style={{ maxHeight: 300, scrollbarWidth: 'thin' }}
    >
      <AnimatePresence initial={false}>
        {events.map((evt, i) => (
          <AgentEventRow key={evt.id} event={evt} isLast={i === events.length - 1} />
        ))}
      </AnimatePresence>
    </div>
  );
}
