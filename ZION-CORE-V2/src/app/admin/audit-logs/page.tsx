/* GabomaGPT · Audit Logs · SmartANDJ AI Technologies */
'use client';
import { SectionHeader, DataTable, StatusBadge } from '@/components/admin/AdminComponents';

const logs = [
  { id: '1', user: 'Daniel ANDJ', action: 'user.ban', resource: 'users', resourceId: 'u-234', details: 'Banned user for spam', ip: '41.158.x.x', date: '18/06 14:32' },
  { id: '2', user: 'System', action: 'model.deploy', resource: 'models', resourceId: 'flash-v2', details: 'Deployed Flash model v2.3', ip: 'internal', date: '18/06 12:00' },
  { id: '3', user: 'Daniel ANDJ', action: 'waitlist.invite', resource: 'waitlist', resourceId: 'w-89', details: 'Invited 12 users from waitlist', ip: '41.158.x.x', date: '18/06 10:15' },
  { id: '4', user: 'Daniel ANDJ', action: 'config.update', resource: 'settings', resourceId: 'rate-limit', details: 'Updated Pro rate limit: 40→60 req/min', ip: '41.158.x.x', date: '17/06 22:30' },
  { id: '5', user: 'System', action: 'prompt.activate', resource: 'prompts', resourceId: 'p-v2.3', details: 'Activated prompt version v2.3', ip: 'internal', date: '17/06 18:00' },
  { id: '6', user: 'Daniel ANDJ', action: 'dataset.upload', resource: 'distillation', resourceId: 'ds-seed-v3', details: 'Uploaded 50 new seed examples', ip: '41.158.x.x', date: '17/06 15:45' },
];

const cols = [
  { key: 'date', header: 'Date' },
  { key: 'user', header: 'Acteur', render: (r: Record<string, unknown>) => (
    <span className={`text-sm ${r.user === 'System' ? 'text-gray-500 italic' : 'text-white'}`}>{r.user as string}</span>
  )},
  { key: 'action', header: 'Action', render: (r: Record<string, unknown>) => {
    const a = r.action as string;
    const v = a.includes('ban') || a.includes('delete') ? 'error' : a.includes('deploy') || a.includes('activate') ? 'success' : 'info';
    return <StatusBadge label={a} variant={v as 'success' | 'error' | 'info'} />;
  }},
  { key: 'resource', header: 'Ressource', render: (r: Record<string, unknown>) => (
    <span className="font-mono text-xs text-gray-500">{r.resource as string}/{r.resourceId as string}</span>
  )},
  { key: 'details', header: 'Détails', className: 'max-w-[300px] truncate' },
  { key: 'ip', header: 'IP', render: (r: Record<string, unknown>) => <span className="font-mono text-[11px] text-gray-600">{r.ip as string}</span> },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Audit Logs" subtitle="Journal de toutes les actions admin et système"
        action={<button className="h-9 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-xs font-medium hover:bg-white/[0.1] transition-colors">Export CSV</button>}
      />
      <DataTable columns={cols} data={logs} />
    </div>
  );
}
