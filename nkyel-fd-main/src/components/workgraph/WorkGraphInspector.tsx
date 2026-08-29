'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Trash,
  Link as LinkIcon,
  Plus,
  CaretDown
} from '@phosphor-icons/react';
import type { WorkNode } from '@/lib/nkyel/work-graph.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WorkGraphInspectorProps {
  node: WorkNode | null;
  onSave: (nodeId: string, updates: Partial<WorkNode>) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onAddLink?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
}

export default function WorkGraphInspector({
  node,
  onSave,
  onDelete,
  onDuplicate,
  onAddLink,
  onFocusNode
}: WorkGraphInspectorProps) {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (node) {
      setEditedTitle(node.title || '');
      setEditedDescription(node.summary || '');
      setEditedStatus(node.status || 'planned');
    }
  }, [node]);

  if (!node) return null;

  const isDirty = 
    node.title !== editedTitle || 
    (node.summary || '') !== editedDescription || 
    (node.status || 'planned') !== editedStatus;

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      await onSave(node.id, {
        title: editedTitle,
        summary: editedDescription,
        status: editedStatus as WorkNode['status']
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
    } catch {
      return '';
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-30 bg-[#0E121A]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
      
      {/* Handle for mobile sheet (visual only) */}
      <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5 no-scrollbar flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
              {/* Type icon would go here in a real implementation, mapped similarly to the node */}
              <div className="text-xl font-bold">{node.type.charAt(0).toUpperCase()}</div>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {node.type.replace('_', ' ')}
              </h2>
              <p className="text-xs text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">ID: {node.id.split('_').pop()}</span>
                <span>•</span>
                <span>créé {getRelativeTime(node.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onDuplicate?.(node.id)}
              className="p-2 rounded-xl border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              title="Dupliquer"
            >
              <Copy size={18} />
            </button>
            <button 
              onClick={() => onDelete?.(node.id)}
              className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
              title="Supprimer"
            >
              <Trash size={18} />
            </button>
            <button 
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="ml-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-medium hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all"
            >
              {isSaving ? 'Enregistrement...' : 'enregistrer'}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          
          {/* Name Field */}
          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-[#0E121A] px-1 text-[10px] uppercase tracking-wider font-semibold text-white/50 z-10">
              Nom
            </label>
            <input 
              type="text" 
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-transparent border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Description Field */}
          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-[#0E121A] px-1 text-[10px] uppercase tracking-wider font-semibold text-white/50 z-10">
              Description
            </label>
            <textarea 
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={2}
              className="w-full bg-transparent border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[var(--accent)] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Status & Owner row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-[#0E121A] px-1 text-[10px] uppercase tracking-wider font-semibold text-white/50 z-10">
                Statut
              </label>
              <div className="relative">
                <select 
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-full bg-transparent border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-[var(--accent)] focus:outline-none transition-colors"
                >
                  <option value="planned" className="bg-[#1A1D24]">à faire</option>
                  <option value="running" className="bg-[#1A1D24]">en cours</option>
                  <option value="waiting" className="bg-[#1A1D24]">en attente</option>
                  <option value="completed" className="bg-[#1A1D24]">terminé</option>
                  <option value="failed" className="bg-[#1A1D24]">échoué</option>
                </select>
                <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={14} />
                {/* Visual Status Indicator Dot */}
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                  editedStatus === 'completed' ? 'bg-[var(--success)]' :
                  editedStatus === 'running' ? 'bg-[var(--accent)]' :
                  editedStatus === 'failed' ? 'bg-[var(--error)]' :
                  editedStatus === 'waiting' ? 'bg-[var(--warning)]' : 'bg-[var(--text-tertiary)]'
                }`} />
                {/* Adjust select padding so text doesn't overlap the dot */}
                <style jsx>{`select { padding-left: 2.25rem; }`}</style>
              </div>
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-[#0E121A] px-1 text-[10px] uppercase tracking-wider font-semibold text-white/50 z-10">
                Propriétaire
              </label>
              <div className="relative">
                <select 
                  disabled
                  className="w-full bg-transparent border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white appearance-none opacity-80"
                >
                  <option>Vous</option>
                </select>
                <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* Relations / Links */}
          <div className="relative group mt-2">
            <label className="absolute -top-2 left-3 bg-[#0E121A] px-1 text-[10px] uppercase tracking-wider font-semibold text-white/50 z-10">
              Lié à
            </label>
            <div className="w-full border border-white/[0.08] rounded-xl p-3 min-h-[60px] flex flex-wrap gap-2 items-center">
              {/* Dummy related chips for visual matching - ideally derived from real graph edges */}
              {/* This is a visual scaffold, a fully connected one would map through graph edges where node.id is source or target */}
              
              <button onClick={() => onAddLink?.(node.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors">
                <Plus size={12} />
                <span>ajouter un lien</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
