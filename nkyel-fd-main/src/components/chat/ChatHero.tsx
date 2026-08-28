/**
 * Ñkyel AI · ChatHero (Prompt 1 Section 6 & Prompt 5 Component 19)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Visual Restraint & Editorial Hierarchy:
 * - NO giant logo
 * - NO floating panther paw
 * - Canonical Hero Title: "Turn your intention into visible work."
 * - Canonical Supporting Copy: "See the structure. Follow the flow. Verify the evidence. Stay in control."
 * - Compact capability suggestion chips (44–46px height, rounded-full, 14–18px padding, 18px icon, 14px text)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Cpu,
  Table,
  FileText,
  Image as ImageIcon,
  DotsThree,
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface ChatHeroProps {
  onSelectAction: (prompt: string) => void;
  onOpenMore?: () => void;
}

export default function ChatHero({ onSelectAction, onOpenMore }: ChatHeroProps) {
  const { t, uiLocale } = useLanguageStore();
  const isFr = !uiLocale || uiLocale.startsWith('fr');

  const chips = [
    {
      id: 'research',
      icon: Globe,
      label: isFr ? 'Recherche approfondie' : 'Deep research',
      prompt: isFr
        ? 'Effectue une recherche approfondie et documentée sur : '
        : 'Perform a comprehensive structured deep research on: ',
    },
    {
      id: 'code',
      icon: Cpu,
      label: isFr ? 'Concevoir avec du code' : 'Build with code',
      prompt: isFr
        ? 'Conçois une architecture logicielle et écris le code pour : '
        : 'Design a software architecture and implement clean code for: ',
    },
    {
      id: 'data',
      icon: Table,
      label: isFr ? 'Analyser des données' : 'Analyze data',
      prompt: isFr
        ? 'Analyse ces données chiffrées et dégage les tendances clés pour : '
        : 'Analyze these quantitative data points and identify key trends for: ',
    },
    {
      id: 'document',
      icon: FileText,
      label: isFr ? 'Créer un document' : 'Create document',
      prompt: isFr
        ? 'Rédige un document structuré et officiel sur : '
        : 'Draft a structured executive document on: ',
    },
    {
      id: 'image',
      icon: ImageIcon,
      label: isFr ? 'Générer une image' : 'Generate image',
      prompt: isFr
        ? 'Génère une image haute fidélité représentant : '
        : 'Generate a high-fidelity image depicting: ',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-12 pb-2 text-center select-none animate-in fade-in duration-300">
      {/* Canonical Hero Title (Section 25 & Component 15) */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-[42px] font-medium text-[var(--text-primary)] tracking-tight whitespace-pre-line leading-[1.08]"
        style={{ letterSpacing: '-0.025em' }}
      >
        {t('hero.title') || 'Turn your intention\ninto visible work.'}
      </motion.h1>

      {/* Supporting Copy (Section 25 & Component 15) */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="text-[13.5px] sm:text-[15px] text-[var(--text-tertiary)] mt-3 max-w-md mx-auto whitespace-pre-line leading-relaxed"
      >
        {t('hero.subtitle') || 'See the structure. Follow the flow.\nVerify the evidence. Stay in control.'}
      </motion.p>

      {/* Compact Capability Chips (Prompt 1 Section 6 & Prompt 5 Component 19) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 max-w-xl mx-auto mt-7"
      >
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectAction(chip.prompt)}
              className="flex items-center gap-2 h-[44px] px-4 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] hover:border-[var(--accent-muted)] text-[var(--text-primary)] text-[14px] font-medium transition-all duration-150 shadow-xs active:scale-[0.98] touch-manipulation whitespace-nowrap"
            >
              <Icon size={18} className="text-[var(--accent)] shrink-0" />
              <span>{chip.label}</span>
            </button>
          );
        })}

        {/* More Chip */}
        {onOpenMore && (
          <button
            type="button"
            onClick={onOpenMore}
            className="flex items-center gap-1.5 h-[44px] px-3.5 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[14px] font-medium transition-all duration-150 shadow-xs active:scale-[0.98] touch-manipulation"
          >
            <span>{isFr ? 'Plus' : 'More'}</span>
            <DotsThree size={18} weight="bold" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
