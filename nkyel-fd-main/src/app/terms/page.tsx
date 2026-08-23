/**
 * Ñkyel AI · Conditions Générales d'Utilisation (CGU)
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /terms
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Scales, ShieldCheck, UserCheck, CreditCard, LockKey } from '@phosphor-icons/react';

const SECTIONS = [
  {
    title: '1. Acceptation des Conditions',
    content: `En accédant à Ñkyel AI ou en l'utilisant, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (« CGU »). Si vous n'acceptez pas ces CGU, veuillez ne pas utiliser le Service. Ñkyel AI est édité par SmartANDJ AI Technologies, société enregistrée au Gabon, fondée par Daniel Jonathan ANDJ.`,
  },
  {
    title: '2. Description du Service & Architecture Fabric',
    content: `Ñkyel AI est une plateforme d'intelligence artificielle universelle et souveraine opérant sur une architecture agnostique mondiale (38 fournisseurs d'inférence). Elle propose des capacités d'agent autonome (WorkGraph), de conversation multimodale, de génération d'artefacts (VIE Canvas) et de mémoire persistante (DeerMem).`,
  },
  {
    title: '3. Inscription, Authentification & Sécurité',
    content: `L'accès à Ñkyel AI s'effectue via authentification sécurisée Clerk (JWKS RS256). Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées depuis votre compte. L'âge minimal requis pour utiliser la plateforme est de 16 ans.`,
  },
  {
    title: '4. Propriété des Entrées et des Livrables',
    content: `Vous conservez l'entière propriété intellectuelle des prompts, documents et instructions que vous soumettez à Ñkyel AI, ainsi que des artefacts de code et contenus générés par l'IA pour votre compte, sous réserve du respect des droits de tiers. L'infrastructure, le code source et les marques restent la propriété exclusive de SmartANDJ AI Technologies.`,
  },
  {
    title: '5. Abonnements, Crédits & Paiements',
    content: `Ñkyel AI propose des formules d'accès et des forfaits de crédits. Les règlements s'effectuent par Mobile Money (Airtel Money, Moov Money), virement bancaire ou carte bancaire via nos prestataires agréés. Les forfaits et crédits consommés ne sont pas remboursables une fois la puissance de calcul mobilisée.`,
  },
  {
    title: '6. Limitation de Responsabilité & IA',
    content: `Ñkyel AI est fourni « en l'état ». Les réponses générées par les modèles d'IA sont fournies à titre indicatif et ne se substituent pas à un avis médical, juridique ou financier certifié. La responsabilité de SmartANDJ AI Technologies est plafonnée aux montants versés au cours des 12 derniers mois.`,
  },
  {
    title: '7. Résiliation & Suppression de Compte',
    content: `Vous pouvez demander la suppression immédiate de votre compte et de toutes vos données associées à tout moment via les paramètres ou par email à privacy@smartandj.ai.`,
  },
  {
    title: '8. Droit Applicable & Juridiction',
    content: `Les présentes CGU sont soumises au droit applicable. Tout litige relatif à leur interprétation relève de la compétence exclusive des tribunaux compétents de Libreville, Gabon.`,
  },
];

export default function TermsPage() {
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
              <FileText size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Conditions Générales d&apos;Utilisation (CGU)</h1>
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
                <Scales size={18} className="text-[#D5AE57]" />
                {s.title}
              </h2>
              <p className="text-white/70 whitespace-pre-line leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/acceptable-use" className="hover:text-white transition-colors">Usage Acceptable</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
