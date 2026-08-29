import React from 'react';
import { VIESection } from '../VIESection';
import { VIEPlan as PlanData, VIESectionState } from '@/lib/nkyel/vie-projection';
import { CaretRight } from '@phosphor-icons/react';

interface VIEActionPlanProps {
  state: VIESectionState<PlanData>;
}

export function VIEActionPlan({ state }: VIEActionPlanProps) {
  const { data, status } = state;

  const renderPriority = (task: any) => {
    // Attempt to map real priorities if they exist.
    const priority = task.metadata?.priority || 'medium';
    
    switch (priority) {
      case 'high':
        return <span className="text-[var(--nkyel-danger,var(--danger))] uppercase text-[10px] font-bold">ÉLEVÉE</span>;
      case 'low':
        return <span className="text-[var(--text-muted)] uppercase text-[10px] font-bold">FAIBLE</span>;
      case 'medium':
      default:
        return <span className="text-[var(--nkyel-warning,var(--warning))] uppercase text-[10px] font-bold">MOYENNE</span>;
    }
  };

  const actionList = (
    <div className="flex flex-col gap-2 w-full max-w-lg">
      {data.actions.length > 0 ? (
        data.actions.slice(0, 4).map((action, idx) => (
          <div 
            key={action.id} 
            className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[var(--surface-raised)] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[var(--border)] text-[10px] text-[var(--text-secondary)]">
                {idx + 1}
              </span>
              <span className="text-[13px] text-[var(--text-primary)] truncate">
                {action.title}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 pl-4">
              {renderPriority(action)}
              <CaretRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          </div>
        ))
      ) : (
        <div className="text-[13px] text-[var(--text-muted)] italic py-2">
          Aucune action planifiée pour le moment.
        </div>
      )}
      
      {data.actions.length > 4 && (
        <div className="text-[12px] text-[var(--text-muted)] pt-2 pl-1">
          + {data.actions.length - 4} actions supplémentaires
        </div>
      )}
    </div>
  );

  return (
    <VIESection
      number={3}
      title="PLAN D'ACTION"
      description="VIE propose des actions hiérarchisées et prêtes à être exécutées."
      status={status}
      metric={<span>{data.totalActions} actions</span>}
      primaryContent={actionList}
    />
  );
}
