/* GabomaGPT · Admin Shared Components · SmartANDJ AI Technologies
   Apple/Vercel-inspired glassmorphism components
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { ReactNode, ElementType } from 'react';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

// ══════════════════════════════════════════════════════════
// KPI CARD
// ══════════════════════════════════════════════════════════

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: ElementType | string;
  subtitle?: string;
}

export function KPICard({ title, value, change, changeType = 'neutral', icon: Icon, subtitle }: KPICardProps) {
  const isUp = changeType === 'up';
  const isDown = changeType === 'down';
  const changeColor = isUp ? 'text-[var(--emerald)]' : isDown ? 'text-[var(--destructive)]' : 'text-[var(--text-muted)]';
  const changeBg = isUp ? 'bg-[var(--emerald)]/10 border-[var(--emerald)]/20' : isDown ? 'bg-[var(--destructive)]/10 border-[var(--destructive)]/20' : 'bg-[var(--glass)] border-[var(--glass-border)]';
  const ChangeIcon = isUp ? TrendUp : isDown ? TrendDown : Minus;

  return (
    <div className="relative overflow-hidden bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl p-5 transition-all duration-300 hover:bg-[var(--bg-card2)] hover:border-[var(--accent)]/30 shadow-sm group">
      {/* Subtle top inner highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--glass-border)] bg-[var(--bg-base)] shadow-inner group-hover:scale-105 transition-transform duration-300 text-[var(--accent)]`}>
          {typeof Icon === 'string' ? <span className="text-lg">{Icon}</span> : <Icon size={20} weight="thin" />}
        </div>
        {change && (
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${changeBg} ${changeColor} tracking-tight`}>
            <ChangeIcon size={14} weight="bold" />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tight antialiased mb-1">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] antialiased">{title}</p>
        {subtitle && <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1.5 tracking-tight">{subtitle}</p>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const badgeStyles: Record<BadgeVariant, string> = {
  success: 'bg-[var(--emerald)]/10 text-[var(--emerald)] border-[var(--emerald)]/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  error: 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20',
  info: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
  neutral: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--glass-border)]',
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${badgeStyles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-[var(--emerald)]' : variant === 'error' ? 'bg-[var(--destructive)]' : variant === 'warning' ? 'bg-amber-500' : variant === 'info' ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'}`} />
      {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════
// DATA TABLE
// ══════════════════════════════════════════════════════════

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'Aucune donnée',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-base)]/50 border-b border-[var(--glass-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm font-medium text-[var(--text-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`group hover:bg-[var(--bg-card2)] transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-4 text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] antialiased tracking-tight transition-colors ${col.className || ''}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CHART CARD
// ══════════════════════════════════════════════════════════

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] tracking-tight antialiased">{title}</h3>
        {subtitle && <p className="text-[11px] font-medium text-[var(--text-muted)] tracking-tight mt-1">{subtitle}</p>}
      </div>
      <div className="relative flex-1">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TRACE TIMELINE (Agent Trace Viewer)
// ══════════════════════════════════════════════════════════

interface TraceStep {
  label: string;
  status: 'success' | 'error' | 'pending' | 'running';
  detail?: string;
  timestamp?: string;
  duration?: string;
}

interface TraceTimelineProps {
  steps: TraceStep[];
}

const stepColors = {
  success: 'border-[var(--emerald)] bg-[var(--emerald)]',
  error: 'border-[var(--destructive)] bg-[var(--destructive)]',
  pending: 'border-[var(--text-muted)] bg-[var(--text-muted)]',
  running: 'border-[var(--accent)] bg-[var(--accent)] animate-pulse',
};

export function TraceTimeline({ steps }: TraceTimelineProps) {
  return (
    <div className="relative pl-6 space-y-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--glass-border)]" />

      {steps.map((step, i) => (
        <div key={i} className="relative flex items-start gap-4">
          {/* Dot */}
          <div className={`absolute left-[-19px] top-1.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--bg-card)] ${stepColors[step.status]} shadow-[0_0_0_2px_var(--glass-border)]`} />

          {/* Content */}
          <div className="flex-1 min-w-0 bg-[var(--glass)] border border-[var(--glass-border)] rounded-xl p-3 hover:bg-[var(--bg-card2)] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">{step.label}</span>
              {step.duration && (
                <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded border border-[var(--glass-border)] tracking-widest uppercase">{step.duration}</span>
              )}
            </div>
            {step.detail && <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed antialiased mt-2">{step.detail}</p>}
            {step.timestamp && <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mt-2">{step.timestamp}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION HEADER
// ══════════════════════════════════════════════════════════

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6 pb-4 border-b border-[var(--glass-border)]">
      <div>
        <h2 className="text-xl font-display font-semibold text-[var(--text-primary)] tracking-tight antialiased">{title}</h2>
        {subtitle && <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1.5 tracking-tight">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FILTER BAR
// ══════════════════════════════════════════════════════════

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    name: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map((filter) => (
        <div key={filter.name} className="relative group">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-full bg-[var(--bg-card)] border border-[var(--glass-border)] text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer hover:bg-[var(--bg-card2)] shadow-sm antialiased"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--bg-base)]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}
