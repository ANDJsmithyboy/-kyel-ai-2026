import React from 'react';

interface GabonOriginMarkProps {
  className?: string;
  isFr?: boolean;
}

export function GabonOriginMark({ className = '', isFr = true }: GabonOriginMarkProps) {
  return (
    <div className={`flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity ${className}`} title={isFr ? "Créé au Gabon" : "Created in Gabon"}>
      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm overflow-hidden border border-black/10 dark:border-white/10 shrink-0">
        <rect width="12" height="3" fill="#009E60"/>
        <rect y="3" width="12" height="3" fill="#FCD116"/>
        <rect y="6" width="12" height="3" fill="#3A75C4"/>
      </svg>
      <span className="text-[10px] sm:text-[11px] font-medium text-[var(--text-tertiary)] tracking-wide uppercase">
        {isFr ? 'Conçu au Gabon' : 'Built in Gabon'}
      </span>
    </div>
  );
}
