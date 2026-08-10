/* GabomaGPT · ThinkingAnimation.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Animation de réflexion — 5 arcs rotatifs (couleurs du logo) + logo pulsant */
'use client';

const ARCS = [
  { color: '#1DB954', r: 72, speed: 2.8, direction: 1,   dasharray: '30 140' },
  { color: '#F5C518', r: 64, speed: 3.4, direction: -1,  dasharray: '25 130' },
  { color: '#00A8E8', r: 78, speed: 2.2, direction: 1,   dasharray: '35 160' },
  { color: '#C0392B', r: 58, speed: 3.8, direction: -1,  dasharray: '20 120' },
  { color: '#8E44AD', r: 85, speed: 1.8, direction: 1,   dasharray: '40 180' },
];

interface ThinkingAnimationProps {
  size?: number;
  showLogo?: boolean;
}

export default function ThinkingAnimation({ size = 48, showLogo = true }: ThinkingAnimationProps) {
  const viewBox = 200;
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const scale = size / viewBox;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className="absolute inset-0"
      >
        {ARCS.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={arc.r}
            fill="none"
            stroke={arc.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={arc.dasharray}
            opacity={0.8}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: `${arc.direction > 0 ? 'aura-spin' : 'aura-spin-reverse'} ${arc.speed}s linear infinite`,
            }}
          />
        ))}
      </svg>

      {showLogo && (
        <img
          src="/gabomagpt-logo.jpeg"
          alt="GabomaGPT"
          className="relative z-10 rounded-xl object-cover"
          style={{
            width: size * 0.38,
            height: size * 0.38,
            animation: 'pulse-soft 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
