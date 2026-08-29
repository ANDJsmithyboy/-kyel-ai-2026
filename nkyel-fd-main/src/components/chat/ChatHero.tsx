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
  ArrowRight,
  DownloadSimple,
  MagnifyingGlass,
  ChartBar
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import { IconNkyel } from '@/components/icons';

interface ChatHeroProps {
  onSelectAction: (prompt: string) => void;
  onOpenMore?: () => void;
}

const CAROUSEL_SLIDES = [
  {
    id: 'slide_agent',
    titleFr: 'Personnalisez votre agent IA',
    titleEn: 'Personalize your AI agent',
    descFr: 'Configurez des agents sur mesure pour automatiser vos tâches complexes.',
    descEn: 'Configure custom agents to automate your complex tasks.',
    promptFr: 'Ouvre l\'éditeur de personnalisation d\'agent.',
    promptEn: 'Open the agent customization editor.',
    imageSrc: '/images/deep-resear-nk.png',
  },
  {
    id: 'slide_deck',
    titleFr: 'Générer une présentation premium',
    titleEn: 'Generate a premium presentation',
    descFr: 'Concevez des présentations exécutives prêtes pour vos comités de direction.',
    descEn: 'Design executive presentation decks ready for leadership meetings.',
    promptFr: 'Génère une présentation exécutive de 12 diapositives avec graphiques et synthèse stratégique.',
    promptEn: 'Generate a 12-slide executive presentation deck with charts and strategic synthesis.',
    imageSrc: '/images/presentation-nkyel.png',
  },
  {
    id: 'slide_web',
    titleFr: 'Connecter vos outils et données',
    titleEn: 'Connect your tools and data',
    descFr: 'Liez Ñkyel à vos bases de données, CRM et outils internes en un clic.',
    descEn: 'Link Ñkyel to your databases, CRMs, and internal tools in one click.',
    promptFr: 'Ouvre le panneau de configuration des connecteurs et protocoles.',
    promptEn: 'Open the connectors and protocols configuration panel.',
    imageSrc: '/images/site-web-nkyel.png',
  },
  {
    id: 'slide_game',
    titleFr: 'Créez votre propre jeu',
    titleEn: 'Create your own game',
    descFr: 'Développez des jeux interactifs complets avec logique de gameplay et design soigné.',
    descEn: 'Develop complete interactive games with gameplay mechanics and clean design.',
    promptFr: 'Crée un jeu complet en HTML5 Canvas / WebGL avec logique de gameplay interactive et design soigné.',
    promptEn: 'Create a full interactive HTML5 Canvas game with gameplay mechanics and clean design.',
    imageSrc: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'slide_skills',
    titleFr: 'Créer des compétences',
    titleEn: 'Create skills',
    descFr: 'Apprenez à votre agent de nouvelles compétences spécifiques à votre métier.',
    descEn: 'Teach your agent new skills specific to your profession.',
    promptFr: 'Crée une nouvelle compétence personnalisée pour mon agent.',
    promptEn: 'Create a new custom skill for my agent.',
    imageSrc: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  }
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
      label: isFr ? 'Créer un site web' : 'Build a website',
      prompt: isFr
        ? 'Développe une application web interactive complète pour : '
        : 'Build a complete interactive web application for: ',
    },
    {
      id: 'design',
      icon: Palette,
      label: isFr ? 'Conception' : 'Design',
      prompt: isFr
        ? 'Conçois une identité visuelle ou une image haute fidélité pour : '
        : 'Design a visual identity or high-fidelity image for: ',
    },
    {
      id: 'game',
      icon: GameController,
      label: isFr ? 'Créer des jeux' : 'Create games',
      prompt: isFr
        ? 'Crée un jeu complet en HTML5 Canvas avec logique : '
        : 'Create a full HTML5 Canvas game with logic: ',
    },
    {
      id: 'agent',
      icon: Sparkle,
      label: isFr ? 'Personnaliser un agent' : 'Customize an agent',
      prompt: isFr
        ? 'Aide-moi à personnaliser et configurer un nouvel agent IA pour : '
        : 'Help me customize and configure a new AI agent for: ',
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
              className="flex items-center gap-2 h-[36px] px-3.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent-muted)] text-[var(--text-primary)] text-xs sm:text-[13.5px] font-semibold transition-all duration-150 shadow-sm active:scale-[0.98] touch-manipulation whitespace-nowrap"
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
          className="flex items-center gap-1.5 h-[36px] px-3.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-[13.5px] font-semibold transition-all duration-150 shadow-sm active:scale-[0.98] touch-manipulation"
        >
          <span>{isFr ? 'Plus' : 'Plus'}</span>
        </button>
      </motion.div>

      {/* ── Image-based Suggestion Carousel ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="w-full max-w-[800px] mx-auto mt-6"
      >
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CAROUSEL_SLIDES.map((slide) => (
            <div
              key={slide.id}
              onClick={() => onSelectAction(isFr ? slide.promptFr : slide.promptEn)}
              className="snap-center shrink-0 w-[240px] sm:w-[280px] h-[220px] rounded-[20px] bg-[var(--surface-raised)] border border-[var(--border-strong)] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col"
            >
              <div className="w-full h-[120px] relative overflow-hidden bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                {/* Image background with slight overlay */}
                <img 
                  src={slide.imageSrc} 
                  alt={isFr ? slide.titleFr : slide.titleEn} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-raised)] via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-4 text-start flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight mb-1">
                    {isFr ? slide.titleFr : slide.titleEn}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {isFr ? slide.descFr : slide.descEn}
                  </p>
                </div>
                <div className="absolute bottom-3 end-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--accent)] text-[var(--text-tertiary)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                    <ArrowRight size={12} weight="bold" />
                  </div>
                </div>
              </div>
              {/* Subtle hover glow */}
              <div className="absolute inset-0 border-[1.5px] border-[var(--accent)] opacity-0 group-hover:opacity-100 rounded-[20px] transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
