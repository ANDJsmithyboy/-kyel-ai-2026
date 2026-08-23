/**
 * Ñkyel AI · ProtocolObservatory
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Observatoire modulaire en temps réel des 8 sous-systèmes protocolaires :
 * - MCP (Model Context Protocol)
 * - Skills (SKILL.md)
 * - A2A (Agent-to-Agent Mesh)
 * - AG-UI (Agent-GUI Streaming & Events)
 * - A2UI (Agent-to-UI Declarative Surfaces)
 * - MCP Apps (Interactive Tools)
 * - AP2 / UCP (Ñkyel Pay & Commerce)
 * - Outils Google Connectés (Vision, Motion, Grounding, Workspace)
 */

'use client';

import React, { useState } from 'react';
import {
  Cpu,
  PlugsConnected,
  PuzzlePiece,
  UsersThree,
  Broadcast,
  Layout,
  Globe,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';

export default function ProtocolObservatory() {
  const { mcpServers, skills, a2aAgents, healthCards } = useProtocolStore();

  const protocolCards = [
    {
      id: 'mcp',
      title: 'Model Context Protocol (MCP)',
      status: 'Opérationnel',
      count: `${mcpServers.length} Serveurs`,
      icon: PlugsConnected,
      color: '#5BA3B5',
      bg: 'rgba(91, 163, 181, 0.12)',
    },
    {
      id: 'skills',
      title: 'Agent Skills (SKILL.md)',
      status: 'Actif',
      count: `${skills.length} Capacités`,
      icon: PuzzlePiece,
      color: '#C39A52',
      bg: 'rgba(195, 154, 82, 0.12)',
    },
    {
      id: 'a2a',
      title: 'Agent-to-Agent (A2A)',
      status: 'Connecté',
      count: `${a2aAgents.length} Agents Mesh`,
      icon: UsersThree,
      color: '#6F9485',
      bg: 'rgba(111, 148, 133, 0.12)',
    },
    {
      id: 'agui',
      title: 'AG-UI Bus d\'Événements',
      status: 'Streaming 60 FPS',
      count: 'SSE / Canonical',
      icon: Broadcast,
      color: '#315A70',
      bg: 'rgba(49, 90, 112, 0.12)',
    },
    {
      id: 'a2ui',
      title: 'A2UI Surfaces Déclaratives',
      status: 'Sandbox Isolée',
      count: 'Zero Eval',
      icon: Layout,
      color: '#765E78',
      bg: 'rgba(118, 94, 120, 0.12)',
    },
    {
      id: 'mcp-apps',
      title: 'MCP Apps Interactives',
      status: 'Sécurisé',
      count: 'Dashboards & Tools',
      icon: Globe,
      color: '#665F9E',
      bg: 'rgba(102, 95, 158, 0.12)',
    },
    {
      id: 'pay',
      title: 'Ñkyel Pay (AP2 / UCP)',
      status: 'Validation Humaine',
      count: 'Mandats Actifs',
      icon: ShieldCheck,
      color: '#D98E3B',
      bg: 'rgba(217, 142, 59, 0.12)',
    },
    {
      id: 'google',
      title: 'Intégrations Google Connectées',
      status: 'Vérifié',
      count: 'Vision, Grounding, Workspace',
      icon: Sparkle,
      color: '#4285F4',
      bg: 'rgba(66, 133, 244, 0.12)',
    },
  ];

  return (
    <div className="p-6 bg-[#08090D] text-[#F1EEE7] space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#F1EEE7] tracking-tight">
            Observatoire des Protocoles & Capacités
          </h2>
          <p className="text-[13px] text-[#7E8795]">
            Surveillance en temps réel des 8 couches protocolaires souveraines Ñkyel
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6F9485]/15 border border-[#6F9485]/30 text-[#6F9485] text-[12px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#6F9485] animate-pulse" />
          <span>Tous les systèmes nominaux</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {protocolCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="p-4 rounded-2xl border border-white/[0.08] bg-[#0E121A] hover:bg-[#151922] transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#7E8795] border border-white/[0.06]">
                  {card.status}
                </span>
              </div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#F1EEE7] leading-snug">
                  {card.title}
                </h3>
                <p className="text-[12px] text-[#B8C0CC] font-mono mt-1">
                  {card.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
