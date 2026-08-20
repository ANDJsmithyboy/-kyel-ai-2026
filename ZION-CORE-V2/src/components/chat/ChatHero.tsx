/**
 * Nkyel AI · ChatHero
 * SmartANDJ AI Technologies
 * Responsive Center Hero: Title, Action Pills, Discovery Carousel with dots
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
    subtitle: 'Jeux de stratégie, de réflexion, aventures et applications sur-mesure.',
    tag: 'Ñkyel App & Code',
    icon: GameController,
    gradient: 'from-[#171B27] to-[#10141F]',
    actionPrompt: 'Crée un jeu vidéo interactif complet avec interface moderne en HTML5/Canvas.',
  },
  {
    id: 'c-2',
    title: 'Personnalisez votre agent IA pour votre entreprise',
    subtitle: 'Une identité souveraine et distincte qui évolue avec votre organisation.',
    tag: 'Entreprise & RAG',
    icon: Suitcase,
    gradient: 'from-[#10141F] to-[#171B27]',
    actionPrompt: 'Configure un agent IA spécialisé avec la charte et les objectifs de mon entreprise.',
  },
  {
    id: 'c-3',
    title: 'Personnalisez votre Ñkyel',
    subtitle: 'Permettez à Ñkyel d\'en savoir plus sur vos projets et visions d\'avenir.',
    tag: 'Mémoire Ñkyel',
    icon: Sparkle,
    gradient: 'from-[#171B27] to-[#10141F]',
    actionPrompt: 'Aide-moi à personnaliser les instructions et la mémoire de travail de Ñkyel.',
  },
  {
    id: 'c-4',
    title: 'Ñkyel Research & Veille Stratégique',
    subtitle: 'Recherches web approfondies, analyse de marché et synthèses instantanées.',
    tag: 'Deep Search',
    icon: Browsers,
    gradient: 'from-[#10141F] to-[#171B27]',
    actionPrompt: 'Effectue une recherche approfondie sur les opportunités technologiques majeures de 2026.',
  },
];

export default function ChatHero({ onSelectAction, onOpenMore }: ChatHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_CARDS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const actionPills = [
    {
      id: 'slides',
      label: 'Diapositives',
      icon: Presentation,
      prompt: 'Crée une présentation PowerPoint professionnelle et percutante de 10 diapositives sur :',
    },
    {
      id: 'web',
      label: 'Site web',
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
      label: 'Jeux',
      icon: GameController,
      prompt: 'Développe un jeu vidéo complet et interactif en JavaScript sur le thème :',
    },
  ];

  const currentCard = CAROUSEL_CARDS[activeSlide];
  const CardIcon = currentCard.icon;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-3 pt-4 sm:pt-8 pb-2 text-center select-none">
      {/* Central Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#F5F6FA] tracking-tight mb-4 sm:mb-6"
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
        className="flex items-center justify-center flex-wrap gap-2 mb-4 sm:mb-6 w-full"
      >
        {actionPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectAction(pill.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10141F] hover:bg-[#171B27] border border-white/[0.08] hover:border-white/[0.15] text-[#EDEAE3] hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95"
            >
              <Icon size={14} className="text-[#D5AE57]" />
              <span>{pill.label}</span>
            </button>
          );
        })}

        {/* Plus Button */}
        <button
          type="button"
          onClick={onOpenMore}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#10141F] hover:bg-[#171B27] border border-white/[0.08] text-[#9199A8] hover:text-white text-xs font-medium transition-all active:scale-95"
        >
          <span>Plus</span>
          <DotsThree size={14} weight="bold" />
        </button>
      </motion.div>

      {/* Discovery Interactive Carousel Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={() => onSelectAction(currentCard.actionPrompt)}
            className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#10141F] to-[#171B27] border border-white/[0.08] hover:border-[#D5AE57]/30 shadow-lg cursor-pointer text-left transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-[#D5AE57] bg-[#D5AE57]/10 px-1.5 py-0.2 rounded-full border border-[#D5AE57]/20">
                    {currentCard.tag}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#D5AE57] transition-colors truncate">
                  {currentCard.title}
                </h3>
                <p className="text-[11px] text-[#9199A8] leading-relaxed line-clamp-2">
                  {currentCard.subtitle}
                </p>
              </div>

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#6757E8]/20 to-[#D5AE57]/20 border border-white/10 flex items-center justify-center text-[#D5AE57] shrink-0 group-hover:scale-105 transition-transform">
                <CardIcon size={20} weight="duotone" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {CAROUSEL_CARDS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1 rounded-full transition-all ${
                activeSlide === i
                  ? 'w-5 bg-[#D5AE57] shadow-[0_0_6px_#D5AE57]'
                  : 'w-1 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
