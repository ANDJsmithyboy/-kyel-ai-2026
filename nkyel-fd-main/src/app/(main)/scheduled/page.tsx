/**
 * Ñkyel AI — Page Tâches Planifiées & Récurrentes
 * Route : /scheduled
 */

'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  Trash,
  CheckCircle,
  Sparkle,
  ShieldCheck,
  ToggleRight,
  ToggleLeft,
} from '@phosphor-icons/react';

interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  description: string;
  agent: string;
  nextRun: string;
  enabled: boolean;
}

const INITIAL_SCHEDULED: ScheduledTask[] = [
  {
    id: 'sched_1',
    name: 'Veille Stratégique IA & Souveraineté',
    cron: '0 8 * * * (Tous les matins à 08:00)',
    description: 'Recherche Wide Research Tavily sur les actualités de souveraineté numérique en Afrique.',
    agent: 'Researcher & Synthesizer',
    nextRun: 'Demain à 08:00',
    enabled: true,
  },
  {
    id: 'sched_2',
    name: 'Génération Quotidienne Kit Réseaux Sociaux',
    cron: '0 9 * * 1-5 (Du lundi au vendredi à 09:00)',
    description: 'Création d’un visuel FLUX et de deux posts LinkedIn/Facebook thématiques.',
    agent: 'Visual Director & Video Producer',
    nextRun: 'Lundi à 09:00',
    enabled: true,
  },
  {
    id: 'sched_3',
    name: 'Sauvegarde Périodique Neon vers Cloudflare R2',
    cron: '0 0 * * 0 (Tous les dimanches à minuit)',
    description: 'Instantané complet de la base PostgreSQL Neon archivé sur le bucket R2.',
    agent: 'System Backup Daemon',
    nextRun: 'Dimanche à 00:00',
    enabled: true,
  },
];

export default function ScheduledTasksPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(INITIAL_SCHEDULED);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  return (
    <div className="flex-1 bg-[#08090D] p-6 text-[#F1EEE7] overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
          <div>
            <h1 className="text-xl font-bold font-heading text-[#F1EEE7] flex items-center gap-2">
              <Calendar size={24} className="text-[#C39A52]" />
              Tâches Planifiées & Automatisations
            </h1>
            <p className="text-xs text-[#7E8795] mt-1">
              Exécution récurrente en arrière-plan d'agents, de veilles Wide Research et de sauvegardes de sécurité.
            </p>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-[#0E121A] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#C39A52] shrink-0 mt-0.5">
                  <Clock size={20} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xs font-semibold text-[#F1EEE7]">{task.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C39A52]/15 text-[#C39A52] font-mono">
                      {task.cron}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8C0CC] mt-1.5 leading-relaxed">{task.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-[#7E8795]">
                    <span>Agent : <span className="text-[#F1EEE7]">{task.agent}</span></span>
                    <span>•</span>
                    <span>Prochaine exécution : <span className="text-[#6F9485] font-semibold">{task.nextRun}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => toggleTask(task.id)} className="text-[#665F9E] hover:text-[#AAA2C8]">
                  {task.enabled ? (
                    <ToggleRight size={28} weight="fill" className="text-[#6F9485]" />
                  ) : (
                    <ToggleLeft size={28} className="text-[#7E8795]" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
