/**
 * Ñkyel AI — Page Espace VIE & WorkGraph
 * Route : /work/[id]
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import WorkGraphContainer from '@/components/workgraph/WorkGraphContainer';

export default function WorkGraphPage() {
  const params = useParams();
  const threadId = (params?.id as string) || 'active-thread';

  return (
    <div className="w-full h-full flex flex-col bg-[#08090D] overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="h-14 border-b border-white/[0.06] bg-[#0E121A] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-serif font-medium text-white tracking-wide">WorkGraph</h1>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            Bêta
          </span>
          <div className="w-[1px] h-5 bg-white/[0.06] mx-2" />
          <span className="text-sm text-white/50">
            Orchestrez vos idées. Visualisez ce qui compte.
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs font-medium border border-white/[0.06] rounded-full overflow-hidden bg-white/[0.02]">
            <span className="px-3 py-1.5 text-white/50 hover:text-white cursor-pointer transition-colors">plan gratuit</span>
            <div className="w-[1px] h-4 bg-white/[0.06]" />
            <span className="px-3 py-1.5 text-[var(--accent)] hover:brightness-110 cursor-pointer transition-colors">mise à niveau</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#665F9E]/20 text-[#AAA2C8] font-mono ml-4 hidden md:inline-block">
            Mission : {threadId.substring(0, 8)}...
          </span>
        </div>
      </div>

      {/* Main WorkGraph Container */}
      <div className="flex-1 relative min-h-0">
        <WorkGraphContainer />
      </div>
    </div>
  );
}
