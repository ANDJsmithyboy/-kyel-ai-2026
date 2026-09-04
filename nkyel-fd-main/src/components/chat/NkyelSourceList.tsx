import React from 'react';
import NkyelSourceCard from './NkyelSourceCard';

export interface NkyelSourceListProps {
  sources: {
    id?: string;
    url?: string;
    title: string;
    domain?: string;
    snippet?: string;
    favicon?: string;
  }[];
}

export default function NkyelSourceList({ sources }: NkyelSourceListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full mt-2 mb-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Sources
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sources.map((source, idx) => (
          <NkyelSourceCard
            key={source.id || idx}
            index={idx + 1}
            title={source.title}
            domain={source.domain || new URL(source.url || 'https://unknown').hostname.replace(/^www\./, '')}
            url={source.url}
            snippet={source.snippet}
            favicon={source.favicon}
          />
        ))}
      </div>
    </div>
  );
}
