import React from 'react';
import { VIESectionState } from '@/lib/nkyel/vie-projection';
import { CheckCircle, CircleDashed, SpinnerGap, WarningCircle } from '@phosphor-icons/react';

interface VIESectionProps {
  number: number;
  title: string;
  description: string;
  status: VIESectionState<any>['status'];
  metric?: React.ReactNode;
  primaryContent?: React.ReactNode;
  secondaryContent?: React.ReactNode;
  actions?: React.ReactNode;
}

export function VIESection({
  number,
  title,
  description,
  status,
  metric,
  primaryContent,
  secondaryContent,
  actions
}: VIESectionProps) {
  
  // Resolve status styling & text
  let StatusIcon = CircleDashed;
  let statusText = 'EN ATTENTE';
  let statusColorClass = 'text-[var(--text-muted)] bg-[var(--surface-raised)] border-[var(--border)]';

  switch (status) {
    case 'idle':
    case 'collecting':
    case 'processing':
    case 'running':
      StatusIcon = SpinnerGap;
      statusText = 'EN COURS';
      statusColorClass = 'text-[var(--nkyel-success,var(--success,#10b981))] bg-[#10b9811a] border-[#10b98133]';
      break;
    case 'ready':
    case 'completed':
      StatusIcon = CheckCircle;
      statusText = status === 'ready' ? 'PRÊT' : 'TERMINÉ';
      statusColorClass = 'text-[var(--nkyel-success,var(--success,#10b981))] bg-[#10b9811a] border-[#10b98133]';
      break;
    case 'failed':
    case 'insufficient':
      StatusIcon = WarningCircle;
      statusText = status === 'failed' ? 'ÉCHEC' : 'INSUFFISANT';
      statusColorClass = 'text-[var(--nkyel-danger,var(--danger,#ef4444))] bg-[#ef44441a] border-[#ef444433]';
      break;
    case 'partial':
      StatusIcon = CircleDashed;
      statusText = 'PARTIEL';
      statusColorClass = 'text-[var(--nkyel-warning,var(--warning,#f59e0b))] bg-[#f59e0b1a] border-[#f59e0b33]';
      break;
  }

  const isAnimated = ['collecting', 'processing', 'running'].includes(status);

  return (
    <section className="nkyel-vie-section relative w-full rounded-[20px] bg-[var(--surface-1,var(--surface))] border border-[var(--border)] overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch min-h-[160px]">
      
      {/* Left Column: Info & Status */}
      <div className="w-full md:w-[280px] lg:w-[320px] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border)] shrink-0">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm">
              {number}
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] uppercase tracking-wide">
              {title}
            </h2>
          </div>
          
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-6">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide uppercase ${statusColorClass}`}>
            <StatusIcon weight="fill" size={12} className={isAnimated ? 'animate-spin' : ''} />
            {statusText}
          </div>
          {metric && (
            <div className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-secondary)] text-[11px] font-medium flex items-center h-[26px]">
              {metric}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Contents */}
      <div className="flex-1 p-6 flex flex-col justify-center min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
          {/* Primary Visualization/Data */}
          {primaryContent && (
            <div className="w-full h-full flex flex-col justify-center min-h-[120px]">
              {primaryContent}
            </div>
          )}
          
          {/* Secondary Details/List */}
          {secondaryContent && (
            <div className="w-full h-full flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-6 lg:pt-0 lg:pl-8">
              {secondaryContent}
            </div>
          )}
        </div>

        {actions && (
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end">
            {actions}
          </div>
        )}
      </div>

    </section>
  );
}
