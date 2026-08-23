/**
 * Nkyel AI · CapabilitiesDrawer
 * SmartANDJ AI Technologies
 * 12 Sovereign Capacities with their real engines (Gemini, Imagen, Veo, fx, E2B, etc.)
 */

'use client';

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
} from '@phosphor-icons/react';

interface CapabilitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCapability: (prompt: string) => void;
}

export const NKYEL_CAPABILITIES = [
  {
    id: 'research',
    title: 'Ñkyel Research',
    desc: 'Recherche approfondie, RAG, sources vérifiées et Grounding en direct.',
    engine: 'Tavily & Google Grounding',
    icon: Globe,
    badge: 'Disponible',
    prompt: 'Effectue une recherche approfondie et documentée sur :',
  },
  {
    id: 'vision',
    title: 'Ñkyel Vision',
    desc: 'Analyse d\'images, lecture de schémas et génération visuelle.',
    engine: 'Propulsé par Imagen & Gemini',
    icon: Sparkle,
    badge: 'Disponible',
    prompt: 'Génère ou analyse un visuel haute fidélité pour :',
  },
  {
    id: 'motion',
    title: 'Ñkyel Motion',
    desc: 'Génération vidéo fluide et animation de scènes.',
    engine: 'Propulsé par Veo',
    icon: VideoCamera,
    badge: 'Bêta',
    prompt: 'Crée un scénario et un plan de production vidéo pour :',
  },
  {
    id: 'voice',
    title: 'Ñkyel Voice',
    desc: 'Parole naturelle, transcription de notes et synthèse vocale.',
    engine: 'Propulsé par Gemini TTS',
    icon: Microphone,
    badge: 'Disponible',
    prompt: 'Transcris et génère une synthèse audio claire sur :',
  },
  {
    id: 'web',
    title: 'Ñkyel Web',
    desc: 'Création, architecture et déploiement de sites web modernes.',
    engine: 'Next.js & Vercel Deploy',
    icon: Browsers,
    badge: 'Disponible',
    prompt: 'Développe et déploie un site web moderne pour :',
  },
  {
    id: 'app',
    title: 'Ñkyel App',
    desc: 'Développement d\'applications logicielles complètes et API.',
    engine: 'Fullstack React & Python',
    icon: AppWindow,
    badge: 'Disponible',
    prompt: 'Développe une application complète avec interface et backend pour :',
  },
  {
    id: 'code',
    title: 'Ñkyel Code',
    desc: 'Génération et exécution ultra-rapide de code en sandbox.',
    engine: 'Propulsé par Vercel Labs fx (Zig)',
    icon: Code,
    badge: 'Ultra-rapide',
    prompt: 'Écris et exécute un script performant pour résoudre :',
  },
  {
    id: 'slides',
    title: 'Ñkyel Slides',
    desc: 'Création de présentations et diapositives professionnelles.',
    engine: 'PowerPoint & Google Slides',
    icon: Presentation,
    badge: 'Disponible',
    prompt: 'Crée une présentation complète de 10 diapositives sur :',
  },
  {
    id: 'data',
    title: 'Ñkyel Data',
    desc: 'Feuilles de calcul, analyse de données CSV/Excel et graphiques.',
    engine: 'Python Data & Google Sheets',
    icon: Table,
    badge: 'Disponible',
    prompt: 'Analyse ces données chiffrées et dresse un tableau avec graphiques pour :',
  },
  {
    id: 'documents',
    title: 'Ñkyel Documents',
    desc: 'Rapports formels, mémoires, PDF et documents administratifs.',
    engine: 'PDF & Google Docs',
    icon: FileText,
    badge: 'Disponible',
    prompt: 'Rédige un document officiel et complet au format structuré sur :',
  },
  {
    id: 'workgraph',
    title: 'Ñkyel WorkGraph',
    desc: 'Structure vérifiable de chaque mission avec graphe d\'états.',
    engine: 'LangGraph & React Flow',
    icon: TreeStructure,
    badge: 'Core VIE',
    prompt: 'Génère le graphe complet des étapes et des preuves pour :',
  },
  {
    id: 'desktop',
    title: 'Ñkyel Desktop',
    desc: 'Connexion contrôlée et sécurisée à votre environnement local.',
    engine: 'Agent Sandbox',
    icon: Desktop,
    badge: 'Sécurisé',
    prompt: 'Prépare une session d\'automatisation locale pour :',
  },
];

export default function CapabilitiesDrawer({
  isOpen,
  onClose,
  onSelectCapability,
}: CapabilitiesDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-[#07090F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10141F]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#D5AE57]/15 border border-[#D5AE57]/30 flex items-center justify-center text-[#D5AE57]">
                <Sparkle size={18} weight="fill" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white tracking-tight">
                  Capacités Ñkyel AI
                </h2>
                <p className="text-[12px] text-[#9199A8]">
                  12 moteurs souverains prêts pour l'action
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid of Capabilities */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 scrollbar-thin">
            {NKYEL_CAPABILITIES.map((cap) => {
              const Icon = cap.icon;

              return (
                <div
                  key={cap.id}
                  onClick={() => {
                    onSelectCapability(cap.prompt);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-[#10141F] hover:bg-[#171B27] border border-white/[0.08] hover:border-[#D5AE57]/40 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between text-left"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D5AE57] group-hover:scale-105 transition-transform">
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9199A8] group-hover:text-white">
                        {cap.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-[14px] font-bold text-white group-hover:text-[#D5AE57] transition-colors flex items-center gap-1">
                        <span>{cap.title}</span>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-[12px] text-[#9199A8] leading-relaxed mt-1 line-clamp-2">
                        {cap.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#6757E8] font-medium">
                    <span>{cap.engine}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
