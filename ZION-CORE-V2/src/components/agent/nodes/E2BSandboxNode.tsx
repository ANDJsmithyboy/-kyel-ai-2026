'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import ThoughtBlock from './ThoughtBlock';
import { motion, AnimatePresence } from 'framer-motion';

interface E2BSandboxNodeProps {
  language: string;
  code: string;
  status: 'active' | 'success' | 'error';
  stdout?: string;
  stderr?: string;
}

export default function E2BSandboxNode({ language, code, status, stdout, stderr }: E2BSandboxNodeProps) {
  return (
    <ThoughtBlock 
      title={`Sandbox Execution (${language})`} 
      icon={<Terminal size={14} />} 
      status={status}
    >
      <div className="flex flex-col gap-3 font-mono">
        {/* Affichage du code exécuté */}
        <div className="relative rounded-md overflow-hidden border border-[var(--glass-border)] bg-[#0D0D12]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-[var(--glass-border)]">
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{language}</span>
            {status === 'active' && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
            )}
          </div>
          <div className="p-3 text-xs text-[var(--text-secondary)] whitespace-pre-wrap overflow-x-auto">
            {code}
          </div>
        </div>

        {/* Affichage des logs du terminal */}
        <AnimatePresence>
          {(stdout || stderr || status === 'active') && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="relative rounded-md border border-[var(--border)] bg-[#020304] text-[11px] p-3 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {stdout && (
                  <span className="text-white/80 whitespace-pre-wrap break-all">
                    {stdout}
                  </span>
                )}
                {stderr && (
                  <span className="text-red-400 whitespace-pre-wrap break-all">
                    {stderr}
                  </span>
                )}
                {status === 'active' && !stdout && !stderr && (
                  <span className="text-[var(--text-tertiary)] animate-pulse flex items-center gap-2">
                    <Terminal size={12} /> Exécution en cours dans la sandbox isolée...
                  </span>
                )}
                {status === 'active' && (
                  <span className="w-1.5 h-3 bg-[var(--accent)] animate-pulse inline-block ml-1 align-middle" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThoughtBlock>
  );
}
