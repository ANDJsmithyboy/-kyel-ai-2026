/**
 * Ñkyel AI · CapabilitiesDrawer (Apple HIG Pro Design)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * 12 Sovereign Engines with Apple macOS Sequoia & iOS 18 Glassmorphism:
 * - Liquid crystal frosted acrylics with dynamic backdrop-filter
 * - Apple-style segmented category pills & instant filter search
 * - Refined glowing squircle iconography and pulsating status LEDs
 * - Smooth spring physics with keyboard accessibility (ESC, Enter)
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkle,
  VideoCamera,
  Microphone,
  Code,
  Browsers,
  Presentation,
  Table,
  FileText,
  TreeStructure,
  Desktop,
  AppWindow,
  X,
  ArrowUpRight,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';

interface CapabilitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCapability: (prompt: string) => void;
}

export type CapabilityCategory = 'all' | 'intelligence' | 'media' | 'engineering' | 'productivity' | 'system';

export interface NkyelCapability {
  id: string;
  title: string;
  desc: string;
  engine: string;
  icon: any;
  badge: 'Disponible' | 'Bêta' | 'Ultra-rapide' | 'Core VIE' | 'Sécurisé';
  category: CapabilityCategory;
  accentColor: string;
  prompt: string;
}

export const NKYEL_CAPABILITIES: NkyelCapability[] = [
  {
    id: 'research',
    title: 'Ñkyel Research',
    desc: 'Recherche approfondie, RAG, sources vérifiées et Grounding en direct.',
    engine: 'Tavily & Google Grounding',
    icon: Globe,
    badge: 'Disponible',
    category: 'intelligence',
    accentColor: '#38BDF8', // Sky
    prompt: 'Effectue une recherche approfondie et documentée sur :',
  },
  {
    id: 'vision',
    title: 'Ñkyel Vision',
    desc: "Analyse d'images, lecture de schémas et génération visuelle.",
    engine: 'Propulsé par Imagen & Gemini',
    icon: Sparkle,
    badge: 'Disponible',
    category: 'media',
    accentColor: '#F472B6', // Pink
    prompt: 'Génère ou analyse un visuel haute fidélité pour :',
  },
  {
    id: 'motion',
    title: 'Ñkyel Motion',
    desc: 'Génération vidéo fluide et animation de scènes.',
    engine: 'Propulsé par Veo',
    icon: VideoCamera,
    badge: 'Bêta',
    category: 'media',
    accentColor: '#FB923C', // Orange
    prompt: 'Crée un scénario et un plan de production vidéo pour :',
  },
  {
    id: 'voice',
    title: 'Ñkyel Voice',
    desc: 'Parole naturelle, transcription de notes et synthèse vocale.',
    engine: 'Propulsé par Gemini TTS',
    icon: Microphone,
    badge: 'Disponible',
    category: 'media',
    accentColor: '#A78BFA', // Violet
    prompt: 'Transcris et génère une synthèse audio claire sur :',
  },
  {
    id: 'web',
    title: 'Ñkyel Web',
    desc: 'Création, architecture et déploiement de sites web modernes.',
    engine: 'Next.js & Vercel Deploy',
    icon: Browsers,
    badge: 'Disponible',
    category: 'engineering',
    accentColor: '#3B82F6', // Blue
    prompt: 'Développe et déploie un site web moderne pour :',
  },
  {
    id: 'app',
    title: 'Ñkyel App',
    desc: "Développement d'applications logicielles complètes et API.",
    engine: 'Fullstack React & Python',
    icon: AppWindow,
    badge: 'Disponible',
    category: 'engineering',
    accentColor: '#6366F1', // Indigo
    prompt: 'Développe une application complète avec interface et backend pour :',
  },
  {
    id: 'code',
    title: 'Ñkyel Code',
    desc: 'Génération et exécution ultra-rapide de code en sandbox.',
    engine: 'Propulsé par Vercel Labs fx (Zig)',
    icon: Code,
    badge: 'Ultra-rapide',
    category: 'engineering',
    accentColor: '#10B981', // Emerald
    prompt: 'Écris et exécute un script performant pour résoudre :',
  },
  {
    id: 'slides',
    title: 'Ñkyel Slides',
    desc: 'Création de présentations et diapositives professionnelles.',
    engine: 'PowerPoint & Google Slides',
    icon: Presentation,
    badge: 'Disponible',
    category: 'productivity',
    accentColor: '#F59E0B', // Amber
    prompt: 'Crée une présentation complète de 10 diapositives sur :',
  },
  {
    id: 'data',
    title: 'Ñkyel Data',
    desc: 'Feuilles de calcul, analyse de données CSV/Excel et graphiques.',
    engine: 'Python Data & Google Sheets',
    icon: Table,
    badge: 'Disponible',
    category: 'productivity',
    accentColor: '#06B6D4', // Cyan
    prompt: 'Analyse ces données chiffrées et dresse un tableau avec graphiques pour :',
  },
  {
    id: 'documents',
    title: 'Ñkyel Documents',
    desc: 'Rapports formels, mémoires, PDF et documents administratifs.',
    engine: 'PDF & Google Docs',
    icon: FileText,
    badge: 'Disponible',
    category: 'productivity',
    accentColor: '#EC4899', // Rose
    prompt: 'Rédige un document officiel et complet au format structuré sur :',
  },
  {
    id: 'workgraph',
    title: 'Ñkyel WorkGraph',
    desc: "Structure vérifiable de chaque mission avec graphe d'états.",
    engine: 'LangGraph & React Flow',
    icon: TreeStructure,
    badge: 'Core VIE',
    category: 'system',
    accentColor: '#8B5CF6', // Purple
    prompt: 'Génère le graphe complet des étapes et des preuves pour :',
  },
  {
    id: 'desktop',
    title: 'Ñkyel Desktop',
    desc: 'Connexion contrôlée et sécurisée à votre environnement local.',
    engine: 'Agent Sandbox',
    icon: Desktop,
    badge: 'Sécurisé',
    category: 'system',
    accentColor: '#14B8A6', // Teal
    prompt: "Prépare une session d'automatisation locale pour :",
  },
];

const CATEGORIES: { id: CapabilityCategory; label: string }[] = [
  { id: 'all', label: 'Toutes (12)' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'media', label: 'Multimodal' },
  { id: 'engineering', label: 'Code & Web' },
  { id: 'productivity', label: 'Productivité' },
  { id: 'system', label: 'Systèmes' },
];

export default function CapabilitiesDrawer({
  isOpen,
  onClose,
  onSelectCapability,
}: CapabilitiesDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<CapabilityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered capabilities
  const filteredCapabilities = useMemo(() => {
    return NKYEL_CAPABILITIES.filter((cap) => {
      const matchesCategory = activeCategory === 'all' || cap.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        cap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.engine.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop (Apple Liquid Dark Blur) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-2xl"
          style={{
            WebkitBackdropFilter: 'blur(32px)',
          }}
        />

        {/* Modal Window (Apple HIG Squircle Sheet) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 32,
            mass: 0.8,
          }}
          className="relative w-full max-w-4xl max-h-[88vh] rounded-[28px] overflow-hidden flex flex-col z-10 border border-white/12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] bg-[#0C0F17]/90 backdrop-blur-3xl text-start"
          style={{
            boxShadow:
              '0 30px 70px rgba(0,0,0,0.8), 0 0 1px 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Top Apple Navigation Bar */}
          <div className="px-6 pt-5 pb-4 border-b border-white/[0.08] bg-[#121622]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Glowing Apple-style Squircle Avatar */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden shrink-0 border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.25) 100%)',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                  }}
                >
                  <Sparkle size={20} weight="fill" className="text-white drop-shadow-sm" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-semibold text-white tracking-[-0.015em]">
                      Capacités Ñkyel AI
                    </h2>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/10">
                      12 Moteurs
                    </span>
                  </div>
                  <p className="text-[12px] text-white/50 tracking-normal mt-0.5">
                    Sélectionnez un moteur souverain pour structurer votre mission
                  </p>
                </div>
              </div>

              {/* Close Button (Apple circular pill) */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.14] transition-all active:scale-90"
                aria-label="Fermer"
              >
                <X size={15} weight="bold" />
              </button>
            </div>

            {/* Apple Filter & Search Row */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              {/* Category Segmented Control */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.08] w-full sm:w-auto overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 whitespace-nowrap ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm border border-white/10 font-semibold'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Apple-style Search Bar */}
              <div className="relative flex-1 w-full">
                <MagnifyingGlass
                  size={14}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une capacité ou un moteur..."
                  className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Capabilities Grid (Apple Glassmorphism Cards) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 scrollbar-thin">
            {filteredCapabilities.map((cap) => {
              const Icon = cap.icon;

              // Apple Badge Style with pulsating dot
              const getBadgeConfig = (badge: string) => {
                switch (badge) {
                  case 'Disponible':
                    return {
                      dotColor: 'bg-emerald-400',
                      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                    };
                  case 'Bêta':
                    return {
                      dotColor: 'bg-amber-400',
                      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                    };
                  case 'Ultra-rapide':
                    return {
                      dotColor: 'bg-sky-400',
                      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
                    };
                  case 'Core VIE':
                    return {
                      dotColor: 'bg-purple-400',
                      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
                    };
                  case 'Sécurisé':
                    return {
                      dotColor: 'bg-teal-400',
                      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
                    };
                  default:
                    return {
                      dotColor: 'bg-white/60',
                      badgeBg: 'bg-white/10 text-white/80 border-white/10',
                    };
                }
              };

              const badgeConfig = getBadgeConfig(cap.badge);

              return (
                <motion.div
                  key={cap.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    onSelectCapability(cap.prompt);
                    onClose();
                  }}
                  className="group relative p-4 rounded-2xl bg-white/[0.035] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.985]"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Subtle Top-Right Ambient Glow on Hover */}
                  <div
                    className="absolute -top-12 -end-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                    style={{ background: cap.accentColor }}
                  />

                  <div className="space-y-3 relative z-10">
                    {/* Icon + Status Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform duration-200 group-hover:scale-105"
                        style={{
                          background: `${cap.accentColor}18`,
                          border: `1px solid ${cap.accentColor}35`,
                          color: cap.accentColor,
                        }}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      {/* Apple HIG Status Pill */}
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-sm ${badgeConfig.badgeBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dotColor} animate-pulse`} />
                        <span>{cap.badge}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-[14.5px] font-semibold text-white group-hover:text-white tracking-[-0.01em] transition-colors flex items-center justify-between">
                        <span>{cap.title}</span>
                        <ArrowUpRight
                          size={15}
                          className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                        />
                      </h3>
                      <p className="text-[12px] text-white/55 leading-relaxed mt-1 line-clamp-2">
                        {cap.desc}
                      </p>
                    </div>
                  </div>

                  {/* Engine Tag Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/45 group-hover:text-white/70 transition-colors">
                    <span className="font-mono tracking-tight text-[10.5px]">
                      {cap.engine}
                    </span>
                    <span className="text-[10px] font-medium text-white/40 group-hover:text-white/80 transition-colors">
                      Lancer →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Apple HIG Footer Hint */}
          <div className="px-6 py-2.5 border-t border-white/[0.08] bg-[#0A0D14]/80 flex items-center justify-between text-[11px] text-white/40">
            <span>
              Astuce : Cliquez sur une capacité pour pré-remplir le composer avec son intention dédiée.
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px]">
              ESC pour fermer
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
