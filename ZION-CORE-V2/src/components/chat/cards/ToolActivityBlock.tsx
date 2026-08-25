/**
 * Ñkyel AI — In-Line Tool Execution Block · SmartANDJ AI Technologies
 * Bloc dépliable d'activité des outils et serveurs MCP :
 * - Nom de l'outil, statut d'exécution (running, completed, failed)
 * - Durée, paramètres d'entrée et aperçu de sortie vérifié
 * - Zéro simulation ou faux état
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CaretDown, CheckCircle, WarningCircle, CircleNotch, Lightning } from '@phosphor-icons/react';

export interface ToolActivityData {
  id: string;
  name: string;
  server?: string;
  status: 'running' | 'completed' | 'failed';
  durationMs?: number;
  parameters?: Record<string, any>;
  resultSummary?: string;
}

interface ToolActivityBlockProps {
  tool: ToolActivityData;
}

export default function ToolActivityBlock({ tool }: ToolActivityBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full my-2 rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2">
          {tool.status === 'running' ? (
            <CircleNotch size={14} className="text-[#c39a52] animate-spin" />
          ) : tool.status === 'completed' ? (
            <CheckCircle size={14} className="text-emerald-400" />
          ) : (
            <WarningCircle size={14} className="text-rose-400" />
          )}

          <span className="font-mono text-slate-200">{tool.name}</span>

          {tool.server && (
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
              MCP: {tool.server}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          {tool.durationMs !== undefined && <span>{tool.durationMs}ms</span>}
          <CaretDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3.5 pb-3 border-t border-white/5 bg-black/20 text-[11px] font-mono text-slate-400 space-y-2 pt-2.5"
          >
            {tool.parameters && (
              <div>
                <div className="text-slate-500 font-semibold mb-1">Paramètres :</div>
                <pre className="p-2 rounded bg-black/40 text-slate-300 overflow-x-auto text-[10px]">
                  {JSON.stringify(tool.parameters, null, 2)}
                </pre>
              </div>
            )}

            {tool.resultSummary && (
              <div>
                <div className="text-slate-500 font-semibold mb-1">Résultat :</div>
                <div className="p-2 rounded bg-black/40 text-slate-300 text-[11px]">
                  {tool.resultSummary}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
