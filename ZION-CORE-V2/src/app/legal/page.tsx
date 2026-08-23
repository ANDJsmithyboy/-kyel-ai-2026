/**
 * Ñkyel AI · Mentions Légales & Propriété Intellectuelle
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /legal
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Buildings, Scales, ShieldCheck, FileText, Globe } from '@phosphor-icons/react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#EDEDEC] p-6 md:p-12 overflow-y-auto selection:bg-[#D5AE57]/30 selection:text-white" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, sans-serif)' }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>

        <div className="mb-10 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#D5AE57]/15 text-[#D5AE57] flex items-center justify-center border border-[#D5AE57]/30">
              <Buildings size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Mentions Légales & Propriété Intellectuelle</h1>
              <p className="text-xs text-white/50 mt-1">
                Informations légales relatives à l&apos;éditeur, à l&apos;hébergement et aux droits d&apos;auteur de Ñkyel AI.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-xs text-white/80 leading-relaxed">
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Buildings size={18} className="text-[#D5AE57]" />
              1. Éditeur de la Plateforme
            </h2>
            <p>
              La plateforme <strong>Ñkyel AI</strong> est conçue, éditée et exploitée par :
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-white/90 space-y-1">
              <p className="font-bold text-white">SmartANDJ AI Technologies</p>
              <p>Fondateur & Architecte en Chef : <strong>Daniel Jonathan ANDJ</strong></p>
              <p>Siège social : Libreville, République Gabonaise</p>
              <p>Email officiel : <a href="mailto:contact@smartandj.ai" className="text-[#D5AE57] hover:underline">contact@smartandj.ai</a> / <a href="mailto:jonathanakarentoutoume@gmail.com" className="text-[#D5AE57] hover:underline">jonathanakarentoutoume@gmail.com</a></p>
              <p>Site web éditeur : <a href="https://smartandj.ai" target="_blank" rel="noopener noreferrer" className="text-[#D5AE57] hover:underline">smartandj.ai</a></p>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe size={18} className="text-[#D5AE57]" />
              2. Hébergement & Infrastructure Souveraine
            </h2>
            <p>
              L&apos;infrastructure de production Ñkyel AI repose sur une architecture de haute disponibilité distribuée et souveraine :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li><strong>Frontend & Edge CDN</strong> : Vercel Inc. (San Francisco, CA, USA) avec réplication multi-régions.</li>
              <li><strong>Base de données relationnelle</strong> : Neon PostgreSQL (Francfort, Allemagne / UE) avec Row-Level Security.</li>
              <li><strong>Stockage d&apos;objets & Artefacts</strong> : Cloudflare R2 (Chiffrement au repos, réplication globale sans frais de sortie).</li>
              <li><strong>Inférence Souveraine & Clusters GPU</strong> : RunPod Dedicated Pods & Serveurs On-Premises sécurisés.</li>
              <li><strong>Authentification</strong> : Clerk Inc. (JWKS RS256 avec conformité SOC2 Type II et RGPD).</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Scales size={18} className="text-[#D5AE57]" />
              3. Propriété Intellectuelle & Droits Réservés
            </h2>
            <p>
              Tous les éléments constitutifs de la plateforme Ñkyel AI, incluant de manière non limitative : l&apos;architecture <strong>Zion Core</strong>, le moteur <strong>DeerFlow</strong>, le studio d&apos;artefacts <strong>VIE Canvas</strong>, la charte graphique <strong>Wada Sanzo V4</strong>, les logos, marques, textes, codes sources, interfaces graphiques et algorithmes de routage sont la propriété exclusive de <strong>SmartANDJ AI Technologies</strong> et protégés par les lois internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation totale ou partielle du Service sans autorisation écrite préalable de Daniel Jonathan ANDJ est strictement interdite.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#D5AE57]" />
              4. Droit Applicable & Juridiction Compétente
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit en vigueur. Tout litige relatif à l&apos;interprétation, l&apos;exécution ou la validité des services Ñkyel AI sera soumis à la compétence exclusive des tribunaux compétents de Libreville, Gabon, sous réserve des dispositions impératives applicables aux consommateurs.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
