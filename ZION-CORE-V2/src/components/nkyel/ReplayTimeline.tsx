/**
 * Nkyel AI — Replay Timeline
 *
 * Horizontal timeline bar that replays agent events step-by-step.
 * Connects to the frontend EventStore and reconstructs the graph
 * at each point in time.
 *
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { NkyelEvent, WorkNodeType } from '@/lib/nkyel/work-graph.types';
import { eventStore } from '@/lib/nkyel/event-store';
import './replay-timeline.css';

// --- Event Colors ---------------------------------------

const EVENT_COLORS: Record<string, string> = {
  'goal.received':      '#C0A062',
  'plan.created':       '#6B8AE0',
  'plan.updated':       '#5A7BD0',
  'task.created':       '#7C9AE8',
  'task.started':       '#5BA3B5',
  'task.completed':     '#4CAF50',
  'task.failed':        '#E57373',
  'tool.started':       '#5BA3B5',
  'tool.completed':     '#6EB86E',
  'tool.failed':        '#E57373',
  'source.added':       '#6EB86E',
  'claim.created':      '#E8A838',
  'evidence.linked':    '#4CAF50',
  'hypothesis.created': '#CF72A8',
  'artifact.created':   '#72B8CF',
  'checkpoint.created': '#90A4AE',
  'final.delivered':    '#C0A062',
  'replan.requested':   '#FFB74D',
};

const EVENT_ICONS: Record<string, string> = {
  'goal.received': '🎯',
  'plan.created': '📋',
  'plan.updated': '📋',
  'task.created': '📌',
  'task.started': '⚡',
  'task.completed': '✅',
  'task.failed': '❌',
  'tool.started': '🔧',
  'tool.completed': '🔧',
  'tool.failed': '⚠️',
  'source.added': '📎',
  'claim.created': '💡',
  'evidence.linked': '🔗',
  'hypothesis.created': '🔬',
  'artifact.created': '📄',
  'checkpoint.created': '💾',
  'final.delivered': '🏁',
  'replan.requested': '🔄',
};

// --- Types ----------------------------------------------

interface ReplayTimelineProps {
  /** The run ID to replay */
  runId: string;
  /** Callback when a specific event is selected */
  onEventSelect?: (event: NkyelEvent, index: number) => void;
  /** Callback when the replay position changes (graph should update) */
  onPositionChange?: (upToSequence: number) => void;
  /** Auto-play speed in ms between events (0 = paused) */
  autoPlaySpeed?: number;
}

// --- Component ------------------------------------------

export default function ReplayTimeline({
  runId,
  onEventSelect,
  onPositionChange,
  autoPlaySpeed = 0,
}: ReplayTimelineProps) {
  const [events, setEvents] = useState<NkyelEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(autoPlaySpeed || 800);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load events
  useEffect(() => {
    const runEvents = eventStore.getEvents(runId);
    setEvents(runEvents);
    setCurrentIndex(runEvents.length - 1);
  }, [runId]);

  // Subscribe to new events
  useEffect(() => {
    const unsubscribe = eventStore.subscribe('*', (newEvent) => {
      if (newEvent.runId === runId) {
        setEvents(prev => [...prev, newEvent]);
        if (!isPlaying) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    });
    return unsubscribe;
  }, [runId, isPlaying]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && events.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= events.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, speed);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, speed, events.length]);

  // Notify parent of position changes
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < events.length) {
      const event = events[currentIndex];
      onPositionChange?.(event.sequenceNumber);
      onEventSelect?.(event, currentIndex);
    }
  }, [currentIndex, events, onPositionChange, onEventSelect]);

  // Scroll timeline to keep current event visible
  useEffect(() => {
    if (timelineRef.current && currentIndex >= 0) {
      const marker = timelineRef.current.querySelector(`[data-index="${currentIndex}"]`);
      if (marker) {
        marker.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  const handlePlay = useCallback(() => {
    if (currentIndex >= events.length - 1) {
      setCurrentIndex(-1); // restart from beginning
    }
    setIsPlaying(true);
  }, [currentIndex, events.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.min(prev + 1, events.length - 1));
  }, [events.length]);

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const handleGoToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(events.length - 1);
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="replay-timeline replay-timeline--empty">
        <span className="replay-timeline__empty-text">Aucun événement à rejouer</span>
      </div>
    );
  }

  const progress = events.length > 0 ? ((currentIndex + 1) / events.length) * 100 : 0;
  const currentEvent = currentIndex >= 0 ? events[currentIndex] : null;

  return (
    <div className="replay-timeline">
      {/* Controls */}
      <div className="replay-timeline__controls">
        <button onClick={handleReset} title="Début" className="replay-btn">⏮</button>
        <button onClick={handleStepBackward} title="Précédent" className="replay-btn">⏪</button>
        {isPlaying ? (
          <button onClick={handlePause} title="Pause" className="replay-btn replay-btn--primary">⏸</button>
        ) : (
          <button onClick={handlePlay} title="Lecture" className="replay-btn replay-btn--primary">▶️</button>
        )}
        <button onClick={handleStepForward} title="Suivant" className="replay-btn">⏩</button>
        <button onClick={handleGoToEnd} title="Fin" className="replay-btn">⏭</button>

        {/* Speed control */}
        <select
          className="replay-speed"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={1600}>0.5×</option>
          <option value={800}>1×</option>
          <option value={400}>2×</option>
          <option value={200}>4×</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="replay-timeline__progress">
        <div
          className="replay-timeline__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Event markers */}
      <div className="replay-timeline__track" ref={timelineRef}>
        {events.map((evt, i) => {
          const color = EVENT_COLORS[evt.type] || '#888';
          const icon = EVENT_ICONS[evt.type] || '•';
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;

          return (
            <button
              key={evt.id}
              data-index={i}
              className={`replay-marker ${isActive ? 'replay-marker--active' : ''} ${isPast ? 'replay-marker--past' : ''}`}
              style={{ '--marker-color': color } as React.CSSProperties}
              onClick={() => { setIsPlaying(false); setCurrentIndex(i); }}
              title={`${evt.type} (#${evt.sequenceNumber})`}
            >
              <span className="replay-marker__icon">{icon}</span>
              <span className="replay-marker__dot" />
            </button>
          );
        })}
      </div>

      {/* Current event info */}
      {currentEvent && (
        <div className="replay-timeline__info">
          <span className="replay-info__badge" style={{ background: EVENT_COLORS[currentEvent.type] || '#888' }}>
            {EVENT_ICONS[currentEvent.type] || '•'} {currentEvent.type}
          </span>
          <span className="replay-info__seq">#{currentEvent.sequenceNumber}</span>
          {currentEvent.node?.title && (
            <span className="replay-info__title">{currentEvent.node.title}</span>
          )}
          <span className="replay-info__counter">{currentIndex + 1} / {events.length}</span>
        </div>
      )}
    </div>
  );
}
