'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, CaretDown, ArrowRight } from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { useConnectorsStore } from '@/stores/connectors.store';

interface AgentEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentEditorSheet({ isOpen, onClose }: AgentEditorSheetProps) {
  const { isFr } = useLanguageStore();

  const [name, setName] = useState('Marketing Lead');
  const [role, setRole] = useState('agent de contenu');
  const [instructions, setInstructions] = useState('');
  const [behavior, setBehavior] = useState('Créatif');
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [model, setModel] = useState('GPT-4o');
  const [selectedConnector, setSelectedConnector] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { connectors } = useConnectorsStore();
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, instructions, behavior, memoryEnabled, model, selectedConnector }),
      });
      if (res.ok) {
        // Assume protocol store refetches via side-effect or we can just close
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[400px] h-full bg-[var(--surface)] shadow-2xl flex flex-col border-l border-[var(--border-strong)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-strong)]">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              {isFr ? 'Éditeur visuel' : 'Visual Editor'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                {isFr ? 'Créer un Agent' : 'Create an Agent'}
              </h3>
            </div>

            {/* Profile Block */}
            <div className="flex items-center gap-4">
              <button className="w-16 h-16 rounded-full border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--hover)] transition-all shrink-0">
                <Plus size={20} />
              </button>
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isFr ? 'Nom de l\'agent' : 'Agent name'}
                  className="w-full bg-transparent text-[15px] font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={isFr ? 'Rôle' : 'Role'}
                  className="w-full bg-transparent text-[13px] text-[var(--text-secondary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>{isFr ? 'en attente' : 'pending'}</span>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 pt-2">
              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Instructions (Prompt Système)' : 'Instructions (System Prompt)'}
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] focus:bg-[var(--surface-raised)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
                  placeholder={isFr ? 'Définissez le rôle et les règles...' : 'Define role and rules...'}
                />
              </div>

              {/* Comportement */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Comportement' : 'Behavior'}
                </label>
                <div className="relative">
                  <select
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] focus:bg-[var(--surface-raised)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
                  >
                    <option value="Créatif">{isFr ? 'Créatif' : 'Creative'}</option>
                    <option value="Analytique">{isFr ? 'Analytique' : 'Analytical'}</option>
                    <option value="Précis">{isFr ? 'Précis' : 'Precise'}</option>
                  </select>
                  <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                </div>
              </div>

              {/* Mémoire */}
              <div className="flex items-start justify-between gap-4 py-2">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[var(--text-primary)]">
                    {isFr ? 'Mémoire' : 'Memory'}
                  </label>
                  <p className="text-[11.5px] text-[var(--text-tertiary)] leading-snug">
                    {isFr ? 'Maintient le contexte entre les sessions pour une assistance continue.' : 'Maintains context across sessions for continuous assistance.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMemoryEnabled(!memoryEnabled)}
                  className={`relative w-10 h-6 shrink-0 rounded-full transition-colors ${
                    memoryEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                  }`}
                >
                  <span
                    className={`absolute top-1 bottom-1 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      memoryEnabled ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Connecteurs */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Connecteurs' : 'Connectors'}
                </label>
                <div className="relative">
                  <select
                    value={selectedConnector}
                    onChange={(e) => setSelectedConnector(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] focus:bg-[var(--surface-raised)] text-[13px] text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
                  >
                    <option value="" disabled>{isFr ? 'Sélectionner des connecteurs...' : 'Select connectors...'}</option>
                    {connectors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                </div>
              </div>

              {/* Modèle IA */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Modèle IA' : 'AI Model'}
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] focus:bg-[var(--surface-raised)] text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] appearance-none cursor-pointer"
                  >
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Llama 3.1">Llama 3.1</option>
                  </select>
                  <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--border-strong)] bg-[var(--surface)]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-[13.5px] font-semibold hover:brightness-110 shadow-[0_0_12px_var(--accent-muted)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSaving ? (isFr ? 'Création...' : 'Creating...') : (isFr ? 'Créer cet agent' : 'Create this agent')}</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
