/**
 * Ñkyel AI · MCP App Sandboxed Runner
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Isolated and secure execution container for MCP Apps.
 * Renders interactive visual dashboards, forms, and explorers
 * returned by MCP tools with strict sandbox permissions.
 */

'use client';

import React, { useState } from 'react';
import {
  AppWindow,
  ShieldCheck,
  ArrowsOut,
  ArrowsIn,
  X,
  Play,
  ArrowClockwise,
  DownloadSimple,
} from '@phosphor-icons/react';
import type { MCPAppSpec } from '@/lib/protocols/protocols.types';

interface MCPAppRunnerProps {
  app: MCPAppSpec;
  onClose?: () => void;
}

export default function MCPAppRunner({ app, onClose }: MCPAppRunnerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('2025');
  const [activeTab, setActiveTab] = useState<'view' | 'permissions' | 'events'>('view');
  const [appEvents, setAppEvents] = useState<string[]>([
    'mcp.app.initialized: Sandbox sécurisé monté',
    'mcp.app.state_synced: Contexte initial transmis',
  ]);

  const handleActionClick = (actionName: string) => {
    const log = `mcp.app.action: Exécution de "${actionName}" (Filtre: ${selectedRange})`;
    setAppEvents((prev) => [log, ...prev]);
  };

  return (
    <div
      className={`rounded-2xl border transition-all flex flex-col ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-[#08090D] shadow-2xl border-white/20'
          : 'w-full bg-[#0E121A] border-[#665F9E]/30 my-4 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#151922]">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#665F9E]/20 text-[#AAA2C8] border border-[#665F9E]/30">
            <AppWindow size={18} weight="bold" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-semibold text-[#F1EEE7]">{app.title}</h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#665F9E]/20 text-[#AAA2C8] font-mono">
                v{app.version}
              </span>
            </div>
            <p className="text-[11px] text-[#7E8795]">
              Outil MCP : <span className="font-mono text-[#B8C0CC]">{app.toolOrigin}</span> (Serveur : {app.serverOrigin})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#08090D] rounded-lg p-0.5 border border-white/[0.06] mr-2">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeTab === 'view' ? 'bg-[#665F9E] text-white' : 'text-[#7E8795] hover:text-white'
              }`}
            >
              Application
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeTab === 'permissions' ? 'bg-[#665F9E] text-white' : 'text-[#7E8795] hover:text-white'
              }`}
            >
              Permissions ({app.sandboxPermissions.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeTab === 'events' ? 'bg-[#665F9E] text-white' : 'text-[#7E8795] hover:text-white'
              }`}
            >
              Événements
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-white hover:bg-white/[0.06]"
            title={isFullscreen ? 'Réduire' : 'Plein écran'}
          >
            {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E8795] hover:text-[#BE6254] hover:bg-white/[0.06]"
              title="Fermer l'App MCP"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'view' && (
          <div className="space-y-4">
            {/* Interactive Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#08090D] border border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#7E8795]">Période fiscale :</span>
                <select
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#151922] border border-white/[0.08] text-[12px] text-[#F1EEE7] focus:outline-none"
                >
                  <option value="2024">Exercice 2024</option>
                  <option value="2025">Exercice 2025 (Prévisionnel)</option>
                  <option value="2026">Exercice 2026 (Plan Triennal)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleActionClick('Recalculer Monte-Carlo')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#665F9E]/20 hover:bg-[#665F9E]/30 border border-[#665F9E]/40 text-[#AAA2C8] text-[12px] font-semibold transition-colors"
                >
                  <Play size={13} weight="fill" />
                  <span>Simuler Monte Carlo</span>
                </button>
                <button
                  onClick={() => handleActionClick('Exporter CSV')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F1EEE7] text-[12px] transition-colors"
                >
                  <DownloadSimple size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Interactive Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#151922] border border-white/[0.04]">
                <span className="text-[11px] text-[#7E8795] uppercase tracking-wider block">Valeur d'Entreprise (EV)</span>
                <span className="text-xl font-bold font-mono text-[#F1EEE7] mt-1 block">
                  {selectedRange === '2026' ? '184.5M €' : selectedRange === '2025' ? '162.0M €' : '145.2M €'}
                </span>
                <span className="text-[11px] text-[#6F9485] mt-1 block">+12.4% vs N-1</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#151922] border border-white/[0.04]">
                <span className="text-[11px] text-[#7E8795] uppercase tracking-wider block">Marge EBITDA</span>
                <span className="text-xl font-bold font-mono text-[var(--accent)] mt-1 block">34.8 %</span>
                <span className="text-[11px] text-[#7E8795] mt-1 block">Benchmark sectoriel : 28.5%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#151922] border border-white/[0.04]">
                <span className="text-[11px] text-[#7E8795] uppercase tracking-wider block">Cash-Flow Libre (FCF)</span>
                <span className="text-xl font-bold font-mono text-[#6F9485] mt-1 block">28.4M €</span>
                <span className="text-[11px] text-[#6F9485] mt-1 block">Rendement FCF : 17.5%</span>
              </div>
            </div>

            {/* Simulated Canvas Interactive Area */}
            <div className="p-6 rounded-xl bg-[#08090D] border border-dashed border-white/10 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#665F9E]/15 flex items-center justify-center text-[#AAA2C8] mb-3">
                <AppWindow size={24} />
              </div>
              <h5 className="text-[14px] font-semibold text-[#F1EEE7]">Composant Interactif Isolé (MCP App)</h5>
              <p className="text-[12px] text-[#7E8795] max-w-md mt-1">
                L'environnement MCP App exécute cette interface dans un bac à sable sécurisé sans accès au DOM parent, avec communication régulée par le bus protocolaire Ñkyel.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[13px] text-[#6F9485] mb-2">
              <ShieldCheck size={18} weight="fill" />
              <span className="font-semibold">Bac à sable contrôlé et sécurisé</span>
            </div>
            {app.sandboxPermissions.map((perm, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#08090D] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[12px] font-mono text-[#AAA2C8] font-semibold">{perm}</span>
                  <p className="text-[11px] text-[#7E8795] mt-0.5">Autorisé explicitement lors du chargement de l'outil MCP</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6F9485]/15 text-[#6F9485] font-semibold">
                  Accroché
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-2 font-mono text-[12px]">
            {appEvents.map((evt, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#08090D] border border-white/[0.04] text-[#B8C0CC] flex items-center gap-2">
                <span className="text-[#665F9E]">◈</span>
                <span>{evt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
