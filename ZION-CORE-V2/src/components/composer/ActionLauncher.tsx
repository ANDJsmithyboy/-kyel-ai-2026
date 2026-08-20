/**
 * Ñkyel AI · Action Launcher
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Grand menu respirant, premium et structuré en 5 catégories indispensables :
 * - STUDIO (Vision, Motion, Voice, Slides, Documents)
 * - BUILD (Web, App, Code, Game Lab, Déploiement)
 * - DATA & WORKSPACE (Data, Google Drive, Docs, Sheets, Slides, Calendar, Gmail)
 * - COGNITION (Research, VIE, WorkGraph, Planification, Checkpoints)
 * - PROTOCOLES (MCP, MCP Apps, Skills, A2A, A2UI, AG-UI, AP2/UCP)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkle,
  Eye,
  VideoCamera,
  SpeakerHigh,
  Presentation,
  FileText,
  Globe,
  DeviceMobile,
  Code,
  GameController,
  CloudArrowUp,
  Database,
  GoogleLogo,
  Calendar,
  EnvelopeSimple,
  MagnifyingGlass,
  Graph,
  FloppyDisk,
  PlugsConnected,
  PuzzlePiece,
  UsersThree,
  Layout,
  Cpu,
  ShieldCheck,
  CheckCircle,
  CaretRight,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { useProtocolStore } from '@/stores/protocol.store';

export type LauncherCategory = 'STUDIO' | 'BUILD' | 'DATA' | 'COGNITION' | 'PROTOCOLES';

export interface ActionItem {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'available' | 'beta' | 'experimental' | 'requires_connection' | 'planned';
  promptTemplate: string;
  badge?: string;
  category: LauncherCategory;
}

export const ACTION_LAUNCHER_ITEMS: ActionItem[] = [
  // 1. STUDIO
  {
    id: 'nkyel-vision',
    name: 'Ñkyel Vision',
    provider: 'Imagen 3 / Multimodal',
    description: 'Génération et analyse visuelle haute fidélité avec composition spatiale',
    icon: Eye,
    status: 'available',
    promptTemplate: 'Génère une maquette d\'interface d\'application ultra-moderne pour :',
    category: 'STUDIO',
  },
  {
    id: 'nkyel-motion',
    name: 'Ñkyel Motion',
    provider: 'Veo Video Engine',
    description: 'Génération de vidéos et animations cinématiques 4K',
    icon: VideoCamera,
    status: 'beta',
    promptTemplate: 'Crée une animation cinématique fluide illustrant :',
    category: 'STUDIO',
  },
  {
    id: 'nkyel-voice',
    name: 'Ñkyel Voice',
    provider: 'Gemini TTS / Local',
    description: 'Synthèse vocale expressive et interaction audio en temps réel',
    icon: SpeakerHigh,
    status: 'available',
    promptTemplate: 'Lit et narre de manière expressive le document suivant :',
    category: 'STUDIO',
  },
  {
    id: 'nkyel-slides',
    name: 'Ñkyel Slides',
    provider: 'Google Slides API / Rendu',
    description: 'Conception de présentations exécutives prêtes pour les investisseurs',
    icon: Presentation,
    status: 'available',
    promptTemplate: 'Crée une présentation pitch deck de 10 diapositives sur :',
    category: 'STUDIO',
  },
  {
    id: 'nkyel-docs',
    name: 'Ñkyel Documents',
    provider: 'Google Docs / Markdown Engine',
    description: 'Rédaction de rapports stratégiques, notes de cadrage et synthèses',
    icon: FileText,
    status: 'available',
    promptTemplate: 'Rédige une note de synthèse exécutive structurée sur :',
    category: 'STUDIO',
  },

  // 2. BUILD
  {
    id: 'nkyel-web',
    name: 'Ñkyel Web',
    provider: 'Firebase App Hosting',
    description: 'Conception et déploiement de sites web interactifs modernes',
    icon: Globe,
    status: 'available',
    promptTemplate: 'Crée et déploie un site web complet en Next.js/React pour :',
    category: 'BUILD',
  },
  {
    id: 'nkyel-app',
    name: 'Ñkyel App',
    provider: 'React Native / Web',
    description: 'Développement d\'applications mobiles et web complètes',
    icon: DeviceMobile,
    status: 'beta',
    promptTemplate: 'Développe une application complète avec gestion d\'état pour :',
    category: 'BUILD',
  },
  {
    id: 'nkyel-code',
    name: 'Ñkyel Code',
    provider: 'Gemini Code Execution / E2B',
    description: 'Génération, exécution en sandbox isolée et tests automatisés',
    icon: Code,
    status: 'available',
    promptTemplate: 'Écris, teste et exécute un script d\'analyse de données pour :',
    category: 'BUILD',
  },
  {
    id: 'nkyel-game',
    name: 'Ñkyel Game Lab',
    provider: 'Canvas / HTML5 Engine',
    description: 'Création de jeux interactifs 2D/3D et simulations visuelles',
    icon: GameController,
    status: 'available',
    promptTemplate: 'Crée un jeu interactif complet jouable dans le navigateur :',
    category: 'BUILD',
  },
  {
    id: 'nkyel-deploy',
    name: 'Déployer un artefact',
    provider: 'Firebase / Cloudflare',
    description: 'Mise en ligne instantanée d\'un livrable produit par un agent',
    icon: CloudArrowUp,
    status: 'available',
    promptTemplate: 'Déploie le dernier artefact validé vers un environnement public sécurisé.',
    category: 'BUILD',
  },

  // 3. DATA & WORKSPACE
  {
    id: 'nkyel-data',
    name: 'Ñkyel Data',
    provider: 'Neon DB / SQLite Persistent',
    description: 'Exploration de bases de données, requêtes SQL et visualisations',
    icon: Database,
    status: 'available',
    promptTemplate: 'Analyse et génère un schéma de données complet pour :',
    category: 'DATA',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    provider: 'Google Workspace API',
    description: 'Indexation sécurisée et recherche sémantique dans vos fichiers Drive',
    icon: GoogleLogo,
    status: 'available',
    promptTemplate: 'Recherche dans mon Google Drive les documents relatifs à :',
    category: 'DATA',
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    provider: 'Google Docs API',
    description: 'Lecture, écriture et mise en forme directe dans vos documents Google',
    icon: FileText,
    status: 'available',
    promptTemplate: 'Crée un document Google Docs partagé contenant :',
    category: 'DATA',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    provider: 'Google Sheets API',
    description: 'Modélisation financière, tableaux de bord et calculs automatiques',
    icon: Database,
    status: 'available',
    promptTemplate: 'Crée une feuille de calcul Google Sheets avec formules pour :',
    category: 'DATA',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    provider: 'Google Calendar API',
    description: 'Planification intelligente d\'événements et gestion d\'agenda',
    icon: Calendar,
    status: 'available',
    promptTemplate: 'Planifie les prochaines revues de projet dans mon agenda Google.',
    category: 'DATA',
  },
  {
    id: 'google-gmail',
    name: 'Gmail',
    provider: 'Gmail API',
    description: 'Synthèse de fils d\'emails et préparation de réponses contextuelles',
    icon: EnvelopeSimple,
    status: 'available',
    promptTemplate: 'Prépare un email professionnel de suivi pour :',
    category: 'DATA',
  },

  // 4. COGNITION
  {
    id: 'nkyel-research',
    name: 'Ñkyel Research',
    provider: 'Gemini + Google Grounding',
    description: 'Recherche web approfondie, vérification des faits et citations primaires',
    icon: MagnifyingGlass,
    status: 'available',
    promptTemplate: 'Effectue une recherche approfondie avec sources primaires sur :',
    category: 'COGNITION',
  },
  {
    id: 'nkyel-vie',
    name: 'Ñkyel VIE',
    provider: 'React Flow Canvas',
    description: 'Espace visuel d\'exécution interactif et spatialisé',
    icon: Graph,
    status: 'available',
    promptTemplate: 'Lance l\'exécution en mode spatialisé dans Ñkyel VIE pour :',
    category: 'COGNITION',
  },
  {
    id: 'nkyel-workgraph',
    name: 'Ñkyel WorkGraph',
    provider: 'LangGraph / Canonical Bus',
    description: 'Structure formelle des objectifs, tâches, preuves et hypothèses',
    icon: Layout,
    status: 'available',
    promptTemplate: 'Affiche et détaille le WorkGraph complet de la mission.',
    category: 'COGNITION',
  },
  {
    id: 'nkyel-checkpoint-restore',
    name: 'Reprendre un checkpoint',
    provider: 'State Checkpoint Engine',
    description: 'Restauration instantanée d\'un état de mission vérifié',
    icon: FloppyDisk,
    status: 'available',
    promptTemplate: 'Restaure l\'exécution depuis le dernier checkpoint validé.',
    category: 'COGNITION',
  },

  // 5. PROTOCOLES
  {
    id: 'mcp-connectors',
    name: 'Connecteurs MCP',
    provider: 'Model Context Protocol',
    description: 'Outils, ressources et prompts connectés via stdio ou SSE',
    icon: PlugsConnected,
    status: 'available',
    promptTemplate: 'Connecte le serveur MCP et appelle l\'outil adapté pour :',
    category: 'PROTOCOLES',
  },
  {
    id: 'agent-skills',
    name: 'Agent Skills (SKILL.md)',
    provider: 'Antigravity Skills Registry',
    description: 'Capacités modulaires expertes chargées dynamiquement',
    icon: PuzzlePiece,
    status: 'available',
    promptTemplate: 'Charge le Skill SKILL.md spécialisé pour exécuter :',
    category: 'PROTOCOLES',
  },
  {
    id: 'a2a-collab',
    name: 'Agents A2A',
    provider: 'Agent-to-Agent Protocol',
    description: 'Collaboration et délégation multi-agents avec contrats stricts',
    icon: UsersThree,
    status: 'available',
    promptTemplate: 'Délègue cette sous-tâche via A2A à un agent spécialisé.',
    category: 'PROTOCOLES',
  },
  {
    id: 'a2ui-interfaces',
    name: 'Interfaces A2UI',
    provider: 'Agent-to-UI Declarative Spec',
    description: 'Génération déclarative d\'interfaces sécurisées sans eval()',
    icon: Layout,
    status: 'available',
    promptTemplate: 'Génère une interface interactive déclarative A2UI pour comparer :',
    category: 'PROTOCOLES',
  },
  {
    id: 'mcp-apps-sandbox',
    name: 'MCP Apps',
    provider: 'Interactive Tool Apps',
    description: 'Applications interactives retournées par les outils MCP',
    icon: Globe,
    status: 'available',
    promptTemplate: 'Exécute l\'application interactive MCP App associée.',
    category: 'PROTOCOLES',
  },
  {
    id: 'agui-observatory',
    name: 'Observatoire AG-UI',
    provider: 'Agent-GUI Realtime Bus',
    description: 'Transmission temps-réel des événements, états et approbations',
    icon: Cpu,
    status: 'available',
    promptTemplate: 'Ouvre le moniteur des événements AG-UI en direct.',
    category: 'PROTOCOLES',
  },
  {
    id: 'nkyel-pay',
    name: 'Ñkyel Pay (AP2 / UCP)',
    provider: 'Agentic Payment Protocol',
    description: 'Mandats de paiement et parcours commerciaux sous contrôle humain',
    icon: ShieldCheck,
    status: 'experimental',
    promptTemplate: 'Initie un mandat de paiement sécurisé AP2 soumis à validation.',
    badge: 'Sous validation',
    category: 'PROTOCOLES',
  },
];

interface ActionLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (prompt: string) => void;
}

export default function ActionLauncher({
  isOpen,
  onClose,
  onSelectAction,
}: ActionLauncherProps) {
  const [activeCategory, setActiveCategory] = useState<LauncherCategory>('STUDIO');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredItems = ACTION_LAUNCHER_ITEMS.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery.trim() !== '' ? matchesSearch : matchesCategory;
  });

  const categories: { id: LauncherCategory; label: string; count: number }[] = [
    { id: 'STUDIO', label: 'Studio', count: ACTION_LAUNCHER_ITEMS.filter((i) => i.category === 'STUDIO').length },
    { id: 'BUILD', label: 'Build', count: ACTION_LAUNCHER_ITEMS.filter((i) => i.category === 'BUILD').length },
    { id: 'DATA', label: 'Data & Workspace', count: ACTION_LAUNCHER_ITEMS.filter((i) => i.category === 'DATA').length },
    { id: 'COGNITION', label: 'Cognition', count: ACTION_LAUNCHER_ITEMS.filter((i) => i.category === 'COGNITION').length },
    { id: 'PROTOCOLES', label: 'Protocoles', count: ACTION_LAUNCHER_ITEMS.filter((i) => i.category === 'PROTOCOLES').length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#0E121A] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#F1EEE7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#665F9E]/20 to-[#C39A52]/20 border border-white/[0.08] flex items-center justify-center text-[#C39A52]">
              <Sparkle size={22} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#F1EEE7]">
                Action Launcher & Capacités Souveraines
              </h2>
              <p className="text-[12px] text-[#7E8795]">
                Sélectionnez une capacité pour l'intégrer instantanément à votre mission
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7E8795] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barre de Recherche & Filtres */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8795]" />
            <input
              type="text"
              placeholder="Rechercher une capacité, un outil Google, un protocole MCP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#151922] border border-white/[0.08] rounded-xl text-[13px] text-[#F1EEE7] placeholder-[#7E8795] focus:outline-none focus:border-[#665F9E]"
            />
          </div>

          {/* Onglets de catégories */}
          {searchQuery.trim() === '' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-[#665F9E] text-[#F1EEE7] shadow-sm'
                      : 'bg-[#151922] text-[#7E8795] hover:text-[#B8C0CC] hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-70 font-mono">({cat.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille des Capacités */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectAction(item.promptTemplate);
                  onClose();
                }}
                className="group relative p-4 rounded-xl border border-white/[0.06] bg-[#151922]/70 hover:bg-[#151922] hover:border-[#665F9E]/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#C39A52] group-hover:text-[#F1EEE7] group-hover:border-[#665F9E]/40 transition-colors">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#F1EEE7] group-hover:text-[#AAA2C8] transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[11px] text-[#7E8795] font-mono">
                          {item.provider}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                        item.status === 'available'
                          ? 'bg-[#6F9485]/15 text-[#6F9485] border border-[#6F9485]/30'
                          : item.status === 'beta'
                          ? 'bg-[#C39A52]/15 text-[#C39A52] border border-[#C39A52]/30'
                          : 'bg-[#765E78]/15 text-[#AAA2C8] border border-[#765E78]/30'
                      }`}
                    >
                      {item.badge || item.status}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#B8C0CC] leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#7E8795] group-hover:text-[#F1EEE7]">
                  <span className="font-mono truncate max-w-[80%]">
                    {item.promptTemplate}
                  </span>
                  <CaretRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#08090D] flex items-center justify-between text-[12px] text-[#7E8795]">
          <span>8 Protocoles connectés · Souveraineté SmartANDJ AI</span>
          <span className="font-mono">Wada Sanzo Palette · 60 FPS</span>
        </div>
      </div>
    </div>
  );
}
