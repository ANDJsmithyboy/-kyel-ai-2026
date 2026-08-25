/**
 * Ñkyel AI · Scheduled Missions Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Route: /scheduled
 * Purpose: Let Ñkyel keep working after you leave.
 * Recurring research, monitoring, reporting, and automated execution.
 */

'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  Plus,
  Play,
  Pause,
  Trash,
  PencilSimple,
  CheckCircle,
  ArrowClockwise,
  Sparkle,
  ToggleRight,
  ToggleLeft,
  X,
  Robot,
} from '@phosphor-icons/react';

interface ScheduledMission {
  id: string;
  title: string;
  cronHuman: string;
  description: string;
  agentRole: string;
  nextRun: string;
  lastRunStatus: 'success' | 'failed' | 'running' | 'idle';
  status: 'active' | 'paused' | 'completed';
}

const INITIAL_SCHEDULED: ScheduledMission[] = [
  {
    id: 'sched_1',
    title: 'Veille Stratégique Marchés & Souveraineté',
    cronHuman: 'Tous les matins à 08:00',
    description: 'Recherche Wide Research sur les évolutions macro-économiques et réglementaires CEMAC/OHADA.',
    agentRole: 'Chercheur & Synthétiseur',
    nextRun: 'Demain à 08:00',
    lastRunStatus: 'success',
    status: 'active',
  },
  {
    id: 'sched_2',
    title: 'Génération Hebdomadaire Kit Communication',
    cronHuman: 'Chaque lundi à 09:00',
    description: 'Création d’un visuel de campagne FLUX et de trois publications thématiques LinkedIn.',
    agentRole: 'Directeur Visuel',
    nextRun: 'Lundi 31 Août à 09:00',
    lastRunStatus: 'success',
    status: 'active',
  },
  {
    id: 'sched_3',
    title: 'Audit Quotidien des Opportunités d’Appels d’Offres',
    cronHuman: 'Du lundi au vendredi à 18:00',
    description: 'Extraction et filtrage des avis de marchés publics internationaux avec notation de pertinence.',
    agentRole: 'Analyste Marchés Publics',
    nextRun: 'Aujourd’hui à 18:00',
    lastRunStatus: 'success',
    status: 'active',
  },
];

export default function ScheduledPage() {
  const [missions, setMissions] = useState<ScheduledMission[]>(INITIAL_SCHEDULED);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Mission Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSchedule, setNewSchedule] = useState('daily_morning');
  const [newDescription, setNewDescription] = useState('');

  const toggleMissionStatus = (id: string) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'paused' : 'active' } : m
      )
    );
  };

  const deleteMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const scheduleMap: Record<string, string> = {
      daily_morning: 'Tous les matins à 08:00',
      weekly_monday: 'Chaque lundi à 09:00',
      daily_evening: 'Chaque soir à 19:00',
    };

    const newMission: ScheduledMission = {
      id: `sched_${Date.now()}`,
      title: newTitle.trim(),
      cronHuman: scheduleMap[newSchedule] || 'Tous les jours',
      description: newDescription.trim() || 'Mission récurrente programmée.',
      agentRole: 'Agent Ñkyel Spécialisé',
      nextRun: 'Prochaine occurrence programmée',
      lastRunStatus: 'idle',
      status: 'active',
    };

    setMissions([newMission, ...missions]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const filteredMissions = missions.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'var(--material-canvas)' }}>
      {/* ═══════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 p-6"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-raised)',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <CalendarCheck size={18} weight="bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Automatisations
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Laissez votre Agent Ñkyel exécuter des veilles, des rapports et des processus récurrents en toute autonomie.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            <Plus size={14} weight="bold" />
            <span>Nouvelle automatisation</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         FILTER TABS
         ═══════════════════════════════════════════════════ */}
      <div
        className="shrink-0 px-6 py-3"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-1">
          {[
            { id: 'all', label: 'Toutes les tâches', count: missions.length },
            { id: 'active', label: 'Actives', count: missions.filter((m) => m.status === 'active').length },
            { id: 'paused', label: 'En pause', count: missions.filter((m) => m.status === 'paused').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                color: filter === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: filter === tab.id ? 'var(--surface-raised)' : 'transparent',
                border: filter === tab.id ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full" style={{ background: 'var(--hover)', color: 'var(--text-tertiary)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         MISSION LIST / EMPTY STATE
         ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-4">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((task) => {
              const isActive = task.status === 'active';
              return (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-key)',
                  }}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isActive ? 'var(--accent-subtle)' : 'var(--surface)',
                        color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Clock size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </h3>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{
                            background: 'var(--accent-subtle)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-muted)',
                          }}
                        >
                          {task.cronHuman}
                        </span>
                      </div>

                      <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {task.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span>
                          Agent assigné : <strong style={{ color: 'var(--text-primary)' }}>{task.agentRole}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Prochaine exécution : <strong style={{ color: 'var(--success, #22c55e)' }}>{task.nextRun}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => toggleMissionStatus(task.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      style={{
                        background: isActive ? 'var(--surface)' : 'var(--accent-subtle)',
                        color: isActive ? 'var(--text-secondary)' : 'var(--accent)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {isActive ? (
                        <>
                          <Pause size={13} />
                          <span>Mettre en pause</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} weight="fill" />
                          <span>Reprendre</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMission(task.id)}
                      className="p-2 rounded-xl transition-colors hover:text-red-400"
                      style={{ color: 'var(--text-tertiary)' }}
                      title="Supprimer la mission"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* Premium Empty State */
            <div
              className="p-12 text-center rounded-3xl space-y-3"
              style={{
                background: 'var(--surface-raised)',
                border: '1px dashed var(--border-strong)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <CalendarCheck size={24} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Laissez Ñkyel continuer à travailler après votre départ
              </h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Configurez des missions de recherche, de veille concurrentielle ou de génération de rapports régulières.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                Créer une première mission récurrente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'var(--material-scrim)' }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Nouvelle Mission Programmée
              </h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ color: 'var(--text-tertiary)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Intitulé de la mission
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Veille Marché Énergétique Gabon"
                  className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Fréquence d&apos;exécution
                </label>
                <select
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="daily_morning">Tous les matins à 08:00</option>
                  <option value="weekly_monday">Chaque lundi à 09:00</option>
                  <option value="daily_evening">Chaque soir à 19:00</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Description de la mission
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Que doit accomplir l'agent à chaque exécution ?"
                  className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-semibold"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
                >
                  Activer la programmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
