/**
 * Ñkyel AI · ChatHero (Matching Screenshot 3 with 100% Pixel Precision)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Presentation,
  Browsers,
  Sparkle,
  GameController,
  DotsThree,
  FileText,
  Palette,
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface ChatHeroProps {
  onSelectAction: (prompt: string) => void;
  onOpenMore?: () => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 'slide_game',
    titleFr: 'Créez votre propre jeu',
    titleEn: 'Create your own game',
    descFr: 'Créez des jeux de puzzle, de stratégie, d’aventure et tout autre genre de jeu que vous pouvez imaginer.',
    descEn: 'Create puzzle, strategy, adventure games and any other genre you can imagine.',
    promptFr: 'Crée un jeu complet en HTML5 Canvas / WebGL avec logique de gameplay interactive et design soigné.',
    promptEn: 'Create a full interactive HTML5 Canvas game with gameplay mechanics and clean design.',
    imageSrc: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'slide_deck',
    titleFr: 'Générez des diaporamas percutants',
    titleEn: 'Generate compelling slide decks',
    descFr: 'Concevez des présentations exécutives prêtes pour vos comités de direction et investisseurs.',
    descEn: 'Design executive presentation decks ready for leadership meetings and investors.',
    promptFr: 'Génère une présentation exécutive de 12 diapositives avec graphiques et synthèse stratégique.',
    promptEn: 'Generate a 12-slide executive presentation deck with charts and strategic synthesis.',
    imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'slide_web',
    titleFr: 'Déployez un site web complet',
    titleEn: 'Deploy a full-stack website',
    descFr: 'Landing pages ultra-rapides, tableaux de bord interactifs et applications web modulaires.',
    descEn: 'Ultra-fast landing pages, interactive dashboards and modular web applications.',
    promptFr: 'Développe une landing page moderne en Next.js avec animations fluides et formulaire de contact.',
    promptEn: 'Build a modern Next.js landing page with smooth animations and contact form.',
    imageSrc: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
  },
];

export default function ChatHero({ onSelectAction, onOpenMore }: ChatHeroProps) {
  const { uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');
  const [activeSlide, setActiveSlide] = useState(0);

  const chips = [
    {
      id: 'slides',
      icon: Presentation,
      label: isFr ? 'Créer des diapositives' : 'Create slides',
      prompt: isFr
        ? 'Génère une présentation exécutive de 10 diapositives sur : '
        : 'Generate a 10-slide executive presentation deck on: ',
    },
    {
      id: 'website',
      icon: Browsers,
      label: isFr ? 'Créer un site web' : 'Create a website',
      prompt: isFr
        ? 'Développe une application web interactive complète pour : '
        : 'Build a complete interactive web application for: ',
    },
    {
      id: 'design',
      icon: Palette,
      label: isFr ? 'Conception' : 'Design',
      prompt: isFr
        ? 'Conçois une identité visuelle et une maquette d’interface pour : '
        : 'Design a visual identity and UI mockup for: ',
    },
    {
      id: 'game',
      icon: GameController,
      label: isFr ? 'Créer des jeux' : 'Create games',
      prompt: isFr
        ? 'Développe un jeu 2D jouable dans le navigateur avec des mécaniques de : '
        : 'Build a playable 2D browser game featuring mechanics of: ',
    },
  ];

  const currentSlideData = CAROUSEL_SLIDES[activeSlide];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 pt-10 sm:pt-16 pb-4 text-center select-none animate-in fade-in duration-300 space-y-6">
      
      {/* ── Main Hero Title (Screenshot 3) ── */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-[44px] font-normal font-serif text-[var(--text-primary)] tracking-tight leading-tight"
      >
        {isFr ? 'Que puis-je faire pour vous ?' : 'What can I do for you?'}
      </motion.h1>

      {/* ── Capability Chips matching Screenshot 3 ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-center flex-wrap gap-2.5 max-w-2xl mx-auto"
      >
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectAction(chip.prompt)}
              className="flex items-center gap-2 h-[42px] px-4 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent-muted)] text-[var(--text-primary)] text-xs sm:text-[13.5px] font-medium transition-all duration-150 shadow-xs active:scale-[0.98] touch-manipulation whitespace-nowrap"
            >
              <Icon size={16} className="text-[var(--accent)] shrink-0" />
              <span>{chip.label}</span>
            </button>
          );
        })}

        {/* Plus / More Pill */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMore) onOpenMore();
            else onSelectAction(isFr ? 'Explore les capacités avancées et outils connectés : ' : 'Explore advanced tools and connected capabilities: ');
          }}
          className="flex items-center gap-1.5 h-[42px] px-4 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-[13.5px] font-medium transition-all duration-150 shadow-xs active:scale-[0.98] touch-manipulation"
        >
          <span>{isFr ? 'Plus' : 'Plus'}</span>
        </button>
      </motion.div>

      {/* ── Feature Banner Card with Carousel (Screenshot 3) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        onClick={() => onSelectAction(isFr ? currentSlideData.promptFr : currentSlideData.promptEn)}
        className="w-full max-w-xl mx-auto p-4 sm:p-5 rounded-3xl bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border-strong)] transition-all cursor-pointer group shadow-sm text-start relative overflow-hidden active:scale-[0.99] touch-manipulation"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0 pe-2">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {isFr ? currentSlideData.titleFr : currentSlideData.titleEn}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              {isFr ? currentSlideData.descFr : currentSlideData.descEn}
            </p>
          </div>

          <div className="w-28 h-20 shrink-0 rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--control-bg)] relative">
            <img
              src={currentSlideData.imageSrc}
              alt="Feature thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-3">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx
                  ? 'w-4 bg-[var(--text-primary)]'
                  : 'w-1.5 bg-[var(--border-strong)] hover:bg-[var(--text-tertiary)]'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
