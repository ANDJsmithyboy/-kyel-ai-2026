"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Folder, 
  FileCode, 
  FileText, 
  Terminal as TerminalIcon, 
  Server,
  PlayCircle,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data to illustrate the Agent's Sandbox Workspace
const mockFileSystem = [
  { name: 'src', type: 'folder', children: [
    { name: 'main.py', type: 'file', lang: 'python' },
    { name: 'utils.py', type: 'file', lang: 'python' }
  ]},
  { name: 'data', type: 'folder', children: [
    { name: 'gabonese_corpus.csv', type: 'file', lang: 'data' },
    { name: 'extracted_vision.json', type: 'file', lang: 'json' }
  ]},
  { name: 'requirements.txt', type: 'file', lang: 'text' },
  { name: 'sandbox_env.log', type: 'file', lang: 'log' }
];

export default function SandboxViewer({
  provider = 'E2B Cloud Firecracker',
  status = 'running',
  terminalOutput = [
    "gabo-agent@sandbox:~$ source .venv/bin/activate",
    "(venv) gabo-agent@sandbox:~$ python src/main.py",
    "[INFO] Loading Qdrant vector database...",
    "[INFO] Initializing browser-use for Vision tasks...",
    "     > Processing page screenshot...",
    "     > Extracted 14 nodes."
  ]
}) {
  const [activeTab, setActiveTab] = useState<'files' | 'terminal'>('terminal');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-4 mb-4 rounded-xl overflow-hidden glass-elevated border border-[var(--glass-border)]"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface)]/60 border-b border-[var(--border)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-primary font-mono tracking-wide">
            WORKSPACE SANDBOX
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
            {provider}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'running' && (
            <span className="flex items-center gap-1 text-[10px] text-[#00D4AA] font-medium px-2 py-0.5 rounded-full bg-[#00D4AA]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
              Actif
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-[var(--surface)]/30 border-b border-[var(--border)] px-2">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'terminal' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'files' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-primary'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          Fichiers persistants
        </button>
      </div>

      {/* ── Content ── */}
      <div className="h-48 bg-[#020304]/80 overflow-y-auto custom-scrollbar">
        {activeTab === 'terminal' ? (
          <div className="p-3 font-mono text-[11px] leading-relaxed text-[#A0A0A0] space-y-1">
            {terminalOutput.map((line, idx) => (
              <div key={idx} className={`${line.includes('[INFO]') ? 'text-info' : ''}`}>
                {line}
              </div>
            ))}
            {status === 'running' && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[#00D4AA]">gabo-agent@sandbox:~$</span>
                <span className="w-1.5 h-3 bg-accent animate-pulse" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 text-[12px]">
            {mockFileSystem.map((item, idx) => (
              <FileTreeNode key={idx} item={item} depth={0} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper component for the File Tree
function FileTreeNode({ item, depth }: { item: any; depth: number }) {
  const isFolder = item.type === 'folder';
  return (
    <div className="flex flex-col">
      <div 
        className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 cursor-pointer text-[var(--text-secondary)] hover:text-primary transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <Folder className="w-3.5 h-3.5 text-accent" />
        ) : item.lang === 'python' ? (
          <FileCode className="w-3.5 h-3.5 text-[#5B8DEF]" />
        ) : item.lang === 'data' ? (
          <Database className="w-3.5 h-3.5 text-[#1F9D6B]" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        <span>{item.name}</span>
      </div>
      {isFolder && item.children && (
        <div className="flex flex-col">
          {item.children.map((child: any, idx: number) => (
            <FileTreeNode key={idx} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
