'use client';

import React from 'react';
import useSWR from 'swr';
import { TerminalWindow, Play, Clock, CheckCircle, CalendarBlank, Plus } from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface Mission {
  id: string;
  workspace_id: string;
  title: string;
  objective: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  priority: string;
  autonomy_level: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProgramsPage() {
  const { isFr } = useLanguageStore();
  const { data: missions, error, isLoading } = useSWR<Mission[]>('/api/missions', fetcher);

  const getStatusConfig = (status: Mission['status']) => {
    switch (status) {
      case 'running': return { icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: isFr ? 'En cours' : 'Running' };
      case 'scheduled': return { icon: CalendarBlank, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: isFr ? 'Planifié' : 'Scheduled' };
      case 'completed': return { icon: CheckCircle, color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--surface)]', border: 'border-[var(--border)]', label: isFr ? 'Terminé' : 'Completed' };
      default: return { icon: Clock, color: 'text-[var(--text-tertiary)]', bg: 'bg-[var(--surface)]', border: 'border-[var(--border)]', label: status };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[var(--material-canvas)]">
      <div className="flex-1 overflow-y-auto w-full">
        {/* Editorial Hero Pattern */}
        <div className="relative w-full pt-16 pb-12 px-6 sm:px-12 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--surface-raised)] to-transparent">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--control-bg)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)] shadow-sm">
                <TerminalWindow size={28} weight="duotone" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
                {isFr ? 'Programmes & Missions' : 'Programs & Missions'}
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg leading-relaxed">
                {isFr 
                  ? 'Gérez vos workflows d\'intelligence autonomes. Planifiez, surveillez et orchestrez les agents en arrière-plan.' 
                  : 'Manage your autonomous intelligence workflows. Schedule, monitor, and orchestrate background agents.'}
              </p>
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity active:scale-95 shadow-sm">
              <Plus size={18} weight="bold" />
              <span>{isFr ? 'Nouveau Programme' : 'New Program'}</span>
            </button>
          </div>
        </div>

        {/* Mission Queue Grid */}
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              {isFr ? 'File d\'exécution' : 'Execution Queue'}
            </h2>
            <div className="flex gap-2 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">All</span>
              <span className="px-3 py-1 rounded-full bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer">Active</span>
            </div>
          </div>

          {isLoading && (
            <div className="py-20 text-center text-[var(--text-tertiary)]">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4" />
              <p>Chargement des missions...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Failed to load missions.
            </div>
          )}

          {missions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map(mission => {
                const conf = getStatusConfig(mission.status);
                const Icon = conf.icon;
                return (
                  <div key={mission.id} className="group relative flex flex-col p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent-muted)] transition-all shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${conf.bg} ${conf.color} ${conf.border}`}>
                        <Icon size={12} weight="bold" />
                        <span>{conf.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                        {mission.autonomy_level}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-base text-[var(--text-primary)] mb-2 leading-snug line-clamp-2">
                      {mission.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6 flex-1">
                      {mission.objective}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-tertiary)]">
                      <span>{mission.priority.toUpperCase()} PRIORITY</span>
                      <span>
                        {formatDistanceToNow(new Date(mission.created_at), { addSuffix: true, locale: isFr ? fr : enUS })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
