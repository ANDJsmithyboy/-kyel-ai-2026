/**
 * Ñkyel AI · Paramètres (Settings Modal)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Architecture des Paramètres :
 * 1. Général (Langue, Apparence / Thème, Densité, Sons)
 * 2. Compte & Souveraineté (Profil, Identité, Sécurité)
 * 3. Personnalisation (Comportement Ñkyel, Mémoire, Contexte)
 * 4. Connecteurs (Services externes, Serveurs MCP, Intégrations)
 * 5. Agents & Compétences (Capacités, Outils, Permissions A2A)
 * 6. Données & Confidentialité (Contrôle des données, Historique, RAG)
 * 7. Développeurs & Protocoles (API, Webhooks, A2A, Clés, Diagnostic)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gear,
  UserCircle,
  SlidersHorizontal,
  PlugsConnected,
  UsersThree,
  ShieldCheck,
  Code,
  X,
  Info,
  Check,
  Moon,
  Sun,
  Globe,
  Database,
  Key,
  Cpu,
} from '@phosphor-icons/react';
import { useThemeStore, THEMES, type ThemeKey } from '@/stores/theme';
import { useLanguageStore } from '@/stores/language.store';

type SettingsTab =
  | 'general'
  | 'account'
  | 'customization'
  | 'connectors'
  | 'agents'
  | 'data'
  | 'developer';

interface AntreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'general', label: 'Général', icon: Gear },
  { id: 'account', label: 'Compte & Souveraineté', icon: UserCircle },
  { id: 'customization', label: 'Personnalisation', icon: SlidersHorizontal },
  { id: 'connectors', label: 'Connecteurs & MCP', icon: PlugsConnected },
  { id: 'agents', label: 'Agents & Compétences', icon: UsersThree },
  { id: 'data', label: 'Données & Mémoire', icon: Database },
  { id: 'developer', label: 'Développeurs & Protocoles', icon: Code },
];

export default function AntreModal({ isOpen, onClose, initialTab = 'general' }: AntreModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { uiLanguage, setUiLanguage, setModalOpen } = useLanguageStore();

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Général
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Préférences d'apparence, langue d'interface et comportement de base.
              </p>
            </div>

            {/* Thème d'interface */}
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--fg-subtle)' }}>
                Thème d'interface (6 thèmes souverains)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map((t) => {
                  const isSelected = theme === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTheme(t.key)}
                      className="p-3 rounded-lg border text-left flex flex-col justify-between transition-all"
                      style={{
                        background: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>
                          {t.name}
                        </span>
                        {isSelected && <Check size={14} weight="bold" style={{ color: 'var(--accent)' }} />}
                      </div>
                      <span className="text-[11px] line-clamp-1" style={{ color: 'var(--fg-muted)' }}>
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Langue principale */}
            <div
              className="p-4 rounded-xl border flex items-center justify-between"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <span className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                  Langue d'interface & Multilinguisme
                </span>
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  Accéder au sélecteur linguistique universel (langues africaines & internationales)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border font-medium text-xs flex items-center gap-1.5"
                style={{
                  background: 'var(--accent-subtle)',
                  borderColor: 'var(--accent-muted)',
                  color: 'var(--accent)',
                }}
              >
                <Globe size={14} />
                <span>Configurer</span>
              </button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Compte & Souveraineté
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Gestion de votre profil citoyen, identité et sécurité de session.
              </p>
            </div>

            <div
              className="p-4 rounded-xl border flex items-center gap-4"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-base"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-muted)' }}
              >
                JD
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>
                  Daniel Jonathan ANDJ
                </h4>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  Fondateur & Lead Architect · SmartANDJ AI Technologies
                </p>
                <span
                  className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  Souveraineté Gabonaise
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between text-xs py-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--fg-muted)' }}>Statut d'accès</span>
                <span className="font-semibold" style={{ color: 'var(--hue-success)' }}>Actif (Accès Illimité)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span style={{ color: 'var(--fg-muted)' }}>Chiffrement souverain</span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--fg)' }}>AES-256-GCM (Zero-Knowledge)</span>
              </div>
            </div>
          </div>
        );

      case 'customization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Personnalisation
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Ajustez le comportement de raisonnement et l'assistance contextuelle.
              </p>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                    Explication progressive
                  </span>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    Calme par défaut, inspectable en profondeur sur demande
                  </span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>Activé</span>
              </div>
            </div>
          </div>
        );

      case 'connectors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Connecteurs & MCP
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Protocoles Model Context Protocol (MCP) et intégrations de données connectées.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Google Search & Grounding', status: 'Connecté', desc: 'Recherche primaire vérifiée en direct' },
                { name: 'Google Workspace (Drive / Docs / Sheets)', status: 'Prêt', desc: 'Lecture et production de livrables' },
                { name: 'Qdrant Vector Database', status: 'Actif', desc: 'Mémoire vectorielle sémantique locale' },
                { name: 'Firebase App Hosting', status: 'Opérationnel', desc: 'Déploiement direct d’artefacts web' },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                >
                  <div>
                    <h4 className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{c.name}</h4>
                    <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>{c.desc}</p>
                  </div>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--hue-success)' }}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Agents & Compétences
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Orchestration multi-agents A2A et compétences dynamiques (SKILL.md).
              </p>
            </div>

            <div className="space-y-2">
              {[
                { name: 'DeerFlow Orchestrator', role: 'Planification, décomposition et contrôle de graphe' },
                { name: 'Agent de Recherche Wandana', role: 'Extraction, preuves et synthèses documentaires' },
                { name: 'Agent Codeur Chui', role: 'Développement, tests unitaires et vérification formelle' },
                { name: 'A2UI Visual Synthesizer', role: 'Rendu interactif des composants et artefacts' },
              ].map((a, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border flex items-start justify-between gap-3"
                  style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                >
                  <div>
                    <h4 className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{a.name}</h4>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>{a.role}</p>
                  </div>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded shrink-0"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                  >
                    Souverain
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Données & Mémoire
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Contrôle de la rétention, des checkpoints et de la mémoire souveraine.
              </p>
            </div>

            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                    Hébergement souverain
                  </span>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    Données traitées et isolées sans ré-entraînement externe
                  </span>
                </div>
                <ShieldCheck size={20} style={{ color: 'var(--hue-success)' }} />
              </div>
            </div>
          </div>
        );

      case 'developer':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--fg)' }}>
                Développeurs & Protocoles
              </h3>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Surveillance en direct des 8 protocoles et endpoints API.
              </p>
            </div>

            <div
              className="p-4 rounded-xl border space-y-2 font-mono text-xs"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex justify-between" style={{ color: 'var(--fg-muted)' }}>
                <span>Backend Core:</span>
                <span style={{ color: 'var(--hue-success)' }}>FastAPI 0.115 + LangGraph (Opérationnel)</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--fg-muted)' }}>
                <span>Event Store:</span>
                <span style={{ color: 'var(--hue-success)' }}>events.sqlite3 (Invariable)</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--fg-muted)' }}>
                <span>Frontend:</span>
                <span style={{ color: 'var(--accent)' }}>ZION-CORE-V2 · Design System V4</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl h-[620px] max-h-[90vh] rounded-2xl flex overflow-hidden shadow-2xl border flex-col md:flex-row"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--border-default)',
        }}
      >
        {/* Navigation Sidebar */}
        <div
          className="w-full md:w-64 border-r p-4 flex flex-col shrink-0"
          style={{
            background: 'var(--surface-raised)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>
              Paramètres
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg md:hidden"
              style={{ color: 'var(--fg-subtle)' }}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all"
                  style={{
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--fg)' : 'var(--fg-muted)',
                    border: isActive ? '1px solid var(--accent-muted)' : '1px solid transparent',
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? 'var(--accent)' : 'var(--fg-subtle)' }} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-mono block text-center" style={{ color: 'var(--fg-subtle)' }}>
              Ñkyel AI · Build Souverain
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-colors"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--fg-subtle)',
              }}
              aria-label="Fermer les paramètres"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-xl mx-auto">{renderContent()}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
