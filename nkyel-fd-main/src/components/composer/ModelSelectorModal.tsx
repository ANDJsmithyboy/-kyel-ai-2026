/**
 * Ñkyel AI · ModelSelectorModal (Universal Command Palette for 500+ Models)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Professional, high-density Model Command Palette with:
 * - Real-time filtering & keyboard navigation
 * - Category tabs (Tous, Recommandés, Raisonnement, Vision, Audio, Image, Vidéo, Coding, Open Source, Local, Entreprise)
 * - Provider recognition (Ñkyel, Google, Anthropic, OpenAI, Meta, Mistral, DeepSeek, Qwen, xAI, Ollama)
 * - Capability badges, Context window size, and Truthful Availability state
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Sparkle,
  Cpu,
  Brain,
  Eye,
  SpeakerHigh,
  Image as ImageIcon,
  VideoCamera,
  Code,
  Globe,
  HardDrives,
  Buildings,
  Check,
  Star,
  CaretRight,
  Lightning,
  ShieldCheck,
  X,
  Lock,
} from '@phosphor-icons/react';
import {
  CANONICAL_MODEL_REGISTRY,
  type ModelMetadata,
  type ModelCategoryFilter,
  type ModelProvider,
} from '@/lib/modelRegistry';
import { useLanguageStore } from '@/stores/language.store';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelId: string;
  onSelectModel: (model: ModelMetadata) => void;
}

const CATEGORY_TABS: { id: ModelCategoryFilter; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'all', label: 'Tous', icon: Cpu },
  { id: 'recommended', label: 'Recommandés', icon: Sparkle },
  { id: 'reasoning', label: 'Raisonnement', icon: Brain },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Vidéo', icon: VideoCamera },
  { id: 'audio', label: 'Audio', icon: SpeakerHigh },
  { id: 'opensource', label: 'Open Source', icon: Globe },
  { id: 'local', label: 'Local', icon: HardDrives },
  { id: 'enterprise', label: 'Entreprise', icon: Buildings },
];

export default function ModelSelectorModal({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
}: ModelSelectorModalProps) {
  const { t } = useLanguageStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ModelCategoryFilter>('all');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Filtered models
  const filteredModels = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CANONICAL_MODEL_REGISTRY.filter((m) => {
      const matchCat =
        activeCategory === 'all' ||
        m.category.includes(activeCategory) ||
        (activeCategory === 'recommended' && m.isRecommended);

      if (!matchCat) return false;
      if (!q) return true;

      return (
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.contextWindow.toLowerCase().includes(q) ||
        m.capabilities.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [search, activeCategory]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredModels.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModels[focusedIndex]) {
        onSelectModel(filteredModels[focusedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-palette-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
          style={{
            background: 'var(--surface-raised, #10131A)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
            <MagnifyingGlass size={20} className="text-[var(--text-tertiary)] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder="Rechercher parmi plus de 500 modèles, providers et capacités…"
              className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
              id="model-palette-title"
            />
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--surface)] border border-[var(--border-subtle)] rounded">
                ESC
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-none bg-[var(--surface-sunken, #0A0D13)]">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setFocusedIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={14} weight={active ? 'fill' : 'regular'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Models List */}
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--border-subtle)]/40 scrollbar-thin">
            {filteredModels.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-tertiary)]">
                <Cpu size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun modèle correspondant à « {search} »</p>
                <p className="text-xs mt-1 text-[var(--text-tertiary)]/70">
                  Essayez un autre terme de recherche ou changez de catégorie.
                </p>
              </div>
            ) : (
              filteredModels.map((model, idx) => {
                const isSelected = selectedModelId === model.id;
                const isFocused = focusedIndex === idx;

                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model);
                      onClose();
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`group flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isFocused
                        ? 'bg-[var(--hover)] text-[var(--text-primary)]'
                        : isSelected
                        ? 'bg-[var(--surface)]'
                        : 'hover:bg-[var(--hover)]/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Provider Badge / Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-transform ${
                          model.isSovereign
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-muted)]'
                            : 'bg-[var(--surface-sunken)] border border-[var(--border)] text-[var(--text-primary)]'
                        }`}
                      >
                        {model.provider === 'Google' && 'G'}
                        {model.provider === 'Anthropic' && 'A'}
                        {model.provider === 'OpenAI' && 'O'}
                        {model.provider === 'Meta' && 'M'}
                        {model.provider === 'Mistral AI' && 'M'}
                        {model.provider === 'DeepSeek' && 'D'}
                        {model.provider === 'Qwen / Alibaba' && 'Q'}
                        {model.provider === 'xAI' && 'X'}
                        {model.provider === 'Local / Ollama' && 'L'}
                        {model.isSovereign && 'Ñ'}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[14px] text-[var(--text-primary)] truncate">
                            {model.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                            {model.provider}
                          </span>
                          {model.isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-[var(--accent-subtle)] text-[var(--accent)]">
                              ★ Recommandé
                            </span>
                          )}
                          {model.tier === 'Deep Reasoning' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              🧠 Raisonnement
                            </span>
                          )}
                          {model.tier === 'Ultra-Fast' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ⚡ Ultra-Rapide
                            </span>
                          )}
                        </div>

                        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                          {model.tagline}
                        </p>

                        {/* Capabilities Row */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-[var(--text-tertiary)]">
                          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                            {model.contextWindow}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {model.capabilities.map((cap) => (
                              <span
                                key={cap}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--surface)] text-[var(--text-tertiary)] uppercase font-mono tracking-wider"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right status & check */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center">
                          <Check size={14} weight="bold" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-transparent group-hover:border-[var(--border)] flex items-center justify-center text-[var(--text-tertiary)]">
                          <CaretRight size={14} />
                        </div>
                      )}

                      {model.availability === 'CONFIGURATION_REQUIRED' && (
                        <span className="text-[10px] text-amber-400/90 font-mono mt-2">
                          Clé requise
                        </span>
                      )}
                      {model.availability === 'LOCAL' && (
                        <span className="text-[10px] text-emerald-400 font-mono mt-2">
                          GPU Local
                        </span>
                      )}
                      {model.availability === 'ENTERPRISE' && (
                        <span className="text-[10px] text-sky-400 font-mono mt-2">
                          Entreprise
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-sunken, #0A0D13)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>
              {filteredModels.length} modèles disponibles · Routage souverain Gabon 🇬🇦
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] font-mono">↑</kbd>
                <kbd className="px-1 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] font-mono">↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] font-mono">↵</kbd>
                sélectionner
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
