/**
 * Gaboma AI · TierBadge.tsx · Server Component
 * SmartANDJ AI Technologies
 */

interface TierBadgeProps {
  text: string;
}

export default function TierBadge({ text }: TierBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-pill)] uppercase"
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
      {text}
    </span>
  );
}
