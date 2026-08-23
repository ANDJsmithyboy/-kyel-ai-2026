'use client';

import { X, Code, FileText, Table, ChartBar, Desktop } from '@phosphor-icons/react';
import type { RenduType } from '@/lib/models';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings.store';

interface RenduHeaderProps {
  title: string;
  type: RenduType;
  version?: number;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, any> = {
  markdown: FileText,
  code: Code,
  csv: Table,
  excel: Table,
  word: FileText,
  pdf: FileText,
  chart: ChartBar,
  html: Desktop,
  website: Desktop,
};

export default function RenduHeader({ title, type, version, onClose }: RenduHeaderProps) {
  const Icon = TYPE_ICONS[type] || FileText;
  const isBlackPanther = useSettingsStore(s => s.blackPantherMode);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
          isBlackPanther ? "bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)]" : "bg-[var(--green-emerald)]/10 border-[var(--green-emerald)]/20 text-[var(--green-emerald)]"
        )}>
          <Icon size={18} weight="duotone" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate pr-2">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">
              Le Rendu 💎
            </span>
            {version && (
              <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-white/10 px-1.5 py-0.5 rounded">
                v{version}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
          title="Fermer"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
