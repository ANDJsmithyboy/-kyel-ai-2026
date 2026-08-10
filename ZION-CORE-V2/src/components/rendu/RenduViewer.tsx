'use client';

import type { GabomaRendu } from '@/lib/models';
import GabomaMarkdown from '../markdown/GabomaMarkdown';

interface RenduViewerProps {
  rendu: GabomaRendu;
}

export default function RenduViewer({ rendu }: RenduViewerProps) {
  
  if (rendu.type === 'html') {
    return (
      <div className="w-full h-full bg-white text-black p-4 overflow-auto">
        {/* CAUTION: In production, use iframe with sandbox for security */}
        <div dangerouslySetInnerHTML={{ __html: rendu.content || '' }} />
      </div>
    );
  }

  if (rendu.type === 'code') {
    return (
      <div className="w-full h-full bg-[#020304] text-[#E0E0E0] p-6 overflow-auto font-mono text-sm leading-relaxed">
        <pre><code>{rendu.content}</code></pre>
      </div>
    );
  }

  // default: doc, table, chart (often markdown or specialized view)
  return (
    <div className="w-full h-full p-6 overflow-auto bg-[var(--bg-card)]">
      <GabomaMarkdown content={rendu.content || ''} />
    </div>
  );
}
