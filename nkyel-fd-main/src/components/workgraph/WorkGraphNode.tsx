'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { WorkNode } from '@/lib/nkyel/work-graph.types';
import {
  Target,
  Robot,
  Wrench,
  Lightbulb,
  Link as LinkIcon,
  ShieldCheck,
  Scales,
  RocketLaunch,
  Flag,
  FileDashed
} from '@phosphor-icons/react';

// Semantic Node Status mapping
const STATUS_COLORS: Record<string, string> = {
  planned: 'var(--text-tertiary)',
  queued: 'var(--text-tertiary)',
  running: 'var(--accent)',
  waiting: 'var(--warning)',
  waiting_approval: 'var(--warning)',
  completed: 'var(--success)',
  ready: 'var(--success)',
  failed: 'var(--error)',
  cancelled: 'var(--text-tertiary)',
  blocked: 'var(--error)',
};

// Map node types to standard Phosphor icons
const getIconForType = (type: string, size = 20) => {
  const t = type.toLowerCase();
  if (t.includes('goal') || t.includes('objective')) return <Target size={size} weight="fill" />;
  if (t.includes('agent')) return <Robot size={size} weight="fill" />;
  if (t.includes('tool')) return <Wrench size={size} weight="fill" />;
  if (t.includes('hypothesis') || t.includes('hypothèse')) return <Lightbulb size={size} weight="fill" />;
  if (t.includes('source')) return <LinkIcon size={size} weight="bold" />;
  if (t.includes('evidence') || t.includes('preuve')) return <ShieldCheck size={size} weight="fill" />;
  if (t.includes('decision') || t.includes('décision')) return <Scales size={size} weight="fill" />;
  if (t.includes('artifact') || t.includes('livrable')) return <RocketLaunch size={size} weight="fill" />;
  if (t.includes('checkpoint')) return <Flag size={size} weight="fill" />;
  return <FileDashed size={size} weight="regular" />;
};

export default function WorkGraphNode({ data, selected }: { data: WorkNode; selected: boolean }) {
  const isRunning = data.status === 'active';
  const statusColor = STATUS_COLORS[data.status || 'planned'] || 'var(--text-tertiary)';
  const accentColor = 'var(--accent, #665F9E)';

  return (
    <div
      className={`relative min-w-[240px] max-w-[280px] rounded-2xl border bg-[var(--bg-elevated)] p-4 shadow-xl backdrop-blur-md transition-all ${
        selected
          ? 'border-[var(--accent)] shadow-[0_0_32px_rgba(102,95,158,0.2)] ring-1 ring-[var(--accent)] z-10'
          : 'border-[var(--border)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center gap-3 mb-2.5">
        {/* Type Icon */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[10px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: selected ? accentColor : 'var(--text-secondary)'
          }}
        >
          {getIconForType(data.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {data.type.replace('_', ' ')}
          </span>
        </div>
        
        {/* Status Indicator or specific styling if any */}
      </div>

      {/* Node Content */}
      <h4 className="text-[13px] font-normal text-[var(--text-secondary)] leading-snug line-clamp-2 mt-1">
        {data.title}
      </h4>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--text-tertiary)]"
        style={{ top: -5 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--text-tertiary)]"
        style={{ bottom: -5 }}
      />
    </div>
  );
}
