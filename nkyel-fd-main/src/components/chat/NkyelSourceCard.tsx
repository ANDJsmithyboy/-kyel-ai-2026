import React from 'react';

export interface NkyelSourceCardProps {
  index: number;
  title: string;
  domain: string;
  url?: string;
  snippet?: string;
  favicon?: string;
}

export default function NkyelSourceCard({
  index,
  title,
  domain,
  url,
  snippet,
  favicon,
}: NkyelSourceCardProps) {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col gap-1.5 p-3 rounded-[8px] border border-[var(--border-subtle)] 
        bg-[var(--surface-raised)] hover:bg-[var(--hover)] hover:border-[var(--border)]
        transition-colors cursor-pointer w-full text-left
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0">
          {favicon ? (
            <img src={favicon} alt="" className="w-4 h-4 rounded-sm shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-sm bg-[var(--surface)] border border-[var(--border)] shrink-0" />
          )}
          <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-tight truncate">
            {domain}
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[var(--text-tertiary)] shrink-0">
          [{index}]
        </span>
      </div>

      <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-1">
        {title}
      </h4>

      {snippet && (
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {snippet}
        </p>
      )}
    </div>
  );
}
