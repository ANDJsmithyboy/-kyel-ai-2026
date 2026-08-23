'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Maximize2, Loader2, Check, X } from 'lucide-react';

interface RenduNodeProps {
  title: string;
  type: string;
  content?: string;
  status: 'active' | 'success' | 'error';
}

export default function RenduNode({ title, type, content, status }: RenduNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg my-2 rounded-2xl overflow-hidden shadow-sm"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${status === 'active' ? 'var(--accent-20)' : 'var(--border)'}`,
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ background: status === 'active' ? 'var(--accent-06)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-20), var(--accent-06))',
              color: 'var(--accent)'
            }}
          >
            {status === 'active' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] font-heading flex items-center gap-2">
              Le Rendu 💎 
              {status === 'active' && <span className="text-[10px] text-[var(--accent)] bg-[var(--accent-10)] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Génération...</span>}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] truncate max-w-[200px]">
              {title || 'Document.md'}
            </p>
          </div>
        </div>
        
        {status === 'success' && (
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
              className="p-2 rounded-md hover:bg-[var(--accent-06)] text-[var(--text-secondary)] transition-colors"
              title="Copier"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Download size={14} />}
            </button>
            <button 
              className="p-2 rounded-md hover:bg-[var(--accent-06)] text-[var(--text-secondary)] transition-colors"
              title="Agrandir"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content Preview */}
      <AnimatePresence>
        {expanded && status === 'success' && content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border)] bg-[var(--bg)]"
          >
            <div className="p-4 max-h-[300px] overflow-y-auto">
              <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar for active state */}
      {status === 'active' && (
        <div className="w-full h-0.5 bg-[var(--border)]">
          <motion.div 
            className="h-full bg-[var(--accent)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 15, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
}
