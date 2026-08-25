/**
 * Ñkyel AI · CreateSkillModal
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Visual skill builder for reusable Agent abilities.
 * Visual-first inputs/outputs/permissions, mapping to agent specifications.
 */

'use client';

import React, { useState } from 'react';
import { X, Sparkle, Plus, Trash, Check, PuzzlePiece } from '@phosphor-icons/react';
import type { SkillItem } from '@/stores/connectors.store';

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (skill: Omit<SkillItem, 'id' | 'version' | 'author' | 'verified'>) => void;
}

export default function CreateSkillModal({ isOpen, onClose, onCreate }: CreateSkillModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivité');
  const [inputTag, setInputTag] = useState('');
  const [inputs, setInputs] = useState<string[]>(['Brief initial', 'Données sources']);
  const [outputTag, setOutputTag] = useState('');
  const [outputs, setOutputs] = useState<string[]>(['Rapport de synthèse', 'Livrable structuré']);

  if (!isOpen) return null;

  const handleAddInput = () => {
    if (inputTag.trim() && !inputs.includes(inputTag.trim())) {
      setInputs([...inputs, inputTag.trim()]);
      setInputTag('');
    }
  };

  const handleAddOutput = () => {
    if (outputTag.trim() && !outputs.includes(outputTag.trim())) {
      setOutputs([...outputs, outputTag.trim()]);
      setOutputTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      description: description.trim() || 'Capacité personnalisée réutilisable.',
      category,
      icon: 'PuzzlePiece',
      enabled: true,
      inputs,
      outputs,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--material-scrim)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              <PuzzlePiece size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Créer une Capacité Réutilisable (Skill)
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Configurez une compétence autonome pour votre Agent Ñkyel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Nom de la compétence
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Analyse Prédictive de Trésorerie"
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez ce que l'agent réalise lors de l'exécution de cette compétence..."
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs leading-relaxed"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Productivité">Productivité</option>
              <option value="Recherche">Recherche</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Développement">Développement</option>
              <option value="Média">Média</option>
            </select>
          </div>

          {/* Inputs */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Données requises en entrée (Inputs)
            </label>
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInput();
                  }
                }}
                placeholder="Ajouter une entrée (ex: Fichier PDF)..."
                className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-xs"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={handleAddInput}
                className="px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'var(--hover)', color: 'var(--text-primary)' }}
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {inputs.map((inp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]"
                  style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <span>{inp}</span>
                  <button
                    type="button"
                    onClick={() => setInputs(inputs.filter((_, i) => i !== idx))}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Livrables générés en sortie (Outputs)
            </label>
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={outputTag}
                onChange={(e) => setOutputTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOutput();
                  }
                }}
                placeholder="Ajouter un livrable (ex: Diaporama PPTX)..."
                className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-xs"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={handleAddOutput}
                className="px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'var(--hover)', color: 'var(--text-primary)' }}
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {outputs.map((out, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]"
                  style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}
                >
                  <span>{out}</span>
                  <button
                    type="button"
                    onClick={() => setOutputs(outputs.filter((_, i) => i !== idx))}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-end gap-2 pt-3 mt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              Enregistrer la compétence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
