/**
 * Ñkyel AI · Politique d'Utilisation Acceptable & Éthique IA
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /acceptable-use
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, WarningOctagon, Prohibit, HandPalm, Scales } from '@phosphor-icons/react';

const SECTIONS = [
  {
    title: '1. Principes Fondamentaux & Éthique de l\'IA',
    content: `Ñkyel AI est conçu pour amplifier le génie créatif, technique, scientifique et entrepreneurial humain dans le respect absolu de la dignité, des libertés fondamentales et de la légalité.`,
  },
  {
    title: '2. Usages Formellement Interdits',
    content: `Sont formellement prohibés sur l'ensemble de l'infrastructure Ñkyel AI :\n• La création, dissémination ou facilitation de contenus illégaux, haineux, violents, terroristes ou pédopornographiques.\n• Les cyberattaques, génération de logiciels malveillants, scans de vulnérabilités non autorisés ou exploits zero-day.\n• Les tentatives d'ingérence politique, de désinformation massive automatisée ou d'usurpation d'identité.\n• Le contournement des filtres de sécurité des modèles d'inférence (jailbreak hostile).\n• L'extraction non autorisée de données personnelles de tiers (scraping massif illégal).`,
  },
  {
    title: '3. Responsabilité sur les Sorties & Artefacts',
    content: `L'utilisateur demeure l'unique arbitre des livrables générés par les agents Ñkyel avant tout déploiement en production ou prise de décision critique (médicale, financière, légale).`,
  },
  {
    title: '4. Procédure de Signalement & Sanctions',
    content: `Tout abus peut être signalé immédiatement à abuse@smartandj.ai. SmartANDJ AI Technologies se réserve le droit de suspendre ou clôturer tout compte en cas de violation manifeste sans préavis.`,
  },
];

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#EDEDEC] p-6 md:p-12 overflow-y-auto selection:bg-[var(--accent-subtle)] selection:text-white" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, sans-serif)' }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>

        <div className="mb-10 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Scales size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Politique d&apos;Utilisation Acceptable & Éthique</h1>
              <p className="text-xs text-white/50 mt-1">
                Dernière mise à jour : Août 2026 · SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-xs text-white/80 leading-relaxed">
          {SECTIONS.map((s, idx) => (
            <section key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle size={18} className="text-[var(--accent)]" />
                {s.title}
              </h2>
              <p className="text-white/70 whitespace-pre-line leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
