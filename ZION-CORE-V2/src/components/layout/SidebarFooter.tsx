/**
 * Gaboma AI · SidebarFooter.tsx
 * SmartANDJ AI Technologies
 * Profil utilisateur + badge tier + engrenage settings.
 */

import Link from 'next/link';

type TierKey = 'FREE' | 'NYEL' | 'WANDANA' | 'ONYX' | 'BLACK_PANTHER' | 'BLUE_PANTHER';

const TIER_LABELS: Record<TierKey, string> = {
  FREE: 'AURATA',
  NYEL: 'ÑKYEL',
  WANDANA: 'WANDANA',
  ONYX: 'ONYXGRIS',
  BLACK_PANTHER: 'BLACK PANTHER',
  BLUE_PANTHER: 'BLUE PANTHER',
};

interface SidebarFooterProps {
  user: {
    name: string;
    email: string;
    tier: TierKey;
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SidebarFooter({ user }: SidebarFooterProps) {
  return (
    <div
      className="mt-auto flex-shrink-0"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 16px 20px',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left — Avatar + name + tier */}
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Initials circle */}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'var(--accent-20)',
            }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--accent)',
              }}
            >
              {getInitials(user.name)}
            </span>
          </div>

          {/* Name + badge */}
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span
              className="truncate text-[13px] font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--text-primary)',
              }}
            >
              {user.name}
            </span>

            {/* Tier pill */}
            <span
              className="inline-flex w-fit items-center rounded-[var(--radius-pill)] uppercase"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: 'var(--accent)',
                background: 'var(--accent-06)',
                border: '1px solid var(--accent-35)',
                padding: '2px 8px',
              }}
            >
              {TIER_LABELS[user.tier]}
            </span>
          </div>
        </div>

        {/* Right — Settings gear */}
        <Link
          href="/antre"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{
            color: 'var(--text-secondary)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          aria-label="Paramètres"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M9 1.5V3M9 15V16.5M16.5 9H15M3 9H1.5M14.3 3.7L13.2 4.8M4.8 13.2L3.7 14.3M14.3 14.3L13.2 13.2M4.8 4.8L3.7 3.7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
