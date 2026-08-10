'use client';

import React from 'react';
import { DotsThree } from '@phosphor-icons/react';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { SmartAndJTechIcon } from '@/components/icons/SmartAndJTechIcon';
import { cn } from '@/lib/utils';

interface ChatNavbarProps {
  onToggleSidebar: () => void;
  hasArtifact?: boolean;
  onOpenArtifact?: () => void;
}

export default function ChatNavbar({
  onToggleSidebar,
  hasArtifact = false,
  onOpenArtifact,
}: ChatNavbarProps) {
  return (
    <div className="fixed top-4 left-4 right-4 md:left-[280px] md:right-auto md:w-[calc(100vw-320px)] lg:w-[800px] xl:w-[900px] md:mx-auto z-30 flex justify-center pointer-events-none">
      {/* GLASS PILL */}
      <div className="pointer-events-auto flex items-center justify-between w-full h-[56px] px-2 bg-white/7 backdrop-blur-xl backdrop-saturate-150 border border-white/18 rounded-full shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
        
        {/* LEFT: Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95"
        >
          <IbogaAiIcon className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.5} />
        </button>

        {/* CENTER: Title / Logo */}
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none">
          <div className="md:hidden">
            <span className="font-display font-semibold text-base text-[var(--text-primary)] tracking-tight">
              Gaboma AI
            </span>
          </div>
          <div className="hidden md:flex items-center justify-center h-6">
            <SmartAndJTechIcon className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] tracking-tight -mt-0.5">
            En piste…
          </span>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1 pr-1">
          {hasArtifact && (
            <button
              onClick={onOpenArtifact}
              className="px-3 h-8 flex items-center rounded-full bg-[var(--accent)]/12 border border-[var(--accent)]/35 text-[11px] font-semibold text-[var(--accent)] tracking-tight hover:bg-[var(--accent)]/20 transition-colors active:scale-95"
            >
              Le Rendu <span className="ml-1 text-[10px]">💎</span>
            </button>
          )}
          
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95">
            <DotsThree size={24} weight="thin" className="text-[var(--text-primary)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
