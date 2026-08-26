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

import React, { useEffect, useRef, useState } from 'react';
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
import { useFocusTrap } from '@/hooks/useFocusTrap';

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

type LauncherSubmenu = 'sources' | 'skills' | 'tasks' | 'library' | null;

const SKILL_ITEMS = [
  { name: 'Ñkyel Financial', description: 'Recherche et analyse financière professionnelle', icon: Graph },
  { name: 'Ñkyel Spreadsheet', description: 'Création de tableaux et modèles vérifiables', icon: Database },
  { name: 'Ñkyel Documents', description: 'Rédaction et mise en forme de documents', icon: FileText },
  { name: 'Ñkyel Motion', description: 'Production vidéo et animation', icon: VideoCamera },
  { name: 'Ñkyel VIE', description: 'Structure visuelle de la mission', icon: Layout },
];

const RECENT_TASKS = [
  'Présenter la nouvelle version à juger',
  'Créer un PowerPoint professionnel',
  'Analyser les discours des trois dernières années',
  'Retirer et ajouter des contacts dans le carnet',
  'Décrire le logo et les couleurs de SmartANDJ',
  'CV axé sur les SIG',
];

const LIBRARY_ITEMS = [
  'Spécification frontend Ñkyel',
  'Third-party notices',
  'Captures sidebar ouverte',
  'Vérification du mode desktop',
  'Résultats du test GitHub',
  'Analyse de documents',
];

export default function ActionLauncher({
  isOpen,
  onClose,
  onSelectAction,
}: ActionLauncherProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<LauncherSubmenu>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
      setSearchQuery('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectPrompt = (prompt: string) => {
    onSelectAction(prompt);
    onClose();
  };

  const sourceItems = [
    { label: 'Google Drive', detail: 'Rechercher dans vos fichiers', icon: GoogleLogo, prompt: 'Recherche dans mon Google Drive les documents relatifs à :' },
    { label: 'Fichiers locaux', detail: 'Ajouter depuis cet appareil', icon: CloudArrowUp, prompt: 'Analyse les fichiers que je viens d’ajouter :' },
    { label: 'Ñkyel Sources', detail: 'Connecteurs et sources actives', icon: PlugsConnected, prompt: 'Utilise les sources connectées de Ñkyel pour :' },
  ];

  const mainItems = [
    { id: 'sources' as const, label: 'Autres sources', detail: 'Google Drive, fichiers et connecteurs', icon: Layout, submenu: true },
    { id: 'drive' as const, label: 'Ajouter depuis Google Drive', detail: 'Rechercher un document dans Drive', icon: GoogleLogo, submenu: false },
    { id: 'plan' as const, label: 'Plan', detail: 'Structurer les étapes de la mission', icon: FloppyDisk, submenu: false },
    { id: 'skills' as const, label: 'Utiliser des compétences', detail: 'Ouvrir les capacités Ñkyel', icon: PuzzlePiece, submenu: true },
    { id: 'tasks' as const, label: 'Ajouter des tâches récentes', detail: 'Reprendre un travail récent', icon: CheckCircle, submenu: true },
    { id: 'library' as const, label: 'Ajouter depuis la bibliothèque', detail: 'Réutiliser un document ou un artifact', icon: FileText, submenu: true },
    { id: 'local' as const, label: 'Ajouter depuis les fichiers locaux', detail: 'Importer depuis votre ordinateur', icon: CloudArrowUp, submenu: false },
  ];

  const renderSubmenu = () => {
    if (!activeSubmenu) return null;
    const title = activeSubmenu === 'sources' ? 'Autres sources' : activeSubmenu === 'skills' ? 'Utiliser des compétences' : activeSubmenu === 'tasks' ? 'Ajouter des tâches récentes' : 'Ajouter depuis la bibliothèque';
    const items = activeSubmenu === 'sources' ? sourceItems : activeSubmenu === 'skills' ? SKILL_ITEMS.map((item) => ({ ...item, label: item.name, detail: item.description, prompt: `Utilise la compétence ${item.name} pour :` })) : activeSubmenu === 'tasks' ? RECENT_TASKS.map((label) => ({ label, detail: 'Tâche récente Ñkyel', icon: CheckCircle, prompt: label })) : LIBRARY_ITEMS.map((label) => ({ label, detail: 'Artifact de la bibliothèque Ñkyel', icon: FileText, prompt: `Utilise le document « ${label} » pour :` }));
    const filtered = items.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="nkyel-action-launcher-submenu absolute left-[calc(100%+12px)] z-50 h-[430px] w-[336px] flex-col overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#242424] shadow-[0_18px_48px_rgba(0,0,0,0.48)]">
        <div className="flex h-[58px] shrink-0 items-center border-b border-white/[0.07] px-4">
          <div className="min-w-0"><h3 className="truncate text-[15px] font-semibold text-[#F1F1F1]">{title}</h3><p className="mt-0.5 text-[11px] text-[#858585]">Sélectionner une ressource Ñkyel</p></div>
          <button type="button" onClick={() => setActiveSubmenu(null)} aria-label="Fermer le sous-menu" className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-white/[0.06] hover:text-white"><X size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 scrollbar-hidden">
          {filtered.map((item) => { const Icon = item.icon; return <button key={item.label} type="button" onClick={() => selectPrompt(item.prompt)} className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.055]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.035] text-[#C8C8C8]"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-[#E1E1E1]">{item.label}</span><span className="mt-0.5 block truncate text-[11px] text-[#777777]">{item.detail}</span></span><CaretRight size={15} className="text-[#777777] transition-transform group-hover:translate-x-0.5" /></button>; })}
          {filtered.length === 0 && <div className="px-4 py-8 text-center text-[12px] text-[#777777]">Aucun élément trouvé</div>}
        </div>
        <div className="flex h-[54px] shrink-0 items-center border-t border-white/[0.07] px-4"><MagnifyingGlass size={16} className="mr-2 text-[#777777]" /><input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Rechercher ${activeSubmenu === 'skills' ? 'des compétences' : activeSubmenu === 'tasks' ? 'des tâches' : 'dans la bibliothèque'}...`} className="min-w-0 flex-1 bg-transparent text-[13px] text-[#E5E5E5] outline-none placeholder:text-[#6F6F6F]" /></div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/[0.08]" role="presentation" onClick={onClose} />
      <div className="nkyel-action-launcher-anchor absolute bottom-[calc(100%+10px)] left-0 z-50" onClick={(event) => event.stopPropagation()}>
        <div ref={dialogRef} className="relative flex h-[388px] w-[328px] flex-col overflow-visible rounded-[14px] border border-white/[0.12] bg-[#242424] text-[#F1F1F1] shadow-[0_18px_48px_rgba(0,0,0,0.48)]" role="dialog" aria-modal="true" aria-label="Ajouter à la mission" onClick={(event) => event.stopPropagation()}>
          <div className="flex h-[48px] shrink-0 items-center border-b border-white/[0.07] px-4"><span className="text-[13px] font-semibold text-[#E8E8E8]">Ajouter à la mission</span><button type="button" onPointerDown={onClose} onClick={onClose} aria-label="Fermer le menu" className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[#858585] hover:bg-white/[0.06] hover:text-white"><X size={16} /></button></div>
          <div className="flex-1 overflow-y-auto py-1.5 scrollbar-hidden">
            {mainItems.map((item, index) => { const Icon = item.icon; const isOpenSubmenu = item.submenu && activeSubmenu === item.id; return <React.Fragment key={item.id}><button type="button" onMouseEnter={() => item.submenu && setActiveSubmenu(item.id as LauncherSubmenu)} onClick={() => item.submenu ? setActiveSubmenu(item.id as LauncherSubmenu) : selectPrompt(item.id === 'drive' ? 'Recherche dans mon Google Drive les documents relatifs à :' : item.id === 'plan' ? 'Construis un plan d’exécution vérifiable pour :' : item.id === 'local' ? 'Analyse les fichiers locaux ajoutés pour :' : '')} className={`group flex h-[52px] w-full items-center gap-3 px-4 text-left transition-colors ${isOpenSubmenu ? 'bg-white/[0.075]' : 'hover:bg-white/[0.055]'}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#C5C5C5]"><Icon size={18} weight="regular" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-[#E2E2E2]">{item.label}</span><span className="block truncate text-[10.5px] text-[#777777]">{item.detail}</span></span>{item.submenu && <CaretRight size={16} className="shrink-0 text-[#858585]" />}</button>{index === 1 || index === 2 ? <div className="mx-4 my-1 border-t border-white/[0.07]" /> : null}</React.Fragment>; })}
          </div>
          <div className="flex h-[52px] shrink-0 items-center gap-2 border-t border-white/[0.07] px-4"><MagnifyingGlass size={17} className="text-[#777777]" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher des capacités..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#E5E5E5] outline-none placeholder:text-[#777777]" /></div>
          {renderSubmenu()}
        </div>
      </div>
    </>
  );
}
