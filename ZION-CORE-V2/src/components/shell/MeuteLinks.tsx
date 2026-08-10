/**
 * GabomaAI · MeuteLinks (Rejoindre La Meute)
 * SmartANDJ AI Technologies
 * Icônes sociales uniquement — Phosphor thin
 */

'use client';

import { TelegramLogo, WhatsappLogo, XLogo, LinkedinLogo } from '@phosphor-icons/react';

const LINKS = [
  { label: 'Telegram',  href: 'https://t.me/gabomaai',                icon: TelegramLogo },
  { label: 'WhatsApp',  href: 'https://wa.me/gaboma',                 icon: WhatsappLogo },
  { label: 'X',         href: 'https://x.com/gabomaai',               icon: XLogo },
  { label: 'LinkedIn',  href: 'https://linkedin.com/company/gabomaai', icon: LinkedinLogo },
];

export default function MeuteLinks() {
  return (
    <div className="px-4 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-[var(--text-tertiary)]">
        Rejoindre La Meute
      </p>
      <div className="flex items-center gap-2">
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={l.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-[var(--accent-06)] hover:bg-[var(--accent-10)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Icon size={18} weight="thin" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
