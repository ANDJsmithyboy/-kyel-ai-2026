/**
 * Gaboma AI · SettingsRow.tsx · Server Component
 * SmartANDJ AI Technologies
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import TierBadge from './TierBadge';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  action?: 'arrow' | 'badge' | 'toggle' | 'button' | 'none';
  badgeText?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'confirm';
  href?: string;
  children?: React.ReactNode;
  isLast?: boolean;
  labelColor?: string;
}

export default function SettingsRow({
  icon, label, sublabel, action = 'none',
  badgeText, buttonText, buttonVariant = 'default',
  href, children, isLast = false, labelColor,
}: SettingsRowProps) {
  const content = (
    <div
      className={cn('flex min-h-[52px] items-center gap-3 px-4')}
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      {/* Icon */}
      <span className="flex-shrink-0" style={{ color: labelColor || 'var(--text-secondary)' }}>
        {icon}
      </span>

      {/* Label column */}
      <div className="flex-1 py-2">
        <p
          className="text-[15px] font-medium"
          style={{
            fontFamily: 'var(--font-body)',
            color: labelColor || 'var(--text-primary)',
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            className="mt-0.5 text-[13px]"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--text-secondary)',
            }}
          >
            {sublabel}
          </p>
        )}
      </div>

      {/* Action */}
      {action === 'arrow' && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
          <path d="M6 4L10 8L6 12" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {action === 'badge' && badgeText && <TierBadge text={badgeText} />}
      {action === 'button' && buttonText && (
        <span
          className="rounded-[var(--radius-pill)] px-3 py-1 text-[12px] font-medium"
          style={{
            background: buttonVariant === 'destructive' ? 'rgba(224,88,75,0.1)' : 'var(--accent-10)',
            color: buttonVariant === 'destructive' ? 'var(--color-error)' : 'var(--accent)',
          }}
        >
          {buttonText}
        </span>
      )}
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="block transition-colors">{content}</Link>;
  }
  return content;
}
