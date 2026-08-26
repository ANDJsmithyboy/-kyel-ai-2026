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

const WADA_CHART_COLORS = ['#665F9E', '#315A70', '#6F9485', '#C39A52', '#765E78', '#AAA2C8'];

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
    <div
      className="w-full rounded-2xl p-5 my-3 relative overflow-hidden transition-all"
      style={{
        background: 'rgba(21, 25, 34, 0.75)',
        border: '1px solid rgba(118, 94, 120, 0.25)', // Muted Plum accent border for A2UI
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      }}
    >
      {/* Surface Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-semibold"
            style={{ background: 'rgba(118, 94, 120, 0.2)', color: '#AAA2C8' }}
          >
            {spec.componentType === 'table' && <TableIcon size={16} />}
            {spec.componentType === 'chart' && <ChartLine size={16} />}
            {spec.componentType === 'comparison_panel' && <Cards size={16} />}
            {spec.componentType === 'form' && <SlidersHorizontal size={16} />}
            {spec.componentType === 'metric_card' && <FileText size={16} />}
          </span>
          <div>
            <h4 className="text-[14px] font-semibold text-[#F1EEE7] tracking-tight">{spec.title}</h4>
            {spec.description && (
              <p className="text-[12px] text-[#7E8795] mt-0.5">{spec.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
            style={{ background: 'rgba(118, 94, 120, 0.15)', color: '#AAA2C8', border: '1px solid rgba(118, 94, 120, 0.3)' }}
          >
            A2UI · {spec.schemaVersion}
          </span>
          <span className="text-[11px] text-[#7E8795]">Agent: {spec.generatedByAgent}</span>
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
                <label className="block text-[12px] font-medium text-[#B8C0CC] mb-1.5">
                  {field.label} {field.required && <span className="text-[#BE6254]">*</span>}
                </label>

                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                  <input
                    type={field.type}
                    value={(formData[field.name] as string) || ''}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[#F1EEE7] bg-[#0E121A] border border-white/[0.08] focus:border-[#665F9E] focus:outline-none transition-colors"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={(formData[field.name] as string) || ''}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[#F1EEE7] bg-[#0E121A] border border-white/[0.08] focus:border-[#665F9E] focus:outline-none transition-colors"
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
                    className="w-full px-3.5 py-2 rounded-xl text-[13px] text-[#F1EEE7] bg-[#0E121A] border border-white/[0.08] focus:border-[#665F9E] focus:outline-none transition-colors"
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(formData[field.name])}
                      onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                      className="w-4 h-4 rounded text-[#665F9E] bg-[#0E121A] border-white/10"
                    />
                    <span className="text-[13px] text-[#B8C0CC]">{field.label}</span>
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
                    ? 'bg-[#665F9E] hover:bg-[#665F9E]/90 text-white shadow-md'
                    : act.variant === 'danger'
                    ? 'bg-[#BE6254]/20 hover:bg-[#BE6254]/30 text-[#BE6254] border border-[#BE6254]/30'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#F1EEE7] border border-white/[0.08]'
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
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-[#0E121A] text-[#7E8795] font-medium border-b border-white/[0.06]">
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
                    className={`px-4 py-3 cursor-pointer select-none ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable !== false && <CaretUpDown size={12} className="opacity-60" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortedTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  {spec.tableColumns!.map((col) => {
                    const rawVal = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {col.type === 'badge' ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#6F9485]/15 text-[#6F9485] border border-[#6F9485]/20">
                            {String(rawVal)}
                          </span>
                        ) : col.type === 'currency' ? (
                          <span className="font-mono font-medium text-[var(--accent)]">
                            {typeof rawVal === 'number'
                              ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rawVal)
                              : String(rawVal)}
                          </span>
                        ) : (
                          <span className="text-[#F1EEE7]">{String(rawVal ?? '-')}</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="#7E8795" fontSize={11} />
                <YAxis stroke="#7E8795" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151922',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#F1EEE7',
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="#7E8795" fontSize={11} />
                <YAxis stroke="#7E8795" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151922',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#F1EEE7',
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={spec.chartSpec.xAxisKey} stroke="#7E8795" fontSize={11} />
                <YAxis stroke="#7E8795" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151922',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#F1EEE7',
                  }}
                />
                {spec.chartSpec.series.map((s, idx) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color || WADA_CHART_COLORS[idx % WADA_CHART_COLORS.length]}
                    fill={`${s.color || WADA_CHART_COLORS[idx % WADA_CHART_COLORS.length]}25`}
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
                  ? 'bg-[#665F9E]/10 border-[#665F9E]/40 shadow-lg'
                  : 'bg-[#0E121A] border-white/[0.06]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[14px] font-semibold text-[#F1EEE7]">{item.title}</h5>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.isRecommended
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30'
                          : 'bg-white/[0.08] text-[#B8C0CC]'
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
                      <span className="text-[#7E8795]">{m.label}</span>
                      <span className={`font-semibold ${m.isPositive ? 'text-[#6F9485]' : 'text-[#F1EEE7]'}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Feature Checklist */}
                <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                  {item.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-[#B8C0CC]">
                      {f.supported ? (
                        <CheckCircle size={13} weight="fill" className="text-[#6F9485] shrink-0" />
                      ) : (
                        <span className="text-[#7E8795] opacity-50 shrink-0">✕</span>
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
                      ? 'bg-[#665F9E] hover:bg-[#665F9E]/90 text-white'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#F1EEE7]'
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
        <div className="p-4 rounded-xl bg-[#0E121A] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[12px] text-[#7E8795] font-medium block">{spec.metricCardData.label}</span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-2xl font-bold font-mono text-[#F1EEE7]">{spec.metricCardData.value}</span>
              {spec.metricCardData.trendPercent !== undefined && (
                <span
                  className={`flex items-center text-[11px] font-semibold ${
                    spec.metricCardData.trendDirection === 'up' ? 'text-[#6F9485]' : 'text-[#BE6254]'
                  }`}
                >
                  {spec.metricCardData.trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {spec.metricCardData.trendPercent}%
                </span>
              )}
            </div>
            {spec.metricCardData.subtext && (
              <span className="text-[11px] text-[#7E8795] mt-1 block">{spec.metricCardData.subtext}</span>
            )}
          </div>
        </div>
      )}

      {/* ── 6. VALIDATION CONTROLS (HUMAN IN THE LOOP) ── */}
      {spec.validationControls && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
          <div className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wider">
            Points de vérification humaine requis
          </div>
          {spec.validationControls.checklist.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-2.5 cursor-pointer py-1 text-[12px] text-[#B8C0CC] hover:text-white transition-colors"
            >
              <input
                type="checkbox"
                checked={Boolean(checklistState[item.id])}
                onChange={() => handleChecklistToggle(item.id)}
                className="w-4 h-4 rounded text-[#665F9E] bg-[#0E121A] border-white/10 mt-0.5"
              />
              <span>
                {item.text} {item.isMandatory && <span className="text-[#BE6254] font-medium">(Obligatoire)</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
