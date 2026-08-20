/**
 * Nkyel AI · ChatHero
 * SmartANDJ AI Technologies
 * Center Hero matching Manus & ChatGPT UI: Title, Action Pills, Discovery Carousel with dots
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  Globe,
  Palette,
  GameController,
  DotsThree,
  Sparkle,
  Suitcase,
  Browsers,
  Code,
  Robot,
} from '@phosphor-icons/react';

interface ChatHeroProps {
  onSelectAction: (prompt: string) => void;
  onOpenMore: () => void;
}

interface CarouselCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ComponentType<any>;
  gradient: string;
  actionPrompt: string;
}

const CAROUSEL_CARDS: CarouselCard[] = [
  {
    id: 'c-1',
    title: 'Créez votre propre jeu ou application',
    subtitle: 'Créez des jeux de puzzle, de stratégie, d\'aventure et tout autre genre que vous pouvez imaginer.',
    tag: 'Ñkyel App & Code',
    icon: GameController,
    gradient: 'from-[#171B27] to-[#10141F]',
    actionPrompt: 'Crée un jeu vidéo interactif complet avec interface moderne en HTML5/Canvas.',
  },
  {
    id: 'c-2',
    title: 'Personnalisez votre agent IA pour votre entreprise',
    subtitle: 'Une identité souveraine et distincte qui évolue avec votre organisation et vos processus.',
    tag: 'Entreprise & RAG',
    icon: Suitcase,
    gradient: 'from-[#10141F] to-[#171B27]',
    actionPrompt: 'Configure un agent IA spécialisé avec la charte et les objectifs de mon entreprise.',
  },
  {
    id: 'c-3',
    title: 'Personnalisez votre Ñkyel',
    subtitle: 'Permettez à Ñkyel d\'en savoir plus sur vos projets, préférences et visions d\'avenir.',
    tag: 'Mémoire Ñkyel',
    icon: Sparkle,
    gradient: 'from-[#171B27] to-[#10141F]',
    actionPrompt: 'Aide-moi à personnaliser les instructions et la mémoire de travail de Ñkyel.',
  },
  {
    id: 'c-4',
    title: 'Ñkyel Research & Veille Stratégique',
    subtitle: 'Recherches web approfondies, analyse de marché et rapports de synthèse instantanés.',
    tag: 'Deep Search',
    icon: Browsers,
    gradient: 'from-[#10141F] to-[#171B27]',
    actionPrompt: 'Effectue une recherche approfondie sur les opportunités technologiques majeures de 2026.',
  },
];

export default function ChatHero({ onSelectAction, onOpenMore }: ChatHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate carousel every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_CARDS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const actionPills = [
    {
      id: 'slides',
      label: 'Créer des diapositives',
      icon: Presentation,
      prompt: 'Crée une présentation PowerPoint professionnelle et percutante de 10 diapositives sur :',
    },
    {
      id: 'web',
      label: 'Créer un site web',
      icon: Globe,
      prompt: 'Conçois et génère le code complet d\'un site web moderne et élégant pour :',
    },
    {
      id: 'design',
      label: 'Conception',
      icon: Palette,
      prompt: 'Propose une direction artistique et une charte graphique premium pour :',
    },
    {
      id: 'games',
      label: 'Créer des jeux',
      icon: GameController,
      prompt: 'Développe un jeu vidéo complet et interactif en JavaScript sur le thème :',
    },
  ];

  const currentCard = CAROUSEL_CARDS[activeSlide];
  const CardIcon = currentCard.icon;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 pt-10 pb-4 text-center select-none">
      {/* Central Title matching Manus screenshot */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-3xl md:text-4xl font-normal text-[#F5F6FA] tracking-tight mb-8"
        style={{
          fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
          letterSpacing: '-0.02em',
        }}
      >
        Que puis-je faire pour vous ?
      </motion.h1>

      {/* Action Pills Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-center flex-wrap gap-2.5 mb-8 w-full"
      >
        {actionPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectAction(pill.prompt)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#10141F] hover:bg-[#171B27] border border-white/[0.08] hover:border-white/[0.15] text-[#EDEAE3] hover:text-white text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <Icon size={16} className="text-[#D5AE57]" />
              <span>{pill.label}</span>
            </button>
          );
        })}

        {/* Plus Button */}
        <button
          type="button"
          onClick={onOpenMore}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#10141F] hover:bg-[#171B27] border border-white/[0.08] text-[#9199A8] hover:text-white text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Plus</span>
          <DotsThree size={16} weight="bold" />
        </button>
      </motion.div>

      {/* Discovery Interactive Carousel Card */}
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelectAction(currentCard.actionPrompt)}
            className="w-full p-4 md:p-5 rounded-2xl bg-gradient-to-br from-[#10141F] to-[#171B27] border border-white/[0.08] hover:border-[#D5AE57]/30 shadow-xl cursor-pointer text-left transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#D5AE57] bg-[#D5AE57]/10 px-2 py-0.5 rounded-full border border-[#D5AE57]/20">
                    {currentCard.tag}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-white group-hover:text-[#D5AE57] transition-colors truncate">
                  {currentCard.title}
                </h3>
                <p className="text-[12px] text-[#9199A8] leading-relaxed line-clamp-2">
                  {currentCard.subtitle}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6757E8]/20 to-[#D5AE57]/20 border border-white/10 flex items-center justify-center text-[#D5AE57] shrink-0 group-hover:scale-110 transition-transform">
                <CardIcon size={24} weight="duotone" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {CAROUSEL_CARDS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === i
                  ? 'w-6 bg-[#D5AE57] shadow-[0_0_8px_#D5AE57]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
