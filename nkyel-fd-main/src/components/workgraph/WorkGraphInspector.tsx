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

  const handleSave = async () => {
    // Read-only evidence inspector - save is mostly disabled
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

            {/* Actions (Read-only view) */}
            <button 
              onClick={() => onFocusNode?.(node.id)}
              className="p-2 rounded-xl border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              title="Centrer"
            >
              <LinkIcon size={18} />
            </button>
          </div>

        {/* Observable Evidence Fields */}
        <div className="flex flex-col gap-4">
          
          {/* Status Row */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/[0.08]">
            <div className={`w-2 h-2 rounded-full ${
              node.status === 'completed' ? 'bg-[var(--success)]' :
              node.status === 'active' ? 'bg-[var(--accent)]' :
              node.status === 'failed' ? 'bg-[var(--error)]' : 'bg-white/40'
            }`} />
            <span className="text-sm text-white/80 capitalize font-medium">{node.status}</span>
            {node.latencyMs && (
              <span className="ml-auto text-xs font-mono text-white/50">{node.latencyMs}ms</span>
            )}
            {node.provider && (
              <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/20">
                {node.provider}
              </span>
            )}
          </div>

          {/* Type-specific Evidence */}
          {(node.type === 'tool_call' || node.type === 'mcp_tool') && (
            <>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Entrée (Input)</h3>
                <pre className="p-3 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-emerald-400/90 whitespace-pre-wrap break-words">
                  {node.metadata?.tool_input ? JSON.stringify(node.metadata.tool_input, null, 2) : 'Aucune donnée d\'entrée'}
                </pre>
              </div>
              {node.status === 'completed' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Sortie (Output)</h3>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-white/80 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                    {node.metadata?.tool_output ? JSON.stringify(node.metadata.tool_output, null, 2) : 'Résultat vide'}
                  </pre>
                </div>
              )}
            </>
          )}

          {node.type === 'source' && (
            <>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">URL / Domaine</h3>
                <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08] flex flex-col gap-1">
                  <span className="text-sm font-medium text-white/90">{node.metadata?.domain as string || 'Source Externe'}</span>
                  <a href={node.sourceRef || node.metadata?.url as string || '#'} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-[var(--accent)] hover:underline truncate">
                    {node.sourceRef || node.metadata?.url as string || 'URL non disponible'}
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Extrait (Snippet)</h3>
                <p className="p-3 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-white/80 leading-relaxed italic">
                  "{node.metadata?.snippet as string || node.summary || 'Aucun extrait mémorisé'}"
                </p>
              </div>
            </>
          )}

          {(node.type === 'task' || node.type === 'goal' || node.type === 'plan') && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Description</h3>
              <p className="p-3 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-white/90 leading-relaxed">
                {node.summary || 'Aucune description'}
              </p>
            </div>
          )}

          {node.type === 'artifact' && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Livrable</h3>
              <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{node.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{node.summary}</p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
