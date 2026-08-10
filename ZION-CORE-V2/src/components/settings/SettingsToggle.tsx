/**
 * Gaboma AI · SettingsToggle.tsx · Client Component
 * SmartANDJ AI Technologies
 */

'use client';

import { useState } from 'react';

interface SettingsToggleProps {
  defaultChecked: boolean;
  onToggle?: (checked: boolean) => void;
}

export default function SettingsToggle({ defaultChecked, onToggle }: SettingsToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const next = !checked;
    setChecked(next);
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className="relative flex-shrink-0 cursor-pointer rounded-xl transition-colors"
      style={{
        width: 44,
        height: 24,
        background: checked ? 'var(--accent)' : 'var(--accent-06)',
        border: `1px solid ${checked ? 'var(--accent-35)' : 'var(--border)'}`,
        transition: 'var(--transition-fast)',
      }}
    >
      <span
        className="absolute top-[2px] left-[2px] block rounded-full bg-white"
        style={{
          width: 18,
          height: 18,
          opacity: checked ? 1 : 0.4,
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
      />
    </button>
  );
}
