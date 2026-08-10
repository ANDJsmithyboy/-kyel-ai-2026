/**
 * Gaboma AI · SettingsSection.tsx · Server Component
 * SmartANDJ AI Technologies
 */

import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      {title && (
        <p
          className="px-4 pb-2 pt-5 text-[11px] font-medium uppercase"
          style={{
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
          }}
        >
          {title}
        </p>
      )}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)]"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {children}
      </div>
    </div>
  );
}
