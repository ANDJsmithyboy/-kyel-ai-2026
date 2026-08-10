'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ThoughtBlockProps {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  status?: 'pending' | 'active' | 'success' | 'error';
  isCollapsed?: boolean;
}

export default function ThoughtBlock({ title, icon, children, status = 'active', isCollapsed = false }: ThoughtBlockProps) {
  
  // Couleurs dynamiques selon le statut (utilisant les variables CSS Tailwind v4 définies dans ton globals.css)
  const getStatusColor = () => {
    switch(status) {
      case 'active': return 'var(--accent)';
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      case 'pending': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const color = getStatusColor();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mb-3 flex gap-3"
    >
      {/* Ligne verticale de connexion façon "arbre de pensée" */}
      <div className="absolute left-[11px] top-7 bottom-[-20px] w-[2px] bg-[var(--border)] rounded-full z-0" />
      
      {/* Icône Status */}
      <div 
        className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm"
        style={{ color }}
      >
        {status === 'active' && (
           <motion.div 
             className="absolute inset-0 rounded-full"
             style={{ boxShadow: `0 0 8px ${color}` }}
             animate={{ opacity: [0.3, 0.8, 0.3] }}
             transition={{ duration: 2, repeat: Infinity }}
           />
        )}
        <div className="h-3 w-3">
          {icon}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden rounded-lg bg-[var(--bg-glass)] border border-[var(--glass-border)] shadow-sm backdrop-blur-md">
        <div className="px-3 py-2 flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
          {status === 'active' && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--accent-10)] text-[var(--accent)] animate-pulse">
              En cours...
            </span>
          )}
        </div>
        
        {/* Dépliage du contenu */}
        {!isCollapsed && children && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 py-2 text-sm text-[var(--text-secondary)] border-t border-[var(--border)]"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
