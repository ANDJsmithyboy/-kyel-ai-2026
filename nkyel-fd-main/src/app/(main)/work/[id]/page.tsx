/**
 * Ñkyel AI — Page Espace VIE & WorkGraph
 * Route : /work/[id]
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import VIECanvas from '@/components/vie/VIECanvas';
import ReplayTimeline from '@/components/nkyel/ReplayTimeline';

export default function WorkGraphPage() {
  const params = useParams();
  const threadId = (params?.id as string) || 'active-thread';

  return (
    <div className="w-full h-full flex flex-col bg-[#08090D] overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="h-12 border-b border-white/[0.06] bg-[#0E121A] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F1EEE7]">Espace VIE — WorkGraph</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#665F9E]/20 text-[#AAA2C8] font-mono">
            Mission : {threadId}
          </span>
        </div>
      </div>

      {/* Canvas central */}
      <div className="flex-1 relative min-h-0">
        <VIECanvas />
      </div>

      {/* Timeline d'exécution pas à pas */}
      <div className="h-14 border-t border-white/[0.06] bg-[#0E121A] shrink-0">
        <ReplayTimeline runId={threadId} />
      </div>
    </div>
  );
}
