'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, ChatCircleDots, CalendarBlank } from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { useConversations, type NeonConversation } from '@/hooks/useConversations';
import { useRouter } from 'next/navigation';

function groupConversationsByTime(conversations: NeonConversation[], t: any) {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;
  const weekAgo = todayStart - 7 * 86400000;

  const groups = [
    { label: t('time.today') || "Aujourd'hui", items: [] as NeonConversation[] },
    { label: t('time.yesterday') || 'Hier', items: [] as NeonConversation[] },
    { label: t('time.thisWeek') || 'Cette semaine', items: [] as NeonConversation[] },
    { label: t('time.older') || 'Plus ancien', items: [] as NeonConversation[] },
  ];

  (conversations || []).forEach((c) => {
    const time = new Date(c.updated_at || c.created_at).getTime() || now;
    if (time >= todayStart) groups[0].items.push(c);
    else if (time >= yesterdayStart) groups[1].items.push(c);
    else if (time >= weekAgo) groups[2].items.push(c);
    else groups[3].items.push(c);
  });

  return groups.filter((g) => g.items.length > 0);
}

export default function MissionSearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { conversations, setCurrentConversationId } = useConversations();
  const [query, setQuery] = useState('');
  
  const recentGroups = groupConversationsByTime(
    conversations.filter(c => !query || c.title?.toLowerCase().includes(query.toLowerCase())),
    t
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center pt-[8vh] sm:pt-[12vh] px-4 pb-4">
      {/* Dim backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Panel */}
      <div 
        className="relative w-full max-w-[620px] bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col"
        style={{ maxHeight: 'min(80vh, 600px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Field Header */}
        <div className="flex items-center px-4 h-[56px] border-b border-[var(--border-subtle)] shrink-0">
          <MagnifyingGlass weight="bold" size={24} className="text-[var(--text-secondary)] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('mission.searchPlaceholder') || 'Search Missions...'}
            className="flex-1 h-full bg-transparent border-0 px-4 focus:ring-0 focus:outline-none text-[17px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <div className="hidden sm:flex shrink-0 items-center gap-1">
            <kbd className="px-2 py-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded text-[11px] font-mono text-[var(--text-tertiary)]">ESC</kbd>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-4">
          <button 
            onClick={() => {
              router.push('/chat?new=true');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--hover)] text-start transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-fg)] shrink-0">
              <span className="text-[20px] leading-none">+</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[15px] text-[var(--text-primary)]">{t('nav.newTask') || 'New Mission'}</span>
            </div>
          </button>

          {recentGroups.length > 0 ? (
            recentGroups.map((group) => (
              <div key={group.label} className="flex flex-col space-y-1">
                <div className="px-3 py-1 text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  {group.label}
                </div>
                {group.items.map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => {
                      setCurrentConversationId(mission.id);
                      router.push('/chat');
                      onClose();
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface)] focus:bg-[var(--surface)] text-start transition-colors outline-none"
                  >
                    <div className="mt-0.5 text-[var(--accent)] shrink-0">
                      <ChatCircleDots weight="bold" size={20} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-[15px] text-[var(--text-primary)] truncate">{mission.title || 'Untitled'}</span>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-[var(--text-tertiary)]">
                        <CalendarBlank size={12} />
                        <span>{new Date(mission.updated_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center mb-3">
                <MagnifyingGlass size={24} className="text-[var(--text-tertiary)]" />
              </div>
              <p className="text-[14px] text-[var(--text-secondary)]">No missions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
