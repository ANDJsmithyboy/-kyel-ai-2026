/**
 * Ñkyel AI · Agent Studio
 * SmartANDJ AI Technologies
 * 
 * Premium UI for personalizing the sovereign agent.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Robot, SlidersHorizontal, Brain, Plug, LockKey, Desktop,
  PaintBrush, ShieldCheck, Database, Waveform, ChatCircleText 
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';
import Image from 'next/image';

type Tab = 'personnalisation' | 'competences' | 'acces' | 'avance';

export default function NkyelAgentView() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<Tab>('personnalisation');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'personnalisation', label: 'Personnalisation', icon: SlidersHorizontal },
    { id: 'competences', label: 'Compétences', icon: Brain },
    { id: 'acces', label: 'Accès', icon: LockKey },
    { id: 'avance', label: 'Avancé', icon: Desktop },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 pb-24">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Agent Studio
          </h1>
          <p className="text-[var(--text-secondary)]">
            Configurez et personnalisez l'identité, les outils et les capacités de votre agent souverain Ñkyel.
          </p>
        </div>

        {/* Hero Card (VIE Identity) */}
        <div className="relative w-full h-[200px] sm:h-[240px] rounded-3xl overflow-hidden mb-10 shadow-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
          <div className="absolute inset-0">
            {/* Fallback pattern in case image is missing */}
            <div className="w-full h-full opacity-30" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #000 100%)' }} />
          </div>
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Robot size={32} weight="duotone" className="text-white" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Identité VIE (Panthère)</h2>
            </div>
            <p className="text-gray-300 max-w-lg text-sm leading-relaxed">
              Votre agent est propulsé par l'intelligence souveraine VIE. Il s'adapte à vos données de manière sécurisée et privée.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-[var(--border-subtle)] pb-px overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-[14px] transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)]' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === 'personnalisation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard icon={PaintBrush} title="Apparence" description="Définissez le nom, l'avatar et le thème visuel de votre agent." />
                <SectionCard icon={Robot} title="Personnalité" description="Ajustez le ton, l'empathie et les directives de base." />
                <SectionCard icon={ChatCircleText} title="Style de réponse" description="Longueur des réponses, formatage markdown, et utilisation d'emojis." />
                <SectionCard icon={Waveform} title="Voix" description="Choisissez la voix de synthèse pour les interactions orales." />
              </div>
            )}

            {activeTab === 'competences' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard icon={Database} title="Mémoire" description="Gérez le contexte à long terme, les souvenirs et les documents intégrés." />
                <SectionCard icon={ShieldCheck} title="Outils" description="Activez la recherche web, l'exécution de code, et la génération d'images." />
                <SectionCard icon={Plug} title="Connecteurs" description="Reliez l'agent à Google Drive, Notion, Slack et autres services externes." />
              </div>
            )}

            {(activeTab === 'acces' || activeTab === 'avance') && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border)] rounded-2xl">
                <LockKey size={48} className="text-[var(--text-tertiary)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Section en développement</h3>
                <p className="text-[var(--text-secondary)] mt-2">Cette configuration sera disponible prochainement.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors shadow-sm cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--hover)] text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg)] transition-colors">
          <Icon size={20} weight="fill" />
        </div>
        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
