'use client';

import React from 'react';
import { useLanguageStore } from '@/stores/language.store';
import { CheckCircle, Circle, Spinner, Clock } from '@phosphor-icons/react';
import type { NkyelVisualEvent } from '@/lib/visualEvents';
import type { ArtifactPreview } from './NkyelMessageItem';

interface MissionStatusCardProps {
  status: 'idle' | 'analyzing' | 'planning' | 'researching' | 'executing' | 'completed' | 'failed';
  events?: NkyelVisualEvent[];
  deliverables?: ArtifactPreview[];
  progress?: number;
}

export default function MissionStatusCard({
  status,
  events = [],
  deliverables = [],
  progress
}: MissionStatusCardProps) {
  const { uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const steps = [
    { id: 'analyzing', label: isFr ? 'Analyse' : 'Analysis' },
    { id: 'planning', label: isFr ? 'Plan' : 'Plan' },
    { id: 'researching', label: isFr ? 'Recherche' : 'Research' },
    { id: 'executing', label: isFr ? 'Exécution' : 'Execution' },
  ];

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['idle', 'analyzing', 'planning', 'researching', 'executing', 'completed', 'failed'];
    const currentStatusIndex = statusOrder.indexOf(status);
    const stepIndex = steps.findIndex(s => s.id === stepId) + 1; // +1 because 'idle' is 0

    if (currentStatusIndex > stepIndex || status === 'completed') return 'completed';
    if (currentStatusIndex === stepIndex) return 'current';
    return 'pending';
  };

  const StatusIcon = ({ state }: { state: 'completed' | 'current' | 'pending' }) => {
    if (state === 'completed') return <CheckCircle size={14} weight="fill" className="text-emerald-500" />;
    if (state === 'current') return <Spinner size={14} className="animate-spin text-[var(--accent)]" />;
    return <Circle size={14} className="text-[var(--text-tertiary)]" />;
  };

  const getStatusText = (state: 'completed' | 'current' | 'pending') => {
    if (state === 'completed') return isFr ? 'terminé' : 'completed';
    if (state === 'current') return isFr ? 'en cours' : 'in progress';
    return isFr ? 'à venir' : 'upcoming';
  };

  return (
    <div className="w-full max-w-lg rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] overflow-hidden shadow-sm my-3 animate-in fade-in duration-200">
      
      {/* 1. Status Indicator (Analyse terminé / Plan en cours) */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          {isFr ? 'Statut de la mission' : 'Mission Status'}
        </h4>
        <div className="space-y-2">
          {steps.map(step => {
            const state = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusIcon state={state} />
                  <span className={state === 'pending' ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)] font-medium'}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-xs ${state === 'current' ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
                  {getStatusText(state)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Timeline Timestamps (Heures réelles) & Steps */}
      {events.length > 0 && (
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            {isFr ? 'Étapes & Historique' : 'Steps & Timeline'}
          </h4>
          <div className="space-y-3">
            {events.map((evt, idx) => (
              <div key={evt.id || idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] mt-1.5" />
                  {idx !== events.length - 1 && <div className="w-px h-full bg-[var(--border-subtle)] my-1" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{evt.type}</span>
                    <span className="text-xs font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {(evt as any).data && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                      {JSON.stringify((evt as any).data)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Progress Bar (Si backend le connaît) */}
      {progress !== undefined && progress > 0 && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {isFr ? 'Progression' : 'Progress'}
            </span>
            <span className="text-xs font-mono text-[var(--text-tertiary)]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${Math.max(2, progress)}%` }} 
            />
          </div>
        </div>
      )}

      {/* 4. Deliverables Section (Livrables : PDF, DOCX, PPTX) */}
      {deliverables.length > 0 && (
        <div className="p-4 bg-[var(--surface)]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            {isFr ? 'Livrables' : 'Deliverables'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {deliverables.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
              >
                <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase">{doc.type}</span>
                <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[100px]">{doc.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
