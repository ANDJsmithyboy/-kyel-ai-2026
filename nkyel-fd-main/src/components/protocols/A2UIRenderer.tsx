/**
 * Ñkyel AI · A2UI Declarative Interface Renderer
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Secure renderer for A2UI declarative JSON specs.
 * Renders forms, tables, charts, metric cards, and comparison panels
 * using native Ñkyel components with zero arbitrary Javascript execution.
 */

'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle,
  WarningCircle,
  ArrowUpRight,
  ArrowDownRight,
  CaretUpDown,
  Table as TableIcon,
  ChartLine,
  Cards,
  SlidersHorizontal,
  FileText,
} from '@phosphor-icons/react';
import type { A2UISurfaceSpec, A2UIFormField } from '@/lib/protocols/protocols.types';

interface A2UIRendererProps {
  spec: A2UISurfaceSpec;
  onSubmitAction?: (actionKey: string, payload: Record<string, unknown>) => void;
  onValidationChange?: (allValid: boolean) => void;
}

const WADA_CHART_COLORS = ['var(--accent)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--error)', 'var(--text-secondary)'];

export default function A2UIRenderer({
  spec,
  onSubmitAction = () => {},
  onValidationChange = () => {},
}: A2UIRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    spec.formFields?.forEach((f) => {
      if (f.defaultValue !== undefined) initial[f.name] = f.defaultValue;
    });
    return initial;
  });

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    spec.validationControls?.checklist.forEach((item) => {
      initial[item.id] = item.checked;
    });
    return initial;
  });

  // Handle Form Change
  const handleFieldChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Checklist Change
  const handleChecklistToggle = (id: string) => {
    setChecklistState((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      const allMandatoryChecked =
        spec.validationControls?.checklist.every((c) => !c.isMandatory || updated[c.id]) ?? true;
      onValidationChange(allMandatoryChecked);
      return updated;
    });
  };

  // Sort Table Data
  const sortedTableData = React.useMemo(() => {
    if (!spec.tableData || !sortCol) return spec.tableData || [];
    return [...spec.tableData].sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (valA < valB) return sortAsc ? -1 : 1;
      return sortAsc ? 1 : -1;
    });
  }, [spec.tableData, sortCol, sortAsc]);

  return (
    <div className="w-full rounded-2xl p-5 my-3 relative overflow-hidden transition-all bg-[var(--glass-elevated)] border border-[var(--glass-border)] shadow-[var(--shadow-floating)]">
      {/* Surface Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-semibold bg-[var(--accent-10)] text-[var(--accent)]">
            {spec.componentType === 'table' && <TableIcon size={16} />}
            {spec.componentType === 'chart' && <ChartLine size={16} />}
            {spec.componentType === 'comparison_panel' && <Cards size={16} />}
            {spec.componentType === 'form' && <SlidersHorizontal size={16} />}
            {spec.componentType === 'metric_card' && <FileText size={16} />}
          </span>
          <div>
            <h4 className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">{spec.title}</h4>
            {spec.description && (
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{spec.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase bg-[var(--accent-06)] text-[var(--accent)] border border-[var(--accent-10)]">
            A2UI · {spec.schemaVersion}
          </span>
          <span className="text-[11px] text-[var(--text-tertiary)]">Agent: {spec.generatedByAgent}</span>
        </div>
      </div>

      {/* ── 1. FORM RENDERER ── */}
      {spec.componentType === 'form' && spec.formFields && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitAction('submit_form', formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spec.formFields.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                  {field.label} {field.required && <span className="text-[var(--error)]">*</span>}
                </label>

                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                  <input
                    type={field.type}
                    value={(formData[field.name] as string) || ''}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={(formData[field.name] as string) || ''}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  >
                    <option value="">Sélectionner une option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={(formData[field.name] as string) || ''}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[var(--text-primary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[field.name])}
                      onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--surface-raised)] border-[var(--border-subtle)]"
                    />
                    <span className="text-[13px] text-[var(--text-secondary)]">{field.label}</span>
                  </label>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {spec.actions?.map((act) => (
              <button
                key={act.id}
                type={act.variant === 'primary' ? 'submit' : 'button'}
                onClick={() => act.variant !== 'primary' && onSubmitAction(act.actionKey, formData)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                  act.variant === 'primary'
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text-inverse)] shadow-md opacity-90 hover:opacity-100'
                    : act.variant === 'danger'
                    ? 'bg-[var(--error-subtle)] hover:bg-[var(--error)] text-[var(--error)] hover:text-white border border-[var(--error)]/30'
                    : 'bg-[var(--control-bg)] hover:bg-[var(--control-hover)] text-[var(--text-primary)] border border-[var(--control-border)]'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* ── 2. TABLE RENDERER ── */}
      {spec.componentType === 'table' && spec.tableColumns && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full text-start text-[13px] border-collapse">
            <thead className="bg-[var(--surface-raised)] text-[var(--text-tertiary)] font-medium border-b border-[var(--border-subtle)]">
              <tr>
                {spec.tableColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => {
                      if (col.sortable !== false) {
                        if (sortCol === col.key) setSortAsc(!sortAsc);
                        else {
                          setSortCol(col.key);
                          setSortAsc(true);
                        }
                      }
                    }}
                    className={`px-4 py-3 cursor-pointer select-none ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable !== false && <CaretUpDown size={12} className="opacity-60" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {sortedTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--hover)] transition-colors">
                  {spec.tableColumns!.map((col) => {
                    const rawVal = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}
                      >
                        {col.type === 'badge' ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--info-subtle)] text-[var(--info)] border border-[var(--info)]/20">
                            {String(rawVal)}
                          </span>
                        ) : col.type === 'currency' ? (
                          <span className="font-mono font-medium text-[var(--accent)]">
                            {typeof rawVal === 'number'
                              ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rawVal)
                              : String(rawVal)}
                          </span>
                        ) : (
                          <span className="text-[var(--text-primary)]">{String(rawVal ?? '-')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3. CHART RENDERER ── */}
      {spec.componentType === 'chart' && spec.chartSpec && (
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {spec.chartSpec.chartType === 'line' ? (
              <LineChart data={spec.chartSpec.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-raised)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                />
                {spec.chartSpec.series.map((s, idx) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color || WADA_CHART_COLORS[idx % WADA_CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            ) : spec.chartSpec.chartType === 'bar' ? (
              <BarChart data={spec.chartSpec.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-raised)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                />
                {spec.chartSpec.series.map((s, idx) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color || WADA_CHART_COLORS[idx % WADA_CHART_COLORS.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            ) : (
              <AreaChart data={spec.chartSpec.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-raised)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                />
                {spec.chartSpec.series.map((s, idx) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color || WADA_CHART_COLORS[idx % WADA_CHART_COLORS.length]}
                    fill={`var(--accent-10)`}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* ── 4. COMPARISON PANEL ── */}
      {spec.componentType === 'comparison_panel' && spec.comparisonItems && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {spec.comparisonItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                item.isRecommended
                  ? 'bg-[var(--accent-06)] border-[var(--accent)]/40 shadow-lg'
                  : 'bg-[var(--surface-raised)] border-[var(--border-subtle)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[14px] font-semibold text-[var(--text-primary)]">{item.title}</h5>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.isRecommended
                          ? 'bg-[var(--accent-10)] text-[var(--accent)] border border-[var(--accent)]/30'
                          : 'bg-[var(--control-bg)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-1.5 my-3">
                  {item.metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-tertiary)]">{m.label}</span>
                      <span className={`font-semibold ${m.isPositive ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Feature Checklist */}
                <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                  {item.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                      {f.supported ? (
                        <CheckCircle size={13} weight="fill" className="text-[var(--success)] shrink-0" />
                      ) : (
                        <span className="text-[var(--text-tertiary)] opacity-50 shrink-0">✕</span>
                      )}
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.actionLabel && (
                <button
                  type="button"
                  onClick={() => onSubmitAction('select_comparison_item', { itemId: item.id })}
                  className={`mt-4 w-full py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    item.isRecommended
                      ? 'bg-[var(--accent)] hover:opacity-90 text-[var(--text-inverse)]'
                      : 'bg-[var(--control-bg)] hover:bg-[var(--control-hover)] text-[var(--text-primary)]'
                  }`}
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 5. METRIC CARD ── */}
      {spec.componentType === 'metric_card' && spec.metricCardData && (
        <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[var(--text-tertiary)] font-medium block">{spec.metricCardData.label}</span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">{spec.metricCardData.value}</span>
              {spec.metricCardData.trendPercent !== undefined && (
                <span
                  className={`flex items-center text-[11px] font-semibold ${
                    spec.metricCardData.trendDirection === 'up' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  }`}
                >
                  {spec.metricCardData.trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {spec.metricCardData.trendPercent}%
                </span>
              )}
            </div>
            {spec.metricCardData.subtext && (
              <span className="text-[11px] text-[var(--text-tertiary)] mt-1 block">{spec.metricCardData.subtext}</span>
            )}
          </div>
        </div>
      )}

      {/* ── 6. VALIDATION CONTROLS (HUMAN IN THE LOOP) ── */}
      {spec.validationControls && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
          <div className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wider">
            Points de vérification humaine requis
          </div>
          {spec.validationControls.checklist.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-2.5 cursor-pointer py-1 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <input
                type="checkbox"
                checked={Boolean(checklistState[item.id])}
                onChange={() => handleChecklistToggle(item.id)}
                className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--surface-raised)] border-white/10 mt-0.5"
              />
              <span>
                {item.text} {item.isMandatory && <span className="text-[var(--error)] font-medium">(Obligatoire)</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
