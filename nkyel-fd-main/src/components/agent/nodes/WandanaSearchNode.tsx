'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Link as LinkIcon, ExternalLink } from 'lucide-react';
import ThoughtBlock from './ThoughtBlock';

interface WandanaSearchNodeProps {
  query: string;
  status: 'active' | 'success' | 'error';
  results?: Array<{ title: string; url: string; content?: string }>;
}

const PROGRESSIVE_PHRASES = [
  "Initialisation du radar Wandana...",
  "Balayage des sources fiables...",
  "Analyse en profondeur du web...",
  "Extraction des citations pertinentes...",
  "Synthèse des résultats..."
];

export default function WandanaSearchNode({ query, status, results = [] }: WandanaSearchNodeProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Animation des phrases progressives (type Manus AI)
  useEffect(() => {
    if (status !== 'active') return;
    
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PROGRESSIVE_PHRASES.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [status]);

  return (
    <ThoughtBlock 
      title="Wandana Deep Search" 
      icon={<Globe size={14} />} 
      status={status}
    >
      <div className="flex flex-col gap-3">
        {/* Affichage de la requête */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <span className="opacity-50">Requête:</span>
          <code className="px-2 py-1 bg-black/20 rounded-md font-mono text-xs">
            {query}
          </code>
        </div>

        {/* État de chargement avec texte progressif */}
        {status === 'active' && (
          <div className="flex items-center gap-3 py-2">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-[var(--accent)]"
            >
              <Globe size={16} />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-mono text-[var(--accent)]"
              >
                {PROGRESSIVE_PHRASES[phraseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}

        {/* État de succès : Affichage des citations */}
        {status === 'success' && results.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1">
              <LinkIcon size={12} /> Sources Consultées ({results.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.map((result, idx) => (
                <a 
                  key={idx} 
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md hover:border-[var(--accent-35)] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate pr-2">
                      {result.title || result.url}
                    </span>
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity" />
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] truncate font-mono">
                    {new URL(result.url).hostname}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </ThoughtBlock>
  );
}
