/**
 * Gaboma AI · UpsellCard.tsx · Server Component
 * SmartANDJ AI Technologies
 */

import Link from 'next/link';

export default function UpsellCard() {
  return (
    <Link
      href="/pricing"
      className="block overflow-hidden rounded-[var(--radius-lg)]"
      style={{
        background: 'var(--accent-10)',
        border: '1px solid var(--accent-35)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--accent-20)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3L12.5 8H7.5L10 3Z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 8V17" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {/* Text */}
        <div className="flex-1">
          <p
            className="text-[14px] font-semibold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
          >
            Évoluer en Ñyel
          </p>
          <p
            className="text-[12px]"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            Débloquer le mode avancé
          </p>
        </div>
        {/* Arrow */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
